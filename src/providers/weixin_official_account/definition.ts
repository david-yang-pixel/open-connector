import type { ProviderDefinition } from "../../core/types.ts";

import { weixinOfficialAccountActions } from "./actions.ts";

const service = "weixin_official_account";

/**
 * WeChat Official Account provider backed by the WeChat Official Account Platform APIs.
 */
export const provider: ProviderDefinition = {
  service,
  displayName: "WeChat Official Account",
  description:
    "Manage temporary and permanent media, article drafts, publishing, and reader statistics, and send customer service, mass, and template messages for a WeChat Official Account through the WeChat Official Account Platform APIs. The runtime's public egress IP must be added to the account's API IP whitelist in the 微信开发者平台 console (公众号 → 基础信息 → 开发密钥 → API IP白名单), otherwise every call fails with errcode 40164.",
  categories: ["Communication", "Marketing"],
  authTypes: ["custom_credential"],
  auth: [
    {
      type: "custom_credential",
      description:
        "Add this runtime's public egress IP to the account's API IP whitelist in the 微信开发者平台 console (公众号 → 基础信息 → 开发密钥 → API IP白名单) before connecting, otherwise every API call fails with errcode 40164.",
      fields: [
        {
          key: "appId",
          label: "AppID",
          inputType: "text",
          required: true,
          secret: false,
          description:
            "The AppID of the WeChat Official Account. Find it in the 微信开发者平台 console under 公众号 → 基础信息 → 开发密钥.",
        },
        {
          key: "appSecret",
          label: "AppSecret",
          inputType: "password",
          required: true,
          secret: true,
          description:
            "The AppSecret of the same WeChat Official Account. Copy it from the 微信开发者平台 console under 公众号 → 基础信息 → 开发密钥.",
        },
      ],
    },
  ],
  homepageUrl: "https://mp.weixin.qq.com",
  actions: weixinOfficialAccountActions,
};
