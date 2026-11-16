import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "templatedocs";

const templateIdSchema = s.nonEmptyString("The unique TemplateDocs template identifier.");

const tagSchema = s.looseRequiredObject("One placeholder tag discovered in the template.", {
  name: s.string("The placeholder tag name."),
  shape: s.stringEnum("Whether the tag is standalone or contains nested tags.", ["standalone", "container"]),
  children: s.array(
    "Nested placeholder tags when the tag is a container.",
    s.looseObject("One nested placeholder tag."),
  ),
});

const templateSchema = s.looseRequiredObject("Template metadata returned by TemplateDocs.", {
  id: s.string("The unique template identifier."),
  name: s.string("The template filename."),
  createdAt: s.dateTime("The ISO 8601 timestamp when the template was created."),
  fileSize: s.number("The template file size in bytes."),
  sha256: s.string("The SHA-256 hash of the template file."),
  tags: s.array("Placeholder tags discovered in the template.", tagSchema),
});

const successSchema = s.object("The completed TemplateDocs operation.", {
  success: s.boolean("Whether TemplateDocs completed the operation."),
});

const generatedFileSchema = s.object("The generated document stored in connector file transit.", {
  name: s.string("The generated document filename."),
  mimeType: s.string("The generated document MIME type."),
  downloadUrl: s.url("The transit URL for downloading the generated document."),
  sizeBytes: s.integer("The generated document size in bytes."),
});

export const templatedocsActions: readonly ActionDefinition[] = [
  defineProviderAction(service, {
    name: "list_templates",
    operationType: "read",
    description: "List one page of templates available to the TemplateDocs API key.",
    inputSchema: s.object(
      "Pagination options for listing TemplateDocs templates.",
      {
        pageIndex: s.integer("The 1-based page index to retrieve. Defaults to 1.", {
          minimum: 1,
        }),
      },
      { optional: ["pageIndex"] },
    ),
    outputSchema: s.looseRequiredObject("One page of TemplateDocs templates.", {
      pageSize: s.number("The maximum number of templates returned per page."),
      pageIndex: s.number("The 1-based index of the returned page."),
      templates: s.array("Templates returned for this page.", templateSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "get_template",
    operationType: "read",
    description: "Retrieve metadata and placeholder tags for one TemplateDocs template.",
    inputSchema: s.object("The TemplateDocs template to retrieve.", {
      templateId: templateIdSchema,
    }),
    outputSchema: templateSchema,
  }),
  defineProviderAction(service, {
    name: "update_template",
    operationType: "destructive",
    description: "Update the name or generation-warning option for a TemplateDocs template.",
    inputSchema: s.object(
      "Metadata changes for one TemplateDocs template.",
      {
        templateId: templateIdSchema,
        name: s.nonEmptyString("A unique template filename ending in .docx."),
        allowGenerationWithWarnings: s.boolean(
          "Whether TemplateDocs may generate documents when the template has warnings.",
        ),
      },
      { optional: ["name", "allowGenerationWithWarnings"] },
    ),
    outputSchema: successSchema,
  }),
  defineProviderAction(service, {
    name: "delete_template",
    operationType: "destructive",
    description: "Permanently delete one TemplateDocs template.",
    inputSchema: s.object("The TemplateDocs template to permanently delete.", {
      templateId: templateIdSchema,
    }),
    outputSchema: successSchema,
  }),
  defineProviderAction(service, {
    name: "generate_document",
    operationType: "write",
    description:
      "Fill a TemplateDocs template with JSON data and return the generated DOCX or PDF through file transit.",
    inputSchema: s.object(
      "Data and output options for generating a TemplateDocs document.",
      {
        templateId: templateIdSchema,
        data: s.looseObject("Values whose keys match placeholders in the template."),
        format: s.stringEnum("The generated document format. Defaults to docx.", ["docx", "pdf"]),
        filename: s.nonEmptyString("The desired generated document filename."),
        email: s.object(
          "Optional email delivery settings applied by TemplateDocs.",
          {
            to: s.array("Primary recipient email addresses.", s.email("One primary recipient."), {
              minItems: 1,
            }),
            cc: s.array("CC recipient email addresses.", s.email("One CC recipient."), {
              minItems: 1,
            }),
            bcc: s.array("BCC recipient email addresses.", s.email("One BCC recipient."), {
              minItems: 1,
            }),
            subject: s.nonEmptyString("The email subject replacing the default subject."),
            body: s.nonEmptyString("The text or HTML email body replacing the default body."),
          },
          { optional: ["cc", "bcc", "subject", "body"] },
        ),
      },
      { optional: ["format", "filename", "email"] },
    ),
    outputSchema: s.object("The generated TemplateDocs document.", {
      document: generatedFileSchema,
    }),
  }),
];
