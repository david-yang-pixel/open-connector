import type { QuickbooksEntity } from "./constants.ts";

export type QuickbooksResourceOperation = "list" | "get" | "create" | "update" | "delete";

/**
 * One QuickBooks entity exposed through the generated list/get/create/update/delete
 * actions. Actions written by hand in `actions.ts` take precedence over the
 * generated ones with the same name.
 */
export interface QuickbooksResource {
  /** Singular snake_case name used in action names and as the output key, such as `bill`. */
  key: string;
  /** Plural snake_case name used by the list action, such as `bills`. */
  plural: string;
  /** Human wording used in descriptions, such as `bill payment`. */
  label: string;
  entity: QuickbooksEntity;
  operations: QuickbooksResourceOperation[];
  /** How `delete` works: QuickBooks deletes the transaction, or only supports deactivating the record. */
  remove: "delete" | "deactivate";
  /** Column matched by the `name_contains` list filter. */
  nameColumn?: string;
  /** Whether the entity has an `Active` flag that the `status` list filter can use. */
  hasActive: boolean;
  /** Whether the entity has a `TxnDate` that the date-range list filters can use. */
  hasTxnDate: boolean;
  /** Default `order by` column of the list action. */
  defaultOrder?: string;
  /** Names the fields QuickBooks requires on create, shown in the action description. */
  createHint?: string;
}

interface ResourceInput extends Partial<Omit<QuickbooksResource, "entity" | "operations">> {
  key: string;
  plural: string;
  entity: string;
  operations: string;
}

const operationLetters: Record<string, QuickbooksResourceOperation> = {
  l: "list",
  g: "get",
  c: "create",
  u: "update",
  d: "delete",
};

function resource(input: ResourceInput): QuickbooksResource {
  return {
    key: input.key,
    plural: input.plural,
    label: input.label ?? input.key.replaceAll("_", " "),
    entity: { name: input.entity, path: input.entity.toLowerCase() },
    operations: [...input.operations].map((letter) => operationLetters[letter]),
    remove: input.remove ?? "delete",
    nameColumn: input.nameColumn,
    hasActive: input.hasActive ?? false,
    hasTxnDate: input.hasTxnDate ?? false,
    defaultOrder: input.defaultOrder ?? input.nameColumn,
    createHint: input.createHint,
  };
}

function transaction(input: ResourceInput): QuickbooksResource {
  return resource({ hasTxnDate: true, defaultOrder: "TxnDate", ...input });
}

/** Every entity with generated CRUD actions, keyed by `key`. Operations: l=list g=get c=create u=update d=delete. */
export const quickbooksResources: Record<string, QuickbooksResource> = Object.fromEntries(
  [
    transaction({
      key: "bill",
      plural: "bills",
      entity: "Bill",
      operations: "lgcud",
      createHint: "VendorRef and Line (AccountBasedExpenseLineDetail or ItemBasedExpenseLineDetail lines)",
    }),
    transaction({
      key: "bill_payment",
      plural: "bill_payments",
      entity: "BillPayment",
      operations: "lgcud",
      createHint:
        "VendorRef, PayType (Check or CreditCard), TotalAmt, Line with LinkedTxn bills, and CheckPayment or CreditCardPayment",
    }),
    resource({ key: "budget", plural: "budgets", entity: "Budget", operations: "l" }),
    resource({
      key: "class",
      plural: "classes",
      entity: "Class",
      operations: "l",
      nameColumn: "Name",
      hasActive: true,
    }),
    transaction({
      key: "credit_memo",
      plural: "credit_memos",
      entity: "CreditMemo",
      operations: "lgcud",
      createHint: "CustomerRef and Line (SalesItemLineDetail lines)",
    }),
    resource({
      key: "credit_term",
      plural: "credit_terms",
      entity: "Term",
      operations: "lgcud",
      remove: "deactivate",
      nameColumn: "Name",
      hasActive: true,
      createHint: "Name and either DueDays or DayOfMonthDue",
    }),
    resource({
      key: "currency",
      plural: "currencies",
      entity: "CompanyCurrency",
      operations: "l",
      hasActive: true,
    }),
    resource({
      key: "customer",
      plural: "customers",
      entity: "Customer",
      operations: "lgcud",
      remove: "deactivate",
      nameColumn: "DisplayName",
      hasActive: true,
    }),
    resource({
      key: "department",
      plural: "departments",
      entity: "Department",
      operations: "lgcud",
      remove: "deactivate",
      nameColumn: "Name",
      hasActive: true,
      createHint: "Name",
    }),
    transaction({
      key: "deposit",
      plural: "deposits",
      entity: "Deposit",
      operations: "lgcud",
      createHint: "DepositToAccountRef and Line (DepositLineDetail lines)",
    }),
    resource({
      key: "employee",
      plural: "employees",
      entity: "Employee",
      operations: "lgcud",
      remove: "deactivate",
      nameColumn: "DisplayName",
      hasActive: true,
      createHint: "GivenName and FamilyName",
    }),
    transaction({
      key: "estimate",
      plural: "estimates",
      entity: "Estimate",
      operations: "lgcud",
      createHint: "CustomerRef and Line (SalesItemLineDetail lines)",
    }),
    resource({
      key: "invoice",
      plural: "invoices",
      entity: "Invoice",
      operations: "lgcud",
      hasTxnDate: true,
      defaultOrder: "TxnDate",
    }),
    resource({
      key: "journal_code",
      plural: "journal_codes",
      entity: "JournalCode",
      operations: "lgcu",
      nameColumn: "Name",
      createHint: "Name and Type",
    }),
    transaction({
      key: "journal_entry",
      plural: "journal_entries",
      entity: "JournalEntry",
      operations: "lgcud",
      createHint: "Line with balanced debit and credit JournalEntryLineDetail lines",
    }),
    resource({
      key: "account",
      plural: "accounts",
      entity: "Account",
      operations: "lgcd",
      remove: "deactivate",
      nameColumn: "Name",
      hasActive: true,
      createHint: "Name and AccountType, or Name and AccountSubType",
    }),
    resource({
      key: "payment_method",
      plural: "payment_methods",
      entity: "PaymentMethod",
      operations: "lgcd",
      remove: "deactivate",
      nameColumn: "Name",
      hasActive: true,
      createHint: "Name",
    }),
    transaction({ key: "payment", plural: "payments", entity: "Payment", operations: "lgcud" }),
    resource({
      key: "product",
      plural: "products",
      entity: "Item",
      operations: "lgcud",
      remove: "deactivate",
      label: "product or service",
      nameColumn: "Name",
      hasActive: true,
      createHint: "Name and Type (Service, Inventory or NonInventory), plus IncomeAccountRef for sellable items",
    }),
    transaction({
      key: "purchase_order",
      plural: "purchase_orders",
      entity: "PurchaseOrder",
      operations: "lgcud",
      createHint:
        "VendorRef, APAccountRef and Line (ItemBasedExpenseLineDetail or AccountBasedExpenseLineDetail lines)",
    }),
    transaction({
      key: "purchase",
      plural: "purchases",
      entity: "Purchase",
      operations: "lgcud",
      label: "purchase (expense, check or credit card charge)",
      createHint: "AccountRef, PaymentType (Cash, Check or CreditCard) and Line",
    }),
    transaction({
      key: "refund_receipt",
      plural: "refund_receipts",
      entity: "RefundReceipt",
      operations: "lgcud",
      createHint: "Line (SalesItemLineDetail lines), DepositToAccountRef and optionally CustomerRef",
    }),
    transaction({
      key: "sales_receipt",
      plural: "sales_receipts",
      entity: "SalesReceipt",
      operations: "lgcud",
      createHint: "Line (SalesItemLineDetail lines) and optionally CustomerRef and DepositToAccountRef",
    }),
    resource({
      key: "tax_agency",
      plural: "tax_agencies",
      entity: "TaxAgency",
      operations: "lgc",
      createHint: "DisplayName",
    }),
    resource({ key: "tax_code", plural: "tax_codes", entity: "TaxCode", operations: "lg", nameColumn: "Name" }),
    resource({ key: "tax_rate", plural: "tax_rates", entity: "TaxRate", operations: "lg", nameColumn: "Name" }),
    transaction({
      key: "time_activity",
      plural: "time_activities",
      entity: "TimeActivity",
      operations: "lgcud",
      createHint:
        "NameOf (Employee or Vendor), the matching EmployeeRef or VendorRef, and Hours/Minutes or StartTime/EndTime",
    }),
    transaction({
      key: "transfer",
      plural: "transfers",
      entity: "Transfer",
      operations: "lgcud",
      createHint: "FromAccountRef, ToAccountRef and Amount",
    }),
    transaction({
      key: "vendor_credit",
      plural: "vendor_credits",
      entity: "VendorCredit",
      operations: "lgcud",
      createHint: "VendorRef and Line (AccountBasedExpenseLineDetail or ItemBasedExpenseLineDetail lines)",
    }),
    resource({
      key: "vendor",
      plural: "vendors",
      entity: "Vendor",
      operations: "lgcud",
      remove: "deactivate",
      nameColumn: "DisplayName",
      hasActive: true,
      createHint: "DisplayName, or at least one of GivenName, FamilyName and CompanyName",
    }),
  ].map((entry) => [entry.key, entry]),
);

/** Action name of a generated operation, such as `list_bills` or `update_bill`. */
export function resourceActionName(resource: QuickbooksResource, operation: QuickbooksResourceOperation): string {
  return operation === "list" ? `list_${resource.plural}` : `${operation}_${resource.key}`;
}

/** The entity of a table entry, for hand-written handlers that need the same path and name. */
export function quickbooksEntity(key: string): QuickbooksEntity {
  const resource = quickbooksResources[key];
  if (!resource) {
    throw new Error(`Unknown QuickBooks resource ${key}`);
  }
  return resource.entity;
}

/** Entity of the `Attachable` record that holds attachment metadata. */
export const quickbooksAttachable: QuickbooksEntity = { name: "Attachable", path: "attachable" };
