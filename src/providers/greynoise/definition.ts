import type { ProviderDefinition } from "../../core/types.ts";

import { greynoiseActions } from "./actions.ts";

const service = "greynoise";

/** GreyNoise provider backed by the public Community API, which needs no API key. */
export const provider: ProviderDefinition = {
  service,
  displayName: "GreyNoise",
  description:
    "Look up an IPv4 address in the GreyNoise Community dataset to tell internet background noise apart from targeted scanning. Reports whether the IP is noise, whether it is a known-benign service, and its classification.",
  categories: ["Security", "Data"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://www.greynoise.io",
  actions: greynoiseActions,
};
