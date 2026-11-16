import type { ProviderDefinition } from "../../core/types.ts";

import { moneyforwardActions } from "./actions.ts";
import { moneyforwardService } from "./manifest.ts";

export const provider: ProviderDefinition = {
  service: moneyforwardService,
  displayName: "Money Forward クラウド会計 MCP",
  description:
    "Read and write Money Forward クラウド会計 books (offices, accounts, journals, trial balances, transition reports, bank and card transactions) through Money Forward's official MCP server. One multi-office API key covers every office it was issued for; each call names its office.",
  categories: ["Finance", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "Money Forward API キー",
      placeholder: "Paste the API key issued in the Money Forward app portal",
      description:
        "Issue it at https://app-portal.moneyforward.com → pick any office → APIキー管理 → 複数事業者 (or 単一事業者) → 新規登録, with the 事業者情報 and クラウド会計・確定申告 services. It is sent as the Mf-API-Key header and acts with your own permissions in each office. The key is shown only once; it can be revoked from the same screen of any office.",
    },
  ],
  homepageUrl: "https://developers.biz.moneyforward.com/mcp/",
  actions: moneyforwardActions,
};
