import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { apiVersion, recordId, mutationResult, fileResult, queryResult, successResult } from "./schemas.ts";
const fileId = recordId;
export const salesforceFileActions: ActionDefinition[] = [
  defineProviderAction("salesforce", {
    name: "upload_file",
    description:
      "Upload a file URL as a new Salesforce ContentVersion using streaming multipart data (up to 2 GB). Can add a version to an existing file.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        fileUrl: s.url("Public HTTPS file URL to download; credentials are not forwarded to this URL."),
        filename: s.nonEmptyString("File name including its extension."),
        metadata: s.looseObject(
          "ContentVersion fields such as Title, Description, FirstPublishLocationId, ContentDocumentId or ReasonForChange; PathOnClient defaults to filename. VersionData cannot be supplied here.",
          {
            Title: s.string("File title."),
            Description: s.string("File description."),
            FirstPublishLocationId: recordId,
            ContentDocumentId: recordId,
            ReasonForChange: s.string("Reason for creating this file version."),
          },
        ),
      },
      ["fileUrl", "filename"],
    ),
    outputSchema: mutationResult,
  }),
  defineProviderAction("salesforce", {
    name: "get_file",
    description: "Get a Salesforce ContentDocument and its latest version reference.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, fileId }, ["fileId"]),
    outputSchema: s.actionOutput({ record: s.looseObject("ContentDocument fields.") }, "File metadata."),
  }),
  defineProviderAction("salesforce", {
    name: "download_file",
    description: "Download a Salesforce file version to local file transit; defaults to the latest published version.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, fileId, versionId: recordId }, ["fileId"]),
    outputSchema: fileResult,
  }),
  defineProviderAction("salesforce", {
    name: "list_record_files",
    description:
      "List files linked to a Salesforce record, including link IDs needed to unlink; use query_more for later pages.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, recordId }, ["recordId"]),
    outputSchema: queryResult,
  }),
  defineProviderAction("salesforce", {
    name: "list_file_shares",
    description: "List a file's ContentDocumentLink sharing records; use query_more for later pages.",
    operationType: "read",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, fileId }, ["fileId"]),
    outputSchema: queryResult,
  }),
  defineProviderAction("salesforce", {
    name: "link_file",
    description: "Link an existing file to a Salesforce record with an explicit sharing level.",
    operationType: "write",
    requiredScopes: ["api"],
    inputSchema: s.actionInput(
      {
        apiVersion,
        fileId,
        recordId,
        shareType: s.stringEnum(["V", "C", "I"], {
          description: "V = Viewer, C = Collaborator, I = Inferred. Availability depends on target and permissions.",
        }),
        visibility: s.stringEnum(["AllUsers", "InternalUsers", "SharedUsers"], {
          description: "Audience of the link, subject to Salesforce policies.",
        }),
      },
      ["fileId", "recordId"],
    ),
    outputSchema: mutationResult,
  }),
  defineProviderAction("salesforce", {
    name: "unlink_file",
    description: "Delete one ContentDocumentLink without deleting the underlying file.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, linkId: recordId }, ["linkId"]),
    outputSchema: successResult,
  }),
  defineProviderAction("salesforce", {
    name: "delete_file",
    description: "Delete a ContentDocument and its associated versions and links.",
    operationType: "destructive",
    requiredScopes: ["api"],
    inputSchema: s.actionInput({ apiVersion, fileId }, ["fileId"]),
    outputSchema: successResult,
  }),
];
