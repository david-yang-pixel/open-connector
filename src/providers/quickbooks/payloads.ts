import { compactObject, looseArray, optionalNumber, optionalRecord, optionalString } from "../../core/cast.ts";
import { providerInputError, requiredInputNumber, requiredInputString } from "../provider-runtime.ts";

type QuickbooksBody = Record<string, unknown>;

/** Entity reference such as `CustomerRef`: `{ value, name? }`. */
export function referenceBody(input: unknown, fieldName: string): QuickbooksBody | undefined {
  if (input === undefined) {
    return undefined;
  }
  const record = optionalRecord(input);
  if (!record) {
    throw providerInputError(`${fieldName} must be an object`);
  }
  return compactObject({
    value: requiredInputString(record.value, `${fieldName}.value`),
    name: optionalString(record.name),
  });
}

function addressBody(input: unknown): QuickbooksBody | undefined {
  const record = optionalRecord(input);
  if (!record) {
    return undefined;
  }
  return compactObject({
    Line1: optionalString(record.line1),
    Line2: optionalString(record.line2),
    City: optionalString(record.city),
    CountrySubDivisionCode: optionalString(record.country_sub_division_code),
    PostalCode: optionalString(record.postal_code),
    Country: optionalString(record.country),
  });
}

/** Native fields merged over the modelled ones, so callers can reach anything QuickBooks supports. */
function withAdditionalFields(body: QuickbooksBody, input: Record<string, unknown>): QuickbooksBody {
  return { ...compactObject(body), ...optionalRecord(input.additional_fields) };
}

export function customerBody(input: Record<string, unknown>): QuickbooksBody {
  const email = optionalString(input.email);
  const phone = optionalString(input.phone);
  return withAdditionalFields(
    {
      DisplayName: optionalString(input.display_name),
      GivenName: optionalString(input.given_name),
      FamilyName: optionalString(input.family_name),
      CompanyName: optionalString(input.company_name),
      PrimaryEmailAddr: email ? { Address: email } : undefined,
      PrimaryPhone: phone ? { FreeFormNumber: phone } : undefined,
      Notes: optionalString(input.notes),
      BillAddr: addressBody(input.billing_address),
      ShipAddr: addressBody(input.shipping_address),
    },
    input,
  );
}

function invoiceLineBody(line: unknown, index: number): QuickbooksBody {
  const record = optionalRecord(line);
  if (!record) {
    throw providerInputError(`lines[${index}] must be an object`);
  }
  return compactObject({
    Amount: requiredInputNumber(record.amount, `lines[${index}].amount`),
    Description: optionalString(record.description),
    DetailType: "SalesItemLineDetail",
    SalesItemLineDetail: compactObject({
      ItemRef: referenceBody(record.item_ref, `lines[${index}].item_ref`),
      Qty: optionalNumber(record.quantity),
      UnitPrice: optionalNumber(record.unit_price),
    }),
  });
}

export function invoiceBody(input: Record<string, unknown>): QuickbooksBody {
  const memo = optionalString(input.customer_memo);
  const billEmail = optionalString(input.bill_email);
  return withAdditionalFields(
    {
      CustomerRef: referenceBody(input.customer_ref, "customer_ref"),
      Line: input.lines === undefined ? undefined : looseArray(input.lines).map(invoiceLineBody),
      TxnDate: optionalString(input.txn_date),
      DueDate: optionalString(input.due_date),
      DocNumber: optionalString(input.doc_number),
      PrivateNote: optionalString(input.private_note),
      CustomerMemo: memo ? { value: memo } : undefined,
      BillEmail: billEmail ? { Address: billEmail } : undefined,
      CurrencyRef: referenceBody(input.currency_ref, "currency_ref"),
    },
    input,
  );
}

function appliedInvoiceBody(applied: unknown, index: number): QuickbooksBody {
  const record = optionalRecord(applied);
  if (!record) {
    throw providerInputError(`applied_to[${index}] must be an object`);
  }
  return {
    Amount: requiredInputNumber(record.amount, `applied_to[${index}].amount`),
    LinkedTxn: [
      { TxnId: requiredInputString(record.invoice_id, `applied_to[${index}].invoice_id`), TxnType: "Invoice" },
    ],
  };
}

export function paymentBody(input: Record<string, unknown>): QuickbooksBody {
  return withAdditionalFields(
    {
      CustomerRef: referenceBody(input.customer_ref, "customer_ref"),
      TotalAmt: requiredInputNumber(input.total_amount, "total_amount"),
      TxnDate: optionalString(input.txn_date),
      PaymentMethodRef: referenceBody(input.payment_method_ref, "payment_method_ref"),
      DepositToAccountRef: referenceBody(input.deposit_to_account_ref, "deposit_to_account_ref"),
      PaymentRefNum: optionalString(input.payment_ref_num),
      PrivateNote: optionalString(input.private_note),
      Line: input.applied_to === undefined ? undefined : looseArray(input.applied_to).map(appliedInvoiceBody),
    },
    input,
  );
}
