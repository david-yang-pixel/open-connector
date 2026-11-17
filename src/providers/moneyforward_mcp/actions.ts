import type { ActionDefinition, ActionOperationType, JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { moneyforwardService, officeCodePattern } from "./manifest.ts";

const officeCode = s.stringPattern(officeCodePattern, {
  description:
    "Office number (事業者番号, XXXX-XXXX) of the office to act on. Required on every call; there is no default office. Find it with get_accessible_offices.",
});

const expectedOfficeName = s.nonEmptyString(
  "Name of the office you intend to write to, as the user knows it. The write is refused unless it matches the name Money Forward returns for office_code; width, spacing and 株式会社/(株)-style abbreviations are ignored.",
);

const toolOutput = s.unknown("JSON returned by the Money Forward Cloud Accounting MCP tool.");

const writeNote =
  "Writes to the accounting ledger: confirm the office and content with the user first. Never retried automatically; when details.writeOutcome is outcome_unknown, check the ledger before trying again.";

const accountId = s.nonEmptyString("Account item ID (勘定科目), from get_accounts.");
const subAccountId = s.nonEmptyString("Sub-account ID (補助科目), from get_sub_accounts.");
const departmentId = s.nonEmptyString("Department ID (部門), from get_departments.");
const taxId = s.nonEmptyString("Tax category ID (税区分), from get_taxes.");
const tradePartnerCode = s.nonEmptyString("Business partner code (取引先コード), from get_trade_partners.");
const onlyAvailable = s.boolean("When true, return only entries that are currently enabled.");
const page = s.positiveInteger("Page number, starting at 1.");
const tags = s.array("Tags to attach.", s.string("A tag."));

const invoiceKind = s.stringEnum("Qualified-invoice category (インボイス区分) of the line.", [
  "INVOICE_KIND_NOT_TARGET",
  "INVOICE_KIND_QUALIFIED",
  "INVOICE_KIND_UNQUALIFIED_80",
  "INVOICE_KIND_UNQUALIFIED_70",
  "INVOICE_KIND_UNQUALIFIED_50",
  "INVOICE_KIND_UNQUALIFIED_30",
  "INVOICE_KIND_UNQUALIFIED",
]);

const journalType = s.stringEnum(
  "journal_entry for an ordinary entry, adjusting_entry for a year-end adjusting entry.",
  ["journal_entry", "adjusting_entry"],
);

const journalSide = (side: string): JsonSchema =>
  s.object(
    `${side} side of a journal line.`,
    {
      account_id: accountId,
      sub_account_id: subAccountId,
      department_id: departmentId,
      tax_id: taxId,
      trade_partner_code: tradePartnerCode,
      invoice_kind: invoiceKind,
      value: s.integer("Amount in yen."),
    },
    { optional: ["sub_account_id", "department_id", "tax_id", "trade_partner_code", "invoice_kind"] },
  );

const journal = s.object(
  "The journal entry.",
  {
    transaction_date: s.date("Transaction date (YYYY-MM-DD)."),
    journal_type: journalType,
    branches: s.array(
      "Journal lines. Each line has a debit side, a credit side, or both.",
      s.object(
        "One journal line.",
        {
          debitor: journalSide("Debit"),
          creditor: journalSide("Credit"),
          remark: s.string("Line description (摘要)."),
        },
        { optional: ["debitor", "creditor", "remark"] },
      ),
      { minItems: 1, maxItems: 300 },
    ),
    memo: s.string("Memo for the whole entry."),
    tags,
  },
  { optional: ["memo", "tags"] },
);

const reportPeriod = {
  fiscal_year: s.integer("Fiscal year to report on. Defaults to the latest fiscal year."),
  start_month: s.integer("First month of the fiscal year to include, used with fiscal_year.", {
    minimum: 1,
    maximum: 12,
  }),
  end_month: s.integer("Last month of the fiscal year to include, used with fiscal_year.", {
    minimum: 1,
    maximum: 12,
  }),
  include_tax: s.boolean("Report tax-inclusive amounts. Only allowed when the office records amounts tax-exclusive."),
  with_sub_accounts: s.boolean("Include sub-account breakdowns under each account."),
};

const trialBalanceInput = input(
  {
    ...reportPeriod,
    start_date: s.date("Start of a custom period (YYYY-MM-DD)."),
    end_date: s.date("End of a custom period (YYYY-MM-DD)."),
    journal_types: s.array(
      "Journal kinds to include. Defaults to both.",
      s.stringEnum("A journal kind.", ["journal_entry", "adjusting_entry"]),
    ),
  },
  [],
);

const transitionInput = input(
  { ...reportPeriod, type: s.stringEnum("Aggregation unit. Only monthly is supported.", ["monthly"]) },
  ["type"],
);

export const moneyforwardActions: ActionDefinition[] = [
  action(
    "get_accessible_offices",
    "read",
    "List the offices this API key can use in Money Forward Cloud Accounting, with each office's number, name and accounting periods. Start here to find office_code; offices without Cloud Accounting are not listed.",
    s.actionInput({}, [], "No input."),
  ),
  action("current_office", "read", "Get one office's name, type and accounting periods, newest first.", input({}, [])),
  action(
    "get_term_settings",
    "read",
    "Get every fiscal-year setting of an office (dates, accounting and consumption-tax methods), newest first.",
    input({}, []),
  ),
  action(
    "get_accounts",
    "read",
    "List the office's account items (勘定科目).",
    input({ available: onlyAvailable }, []),
  ),
  action(
    "get_sub_accounts",
    "read",
    "List the office's sub-accounts (補助科目), optionally for one account item.",
    input({ account_id: accountId }, []),
  ),
  action("get_taxes", "read", "List the office's tax categories (税区分).", input({ available: onlyAvailable }, [])),
  action("get_departments", "read", "List the office's departments (部門).", input({}, [])),
  action(
    "get_trade_partners",
    "read",
    "List the office's business partners (取引先).",
    input({ available: onlyAvailable }, []),
  ),
  action(
    "get_connected_accounts",
    "read",
    "List the bank, card and other services connected to the office, with their account IDs.",
    input({}, []),
  ),
  action(
    "get_journals",
    "read",
    "List journal entries (仕訳) in a date range. Give start_date, end_date or both; results are paginated.",
    input(
      {
        start_date: s.date("First transaction date to include (YYYY-MM-DD)."),
        end_date: s.date("Last transaction date to include (YYYY-MM-DD)."),
        account_id: s.nonEmptyString("Only entries that use this account item on either side."),
        is_realized: s.boolean("true for realized entries only, false for unrealized only. Omit for all."),
        transaction_ids: s.array(
          "Only entries created from these connected transactions.",
          s.nonEmptyString("A transaction ID."),
        ),
        page,
        per_page: s.positiveInteger("Entries per page."),
      },
      [],
    ),
  ),
  action(
    "get_journal_by_id",
    "read",
    "Get one journal entry by its ID.",
    input({ id: s.nonEmptyString("Journal entry ID.") }, ["id"]),
  ),
  action(
    "get_reports_trial_balance_balance_sheet",
    "read",
    "Get the trial balance (残高試算表) balance sheet for a fiscal year or a custom period. Zero-balance items are omitted.",
    trialBalanceInput,
  ),
  action(
    "get_reports_trial_balance_profit_loss",
    "read",
    "Get the trial balance (残高試算表) profit and loss statement for a fiscal year or a custom period. Zero-balance items are omitted.",
    trialBalanceInput,
  ),
  action(
    "get_reports_transition_balance_sheet",
    "read",
    "Get the month-by-month transition (推移表) balance sheet of a fiscal year. Zero-balance items are omitted.",
    transitionInput,
  ),
  action(
    "get_reports_transition_profit_loss",
    "read",
    "Get the month-by-month transition (推移表) profit and loss statement of a fiscal year. Zero-balance items are omitted.",
    transitionInput,
  ),
  action(
    "get_transactions",
    "read",
    "List bank, card and other transactions (明細) collected from connected services, within a date range of at most 366 days.",
    input(
      {
        start_date: s.date("First transaction date to include (YYYY-MM-DD)."),
        end_date: s.date("Last transaction date to include (YYYY-MM-DD), at most 366 days after start_date."),
        connected_account_id: s.nonEmptyString(
          "Only transactions of this connected service. Do not combine with connected_sub_account_id.",
        ),
        connected_sub_account_id: s.nonEmptyString("Only transactions of this account within a connected service."),
        content: s.string("Filter on the transaction description."),
        content_match_type: s.stringEnum("How content is matched. Ignored without content.", [
          "exact",
          "partial",
          "forward",
          "backward",
        ]),
        journalizing_statuses: s.array(
          "Only transactions in these journalizing states. Omit for all.",
          s.stringEnum("A journalizing state.", ["excluded", "none", "registered", "modified", "new_voucher_attached"]),
        ),
        side: s.stringEnum("Only income or only expense. Required when value_min or value_max is given.", [
          "INCOME",
          "EXPENSE",
        ]),
        value_min: s.integer("Smallest amount in yen. Requires side."),
        value_max: s.integer("Largest amount in yen. Requires side."),
        order: s.stringEnum("Sort by transaction date. Defaults to desc.", ["asc", "desc"]),
        page,
        per_page: s.integer("Transactions per page, 10 to 500. Defaults to 50.", { minimum: 10, maximum: 500 }),
      },
      ["start_date", "end_date"],
    ),
  ),
  action(
    "en_ja_dictionary",
    "read",
    "Get Money Forward's English-to-Japanese glossary of accounting terms, for matching English wording to the Japanese names the other tools return.",
    s.actionInput({}, [], "No input."),
  ),
  action(
    "post_journals",
    "write",
    `Create a journal entry (仕訳). ${writeNote}`,
    input({ journal, expected_office_name: expectedOfficeName }, ["journal", "expected_office_name"]),
  ),
  action(
    "put_journals",
    "write",
    `Replace a journal entry by its ID. Fields left out are overwritten, so send the complete entry. ${writeNote}`,
    input({ id: s.nonEmptyString("Journal entry ID."), journal, expected_office_name: expectedOfficeName }, [
      "id",
      "journal",
      "expected_office_name",
    ]),
  ),
  action(
    "post_transactions",
    "write",
    `Add transactions (明細) to a connected service by hand. ${writeNote}`,
    input(
      {
        connected_account_id: s.nonEmptyString("Connected service to add the transactions to."),
        transactions: s.array(
          "Transactions to add.",
          s.object(
            "One transaction.",
            {
              date: s.date("Transaction date (YYYY-MM-DD)."),
              content: s.nonEmptyString("Transaction description."),
              side: s.stringEnum("INCOME or EXPENSE.", ["INCOME", "EXPENSE"]),
              value: s.integer("Amount in yen."),
              memo: s.string("Memo, up to about 200 characters."),
            },
            { optional: ["memo"] },
          ),
          { minItems: 1 },
        ),
        expected_office_name: expectedOfficeName,
      },
      ["connected_account_id", "transactions", "expected_office_name"],
    ),
  ),
  action(
    "post_trade_partners",
    "write",
    `Create business partners (取引先). ${writeNote}`,
    input(
      {
        trade_partners: s.array(
          "Business partners to create.",
          s.object(
            "One business partner.",
            {
              name: s.nonEmptyString("Partner name."),
              search_key: s.string("Name used for searching."),
              corporate_number: s.string("Corporate number (法人番号)."),
              invoice_registration_number: s.string("Qualified invoice issuer registration number."),
              available: s.boolean("Whether the partner is enabled."),
            },
            { optional: ["search_key", "corporate_number", "invoice_registration_number", "available"] },
          ),
          { minItems: 1 },
        ),
        expected_office_name: expectedOfficeName,
      },
      ["trade_partners", "expected_office_name"],
    ),
  ),
  action(
    "post_transaction_journalize",
    "write",
    `Create a journal entry from one connected transaction (明細), booking it to the given account. ${writeNote}`,
    input(
      {
        transaction_id: s.nonEmptyString("Transaction to journalize, from get_transactions."),
        account_id: accountId,
        sub_account_id: subAccountId,
        department_id: departmentId,
        tax_id: taxId,
        trade_partner_code: tradePartnerCode,
        invoice_kind: invoiceKind,
        transaction_date: s.date("Journal date (YYYY-MM-DD). Defaults to the transaction's date."),
        remark: s.string("Line description (摘要)."),
        memo: s.string("Memo for the entry."),
        tags,
        expected_office_name: expectedOfficeName,
      },
      ["transaction_id", "account_id", "expected_office_name"],
    ),
  ),
  action(
    "list_tools",
    "read",
    "List the tools the Money Forward Cloud Accounting MCP server exposes right now, with their live input schemas. Use it to spot server-side changes.",
    s.actionInput({}, [], "No input."),
  ),
];

/** Every office-scoped action takes office_code; required lists the other mandatory fields. */
function input(properties: Record<string, JsonSchema>, required: string[]): JsonSchema {
  return s.actionInput({ office_code: officeCode, ...properties }, ["office_code", ...required]);
}

function action(
  name: string,
  operationType: ActionOperationType,
  description: string,
  inputSchema: JsonSchema,
): ActionDefinition {
  return defineProviderAction(moneyforwardService, {
    name,
    operationType,
    description,
    requiredScopes: [],
    inputSchema,
    outputSchema: toolOutput,
  });
}
