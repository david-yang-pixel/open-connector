import type { ActionDefinition } from "../../core/types.ts";

import { defineProviderAction } from "../../core/provider-definition.ts";
const search = defineProviderAction("orbit", {
  name: "search",
  description:
    "Find people, optionally discover additional candidates, and build every selected result to the requested profile depth. Requires the `search:read` scope. Requests that include profiles also require `profile:read`.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    description:
      "Provide `query`, `intent`, at least one identity signal, or a supported combination. When query and intent are both present, Orbit derives a base intent from query and overlays the caller-provided intent. Arrays, scalar values, and null replace derived values; nested objects merge field by field.",
    additionalProperties: false,
    properties: {
      request_id: {
        type: "string",
        minLength: 1,
        description: "Your idempotency key. Reuse it only when retrying the same logical request.",
      },
      query: {
        type: "string",
        minLength: 1,
        description:
          "A plain-English description of the people you want. When intent is also present, Orbit derives a base intent from this query before applying the caller-provided structured fields.",
      },
      intent: {
        type: "object",
        description: "Advanced structured criteria. Do not include a `version` field.",
        minProperties: 1,
        additionalProperties: false,
        properties: {
          names: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
              description: "Names. item.",
            },
            description: "Names.",
          },
          experiences: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: {
                  type: "string",
                  description: "Title.",
                },
                titleAnyOf: {
                  type: "array",
                  items: {
                    type: "string",
                    description: "Any matching job title. item.",
                  },
                  description: "Any matching job title.",
                },
                organization: {
                  type: "string",
                  description: "Organization.",
                },
                year: {
                  type: "integer",
                  description: "Year.",
                },
                startYear: {
                  type: "integer",
                  description: "Starting year.",
                },
                startYearLte: {
                  type: "integer",
                  description: "Latest starting year.",
                },
                endYear: {
                  type: "integer",
                  description: "Ending year.",
                },
                temporalScope: {
                  type: "string",
                  enum: ["current", "historical", "both"],
                  description: "Temporal scope.",
                },
              },
              description: "Experiences. item.",
            },
            description: "Experiences.",
          },
          semanticClauses: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                text: {
                  type: "string",
                  minLength: 1,
                  description: "Text.",
                },
                anyOf: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "string",
                    minLength: 1,
                    description: "Any matching clause. item.",
                  },
                  description: "Any matching clause.",
                },
              },
              anyOf: [
                {
                  required: ["text"],
                  description: "Semantic clauses. item. variant.",
                },
                {
                  required: ["anyOf"],
                  description: "Semantic clauses. item. variant.",
                },
              ],
              description: "Semantic clauses. item.",
            },
            description: "Semantic clauses.",
          },
          schools: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                school: {
                  type: "string",
                  description: "School.",
                },
                schoolAnyOf: {
                  type: "array",
                  items: {
                    type: "string",
                    description: "Any matching school. item.",
                  },
                  description: "Any matching school.",
                },
                graduationYear: {
                  type: "integer",
                  description: "Graduation year.",
                },
                startYear: {
                  type: "integer",
                  description: "Starting year.",
                },
                endYear: {
                  type: "integer",
                  description: "Ending year.",
                },
                temporalScope: {
                  type: "string",
                  enum: ["current", "historical", "both"],
                  description: "Temporal scope.",
                },
                relation: {
                  type: "string",
                  description: "Relation.",
                },
              },
              description: "Schools. item.",
            },
            description: "Schools.",
          },
          geo: {
            oneOf: [
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  place: {
                    type: "string",
                    description: "Place.",
                  },
                  isHistorical: {
                    type: "boolean",
                    description: "Whether the location is historical.",
                  },
                  distance: {
                    type: "string",
                    description: "Distance.",
                  },
                },
                description: "Geo. variant.",
              },
              {
                type: "null",
                description: "Geo. variant.",
              },
            ],
            description: "Geo.",
          },
          demographics: {
            oneOf: [
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  ageRange: {
                    type: "object",
                    additionalProperties: false,
                    required: ["min", "max"],
                    properties: {
                      min: {
                        type: "integer",
                        description: "Min.",
                      },
                      max: {
                        type: "integer",
                        description: "Max.",
                      },
                    },
                    description: "Age range.",
                  },
                  birthYearRange: {
                    type: "object",
                    additionalProperties: false,
                    required: ["min", "max"],
                    properties: {
                      min: {
                        type: "integer",
                        description: "Min.",
                      },
                      max: {
                        type: "integer",
                        description: "Max.",
                      },
                    },
                    description: "Birth year range.",
                  },
                  gender: {
                    type: "string",
                    description: "Gender.",
                  },
                },
                description: "Demographics. variant.",
              },
              {
                type: "null",
                description: "Demographics. variant.",
              },
            ],
            description: "Demographics.",
          },
          personalization: {
            oneOf: [
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  network: {
                    type: "object",
                    additionalProperties: false,
                    required: ["scope"],
                    properties: {
                      scope: {
                        type: "string",
                        enum: ["first_degree"],
                        description: "Scope.",
                      },
                    },
                    description: "Network.",
                  },
                  nearMe: {
                    type: "object",
                    additionalProperties: false,
                    required: ["distance"],
                    properties: {
                      distance: {
                        type: "string",
                        description: "Distance.",
                      },
                    },
                    description: "Whether to limit matches to nearby locations.",
                  },
                },
                description: "Personalization. variant.",
              },
              {
                type: "null",
                description: "Personalization. variant.",
              },
            ],
            description: "Personalization.",
          },
        },
      },
      signals: {
        type: "object",
        description: "Known identity signals. Send only the signals you have.",
        minProperties: 1,
        additionalProperties: false,
        properties: {
          address: {
            type: "string",
            minLength: 1,
            description: "Address.",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email.",
          },
          phone: {
            type: "string",
            minLength: 1,
            description: "Phone.",
          },
          linkedin_url: {
            type: "string",
            format: "uri",
            description: "Linkedin url.",
          },
          urls: {
            type: "array",
            items: {
              type: "string",
              format: "uri",
              description: "Urls. item.",
            },
            description: "Urls.",
          },
          usernames: {
            type: "array",
            items: {
              type: "string",
              minLength: 1,
              description: "Usernames. item.",
            },
            description: "Usernames.",
          },
          face_source: {
            allOf: [
              {
                type: "object",
                required: ["image_url"],
                additionalProperties: false,
                description:
                  "A face from a photo stored by `POST /v3/faces/detect`. On `POST /v3/search` it searches for the people the face could be.",
                properties: {
                  image_url: {
                    type: "string",
                    minLength: 1,
                    description: "The photo reference returned by `POST /v3/faces/detect`.",
                  },
                  bbox: {
                    allOf: [
                      {
                        type: "array",
                        minItems: 4,
                        maxItems: 4,
                        items: {
                          type: "number",
                          minimum: 0,
                          description: "Bbox. variant. item.",
                        },
                        description: "A face box `[x0, y0, x1, y1]` in the pixels of the upright photo.",
                      },
                    ],
                    description:
                      "The picked face's box from `POST /v3/faces/detect`. Required when the photo has more than one face.",
                  },
                },
              },
            ],
            description:
              "A face from a photo. It is enough on its own: the search returns the possible people, up to `candidate_discovery_limit`, best match first.",
          },
        },
      },
      candidate_discovery: {
        type: "boolean",
        description:
          "Continue beyond known matches to find additional people. Address, email, and phone signals can each resolve to multiple associated people.",
      },
      candidate_discovery_limit: {
        type: "integer",
        minimum: 1,
        maximum: 50,
        description:
          "Maximum number of Candidate Discovery results. Valid only with candidate_discovery set to true. A lower value reduces downstream profile-generation fanout, although source discovery and clustering can still dominate initial discovery time.",
      },
      profile_depth: {
        type: "string",
        enum: ["partial", "full"],
        description: "The minimum profile depth required for each ready result.",
      },
      include_profile: {
        type: "boolean",
        description:
          "Embed each readable result's profile with its identity fields, contact fields, and generated sections. Read GET /v3/enrich/{profile_id} for the image gallery and source links. This controls the response shape; profile_depth controls how deep each profile is built.",
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        description:
          "The maximum number of matches returned from the existing Orbit index. Candidate Discovery results append outside this limit, and profile upgrades update selected results in place.",
      },
      webhooks: {
        type: "boolean",
        description:
          "Deliver this search's generation updates to the webhook endpoints subscribed to search.profile.updated and search.completed. Deliveries embed whole profiles, so this requires the profile:read scope.",
      },
      face_search: {
        type: "boolean",
        description:
          "Opt into portrait-based source expansion during full generation. Requires candidate_discovery=true, profile_depth=full and limit + candidate_discovery_limit <= 30. Cannot be combined with signals.face_source. Already-full cached profiles are not regenerated.\n\nSignificantly more expensive: 100 credits total per generated profile instead of the normal 10 (10x). Use only when you need maximum coverage of a person. Reserves up to 100 credits per eligible profile. A successful face-search provider response, including an empty result, charges the 100-credit inclusive total even if later generation fails. With no usable portrait or all providers failing, ordinary delivered-depth pricing applies.",
      },
      idempotencyKey: {
        type: "string",
        maxLength: 200,
        description:
          "A client-generated key for a safe retry. If the body omits `request_id`, Orbit can use this value as the request ID.",
      },
    },
    anyOf: [
      {
        required: ["query"],
        description: "Start a People Search parameters. variant.",
      },
      {
        required: ["intent"],
        description: "Start a People Search parameters. variant.",
      },
      {
        required: ["signals"],
        description: "Start a People Search parameters. variant.",
      },
    ],
    required: [],
  },
  outputSchema: {
    type: "object",
    required: [
      "search_id",
      "request_id",
      "status",
      "candidate_discovery",
      "profile_depth",
      "include_profile",
      "profile_upgrades_completed",
      "results",
      "created_at",
      "updated_at",
      "links",
    ],
    properties: {
      search_id: {
        type: "string",
        description: "Server-generated identifier for this search. Use it to poll the status endpoint.",
      },
      request_id: {
        type: "string",
        description: "The idempotency key from the original request, or a generated value when the request omitted it.",
      },
      status: {
        type: "string",
        description:
          "Overall search lifecycle. `running` means work is still in progress; poll until the status is terminal. `completed` means every result reached the requested profile depth; a search can complete with an empty results list when nothing matched. `completed_with_errors` means ready results are available but some work failed. `failed` means work failed and no ready results are available.",
        enum: ["running", "completed", "completed_with_errors", "failed"],
      },
      candidate_discovery: {
        type: "boolean",
        description: "Whether this search runs candidate discovery, as resolved from the request.",
      },
      candidate_discovery_completed: {
        type: "boolean",
        description:
          "Whether the result list is final. Once true, discovery adds no more results to this search; the results themselves can still be generating or enriching toward the requested depth. For discovery searches this becomes true when clustering completes and every discovered person appears in results. If discovery failed, candidate_discovery_failure explains why. Present only when candidate_discovery is true.",
      },
      provider_results_final: {
        type: "boolean",
        description:
          "Whether the people-data provider lookup for a supplied phone, email, or address returned its complete owner set. Once true, every owner of that contact is in results with the contacts the provider reported, usually within the first response and before biography work. Discovery by name can still add results until candidate_discovery_completed is true. Present only when candidate_discovery is true and the request carried a phone, email, or address signal.",
      },
      profile_depth: {
        type: "string",
        description: "The minimum profile depth requested for each ready result.",
        enum: ["partial", "full"],
      },
      include_profile: {
        type: "boolean",
        description: "Whether readable results embed their Search profile.",
      },
      profile_upgrades_completed: {
        type: "boolean",
        description:
          "Whether every result in results has reached the requested profile_depth or failed. While candidate_discovery_completed is false, discovery can still add results with new profile work.",
      },
      results: {
        type: "array",
        description:
          "The people this search has found so far. Results are append-only: a reported result is never removed, and a ready result never regresses.",
        items: {
          type: "object",
          description: "Results. item.",
          additionalProperties: true,
        },
      },
      confidence_kind: {
        type: "string",
        enum: ["identity", "criteria"],
        description:
          "`identity` when the search looks for one person, such as by name, contact, or face, and `criteria` when it looks for everyone who fits a description.",
      },
      none_of_above_confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description:
          "One minus the best result's `confidence`. It is high when no result matches well. Present on `identity` searches.",
      },
      discovered_sources: {
        type: "array",
        description:
          "Every page the search has found, in the order the search first found each one. The list starts filling within seconds and holds up to 200 pages. A page stays listed through later polls and after the search ends, including a page that is also in a result's `candidate_sources`. Present when candidate_discovery is true.",
        items: {
          type: "object",
          description: "Discovered sources. item.",
          additionalProperties: true,
        },
      },
      candidate_discovery_failure: {
        type: "object",
        description: "Why candidate discovery failed. Present only when discovery failed.",
        additionalProperties: true,
      },
      population: {
        type: "object",
        description:
          "Present on population searches: the subject, the depth, the reserved credits and where the search is.",
        additionalProperties: true,
      },
      query_intent: {
        type: "object",
        description: "Present when the search parsed a plain-English query.",
        additionalProperties: true,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "When the search was created.",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "When the snapshot last changed.",
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description:
          "Credits held and spent for this search. The final consumedCredits is the full charge once status is settled.",
        additionalProperties: true,
      },
    },
    description: "Start a People Search response.",
    additionalProperties: true,
  },
  asyncLifecycle: {
    startActionId: "orbit.search",
    statusActionId: "orbit.get_search",
  },
});
const get_search = defineProviderAction("orbit", {
  name: "get_search",
  description:
    "Return the latest search snapshot. Poll while the status is `running`. Requires the `search:read` scope. Searches that include profiles also require `profile:read`.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      search_id: {
        type: "string",
        minLength: 1,
        description: "The search ID returned by `POST /v3/search`.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description: "Get Search Status parameters.",
    additionalProperties: false,
    required: ["search_id"],
  },
  outputSchema: {
    type: "object",
    required: [
      "search_id",
      "request_id",
      "status",
      "candidate_discovery",
      "profile_depth",
      "include_profile",
      "profile_upgrades_completed",
      "results",
      "created_at",
      "updated_at",
      "links",
    ],
    properties: {
      search_id: {
        type: "string",
        description: "Server-generated identifier for this search. Use it to poll the status endpoint.",
      },
      request_id: {
        type: "string",
        description: "The idempotency key from the original request, or a generated value when the request omitted it.",
      },
      status: {
        type: "string",
        description:
          "Overall search lifecycle. `running` means work is still in progress; poll until the status is terminal. `completed` means every result reached the requested profile depth; a search can complete with an empty results list when nothing matched. `completed_with_errors` means ready results are available but some work failed. `failed` means work failed and no ready results are available.",
        enum: ["running", "completed", "completed_with_errors", "failed"],
      },
      candidate_discovery: {
        type: "boolean",
        description: "Whether this search runs candidate discovery, as resolved from the request.",
      },
      candidate_discovery_completed: {
        type: "boolean",
        description:
          "Whether the result list is final. Once true, discovery adds no more results to this search; the results themselves can still be generating or enriching toward the requested depth. For discovery searches this becomes true when clustering completes and every discovered person appears in results. If discovery failed, candidate_discovery_failure explains why. Present only when candidate_discovery is true.",
      },
      provider_results_final: {
        type: "boolean",
        description:
          "Whether the people-data provider lookup for a supplied phone, email, or address returned its complete owner set. Once true, every owner of that contact is in results with the contacts the provider reported, usually within the first response and before biography work. Discovery by name can still add results until candidate_discovery_completed is true. Present only when candidate_discovery is true and the request carried a phone, email, or address signal.",
      },
      profile_depth: {
        type: "string",
        description: "The minimum profile depth requested for each ready result.",
        enum: ["partial", "full"],
      },
      include_profile: {
        type: "boolean",
        description: "Whether readable results embed their Search profile.",
      },
      profile_upgrades_completed: {
        type: "boolean",
        description:
          "Whether every result in results has reached the requested profile_depth or failed. While candidate_discovery_completed is false, discovery can still add results with new profile work.",
      },
      results: {
        type: "array",
        description:
          "The people this search has found so far. Results are append-only: a reported result is never removed, and a ready result never regresses.",
        items: {
          type: "object",
          description: "Results. item.",
          additionalProperties: true,
        },
      },
      confidence_kind: {
        type: "string",
        enum: ["identity", "criteria"],
        description:
          "`identity` when the search looks for one person, such as by name, contact, or face, and `criteria` when it looks for everyone who fits a description.",
      },
      none_of_above_confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description:
          "One minus the best result's `confidence`. It is high when no result matches well. Present on `identity` searches.",
      },
      discovered_sources: {
        type: "array",
        description:
          "Every page the search has found, in the order the search first found each one. The list starts filling within seconds and holds up to 200 pages. A page stays listed through later polls and after the search ends, including a page that is also in a result's `candidate_sources`. Present when candidate_discovery is true.",
        items: {
          type: "object",
          description: "Discovered sources. item.",
          additionalProperties: true,
        },
      },
      candidate_discovery_failure: {
        type: "object",
        description: "Why candidate discovery failed. Present only when discovery failed.",
        additionalProperties: true,
      },
      population: {
        type: "object",
        description:
          "Present on population searches: the subject, the depth, the reserved credits and where the search is.",
        additionalProperties: true,
      },
      query_intent: {
        type: "object",
        description: "Present when the search parsed a plain-English query.",
        additionalProperties: true,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "When the search was created.",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "When the snapshot last changed.",
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description:
          "Credits held and spent for this search. The final consumedCredits is the full charge once status is settled.",
        additionalProperties: true,
      },
    },
    description: "Get Search Status response.",
    additionalProperties: true,
  },
});
const quote_population = defineProviderAction("orbit", {
  name: "quote_population",
  description:
    "What it costs to search everyone at a company or everyone who attended a school. Requires the `search:read` scope.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    required: ["population"],
    properties: {
      population: {
        type: "object",
        required: ["kind", "id", "name"],
        properties: {
          kind: {
            type: "string",
            enum: ["company", "school"],
            description: "What the population is: the current employees of a company, or the alumni of a school.",
          },
          id: {
            type: "string",
            description: "The numeric id of the company or school.",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            description: "The company or school name.",
          },
        },
        description: "Population.",
        additionalProperties: false,
      },
      size: {
        type: ["integer", "null"],
        minimum: 0,
        description: "How many people the population has, when you know it.",
      },
      profile_depth: {
        type: "string",
        enum: ["partial", "full"],
        description: "The depth every person in the population is built to.",
      },
    },
    description: "Price a Population Search parameters.",
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    required: ["population", "size", "profile_depth", "credits", "max_people", "pricing_version"],
    properties: {
      population: {
        type: "object",
        description: "Population.",
        additionalProperties: true,
      },
      size: {
        type: ["integer", "null"],
        description: "The population's size as given, or null.",
      },
      profile_depth: {
        type: "string",
        enum: ["partial", "full"],
        description: "The depth the quote priced.",
      },
      credits: {
        type: "integer",
        description: "The whole cost of the search, as one number. Reserved when the search starts.",
      },
      max_people: {
        type: "integer",
        description: "The most people one population search covers.",
      },
      pricing_version: {
        type: "string",
        description: "The pricing catalog version the quote used.",
      },
    },
    description: "Price a Population Search response.",
    additionalProperties: true,
  },
});
const search_population = defineProviderAction("orbit", {
  name: "search_population",
  description:
    "Search everyone at a company or everyone who attended a school. People are added to the results as the search finds them. Reserves the quoted credits. Requires the `search:read` scope.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    required: ["population"],
    properties: {
      request_id: {
        type: "string",
        maxLength: 200,
        description:
          "Idempotency key. The same request_id returns the same search; a different population under the same id returns 409.",
      },
      population: {
        type: "object",
        required: ["kind", "id", "name"],
        properties: {
          kind: {
            type: "string",
            enum: ["company", "school"],
            description: "What the population is: the current employees of a company, or the alumni of a school.",
          },
          id: {
            type: "string",
            description: "The numeric id of the company or school.",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            description: "The company or school name.",
          },
        },
        description: "Population.",
        additionalProperties: false,
      },
      size: {
        type: ["integer", "null"],
        minimum: 0,
        description: "How many people the population has, when you know it.",
      },
      profile_depth: {
        type: "string",
        enum: ["partial", "full"],
        description: "The depth every person in the population is built to.",
      },
      idempotencyKey: {
        type: "string",
        maxLength: 200,
        description:
          "A client-generated key for a safe retry. If the body omits `request_id`, Orbit can use this value as the request ID.",
      },
    },
    description: "Search a Population parameters.",
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    required: [
      "search_id",
      "request_id",
      "status",
      "candidate_discovery",
      "profile_depth",
      "include_profile",
      "profile_upgrades_completed",
      "results",
      "created_at",
      "updated_at",
      "links",
    ],
    properties: {
      search_id: {
        type: "string",
        description: "Server-generated identifier for this search. Use it to poll the status endpoint.",
      },
      request_id: {
        type: "string",
        description: "The idempotency key from the original request, or a generated value when the request omitted it.",
      },
      status: {
        type: "string",
        description:
          "Overall search lifecycle. `running` means work is still in progress; poll until the status is terminal. `completed` means every result reached the requested profile depth; a search can complete with an empty results list when nothing matched. `completed_with_errors` means ready results are available but some work failed. `failed` means work failed and no ready results are available.",
        enum: ["running", "completed", "completed_with_errors", "failed"],
      },
      candidate_discovery: {
        type: "boolean",
        description: "Whether this search runs candidate discovery, as resolved from the request.",
      },
      candidate_discovery_completed: {
        type: "boolean",
        description:
          "Whether the result list is final. Once true, discovery adds no more results to this search; the results themselves can still be generating or enriching toward the requested depth. For discovery searches this becomes true when clustering completes and every discovered person appears in results. If discovery failed, candidate_discovery_failure explains why. Present only when candidate_discovery is true.",
      },
      provider_results_final: {
        type: "boolean",
        description:
          "Whether the people-data provider lookup for a supplied phone, email, or address returned its complete owner set. Once true, every owner of that contact is in results with the contacts the provider reported, usually within the first response and before biography work. Discovery by name can still add results until candidate_discovery_completed is true. Present only when candidate_discovery is true and the request carried a phone, email, or address signal.",
      },
      profile_depth: {
        type: "string",
        description: "The minimum profile depth requested for each ready result.",
        enum: ["partial", "full"],
      },
      include_profile: {
        type: "boolean",
        description: "Whether readable results embed their Search profile.",
      },
      profile_upgrades_completed: {
        type: "boolean",
        description:
          "Whether every result in results has reached the requested profile_depth or failed. While candidate_discovery_completed is false, discovery can still add results with new profile work.",
      },
      results: {
        type: "array",
        description:
          "The people this search has found so far. Results are append-only: a reported result is never removed, and a ready result never regresses.",
        items: {
          type: "object",
          description: "Results. item.",
          additionalProperties: true,
        },
      },
      confidence_kind: {
        type: "string",
        enum: ["identity", "criteria"],
        description:
          "`identity` when the search looks for one person, such as by name, contact, or face, and `criteria` when it looks for everyone who fits a description.",
      },
      none_of_above_confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description:
          "One minus the best result's `confidence`. It is high when no result matches well. Present on `identity` searches.",
      },
      discovered_sources: {
        type: "array",
        description:
          "Every page the search has found, in the order the search first found each one. The list starts filling within seconds and holds up to 200 pages. A page stays listed through later polls and after the search ends, including a page that is also in a result's `candidate_sources`. Present when candidate_discovery is true.",
        items: {
          type: "object",
          description: "Discovered sources. item.",
          additionalProperties: true,
        },
      },
      candidate_discovery_failure: {
        type: "object",
        description: "Why candidate discovery failed. Present only when discovery failed.",
        additionalProperties: true,
      },
      population: {
        type: "object",
        description:
          "Present on population searches: the subject, the depth, the reserved credits and where the search is.",
        additionalProperties: true,
      },
      query_intent: {
        type: "object",
        description: "Present when the search parsed a plain-English query.",
        additionalProperties: true,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "When the search was created.",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "When the snapshot last changed.",
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description:
          "Credits held and spent for this search. The final consumedCredits is the full charge once status is settled.",
        additionalProperties: true,
      },
    },
    description: "Search a Population response.",
    additionalProperties: true,
  },
  asyncLifecycle: {
    startActionId: "orbit.search_population",
    statusActionId: "orbit.get_search",
  },
});
const batch_enrich = defineProviderAction("orbit", {
  name: "batch_enrich",
  description:
    "Apply one enrichment operation to between 1 and 20 known Orbit profile IDs. Requires the `search:read` scope. Requests that include profiles also require `profile:read`.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["profile_ids", "operation"],
    properties: {
      request_id: {
        type: "string",
        minLength: 1,
        description: "The parent idempotency key for the batch.",
      },
      profile_ids: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        description:
          "Provide between 1 and 20 Orbit profile IDs or slugs. Duplicate entries within this list are normalized before work starts.",
        items: {
          type: "string",
          minLength: 1,
          description: "Profile ids. item.",
        },
      },
      operation: {
        type: "string",
        enum: ["partial", "full", "regenerate"],
        description:
          "Use `partial` for a useful profile, `full` for the deepest available profile, or `regenerate` to rebuild a fresh full profile. With face_search=true, full and regenerate start full-generation work even for an already-full profile; partial does not support face_search.",
      },
      include_profile: {
        type: "boolean",
        description: "Embed each child result's full public profile when one is available.",
      },
      face_search: {
        type: "boolean",
        description:
          "Apply portrait-based source expansion to every profile with operation=full or operation=regenerate. Candidate discovery is not required. Rejects operation=partial. Starts full-generation work even for already-full profiles; each profile has its own reservation and charge.\n\nSignificantly more expensive: 100 credits total per generated profile instead of the normal 10 (10x). Use only when you need maximum coverage of a person. Reserves up to 100 credits per eligible profile. A successful face-search provider response, including an empty result, charges the 100-credit inclusive total even if later generation fails. With no usable portrait or all providers failing, ordinary delivered-depth pricing applies.",
      },
      idempotencyKey: {
        type: "string",
        maxLength: 200,
        description:
          "A client-generated key for a safe retry. If the body omits `request_id`, Orbit can use this value as the request ID.",
      },
    },
    description: "Batch Enrich Profiles parameters.",
  },
  outputSchema: {
    type: "object",
    required: ["request_id", "status", "results", "request_ids"],
    properties: {
      request_id: {
        type: "string",
        description: "Request id.",
      },
      status: {
        type: "string",
        enum: ["running", "completed", "completed_with_errors"],
        description: "Status.",
      },
      results: {
        type: "array",
        items: {
          type: "object",
          description: "Results. item.",
          additionalProperties: true,
        },
        description: "Results.",
      },
      request_ids: {
        type: "array",
        description: "Accepted child request IDs. Pass this array to get_batch_enrichment to read all child results.",
        items: {
          type: "string",
          description: "Child request ID.",
        },
      },
    },
    description: "Batch Enrich Profiles response.",
    additionalProperties: true,
  },
  asyncLifecycle: {
    startActionId: "orbit.batch_enrich",
    statusActionId: "orbit.get_batch_enrichment",
  },
});
const read_profile = defineProviderAction("orbit", {
  name: "read_profile",
  description:
    "Read the current public profile for an Orbit profile ID, known alias ID, or public profile slug. When the stored profile is stale, the read can schedule a background refresh. Use POST /v3/enrich/{profile_id} to request a specific depth or regeneration. Requires the `profile:read` scope. Optional format=markdown returns compact factual USER.md, a manifest and populated section Markdown files in a JSON package; format=json is the default. Both representations use the same public-profile filtering, billing and refresh behavior.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      profile_id: {
        type: "string",
        minLength: 1,
        description: "An Orbit profile ID or public profile slug. Profile reads also accept known alias IDs.",
        not: {
          enum: [".", ".."],
        },
      },
      idempotencyKey: {
        type: "string",
        maxLength: 200,
        description:
          "A client-generated key for a safe retry. If the body omits `request_id`, Orbit can use this value as the request ID.",
      },
      format: {
        type: "string",
        enum: ["json", "markdown"],
        description:
          "Response representation. Case-sensitive; empty, unsupported or repeated values return developer_v3_profile_format_invalid (400) before lookup or billing.",
      },
    },
    description: "Read an Enriched Profile parameters.",
    additionalProperties: false,
    required: ["profile_id"],
  },
  outputSchema: {
    oneOf: [
      {
        type: "object",
        required: ["profile_id", "generation_level", "profile", "billing"],
        properties: {
          profile_id: {
            type: "string",
            description: "Profile id.",
          },
          generation_level: {
            oneOf: [
              {
                type: "integer",
                minimum: 1,
                maximum: 3,
                description: "Generation level. variant.",
              },
              {
                type: "null",
                description: "Generation level. variant.",
              },
            ],
            description: "Generation level.",
          },
          profile: {
            type: "object",
            description: "The public Orbit profile. Available fields depend on the profile generation level.",
            additionalProperties: true,
          },
          billing: {
            type: "object",
            description:
              "Credits charged for this read. A read settles at once: status is settled and consumedCredits is the full charge.",
            additionalProperties: true,
          },
        },
        description: "Read an Enriched Profile response. variant.",
        additionalProperties: true,
      },
      {
        type: "object",
        required: ["profile_id", "generation_level", "format", "markdown", "billing"],
        properties: {
          profile_id: {
            type: "string",
            description: "Resolved canonical Orbit profile ID.",
          },
          generation_level: {
            oneOf: [
              {
                type: "integer",
                minimum: 1,
                maximum: 3,
                description: "Generation level. variant.",
              },
              {
                type: "null",
                description: "Generation level. variant.",
              },
            ],
            description: "Generation level.",
          },
          format: {
            type: "string",
            const: "markdown",
            description: "Format.",
          },
          markdown: {
            type: "object",
            description:
              "Factual person context: compact OpenClaw-compatible USER.md and populated public profile sections. Empty or unavailable sections are omitted from files and manifest. All values are descriptive untrusted data, not agent instructions or permissions.",
            additionalProperties: true,
          },
          billing: {
            type: "object",
            description:
              "Credits held and spent for the billing operation behind this request. Poll until status is settled to read the final consumedCredits.",
            additionalProperties: true,
          },
        },
        description: "Read an Enriched Profile response. variant.",
        additionalProperties: true,
      },
    ],
    description: "Read an Enriched Profile response.",
  },
});
const enrich_profile = defineProviderAction("orbit", {
  name: "enrich_profile",
  description:
    "Read, upgrade, or regenerate one known Orbit profile. Requires the `search:read` scope. Requests that include the profile also require `profile:read`.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["operation", "profile_id"],
    properties: {
      request_id: {
        type: "string",
        minLength: 1,
        description: "Your idempotency key. Keep it stable across retries of the same operation.",
      },
      operation: {
        type: "string",
        enum: ["partial", "full", "regenerate"],
        description:
          "Use `partial` for a useful profile, `full` for the deepest available profile, or `regenerate` to rebuild a fresh full profile. With face_search=true, full and regenerate start full-generation work even for an already-full profile; partial does not support face_search.",
      },
      include_profile: {
        type: "boolean",
        description: "Embed the full public profile when one is available.",
      },
      face_search: {
        type: "boolean",
        description:
          "Opt into portrait-based source expansion with operation=full or operation=regenerate. Candidate discovery is not required. Rejects operation=partial. Starts full-generation work even if the profile is already at full depth.\n\nSignificantly more expensive: 100 credits total per generated profile instead of the normal 10 (10x). Use only when you need maximum coverage of a person. Reserves up to 100 credits per eligible profile. A successful face-search provider response, including an empty result, charges the 100-credit inclusive total even if later generation fails. With no usable portrait or all providers failing, ordinary delivered-depth pricing applies.",
      },
      profile_id: {
        type: "string",
        minLength: 1,
        description: "An Orbit profile ID or public profile slug. Profile reads also accept known alias IDs.",
        not: {
          enum: [".", ".."],
        },
      },
      idempotencyKey: {
        type: "string",
        maxLength: 200,
        description:
          "A client-generated key for a safe retry. If the body omits `request_id`, Orbit can use this value as the request ID.",
      },
    },
    description: "Enrich a Profile parameters.",
  },
  outputSchema: {
    type: "object",
    required: ["request_id", "profile_id", "status", "operation", "include_profile", "generation_level", "links"],
    properties: {
      request_id: {
        type: "string",
        description: "Request id.",
      },
      profile_id: {
        type: "string",
        description: "Profile id.",
      },
      status: {
        type: "string",
        enum: ["running", "completed", "failed"],
        description: "Status.",
      },
      operation: {
        type: "string",
        enum: ["partial", "full", "regenerate"],
        description:
          "Use `partial` for a useful profile, `full` for the deepest available profile, or `regenerate` to rebuild a fresh full profile. With face_search=true, full and regenerate start full-generation work even for an already-full profile; partial does not support face_search.",
      },
      include_profile: {
        type: "boolean",
        description: "Include profile.",
      },
      generation_level: {
        oneOf: [
          {
            type: "integer",
            minimum: 1,
            description: "Generation level. variant.",
          },
          {
            type: "null",
            description: "Generation level. variant.",
          },
        ],
        description: "Generation level.",
      },
      profile: {
        type: "object",
        description: "The public Orbit profile. Available fields depend on the profile generation level.",
        additionalProperties: true,
      },
      failure: {
        type: "object",
        description: "Failure.",
        additionalProperties: true,
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description:
          "Credits held and spent for this request. Omitted when Orbit served the request from the stored profile. The final consumedCredits is the full charge once status is settled.",
        additionalProperties: true,
      },
    },
    description: "Enrich a Profile response.",
    additionalProperties: true,
  },
  asyncLifecycle: {
    startActionId: "orbit.enrich_profile",
    statusActionId: "orbit.get_enrichment",
  },
});
const get_enrichment = defineProviderAction("orbit", {
  name: "get_enrichment",
  description:
    "Return the latest snapshot for one profile enrichment request. Poll while the status is `running`. Requires the `search:read` scope. Requests that include the profile also require `profile:read`.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      request_id: {
        type: "string",
        minLength: 1,
        description: "The request ID returned by a profile enrichment operation.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description: "Get Enrichment Status parameters.",
    additionalProperties: false,
    required: ["request_id"],
  },
  outputSchema: {
    type: "object",
    required: ["request_id", "profile_id", "status", "operation", "include_profile", "generation_level", "links"],
    properties: {
      request_id: {
        type: "string",
        description: "Request id.",
      },
      profile_id: {
        type: "string",
        description: "Profile id.",
      },
      status: {
        type: "string",
        enum: ["running", "completed", "failed"],
        description: "Status.",
      },
      operation: {
        type: "string",
        enum: ["partial", "full", "regenerate"],
        description:
          "Use `partial` for a useful profile, `full` for the deepest available profile, or `regenerate` to rebuild a fresh full profile. With face_search=true, full and regenerate start full-generation work even for an already-full profile; partial does not support face_search.",
      },
      include_profile: {
        type: "boolean",
        description: "Include profile.",
      },
      generation_level: {
        oneOf: [
          {
            type: "integer",
            minimum: 1,
            description: "Generation level. variant.",
          },
          {
            type: "null",
            description: "Generation level. variant.",
          },
        ],
        description: "Generation level.",
      },
      profile: {
        type: "object",
        description: "The public Orbit profile. Available fields depend on the profile generation level.",
        additionalProperties: true,
      },
      failure: {
        type: "object",
        description: "Failure.",
        additionalProperties: true,
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description:
          "Credits held and spent for this request. Omitted when Orbit served the request from the stored profile. The final consumedCredits is the full charge once status is settled.",
        additionalProperties: true,
      },
    },
    description: "Get Enrichment Status response.",
    additionalProperties: true,
  },
});
const create_watcher = defineProviderAction("orbit", {
  name: "create_watcher",
  description:
    "Start watching a profile. Orbit checks it on the schedule you choose and adds what it finds to the profile. Each profile has one watcher per organization; creating a watcher for a profile you already watch updates that watcher and turns it back on. Requires the `watchers:write` scope.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    required: ["orbit_id", "interval_seconds"],
    properties: {
      orbit_id: {
        type: "string",
        format: "uuid",
        description: "The profile to watch — the `id` returned by search and profile reads.",
      },
      interval_seconds: {
        type: "integer",
        minimum: 3600,
        maximum: 2592000,
        description: "How often to refresh, from `3600` (hourly) to `2592000` (every 30 days).",
      },
      phases: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: ["existing_sources", "existing_socials", "new_sources"],
          description:
            "`existing_sources` watches sources already on the profile for updates; `existing_socials` watches the person's social activity; `new_sources` looks for new sources about the person.",
        },
        description: "Restrict runs to these phases. Omit or send `null` to run all three.",
      },
    },
    description: "Create a Watcher parameters.",
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    required: ["id", "orbit_id", "enabled", "interval_seconds", "created_at"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Id.",
      },
      orbit_id: {
        type: "string",
        format: "uuid",
        description: "The watched profile.",
      },
      enabled: {
        type: "boolean",
        description: "Whether runs are scheduled.",
      },
      interval_seconds: {
        type: "integer",
        description: "Seconds between runs, from `3600` (hourly) to `2592000` (every 30 days).",
      },
      phases: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: ["existing_sources", "existing_socials", "new_sources"],
          description:
            "`existing_sources` watches sources already on the profile for updates; `existing_socials` watches the person's social activity; `new_sources` looks for new sources about the person.",
        },
        description: "Phases each run covers; `null` runs all three.",
      },
      next_run_at: {
        type: ["string", "null"],
        format: "date-time",
        description: "When the next run is scheduled.",
      },
      last_run_at: {
        type: ["string", "null"],
        format: "date-time",
        description: "Last run at.",
      },
      last_run_status: {
        type: ["string", "null"],
        enum: ["dispatched", "completed", "failed", null],
        description: "Outcome of the most recent run.",
      },
      run_count: {
        type: "integer",
        description: "Run count.",
      },
      update_count: {
        type: "integer",
        description:
          "Runs that found new information: a recent or upcoming event, a changed section, a new source, or new social activity.",
      },
      paused_reason: {
        type: ["string", "null"],
        description: "Set when Orbit paused the watcher, for example `insufficient_credits`.",
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Created at.",
      },
    },
    description: "Create a Watcher response.",
    additionalProperties: true,
  },
});
const list_watchers = defineProviderAction("orbit", {
  name: "list_watchers",
  description: "All your watchers. Requires the `watchers:write` scope.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {},
    description: "List Watchers parameters.",
    additionalProperties: false,
    required: [],
  },
  outputSchema: {
    type: "object",
    required: ["watchers"],
    properties: {
      watchers: {
        type: "array",
        items: {
          type: "object",
          description: "Watchers. item.",
          additionalProperties: true,
        },
        description: "Watchers.",
      },
    },
    description: "List Watchers response.",
    additionalProperties: true,
  },
});
const get_watcher = defineProviderAction("orbit", {
  name: "get_watcher",
  description: "One watcher, with its schedule and run counters. Requires the `watchers:write` scope.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      watcher_id: {
        type: "string",
        format: "uuid",
        description: "The watcher ID returned at creation.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description: "Get a Watcher parameters.",
    additionalProperties: false,
    required: ["watcher_id"],
  },
  outputSchema: {
    type: "object",
    required: ["id", "orbit_id", "enabled", "interval_seconds", "created_at"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Id.",
      },
      orbit_id: {
        type: "string",
        format: "uuid",
        description: "The watched profile.",
      },
      enabled: {
        type: "boolean",
        description: "Whether runs are scheduled.",
      },
      interval_seconds: {
        type: "integer",
        description: "Seconds between runs, from `3600` (hourly) to `2592000` (every 30 days).",
      },
      phases: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: ["existing_sources", "existing_socials", "new_sources"],
          description:
            "`existing_sources` watches sources already on the profile for updates; `existing_socials` watches the person's social activity; `new_sources` looks for new sources about the person.",
        },
        description: "Phases each run covers; `null` runs all three.",
      },
      next_run_at: {
        type: ["string", "null"],
        format: "date-time",
        description: "When the next run is scheduled.",
      },
      last_run_at: {
        type: ["string", "null"],
        format: "date-time",
        description: "Last run at.",
      },
      last_run_status: {
        type: ["string", "null"],
        enum: ["dispatched", "completed", "failed", null],
        description: "Outcome of the most recent run.",
      },
      run_count: {
        type: "integer",
        description: "Run count.",
      },
      update_count: {
        type: "integer",
        description:
          "Runs that found new information: a recent or upcoming event, a changed section, a new source, or new social activity.",
      },
      paused_reason: {
        type: ["string", "null"],
        description: "Set when Orbit paused the watcher, for example `insufficient_credits`.",
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Created at.",
      },
    },
    description: "Get a Watcher response.",
    additionalProperties: true,
  },
});
const update_watcher = defineProviderAction("orbit", {
  name: "update_watcher",
  description:
    "Pause, resume, retime or rescope a watcher. Send the fields you want to change. Requires the `watchers:write` scope.",
  operationType: "destructive",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    description: "Send the fields you want to change.",
    properties: {
      enabled: {
        type: "boolean",
        description: "`false` pauses the watcher; `true` resumes it and schedules the next run.",
      },
      interval_seconds: {
        type: "integer",
        minimum: 3600,
        maximum: 2592000,
        description: "Interval seconds.",
      },
      phases: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: ["existing_sources", "existing_socials", "new_sources"],
          description:
            "`existing_sources` watches sources already on the profile for updates; `existing_socials` watches the person's social activity; `new_sources` looks for new sources about the person.",
        },
        description: "Send `null` to run all three phases.",
      },
      watcher_id: {
        type: "string",
        format: "uuid",
        description: "The watcher ID returned at creation.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    additionalProperties: false,
    required: ["watcher_id"],
  },
  outputSchema: {
    type: "object",
    required: ["id", "orbit_id", "enabled", "interval_seconds", "created_at"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Id.",
      },
      orbit_id: {
        type: "string",
        format: "uuid",
        description: "The watched profile.",
      },
      enabled: {
        type: "boolean",
        description: "Whether runs are scheduled.",
      },
      interval_seconds: {
        type: "integer",
        description: "Seconds between runs, from `3600` (hourly) to `2592000` (every 30 days).",
      },
      phases: {
        type: ["array", "null"],
        items: {
          type: "string",
          enum: ["existing_sources", "existing_socials", "new_sources"],
          description:
            "`existing_sources` watches sources already on the profile for updates; `existing_socials` watches the person's social activity; `new_sources` looks for new sources about the person.",
        },
        description: "Phases each run covers; `null` runs all three.",
      },
      next_run_at: {
        type: ["string", "null"],
        format: "date-time",
        description: "When the next run is scheduled.",
      },
      last_run_at: {
        type: ["string", "null"],
        format: "date-time",
        description: "Last run at.",
      },
      last_run_status: {
        type: ["string", "null"],
        enum: ["dispatched", "completed", "failed", null],
        description: "Outcome of the most recent run.",
      },
      run_count: {
        type: "integer",
        description: "Run count.",
      },
      update_count: {
        type: "integer",
        description:
          "Runs that found new information: a recent or upcoming event, a changed section, a new source, or new social activity.",
      },
      paused_reason: {
        type: ["string", "null"],
        description: "Set when Orbit paused the watcher, for example `insufficient_credits`.",
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Created at.",
      },
    },
    description: "Update a Watcher response.",
    additionalProperties: true,
  },
});
const delete_watcher = defineProviderAction("orbit", {
  name: "delete_watcher",
  description:
    "Deletes the watcher and its schedule. Pausing keeps the configuration for later; deleting removes it. Requires the `watchers:write` scope.",
  operationType: "destructive",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      watcher_id: {
        type: "string",
        format: "uuid",
        description: "The watcher ID returned at creation.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description: "Delete a Watcher parameters.",
    additionalProperties: false,
    required: ["watcher_id"],
  },
  outputSchema: {
    type: "object",
    required: ["id", "deleted"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Id.",
      },
      deleted: {
        type: "boolean",
        enum: [true],
        description: "Deleted.",
      },
    },
    description: "Delete a Watcher response.",
    additionalProperties: true,
  },
});
const list_watcher_runs = defineProviderAction("orbit", {
  name: "list_watcher_runs",
  description:
    "The watcher's refresh runs, newest first: outcome, the events each run added with their sources, and what was billed. Requires the `watchers:write` scope.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      watcher_id: {
        type: "string",
        format: "uuid",
        description: "The watcher ID returned at creation.",
        not: {
          enum: [".", ".."],
        },
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 200,
        description: "Maximum runs to return.",
      },
    },
    description: "List Watcher Runs parameters.",
    additionalProperties: false,
    required: ["watcher_id"],
  },
  outputSchema: {
    type: "object",
    required: ["runs"],
    properties: {
      runs: {
        type: "array",
        items: {
          type: "object",
          description: "Runs. item.",
          additionalProperties: true,
        },
        description: "Newest first.",
      },
    },
    description: "List Watcher Runs response.",
    additionalProperties: true,
  },
});
const create_webhook = defineProviderAction("orbit", {
  name: "create_webhook",
  description:
    "Registers an HTTPS URL to receive signed event deliveries. The response includes the signing `secret` once. Requires the `webhooks:write` scope.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    required: ["url"],
    properties: {
      url: {
        type: "string",
        format: "uri",
        description:
          "A publicly reachable `https://` URL. Slack incoming-webhook URLs are accepted and receive a formatted message instead of the raw JSON payload.",
      },
      event_types: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "profile.updated",
            "company.thesis.changed",
            "company.alert",
            "portfolio.changed",
            "search.profile.updated",
            "search.completed",
          ],
          description: "Event types. item.",
        },
        description:
          "Events to deliver. Omitting it subscribes the endpoint to profile.updated only, so name every event type you want, including search.profile.updated and search.completed.",
      },
      description: {
        type: "string",
        description: "Free-form label for your own bookkeeping.",
      },
    },
    description: "Create a Webhook Endpoint parameters.",
    additionalProperties: false,
  },
  outputSchema: {
    allOf: [
      {
        type: "object",
        required: ["id", "url", "event_types", "enabled", "created_at"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Id.",
          },
          url: {
            type: "string",
            format: "uri",
            description:
              "The endpoint URL. Secret-bearing URLs (for example Slack incoming webhooks) are shown redacted.",
          },
          event_types: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "profile.updated",
                "company.thesis.changed",
                "company.alert",
                "portfolio.changed",
                "search.profile.updated",
                "search.completed",
              ],
              description: "Event types. item.",
            },
            description: "Event types.",
          },
          enabled: {
            type: "boolean",
            description: "Enabled.",
          },
          description: {
            type: ["string", "null"],
            description: "Description.",
          },
          secret_prefix: {
            type: "string",
            description: "First characters of the signing secret, for identification.",
          },
          secret_suffix: {
            type: "string",
            description: "Secret suffix.",
          },
          last_delivery_at: {
            type: ["string", "null"],
            format: "date-time",
            description: "Last delivery at.",
          },
          created_at: {
            type: "string",
            format: "date-time",
            description: "Created at.",
          },
        },
        description: "Create a Webhook Endpoint response. variant.",
        additionalProperties: true,
      },
      {
        type: "object",
        required: ["secret", "supported_event_types"],
        properties: {
          secret: {
            type: "string",
            description: "The signing secret (`whsec_...`). Shown once, at creation. Store it right away.",
          },
          supported_event_types: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "profile.updated",
                "company.thesis.changed",
                "company.alert",
                "portfolio.changed",
                "search.profile.updated",
                "search.completed",
              ],
              description: "Supported event types. item.",
            },
            description: "Supported event types.",
          },
        },
        description: "Create a Webhook Endpoint response. variant.",
        additionalProperties: true,
      },
    ],
    description: "Create a Webhook Endpoint response.",
  },
});
const list_webhooks = defineProviderAction("orbit", {
  name: "list_webhooks",
  description: "Your registered endpoints, with masked signing secrets. Requires the `webhooks:write` scope.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {},
    description: "List Webhook Endpoints parameters.",
    additionalProperties: false,
    required: [],
  },
  outputSchema: {
    type: "object",
    required: ["endpoints"],
    properties: {
      endpoints: {
        type: "array",
        items: {
          type: "object",
          description: "Endpoints. item.",
          additionalProperties: true,
        },
        description: "Endpoints.",
      },
      supported_event_types: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "profile.updated",
            "company.thesis.changed",
            "company.alert",
            "portfolio.changed",
            "search.profile.updated",
            "search.completed",
          ],
          description: "Supported event types. item.",
        },
        description: "Supported event types.",
      },
    },
    description: "List Webhook Endpoints response.",
    additionalProperties: true,
  },
});
const delete_webhook = defineProviderAction("orbit", {
  name: "delete_webhook",
  description:
    "Deletes the endpoint. Deliveries stop immediately and the signing secret is invalidated. Requires the `webhooks:write` scope.",
  operationType: "destructive",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      webhook_id: {
        type: "string",
        format: "uuid",
        description: "The webhook endpoint ID returned at creation.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description: "Delete a Webhook Endpoint parameters.",
    additionalProperties: false,
    required: ["webhook_id"],
  },
  outputSchema: {
    type: "object",
    required: ["id", "deleted"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Id.",
      },
      deleted: {
        type: "boolean",
        enum: [true],
        description: "Deleted.",
      },
    },
    description: "Delete a Webhook Endpoint response.",
    additionalProperties: true,
  },
});
const test_webhook = defineProviderAction("orbit", {
  name: "test_webhook",
  description:
    'Delivers one signed test event to the endpoint so you can verify your handler without waiting for a real event. The body is your most recent event of this type when you have one and the documented example payload otherwise; either way the envelope carries `"test": true` and an `evt_test_` event ID. Test deliveries are free, are never retried, and are not recorded in your delivery history. Requires the `webhooks:write` scope and is rate limited more tightly than other routes.',
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      event_type: {
        type: "string",
        enum: [
          "profile.updated",
          "company.thesis.changed",
          "company.alert",
          "portfolio.changed",
          "search.profile.updated",
          "search.completed",
        ],
        description: "Event type.",
      },
      webhook_id: {
        type: "string",
        format: "uuid",
        description: "The webhook endpoint ID returned at creation.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description:
      "Optional. Defaults to the first event type the endpoint subscribes to; must be one of its subscribed types.",
    additionalProperties: false,
    required: ["webhook_id"],
  },
  outputSchema: {
    type: "object",
    required: ["webhook_id", "event_id", "event_type", "payload_source", "delivered", "duration_ms"],
    properties: {
      webhook_id: {
        type: "string",
        format: "uuid",
        description: "Webhook id.",
      },
      url: {
        type: "string",
        description: "The endpoint URL the test was delivered to, redacted the same way list responses redact it.",
      },
      event_id: {
        type: "string",
        description:
          "The delivery ID sent in `x-orbit-webhook-event-id`. Test deliveries always start with `evt_test_`.",
      },
      event_type: {
        type: "string",
        enum: [
          "profile.updated",
          "company.thesis.changed",
          "company.alert",
          "portfolio.changed",
          "search.profile.updated",
          "search.completed",
        ],
        description: "Event type.",
      },
      payload_source: {
        type: "string",
        enum: ["recent_event", "example"],
        description:
          "`recent_event` when the body replayed your most recent event of this type from the last 30 days, `example` when it carried the documented example payload.",
      },
      delivered: {
        type: "boolean",
        description: "True when your server answered `2xx`.",
      },
      response_status: {
        type: ["integer", "null"],
        description: "The HTTP status your server returned, or null when the request never completed.",
      },
      duration_ms: {
        type: "integer",
        description: "How long the attempt took, in milliseconds.",
      },
      error: {
        type: ["string", "null"],
        description: "Why the delivery failed, for example `http_500` or `ECONNREFUSED`. Null on success.",
      },
    },
    description: "Send a Test Delivery response.",
    additionalProperties: true,
  },
});
const detect_faces = defineProviderAction("orbit", {
  name: "detect_faces",
  description: "Store a photo privately and return every face in it, left to right. Requires the `search:read` scope.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    description: "Photo upload parameters.",
    additionalProperties: false,
    required: ["imageUrl"],
    properties: {
      imageUrl: {
        type: "string",
        format: "uri",
        description:
          "Public JPG, PNG or WebP image URL. The photo must be at least 50 by 50 pixels and at most 25 MB. Connector downloads it securely and uploads it to Orbit.",
      },
    },
  },
  outputSchema: {
    type: "object",
    required: ["status", "payload"],
    description: "The stored photo and its faces.",
    properties: {
      status: {
        type: "string",
        enum: ["success"],
        description: "Status.",
      },
      payload: {
        type: "object",
        description: "Payload.",
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
});
const search_face_index = defineProviderAction("orbit", {
  name: "search_face_index",
  description: "Return the Orbit profiles whose photos show the picked face. Requires the `search:read` scope.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    required: ["image_url"],
    additionalProperties: false,
    description:
      "A face from a photo stored by `POST /v3/faces/detect`. On `POST /v3/search` it searches for the people the face could be.",
    properties: {
      image_url: {
        type: "string",
        minLength: 1,
        description: "The photo reference returned by `POST /v3/faces/detect`.",
      },
      bbox: {
        allOf: [
          {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "number",
              minimum: 0,
              description: "Bbox. variant. item.",
            },
            description: "A face box `[x0, y0, x1, y1]` in the pixels of the upright photo.",
          },
        ],
        description:
          "The picked face's box from `POST /v3/faces/detect`. Required when the photo has more than one face.",
      },
    },
  },
  outputSchema: {
    type: "object",
    required: ["status", "payload"],
    description: "Orbit profiles that show the picked face.",
    properties: {
      status: {
        type: "string",
        enum: ["success"],
        description: "Status.",
      },
      payload: {
        type: "object",
        description: "Payload.",
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
});
const bulk_search = defineProviderAction("orbit", {
  name: "bulk_search",
  description:
    "Requires search:read and profile:read when any item includes profiles. Accepted items are queued and retry temporary execution failures automatically.",
  operationType: "write",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    required: ["request_id", "items"],
    properties: {
      request_id: {
        type: "string",
        minLength: 1,
        maxLength: 128,
        description: "Request id.",
      },
      items: {
        type: "array",
        minItems: 1,
        maxItems: 5000,
        items: {
          type: "object",
          description:
            "Provide `query`, `intent`, at least one identity signal, or a supported combination. When query and intent are both present, Orbit derives a base intent from query and overlays the caller-provided intent. Arrays, scalar values, and null replace derived values; nested objects merge field by field.",
          additionalProperties: false,
          properties: {
            query: {
              type: "string",
              minLength: 1,
              description:
                "A plain-English description of the people you want. When intent is also present, Orbit derives a base intent from this query before applying the caller-provided structured fields.",
            },
            intent: {
              type: "object",
              description: "Advanced structured criteria. Do not include a `version` field.",
              minProperties: 1,
              additionalProperties: false,
              properties: {
                names: {
                  type: "array",
                  items: {
                    type: "string",
                    minLength: 1,
                    description: "Names. item.",
                  },
                  description: "Names.",
                },
                experiences: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: {
                        type: "string",
                        description: "Title.",
                      },
                      titleAnyOf: {
                        type: "array",
                        items: {
                          type: "string",
                          description: "Any matching job title. item.",
                        },
                        description: "Any matching job title.",
                      },
                      organization: {
                        type: "string",
                        description: "Organization.",
                      },
                      year: {
                        type: "integer",
                        description: "Year.",
                      },
                      startYear: {
                        type: "integer",
                        description: "Starting year.",
                      },
                      startYearLte: {
                        type: "integer",
                        description: "Latest starting year.",
                      },
                      endYear: {
                        type: "integer",
                        description: "Ending year.",
                      },
                      temporalScope: {
                        type: "string",
                        enum: ["current", "historical", "both"],
                        description: "Temporal scope.",
                      },
                    },
                    description: "Experiences. item.",
                  },
                  description: "Experiences.",
                },
                semanticClauses: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      text: {
                        type: "string",
                        minLength: 1,
                        description: "Text.",
                      },
                      anyOf: {
                        type: "array",
                        minItems: 1,
                        items: {
                          type: "string",
                          minLength: 1,
                          description: "Any matching clause. item.",
                        },
                        description: "Any matching clause.",
                      },
                    },
                    anyOf: [
                      {
                        required: ["text"],
                        description: "Semantic clauses. item. variant.",
                      },
                      {
                        required: ["anyOf"],
                        description: "Semantic clauses. item. variant.",
                      },
                    ],
                    description: "Semantic clauses. item.",
                  },
                  description: "Semantic clauses.",
                },
                schools: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      school: {
                        type: "string",
                        description: "School.",
                      },
                      schoolAnyOf: {
                        type: "array",
                        items: {
                          type: "string",
                          description: "Any matching school. item.",
                        },
                        description: "Any matching school.",
                      },
                      graduationYear: {
                        type: "integer",
                        description: "Graduation year.",
                      },
                      startYear: {
                        type: "integer",
                        description: "Starting year.",
                      },
                      endYear: {
                        type: "integer",
                        description: "Ending year.",
                      },
                      temporalScope: {
                        type: "string",
                        enum: ["current", "historical", "both"],
                        description: "Temporal scope.",
                      },
                      relation: {
                        type: "string",
                        description: "Relation.",
                      },
                    },
                    description: "Schools. item.",
                  },
                  description: "Schools.",
                },
                geo: {
                  oneOf: [
                    {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        place: {
                          type: "string",
                          description: "Place.",
                        },
                        isHistorical: {
                          type: "boolean",
                          description: "Whether the location is historical.",
                        },
                        distance: {
                          type: "string",
                          description: "Distance.",
                        },
                      },
                      description: "Geo. variant.",
                    },
                    {
                      type: "null",
                      description: "Geo. variant.",
                    },
                  ],
                  description: "Geo.",
                },
                demographics: {
                  oneOf: [
                    {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        ageRange: {
                          type: "object",
                          additionalProperties: false,
                          required: ["min", "max"],
                          properties: {
                            min: {
                              type: "integer",
                              description: "Min.",
                            },
                            max: {
                              type: "integer",
                              description: "Max.",
                            },
                          },
                          description: "Age range.",
                        },
                        birthYearRange: {
                          type: "object",
                          additionalProperties: false,
                          required: ["min", "max"],
                          properties: {
                            min: {
                              type: "integer",
                              description: "Min.",
                            },
                            max: {
                              type: "integer",
                              description: "Max.",
                            },
                          },
                          description: "Birth year range.",
                        },
                        gender: {
                          type: "string",
                          description: "Gender.",
                        },
                      },
                      description: "Demographics. variant.",
                    },
                    {
                      type: "null",
                      description: "Demographics. variant.",
                    },
                  ],
                  description: "Demographics.",
                },
                personalization: {
                  oneOf: [
                    {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        network: {
                          type: "object",
                          additionalProperties: false,
                          required: ["scope"],
                          properties: {
                            scope: {
                              type: "string",
                              enum: ["first_degree"],
                              description: "Scope.",
                            },
                          },
                          description: "Network.",
                        },
                        nearMe: {
                          type: "object",
                          additionalProperties: false,
                          required: ["distance"],
                          properties: {
                            distance: {
                              type: "string",
                              description: "Distance.",
                            },
                          },
                          description: "Whether to limit matches to nearby locations.",
                        },
                      },
                      description: "Personalization. variant.",
                    },
                    {
                      type: "null",
                      description: "Personalization. variant.",
                    },
                  ],
                  description: "Personalization.",
                },
              },
            },
            signals: {
              allOf: [
                {
                  type: "object",
                  description: "Known identity signals. Send only the signals you have.",
                  minProperties: 1,
                  additionalProperties: false,
                  properties: {
                    address: {
                      type: "string",
                      minLength: 1,
                      description: "Address.",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      description: "Email.",
                    },
                    phone: {
                      type: "string",
                      minLength: 1,
                      description: "Phone.",
                    },
                    linkedin_url: {
                      type: "string",
                      format: "uri",
                      description: "Linkedin url.",
                    },
                    urls: {
                      type: "array",
                      items: {
                        type: "string",
                        format: "uri",
                        description: "Urls. item.",
                      },
                      description: "Urls.",
                    },
                    usernames: {
                      type: "array",
                      items: {
                        type: "string",
                        minLength: 1,
                        description: "Usernames. item.",
                      },
                      description: "Usernames.",
                    },
                    face_source: {
                      allOf: [
                        {
                          type: "object",
                          required: ["image_url"],
                          additionalProperties: false,
                          description:
                            "A face from a photo stored by `POST /v3/faces/detect`. On `POST /v3/search` it searches for the people the face could be.",
                          properties: {
                            image_url: {
                              type: "string",
                              minLength: 1,
                              description: "The photo reference returned by `POST /v3/faces/detect`.",
                            },
                            bbox: {
                              allOf: [
                                {
                                  type: "array",
                                  minItems: 4,
                                  maxItems: 4,
                                  items: {
                                    type: "number",
                                    minimum: 0,
                                    description: "Bbox. variant. item.",
                                  },
                                  description: "A face box `[x0, y0, x1, y1]` in the pixels of the upright photo.",
                                },
                              ],
                              description:
                                "The picked face's box from `POST /v3/faces/detect`. Required when the photo has more than one face.",
                            },
                          },
                        },
                      ],
                      description:
                        "A face from a photo. It is enough on its own: the search returns the possible people, up to `candidate_discovery_limit`, best match first.",
                    },
                  },
                },
                {
                  not: {
                    required: ["face_source"],
                  },
                  description: "Signals. variant.",
                },
              ],
              description: "Identity signals for bulk Search. Face search uses the individual Search endpoint.",
            },
            candidate_discovery: {
              type: "boolean",
              description:
                "Continue beyond known matches to find additional people. Address, email, and phone signals can each resolve to multiple associated people.",
            },
            candidate_discovery_limit: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              description:
                "Maximum number of Candidate Discovery results. Valid only with candidate_discovery set to true. A lower value reduces downstream profile-generation fanout, although source discovery and clustering can still dominate initial discovery time.",
            },
            profile_depth: {
              type: "string",
              enum: ["partial", "full"],
              description: "The minimum profile depth required for each ready result.",
            },
            include_profile: {
              type: "boolean",
              description:
                "Embed each readable result's profile with its identity fields, contact fields, and generated sections. Read GET /v3/enrich/{profile_id} for the image gallery and source links. This controls the response shape; profile_depth controls how deep each profile is built.",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description:
                "The maximum number of matches returned from the existing Orbit index. Candidate Discovery results append outside this limit, and profile upgrades update selected results in place.",
            },
            id: {
              type: "string",
              minLength: 1,
              maxLength: 128,
              description: "Id.",
            },
          },
          anyOf: [
            {
              required: ["query"],
              description: "Items. item. variant.",
            },
            {
              required: ["intent"],
              description: "Items. item. variant.",
            },
            {
              required: ["signals"],
              description: "Items. item. variant.",
            },
          ],
          required: ["id"],
        },
        description: "Items.",
      },
    },
    description: "Submit a Bulk Search Job parameters.",
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    required: [
      "job_id",
      "request_id",
      "status",
      "cancel_requested",
      "counts",
      "billing",
      "last_error",
      "created_at",
      "updated_at",
      "links",
    ],
    properties: {
      job_id: {
        type: "string",
        format: "uuid",
        description: "Job id.",
      },
      request_id: {
        type: "string",
        description: "Request id.",
      },
      status: {
        type: "string",
        enum: [
          "queued",
          "running",
          "waiting_for_credits",
          "needs_attention",
          "completed",
          "completed_with_errors",
          "canceled",
        ],
        description: "Status.",
      },
      cancel_requested: {
        type: "boolean",
        description: "Cancel requested.",
      },
      counts: {
        type: "object",
        description: "Counts.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description: "Billing.",
        additionalProperties: true,
      },
      last_error: {
        type: "object",
        description: "Last error.",
        additionalProperties: true,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Created at.",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Updated at.",
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
    },
    description: "Submit a Bulk Search Job response.",
    additionalProperties: true,
  },
  asyncLifecycle: {
    startActionId: "orbit.bulk_search",
    statusActionId: "orbit.get_bulk_search",
  },
});
const get_bulk_search = defineProviderAction("orbit", {
  name: "get_bulk_search",
  description: "Read Bulk Search Progress.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      job_id: {
        type: "string",
        format: "uuid",
        description: "Job id.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description: "Read Bulk Search Progress parameters.",
    additionalProperties: false,
    required: ["job_id"],
  },
  outputSchema: {
    type: "object",
    required: [
      "job_id",
      "request_id",
      "status",
      "cancel_requested",
      "counts",
      "billing",
      "last_error",
      "created_at",
      "updated_at",
      "links",
    ],
    properties: {
      job_id: {
        type: "string",
        format: "uuid",
        description: "Job id.",
      },
      request_id: {
        type: "string",
        description: "Request id.",
      },
      status: {
        type: "string",
        enum: [
          "queued",
          "running",
          "waiting_for_credits",
          "needs_attention",
          "completed",
          "completed_with_errors",
          "canceled",
        ],
        description: "Status.",
      },
      cancel_requested: {
        type: "boolean",
        description: "Cancel requested.",
      },
      counts: {
        type: "object",
        description: "Counts.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description: "Billing.",
        additionalProperties: true,
      },
      last_error: {
        type: "object",
        description: "Last error.",
        additionalProperties: true,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Created at.",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Updated at.",
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
    },
    description: "Read Bulk Search Progress response.",
    additionalProperties: true,
  },
});
const get_bulk_results = defineProviderAction("orbit", {
  name: "get_bulk_results",
  description: "Read Bulk Search Results.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      job_id: {
        type: "string",
        format: "uuid",
        description: "Job id.",
        not: {
          enum: [".", ".."],
        },
      },
      offset: {
        type: "integer",
        minimum: 0,
        maximum: 5000,
        description: "Offset.",
      },
    },
    description: "Read Bulk Search Results parameters.",
    additionalProperties: false,
    required: ["job_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      job_id: {
        type: "string",
        format: "uuid",
        description: "Job id.",
      },
      status: {
        type: "string",
        enum: [
          "queued",
          "running",
          "waiting_for_credits",
          "needs_attention",
          "completed",
          "completed_with_errors",
          "canceled",
        ],
        description: "Status.",
      },
      next_offset: {
        type: ["integer", "null"],
        description: "Next offset.",
      },
      items: {
        type: "array",
        maxItems: 10,
        items: {
          type: "object",
          description: "Items. item.",
          additionalProperties: true,
        },
        description: "Items.",
      },
    },
    required: ["job_id", "status", "next_offset", "items"],
    description: "Read Bulk Search Results response.",
    additionalProperties: true,
  },
});
const cancel_bulk_search = defineProviderAction("orbit", {
  name: "cancel_bulk_search",
  description: "Cancel Undispatched Bulk Items.",
  operationType: "destructive",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    properties: {
      job_id: {
        type: "string",
        format: "uuid",
        description: "Job id.",
        not: {
          enum: [".", ".."],
        },
      },
    },
    description: "Cancel Undispatched Bulk Items parameters.",
    additionalProperties: false,
    required: ["job_id"],
  },
  outputSchema: {
    type: "object",
    required: [
      "job_id",
      "request_id",
      "status",
      "cancel_requested",
      "counts",
      "billing",
      "last_error",
      "created_at",
      "updated_at",
      "links",
    ],
    properties: {
      job_id: {
        type: "string",
        format: "uuid",
        description: "Job id.",
      },
      request_id: {
        type: "string",
        description: "Request id.",
      },
      status: {
        type: "string",
        enum: [
          "queued",
          "running",
          "waiting_for_credits",
          "needs_attention",
          "completed",
          "completed_with_errors",
          "canceled",
        ],
        description: "Status.",
      },
      cancel_requested: {
        type: "boolean",
        description: "Cancel requested.",
      },
      counts: {
        type: "object",
        description: "Counts.",
        additionalProperties: true,
      },
      billing: {
        type: "object",
        description: "Billing.",
        additionalProperties: true,
      },
      last_error: {
        type: "object",
        description: "Last error.",
        additionalProperties: true,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Created at.",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Updated at.",
      },
      links: {
        type: "object",
        description: "Links.",
        additionalProperties: true,
      },
    },
    description: "Cancel Undispatched Bulk Items response.",
    additionalProperties: true,
  },
});
const get_batch_enrichment = defineProviderAction("orbit", {
  name: "get_batch_enrichment",
  description:
    "Read all accepted child enrichment requests in one call. Keep the request_ids from batch_enrich; completed_with_errors retains successful profiles and failed child details.",
  operationType: "read",
  requiredScopes: [],
  inputSchema: {
    type: "object",
    description: "Batch enrichment lookup parameters.",
    additionalProperties: false,
    required: ["request_ids"],
    properties: {
      request_ids: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        description: "Child request IDs returned by batch_enrich.",
        items: {
          type: "string",
          minLength: 1,
          not: {
            enum: [".", ".."],
          },
          description: "Accepted child request ID.",
        },
      },
    },
  },
  outputSchema: {
    type: "object",
    required: ["status", "results"],
    properties: {
      request_id: {
        type: "string",
        description: "Request id.",
      },
      status: {
        type: "string",
        enum: ["running", "completed", "completed_with_errors"],
        description: "Status.",
      },
      results: {
        type: "array",
        items: {
          type: "object",
          description: "Results. item.",
          additionalProperties: true,
        },
        description: "Results.",
      },
    },
    description: "Aggregated child enrichment snapshots.",
    additionalProperties: true,
  },
});
export const orbitActions: ActionDefinition[] = [
  search,
  get_search,
  quote_population,
  search_population,
  batch_enrich,
  read_profile,
  enrich_profile,
  get_enrichment,
  create_watcher,
  list_watchers,
  get_watcher,
  update_watcher,
  delete_watcher,
  list_watcher_runs,
  create_webhook,
  list_webhooks,
  delete_webhook,
  test_webhook,
  detect_faces,
  search_face_index,
  bulk_search,
  get_bulk_search,
  get_bulk_results,
  cancel_bulk_search,
  get_batch_enrichment,
];
