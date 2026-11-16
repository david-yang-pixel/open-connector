import { sha256Hex } from "../../core/aws-sigv4.ts";

export const moneyforwardService = "moneyforward_mcp";
export const moneyforwardMcpEndpoint = "https://beta.mcp.developers.biz.moneyforward.com/mcp/ca/v3";
export const officeCodePattern = "^[0-9]{4}-[0-9]{4}$";
export const currentOfficeToolName = "mfc_ca_currentOffice";

/** One Money Forward MCP tool and the action that wraps it. */
export interface MoneyforwardToolEntry {
  actionName: string;
  toolName: string;
  isWrite: boolean;
  requiresOfficeCode: boolean;
  /**
   * SHA-256 of the RFC 8785 canonical form of the tool's input schema as the server published it
   * when this provider was written. Only the hash is kept; a write is refused when the live schema
   * hashes differently, so any server-side change is reviewed before writes resume.
   */
  schemaDigest: string;
}

export const moneyforwardTools: readonly MoneyforwardToolEntry[] = [
  {
    actionName: "current_office",
    toolName: "mfc_ca_currentOffice",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "2bbfa71baa94a486be83265529c2f9a39071b5b0518ff5fea1c4c3f2488029be",
  },
  {
    actionName: "en_ja_dictionary",
    toolName: "mfc_ca_en_ja_dictionary",
    isWrite: false,
    requiresOfficeCode: false,
    schemaDigest: "efddc7bd8bbcef73a14eb1ace1ffdaec81e518ef1e13c1e9271d0b8acb694a49",
  },
  {
    actionName: "get_accessible_offices",
    toolName: "mfc_ca_getAccessibleOffices",
    isWrite: false,
    requiresOfficeCode: false,
    schemaDigest: "efddc7bd8bbcef73a14eb1ace1ffdaec81e518ef1e13c1e9271d0b8acb694a49",
  },
  {
    actionName: "get_accounts",
    toolName: "mfc_ca_getAccounts",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "66ffd56141dc57fdaf68ca9be911ce5db97a7929f68e1ffe79b9cddb019fa69f",
  },
  {
    actionName: "get_connected_accounts",
    toolName: "mfc_ca_getConnectedAccounts",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "2bbfa71baa94a486be83265529c2f9a39071b5b0518ff5fea1c4c3f2488029be",
  },
  {
    actionName: "get_departments",
    toolName: "mfc_ca_getDepartments",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "2bbfa71baa94a486be83265529c2f9a39071b5b0518ff5fea1c4c3f2488029be",
  },
  {
    actionName: "get_journal_by_id",
    toolName: "mfc_ca_getJournalById",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "c290ddfd2081cef2c119d8ee37ce8207e1dbda4407437870868c5c3c046e321d",
  },
  {
    actionName: "get_journals",
    toolName: "mfc_ca_getJournals",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "9f3dbbc4efcf6e6783677ac737a293bd7d4ccea768be8d50f783a4a706b60821",
  },
  {
    actionName: "get_reports_transition_balance_sheet",
    toolName: "mfc_ca_getReportsTransitionBalanceSheet",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "171c891292cc5f0e8c9300654a9977d3eeed0067f630076708274c6eb4b4aa5f",
  },
  {
    actionName: "get_reports_transition_profit_loss",
    toolName: "mfc_ca_getReportsTransitionProfitLoss",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "171c891292cc5f0e8c9300654a9977d3eeed0067f630076708274c6eb4b4aa5f",
  },
  {
    actionName: "get_reports_trial_balance_balance_sheet",
    toolName: "mfc_ca_getReportsTrialBalanceBalanceSheet",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "23e330f0fac53ef01afbbc34f04c8017f6974859bde7d28c0b941f6c177fdda9",
  },
  {
    actionName: "get_reports_trial_balance_profit_loss",
    toolName: "mfc_ca_getReportsTrialBalanceProfitLoss",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "23e330f0fac53ef01afbbc34f04c8017f6974859bde7d28c0b941f6c177fdda9",
  },
  {
    actionName: "get_sub_accounts",
    toolName: "mfc_ca_getSubAccounts",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "6f55eb15f3ad3d127bbc272cc4a93ebcad9834cc871539df38809a4dc73bf3b2",
  },
  {
    actionName: "get_taxes",
    toolName: "mfc_ca_getTaxes",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "66ffd56141dc57fdaf68ca9be911ce5db97a7929f68e1ffe79b9cddb019fa69f",
  },
  {
    actionName: "get_term_settings",
    toolName: "mfc_ca_getTermSettings",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "2bbfa71baa94a486be83265529c2f9a39071b5b0518ff5fea1c4c3f2488029be",
  },
  {
    actionName: "get_trade_partners",
    toolName: "mfc_ca_getTradePartners",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "66ffd56141dc57fdaf68ca9be911ce5db97a7929f68e1ffe79b9cddb019fa69f",
  },
  {
    actionName: "get_transactions",
    toolName: "mfc_ca_getTransactions",
    isWrite: false,
    requiresOfficeCode: true,
    schemaDigest: "84ee966ac02851949650f79293e46b2355fe907305f1ed1a4376fa42ad4808c5",
  },
  {
    actionName: "post_journals",
    toolName: "mfc_ca_postJournals",
    isWrite: true,
    requiresOfficeCode: true,
    schemaDigest: "1fefc534d2dc71eba534851b611783618d9587c2dac33110480df2175326cf36",
  },
  {
    actionName: "post_trade_partners",
    toolName: "mfc_ca_postTradePartners",
    isWrite: true,
    requiresOfficeCode: true,
    schemaDigest: "1f9466a7f72dd6dc7c84c657e533165462f899cc0dd1050c8a061729b3a3fcec",
  },
  {
    actionName: "post_transaction_journalize",
    toolName: "mfc_ca_postTransactionJournalize",
    isWrite: true,
    requiresOfficeCode: true,
    schemaDigest: "139d06e6030ec46fee2eaf3f59a9f8f9e0b3e543f490b8469e9b8018454ff3b0",
  },
  {
    actionName: "post_transactions",
    toolName: "mfc_ca_postTransactions",
    isWrite: true,
    requiresOfficeCode: true,
    schemaDigest: "0fd32a246c8478db7cb475fa2bb66d01ea076d8fa484c174ca3ebc311805bb48",
  },
  {
    actionName: "put_journals",
    toolName: "mfc_ca_putJournals",
    isWrite: true,
    requiresOfficeCode: true,
    schemaDigest: "cb4219b165eac7d685122a203d501d9c50223b1c522f2549ae3a98d0ff7c369f",
  },
];

/**
 * SHA-256 of the RFC 8785 canonical form of the whole schema. Nothing is stripped: every stripping
 * rule considered had a counterexample (fields named `description`, data inside `const`/`enum`),
 * so a wording change on the server also blocks writes until reviewed.
 */
export function schemaDigest(schema: unknown): string {
  return sha256Hex(canonicalJson(schema));
}

/** RFC 8785 JSON Canonicalization for the JSON values a tool schema can hold. */
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const members = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort(compareUtf16)
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${members.join(",")}}`;
  }
  return JSON.stringify(value);
}

// Legal-form abbreviations Money Forward and users write interchangeably. NFKC has already
// folded full-width brackets and the enclosed forms into these half-width spellings.
const legalFormAbbreviations: ReadonlyArray<readonly [string, string]> = [
  ["(株)", "株式会社"],
  ["(有)", "有限会社"],
  ["(同)", "合同会社"],
];

/**
 * Normalize an office name for the write guard: NFKC, drop all whitespace, and expand the explicit
 * legal-form abbreviations. No fuzzy matching: a name that differs otherwise is refused.
 */
export function canonicalOfficeName(name: string): string {
  const folded = name.normalize("NFKC").replace(/\s/gu, "");
  return legalFormAbbreviations.reduce((text, [short, full]) => text.split(short).join(full), folded);
}

// RFC 8785 orders member names by UTF-16 code units, which is what `<` on JS strings compares.
function compareUtf16(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}
