# Plan: 级联选择提供商与连接工具 (Provider -> Connection -> Tools)

## Context

用户需要在创建/管理 API Key 时，实现先选「提供商」、再选该提供商下的「具体连接」、最后能查看或确认该连接下的「工具列表」的清晰层级结构。
目前系统是一个扁平的连接列表，缺乏提供商维度的层级与折叠，也缺少直接查看连接下具体工具的途径。

## Design

在 `web/src/access-page.tsx` 中升级 `ConnectionGrantEditor` 为三层结构：

### 1. 第一层：提供商分组 (Provider Group)

- 按 Provider 分组展示卡片列表；
- 组头展示：
  - 提供商名称（如 `Custom Remote MCP`）
  - 连接数量与工具总数汇总（如 `4 个连接 · 共 39 个工具`）
  - 提供商级复选框（支持全选、反选、半选联动）
  - 折叠/展开切换按钮

### 2. 第二层：连接项 (Connection Item)

- 展开后展示该提供商下的具体连接：
  - 勾选框（勾选单个连接）
  - 连接别名（如 `dify-db`, `default`）
  - 绑定实例信息（如 `Custom MCP (zendesk.smlershou.top)`）
  - `[X 个工具]` 徽标（点击查看工具）
  - `[默认]` 徽标

### 3. 第三层：工具详情 (Tools View)

- 用户点击任意连接旁边的 `[X 个工具]` 徽标或操作按钮，立即唤出 `McpToolsDialog` 弹窗；
- 弹窗展示该连接下的所有具体工具名称、描述与参数结构，支持即时搜索与复制；
- 查看完毕后关闭弹窗，继续完成连接勾选。

## Verification

1. 单元测试：`web/src/access-page.test.ts` 保持通过并补充测试。
2. 前端编译：`npm run build:web`。
3. 经用户明确确认后，推送到 Cloudflare 生产环境验证。
