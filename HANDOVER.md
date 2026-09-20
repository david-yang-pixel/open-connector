# OpenConnector 生产环境交接与运维部署手册

本项目为基于 [OOMOL OpenConnector](https://github.com/oomol-lab/open-connector) 进行二次开发与架构加固的生产部署版本，提供统一的 API 集成、自定义远程 MCP 协议路由及 Agent 工具网关服务。

> [!IMPORTANT]
> 本文档的早期本地 Git 提交曾包含生产凭据。推送或共享仓库前，必须先完成相关凭据轮换并清理 Git 历史；仅修改当前文件不能移除历史对象中的秘密值。

---

## 一、生产环境拓扑与运行现状

当前系统完全运行在 **Cloudflare 边缘无服务器（Serverless）架构** 上，无单点服务器维护成本：

| 组件名称                          | 生产资源信息                                                                    | 说明 / 备注                                               |
| :-------------------------------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------- |
| **项目控制台 / API 入口**         | `https://open-connector.yyg066340.workers.dev`                                  | 承载 Web UI 控制台、MCP 动态网关与 Action API             |
| **Worker 实例名称**               | `open-connector`                                                                | 运行在 Cloudflare Workers 边缘节点                        |
| **Cloudflare 账号 ID**            | `a9c9046b7c7a5337e3eba67622ec303d`                                              | 所属 Cloudflare 账户                                      |
| **持久化关系数据库 (D1)**         | 数据库名：`open-connector`<br>数据库 ID：`c99065d2-d83b-4764-801c-e30ef9fae3b4` | SQLite 边缘数据库，持久化存储连接凭据、审计记录及安全策略 |
| **对象存储桶 (R2)**               | 桶名：`open-connector-transit-files`                                            | 临时大文件/附件中转，默认 86400s（1天）自动过期销毁       |
| **核心管理凭据 (Admin Token)**    | Cloudflare Worker secret：`OOMOL_CONNECT_ADMIN_TOKEN`                           | 控制台登录密码及所有管理类 API 的 Bearer Token            |
| **数据加密密钥 (Encryption Key)** | Cloudflare Worker secret：`OOMOL_CONNECT_ENCRYPTION_KEY`                        | 用于 D1 中第三方凭据的静态加密；轮换前必须先制定迁移方案  |
| **部署鉴权 Token (Deploy Token)** | 仅从本地环境变量 `CLOUDFLARE_API_TOKEN` 注入                                    | 具备 Workers、D1、R2 操作权限，不得写入仓库或命令历史     |

---

## 二、当前已配置并运行的在线连接 (Live Connections)

所有凭据均已加密保存在 Cloudflare D1 中，代码更新部署不会影响数据库已有连接：

### 1. 自定义远程 MCP（全部采用 Streamable HTTP / SSE 协议直连）：

- **`dify-db`**：连接至 `https://zendesk.smlershou.top/db-gateway/mcp`
  - 暴露工具：`db_gateway_query`（支持针对 prod/billing/plugin 数据库执行只读 SQL）
- **`dify-signoz`**：连接至 `https://zendesk.smlershou.top`
  - 暴露工具：共 11 个（`sz_run`, `signoz_search_logs`, `signoz_query_metrics`, `signoz_search_traces` 等）
- **`dify-source`**：连接至 `https://zendesk.smlershou.top`
  - 暴露工具：共 8 个（`source_search`, `source_read`, `source_diff`, `repo_status` 等）
- **`zendesk`**：连接至 `https://zendesk.smlershou.top`
  - 暴露工具：共 16 个（`search_tickets`, `get_ticket_comments`, `update_ticket_status` 等）

### 2. 官方第三方集成连接：

- **`cloudflare_mcp`**：已绑定 Cloudflare API（支持 docs、search、execute）
- **`feishu_app_bot`**：连接名 `feishu`（绑定飞书自建应用，具备 60+ 消息与文档操作权限）
- **`github`**：已绑定 GitHub 个人账户（账号：`david-yang-pixel`）
- **`gmail`**：连接名 `yonggangdify`（绑定 OAuth2 邮箱 `yonggang@dify.ai`）
- **`linear`**：已绑定 Linear API（账号：`yonggang`）

---

## 三、核心二次开发与架构加固说明（核心代码资产）

本仓库相比上游官方源码，主要包含了以下关键扩展与深度加固，**后续开发时切勿随意还原或覆盖**：

### 1. 自定义远程 MCP 适配器 (`src/providers/custom_mcp/`)

- **功能**：支持接入任意公网远程 MCP 服务（无论是 SSE 还是 Streamable HTTP），并支持任意多个**命名连接（Named Connections）**。
- **关键文件**：
  - `src/providers/custom_mcp/definition.ts`：定义凭据表单字段（`serverUrl`, `authorizationToken`）。
  - `src/providers/custom_mcp/runtime.ts`：协议探测、自适应 Streamable/SSE 降级重试、友好错误转换。
  - `src/providers/custom_mcp/executors.ts`：注册 `custom_mcp.list_tools` 与 `custom_mcp.call_tool` 执行器。

### 2. 请求头跨环境解包补丁 (`src/providers/mcp-client.ts`)

- **根因修复**：在 Cloudflare Workers 打包环境中，`headers instanceof Headers` 跨模块失效会导致 `@modelcontextprotocol/client` 解包丢弃 `Authorization` 头（曾引发 `Invalid URL: undefined`）。
- **实现**：`toPlainHeaders()` 将任意 Headers 对象强制规范化为纯 JS `Record<string, string>` 字典。

### 3. Cloudflare Free 10ms CPU 限制极致优化

由于官方源码冷启动需要同时反序列化 35MB 静态目录（耗时 400ms+），在 Free 计划（上限 10ms）下会发生 503/500 雪崩。为此实施了架构级加速：

- **`/api/providers` 静态资产直出**（`src/server/cloudflare.ts`）：
  构建期生成 `provider-summaries.json`，Worker 收到请求通过 CDN 静态流直出，CPU 耗时由 400ms 降至 **0.05ms**。
- **精简核心运行时分片**（`scripts/copy-catalog-assets.ts` & `src/server/cloudflare/catalog-assets.ts`）：
  提取仅包含已配置服务及免鉴权 API 的 `core-providers.json`（390KB），冷启动反序列化降至 **0.45ms**。
- **`weakEtag` 采样与索引懒加载**（`src/catalog-store.ts` & `src/server/connect-server.ts`）：
  避免巨型字符串全字符逐个遍历，MiniSearch 搜索索引改为首次搜索时按需加载。

---

## 四、代码修改与构建发布标准 SOP

本地代码仓库位于：`/Users/yangyonggang/appdata/open-connector`

### 1. 本地调试与准备

```bash
cd /Users/yangyonggang/appdata/open-connector

# 安装依赖
npm install
```

### 2. 标准生产发布全流程

任何代码改动（例如修改了代码、更新了页面或新增了提供商）后，按顺序执行以下 4 步发布：

```bash
# 步骤 1：重新生成提供商目录与类型映射（必须）
npm run generate:catalog

# 步骤 2：编译前端 Web 控制台单页应用
npm run build:web

# 步骤 3：提取核心提供商与 CDN 优化资产（核心加速必须步骤）
node scripts/copy-catalog-assets.ts

# 步骤 4：编译发布到 Cloudflare Workers
CI=true npx wrangler deploy --config wrangler.local.jsonc --minify
```

执行前应通过受控的本地密钥管理方式设置 `CLOUDFLARE_API_TOKEN` 和
`CLOUDFLARE_ACCOUNT_ID`。不要把实际值写入本文档、脚本或 Git 历史。

---

## 五、日常运维、排错与数据备份命令备忘

### 1. 实时查看线上运行日志与报错追踪

```bash
CI=true npx wrangler tail open-connector --format pretty
```

### 2. 导出 D1 数据库全量备份（包含所有连接与配置）

```bash
CI=true npx wrangler d1 export open-connector --remote --output="./open-connector-backup-$(date +%Y%m%d).sql"
```

### 3. 健康检查与接口探测（快速验证 Worker 是否正常）

```bash
# 检查 API 会话状态
curl -s -H "Authorization: Bearer ${OOMOL_CONNECT_ADMIN_TOKEN:?set OOMOL_CONNECT_ADMIN_TOKEN}" \
  https://open-connector.yyg066340.workers.dev/api/auth/session

# 检查当前已配置的所有连接
curl -s -H "Authorization: Bearer ${OOMOL_CONNECT_ADMIN_TOKEN:?set OOMOL_CONNECT_ADMIN_TOKEN}" \
  https://open-connector.yyg066340.workers.dev/api/connections | jq '.[] | {service, connectionName}'

# 测试调用远程 MCP 获取 dify-db 工具清单
curl -s -X POST https://open-connector.yyg066340.workers.dev/v1/actions/custom_mcp.list_tools \
  -H "Authorization: Bearer ${OOMOL_CONNECT_ADMIN_TOKEN:?set OOMOL_CONNECT_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"connectionName": "dify-db", "input": {}}' | jq '.data.tools'
```

---

## 六、交接建议与未来规划

1. **托管至个人 GitHub 私有仓库**：
   建议在 GitHub 上创建一个私有仓库（例如 `my-open-connector`），运行：
   ```bash
   git remote add origin git@github.com:<your-username>/my-open-connector.git
   git push -u origin main
   ```
   这样代码便能云端托管备份，任何机器拉取均可独立运维。
2. **连接多租户拓展**：
   未来如果需要接入更多 MCP 服务（如 Notion MCP、本地数据库代理等），无需改动代码，直接在 Web 控制台点击「添加连接」并指定不同的 `Connection Name` 即可。
