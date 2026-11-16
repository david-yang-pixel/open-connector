import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
export const validemailActions: ActionDefinition[] = [
  defineProviderAction("validemail", {
    name: "verify_email",
    operationType: "read",
    description:
      "Verify one email address with ValidEmail. Each request consumes one credit. Unknown is inconclusive; when RetryAfterSeconds is present, wait that long before repeating the request.",
    followUpActions: ["validemail.verify_email"],
    inputSchema: s.requiredObject("Email verification input.", {
      email: s.nonWhitespaceString("The email address to verify, including potentially invalid addresses."),
    }),
    outputSchema: s.looseObject("Email verification signals; Unknown does not mean invalid.", {
      IsValid: s.boolean("Whether the address passed verification."),
      Score: s.integer("Deliverability confidence score from 0 to 100."),
      Email: s.string("The queried email address normalized to lower case."),
      State: s.string("Verification state: Deliverable, Not Deliverable, or Unknown."),
      Reason: s.string("The reason for the verification state."),
      Domain: s.string("The email domain."),
      Free: s.boolean("Whether the address uses a free email provider."),
      Role: s.boolean("Whether the address is a role inbox."),
      Disposable: s.boolean("Whether the address uses a disposable email provider."),
      AcceptAll: s.boolean("Whether the domain accepts any recipient; positive results require caution."),
      Tag: s.boolean("Whether the address contains a plus tag."),
      MXRecord: s.string("The mail exchange host for the domain."),
      RetryAfterSeconds: s.nullable(
        s.integer("Seconds to wait before repeating an interim verification; null for definitive results."),
      ),
      EmailAdditionalInfo: s.array(
        "Additional diagnostic details.",
        s.looseObject("One diagnostic key and value pair.", {
          Key: s.string("The diagnostic key."),
          Value: s.unknown("The diagnostic value."),
        }),
      ),
    }),
  }),
  defineProviderAction("validemail", {
    name: "get_balance",
    operationType: "read",
    description: "Get remaining ValidEmail verification credits without consuming a credit.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: s.looseRequiredObject("Remaining verification credits.", {
      balance: s.number("The number of verification credits remaining."),
    }),
  }),
];
