import type { ProviderDefinition } from "../../core/types.ts";

import { listmonkActions } from "./actions.ts";

const service = "listmonk";

/**
 * Listmonk provider backed by a user-configured, self-hosted listmonk instance.
 *
 * Authenticates as a listmonk API user (Admin -> Users -> New, type "API").
 * Every request carries `Authorization: token <api_user>:<token>`, so the
 * provider acts with exactly the role and list permissions granted to that
 * API user.
 */
export const provider: ProviderDefinition = {
  service,
  displayName: "Listmonk",
  description:
    "Newsletter and mailing list manager: subscribers, lists, templates, and campaigns (create, test, schedule, send) on a self-hosted listmonk instance.",
  categories: ["Marketing", "Communication"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Token",
      placeholder: "LISTMONK_API_TOKEN",
      description:
        "The access token of a listmonk API user, created under Admin -> Users -> New with the user type API. The provider acts with that user's role and list permissions.",
      extraFields: [
        {
          key: "baseUrl",
          label: "Instance Base URL",
          inputType: "text",
          required: true,
          secret: false,
          placeholder: "https://listmonk.example.com",
          description:
            "The root URL of your listmonk instance, the same origin that serves the /admin dashboard. A trailing /api or /admin is stripped.",
        },
        {
          key: "apiUser",
          label: "API Username",
          inputType: "text",
          required: true,
          secret: false,
          placeholder: "api-bot",
          description: "The username of the listmonk API user the token belongs to.",
        },
      ],
    },
  ],
  homepageUrl: "https://listmonk.app",
  actions: listmonkActions,
};
