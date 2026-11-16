import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const detector = s.looseObject(
  "A built-in, saved, regex, or word-list detector with optional advanced configuration.",
  {
    detectorUUID: s.string(
      "UUID of a saved detector; when supplied, Nightfall ignores the other detector definition fields.",
    ),
    detectorType: s.stringEnum("Inline detector type.", ["NIGHTFALL_DETECTOR", "REGEX", "WORD_LIST"]),
    nightfallDetector: s.string("Built-in detector name, such as CREDIT_CARD_NUMBER or API_KEY."),
    displayName: s.string("Display name for this detector's findings."),
    minNumFindings: s.integer("Minimum number of matches needed to report this detector."),
    minConfidence: s.stringEnum("Minimum confidence required for a match.", [
      "VERY_UNLIKELY",
      "UNLIKELY",
      "POSSIBLE",
      "LIKELY",
      "VERY_LIKELY",
    ]),
    regex: s.looseObject("Regex detector configuration: pattern and isCaseSensitive.", {}),
    wordList: s.looseObject("Word-list detector configuration: values and isCaseSensitive.", {}),
    contextRules: s.array(
      "Rules that adjust confidence using surrounding context.",
      s.looseObject("Context rule with regex, proximity, and confidenceAdjustment.", {}),
    ),
    exclusionRules: s.array(
      "Rules that exclude matching text from findings.",
      s.looseObject("Exclusion rule with matchType, exclusionType, and regex or wordList.", {}),
    ),
    redactionConfig: s.looseObject(
      "Redaction configuration: maskConfig, infoTypeSubstitutionConfig, substitutionConfig, or cryptoConfig; removeFinding may omit the original finding.",
      {},
    ),
    scope: s.stringEnum("Detector scope.", ["Content", "File", "ContentAndFile"]),
  },
);
const policy = {
  ...s.object(
    "Inline policy; provide at least one saved detection rule UUID or inline detection rule.",
    {
      detectionRuleUUIDs: s.array(
        "Saved detection rule UUIDs, at most 20.",
        s.string("Detection rule UUID.", { minLength: 1 }),
        { maxItems: 20 },
      ),
      detectionRules: s.array(
        "Inline detection rules, at most 20.",
        s.requiredObject("A rule combining detectors.", {
          name: s.optional(s.string("Optional detection rule name.")),
          logicalOp: s.stringEnum("Combine detectors with ANY (OR) or ALL (AND).", ["ANY", "ALL"]),
          detectors: s.array("Detectors used by this rule.", detector, { minItems: 1 }),
        }),
        { maxItems: 20 },
      ),
      contextBytes: s.integer("Bytes of context to return before and after each finding, at most 40.", {
        minimum: 0,
        maximum: 40,
      }),
      defaultRedactionConfig: s.looseObject(
        "Default redaction configuration, using maskConfig, infoTypeSubstitutionConfig, substitutionConfig, or cryptoConfig.",
        {},
      ),
      alertConfig: s.looseObject(
        "Optional asynchronous alerts: slack.target, email.address, url.address, or siem.address with sensitiveHeaders and plainTextHeaders. Nightfall sends requests to these destinations.",
        {},
      ),
    },
    { optional: ["detectionRuleUUIDs", "detectionRules", "contextBytes", "defaultRedactionConfig", "alertConfig"] },
  ),
  anyOf: [
    { required: ["detectionRuleUUIDs"], properties: { detectionRuleUUIDs: { minItems: 1 } } },
    { required: ["detectionRules"], properties: { detectionRules: { minItems: 1 } } },
  ],
};
export const nightfallAiActions: ActionDefinition[] = [
  defineProviderAction("nightfall_ai", {
    name: "scan_text",
    operationType: "write",
    description:
      "Scan text for sensitive data using saved policies or inline detection rules, optionally redact matches and send configured alerts. Submit at most 50,000 strings totaling 500 KB. Findings align with input indices; an empty redactedPayload entry means no redaction was applied, not that the original text was empty.",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "Text and scanning policy.",
        {
          payload: s.array(
            "Strings to scan, with an aggregate maximum size of 500 KB.",
            s.string("One text sample; whitespace is preserved."),
            { minItems: 1, maxItems: 50000 },
          ),
          policyUUIDs: s.array("Saved policy UUIDs; at most one.", s.string("Saved policy UUID.", { minLength: 1 }), {
            minItems: 1,
            maxItems: 1,
          }),
          policy,
        },
        { optional: ["policyUUIDs", "policy"] },
      ),
      anyOf: [{ required: ["policyUUIDs"] }, { required: ["policy"] }],
    },
    outputSchema: s.looseObject("Nightfall scan results, preserving upstream extension fields.", {
      findings: s.array(
        "Findings grouped by the corresponding input payload index.",
        s.array(
          "Matches for one input string; empty when no matches were found.",
          s.looseObject("A sensitive-data finding and its detector metadata.", {
            finding: s.string("Original matched text; may be omitted by removeFinding."),
            redactedFinding: s.string("Redacted match when redaction was configured."),
            beforeContext: s.string("Requested context before the match."),
            afterContext: s.string("Requested context after the match."),
            confidence: s.string("Confidence of the detected match."),
            detector: s.looseObject("Detector name, UUID, and optional subdetector metadata.", {}),
            location: s.looseObject("Original location with byteRange and codepointRange start/end offsets.", {}),
            redactedLocation: s.looseObject(
              "Location in the redacted string with byteRange and codepointRange offsets.",
              {},
            ),
          }),
        ),
      ),
      redactedPayload: s.array(
        "Redacted text aligned with input indices; empty strings indicate no redaction was applied.",
        s.string("Redacted text or an empty string when unchanged."),
      ),
    }),
  }),
];
