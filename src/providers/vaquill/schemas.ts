import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
const jurisdictionPattern =
  "^(?:[fF][eE][dD][eE][rR][aA][lL]|[aA][lL]|[aA][kK]|[aA][sS]|[aA][zZ]|[aA][rR]|[cC][aA]|[cC][oO]|[cC][tT]|[dD][eE]|[dD][cC]|[fF][lL]|[gG][aA]|[gG][uU]|[hH][iI]|[iI][dD]|[iI][lL]|[iI][nN]|[iI][aA]|[kK][sS]|[kK][yY]|[lL][aA]|[mM][eE]|[mM][dD]|[mM][aA]|[mM][iI]|[mM][nN]|[mM][sS]|[mM][oO]|[mM][tT]|[nN][eE]|[nN][vV]|[nN][hH]|[nN][jJ]|[nN][mM]|[nN][yY]|[nN][cC]|[nN][dD]|[mM][pP]|[oO][hH]|[oO][kK]|[oO][rR]|[pP][aA]|[pP][rR]|[rR][iI]|[sS][cC]|[sS][dD]|[tT][nN]|[tT][xX]|[uU][tT]|[vV][tT]|[vV][iI]|[vV][aA]|[wW][aA]|[wW][vV]|[wW][iI]|[wW][yY])$";
const divisionCorpusPattern =
  "^(?:[uU][sS][cC]|[cC][fF][rR]|[sS][tT][aA][tT][eE]|[rR][eE][gG][uU][lL][aA][tT][iI][oO][nN]|[cC][oO][nN][sS][tT][iI][tT][uU][tT][iI][oO][nN]|[sS][tT][aA][tT][eE]_[cC][oO][nN][sS][tT][iI][tT][uU][tT][iI][oO][nN]|[fF][eE][dD][eE][rR][aA][lL]_[rR][uU][lL][eE][sS])$";
const statePattern =
  "^(?:[aA][lL]|[aA][kK]|[aA][sS]|[aA][zZ]|[aA][rR]|[cC][aA]|[cC][oO]|[cC][tT]|[dD][eE]|[dD][cC]|[fF][lL]|[gG][aA]|[gG][uU]|[hH][iI]|[iI][dD]|[iI][lL]|[iI][nN]|[iI][aA]|[kK][sS]|[kK][yY]|[lL][aA]|[mM][eE]|[mM][dD]|[mM][aA]|[mM][iI]|[mM][nN]|[mM][sS]|[mM][oO]|[mM][tT]|[nN][eE]|[nN][vV]|[nN][hH]|[nN][jJ]|[nN][mM]|[nN][yY]|[nN][cC]|[nN][dD]|[mM][pP]|[oO][hH]|[oO][kK]|[oO][rR]|[pP][aA]|[pP][rR]|[rR][iI]|[sS][cC]|[sS][dD]|[tT][nN]|[tT][xX]|[uU][tT]|[vV][tT]|[vV][iI]|[vV][aA]|[wW][aA]|[wW][vV]|[wW][iI]|[wW][yY])$";
const processingTimeMsSchema: JsonSchema = {
  type: "number",
  description:
    "Server-side time for this request in milliseconds, excluding network transit. Useful for spotting a slow query; not billed on.",
};
const creditsConsumedSchema: JsonSchema = {
  type: "number",
  description:
    "Credits actually charged for this call. Read it rather than assuming the list price: failed and refunded work bills 0, and batch endpoints charge per item returned, so a partial result costs less than a full one.",
};
const actidSchema: JsonSchema = {
  type: "string",
  minLength: 3,
  maxLength: 200,
  description:
    "Section identifier, e.g. `USC_T42_C21_S1983` (Title 42, Chapter 21, Section 1983, which a lawyer writes as 42 U.S.C. § 1983). Take it from a `/us/statutes/search` or `/us/statutes/resolve` result.\n\nA citation also works here: `26 U.S.C. § 1`, `42 USC 1983` or `Cal. Civ. Code § 1950.5` is resolved with the same resolver `/resolve` uses, and the section is served. A citation costs this endpoint's price PLUS the `/resolve` price (2 credits), charged as its own line whether or not it resolves, exactly as `/resolve` charges; that is the same total as calling `/resolve` and then this endpoint, in one round trip. An exact act_id costs only this endpoint's price. When a citation resolves, or when the id only matched after surrounding whitespace, quotes or a trailing period were removed, the response carries `resolvedFrom` saying what your input was matched as. Check it the way you would check a `/resolve` answer. A citation containing `/` cannot travel in a URL path segment; resolve it with `GET /us/statutes/resolve` instead.\n\nDo not assemble an id from a citation: the title and section are derivable, but the CHAPTER is not, so `USC_T26_S1` misses. A miss returns 404 with `reason` and, where the section exists under another id, `didYouMean`.\n\nState session laws (acts as enacted, ids starting `SSL_`) are not code sections: read them at `/us/session-laws/{sessionLawId}`.",
};
const resolvedFromSchema: JsonSchema = {
  anyOf: [
    {
      type: "object",
      description:
        "How the identifier you sent was matched, when it was not an exact act_id.\n\nPresent only when the input did NOT match as sent. Absent (null) means the\nsection is exactly the act_id in your request.",
      additionalProperties: true,
      properties: {},
    },
    {
      type: "null",
      description: "resolvedFrom returned by Vaquill.",
    },
  ],
  description:
    "Null when the section is exactly the act_id you sent. Otherwise how your input was matched: a citation, or an act_id with transport damage (whitespace, quotes, a trailing period) removed. When your citation named a chapter, article, series or several sections, the section served is the FIRST of them and `matchLevel` says so, as on `GET /us/statutes/resolve`.",
};
const creditsConsumedSchema2: JsonSchema = {
  type: "number",
  description:
    "Credits actually charged for this call. Read it rather than assuming the list price: failed and refunded work bills 0.",
};
const creditsConsumedSchema3: JsonSchema = {
  type: "integer",
  description:
    "Credits actually charged for this call, never the list price. It includes the `/us/statutes/resolve` fee when a citation was sent where an id goes. 0 when the call was not charged or was refunded (a body that answers `available: false`).",
};
export const search_statutesInput: JsonSchema = s.object(
  "Parameters for search_statutes.",
  {
    query: {
      type: "string",
      maxLength: 500,
      minLength: 2,
      description: "Search query in natural language.",
    },
    corpusType: {
      anyOf: [
        {
          type: "string",
          enum: [
            "USC",
            "CFR",
            "STATE",
            "CONSTITUTION",
            "FEDERAL_RULES",
            "FEDERAL_LOCAL_RULES",
            "STATE_CONSTITUTION",
            "STATE_RULES",
            "EXECUTIVE_ACTION",
            "REGULATION",
            "FEDERAL_REGISTER",
            "FEDERAL_REGISTER_NOTICE",
            "AGENCY_GUIDANCE",
            "SENTENCING_GUIDELINES",
            "US_TAX_TREATY",
            "STATE_AGENCY_GUIDANCE",
            "STATE_AG_OPINION",
            "STATE_REGISTER",
            "SESSION_LAW",
            "STATUTE_COMPILATION",
            "AGENCY_ADJUDICATION",
            "CFR_ANNUAL",
            "USC_ANNUAL",
          ],
          description: "corpusType parameter.",
        },
        {
          items: {
            type: "string",
            enum: [
              "USC",
              "CFR",
              "STATE",
              "CONSTITUTION",
              "FEDERAL_RULES",
              "FEDERAL_LOCAL_RULES",
              "STATE_CONSTITUTION",
              "STATE_RULES",
              "EXECUTIVE_ACTION",
              "REGULATION",
              "FEDERAL_REGISTER",
              "FEDERAL_REGISTER_NOTICE",
              "AGENCY_GUIDANCE",
              "SENTENCING_GUIDELINES",
              "US_TAX_TREATY",
              "STATE_AGENCY_GUIDANCE",
              "STATE_AG_OPINION",
              "STATE_REGISTER",
              "SESSION_LAW",
              "STATUTE_COMPILATION",
              "AGENCY_ADJUDICATION",
              "CFR_ANNUAL",
              "USC_ANNUAL",
            ],
            description: "corpusType parameter.",
          },
          type: "array",
          description: "corpusType parameter.",
        },
        {
          type: "null",
          description: "corpusType parameter.",
        },
      ],
      description:
        'Restrict to one corpus, or to several by passing a list (`"corpusType": ["USC", "CFR"]`). One of: `USC` (United States Code), `CFR` (Code of Federal Regulations), `STATE` (state statutory codes; call `/us/statutes/coverage` for the list of ingested jurisdictions), `CONSTITUTION` (U.S. Constitution), `FEDERAL_RULES` (FRCP / FRCrP / FRE / FRAP / FRBP), `STATE_CONSTITUTION` (state constitutions; call `/us/statutes/coverage` for the current jurisdiction list), `STATE_RULES` (state court rules; see `/us/statutes/coverage`), `EXECUTIVE_ACTION` (Federal Register Presidential Documents), `REGULATION` (state administrative regulations; pair with `state`), `FEDERAL_REGISTER` (Federal Register agency rules, final and proposed), `AGENCY_GUIDANCE` (sub-regulatory federal agency guidance, 53 named sources spanning the tax, banking, securities, labor, immigration, health-privacy, export-control, intellectual-property, antitrust, energy and communications agencies; each is independently filterable with `source`, which lists them all), `STATE_AGENCY_GUIDANCE` (state-issued regulatory guidance, currently state Department of Insurance bulletins and circular letters; pair with `state`, and see `/us/statutes/coverage`), `SENTENCING_GUIDELINES` (US Sentencing Guidelines Manual), `US_TAX_TREATY` (US income tax treaties and protocols), `SESSION_LAW` (US Statutes at Large: federal public and private laws AS ENACTED, 1789 to date. This is the source the US Code is compiled from, so a section\'s `publicLawCites` resolve here to the enacting text; call `/us/statutes/coverage` for the live section count). Omit to search across all corpora. The `enum` on this field is the complete token list, and `/us/statutes/coverage` serves a one-line description of each in its legend.',
    },
    state: {
      anyOf: [
        {
          type: "string",
          pattern: jurisdictionPattern,
          description: "state parameter.",
        },
        {
          items: {
            type: "string",
            pattern: jurisdictionPattern,
            description: "state parameter.",
          },
          type: "array",
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        'Jurisdiction filter. A 2-letter code for one of the 52 supported US jurisdictions (50 states + DC + PR), or `federal` to scope to USC / CFR / Constitution / federal rules. Pass a LIST to search several at once (`"state": ["ca", "ny", "tx"]`), which is one call instead of one per jurisdiction. Case-insensitive: `ca` and `CA` both work. An unrecognized value is rejected with 422 rather than silently matching nothing. Omit to search every jurisdiction.',
    },
    code: {
      anyOf: [
        {
          type: "string",
          description: "code parameter.",
        },
        {
          items: {
            type: "string",
            description: "code parameter.",
          },
          type: "array",
          description: "code parameter.",
        },
        {
          type: "null",
          description: "code parameter.",
        },
      ],
      description:
        'Restrict to specific state statutory codes, e.g. `tx_pe` for the Texas Penal Code. Values are the `identifier`s returned by `GET /us/statutes/divisions?corpusType=STATE&state=XX`, so the browse output can be fed straight back in. Pass a list to search several codes, across states if you like (`["tx_pe", "ca_pen"]`). This is the only way to scope below a whole jurisdiction: `state=tx` alone searches every Texas code at once.\n\nWith `corpusType=FEDERAL_RULES`, a value can instead be a federal rule set as `GET /us/statutes/divisions?corpusType=FEDERAL_RULES` lists it: `frcp`, `fre`, `frcpsuppadm`, or an appendix copy such as `uscapp_t28a_fre`. Without that corpusType a bare `frcp` is refused, because it cannot be told apart from a state code missing its state.',
    },
    article: {
      anyOf: [
        {
          type: "string",
          description: "article parameter.",
        },
        {
          items: {
            type: "string",
            description: "article parameter.",
          },
          type: "array",
          description: "article parameter.",
        },
        {
          type: "null",
          description: "article parameter.",
        },
      ],
      description:
        "Scope a search to one or more articles. On `CONSTITUTION` and `STATE_CONSTITUTION` this is the article label as `GET /us/statutes/divisions` lists it (`Amendment XIV`, `Article IV`, `Preamble`). On `STATE` / `REGULATION` it is the article of a code divided by article instead of chapter, such as New York (`2-A` in `ny_jud`). This is the search side of `parent.article`: pass a hit's `parent` straight back to search within its article.\n\nPass the `identifier` exactly as the listing returned it; a case slip such as `amendment xiv` also matches. Article labels repeat, so `article` needs a `corpusType` from one of those two families, `STATE_CONSTITUTION` also needs `state`, and `STATE` / `REGULATION` need the `code`. A request missing one is refused with 422 before anything is charged. String or list.",
    },
    yearFrom: {
      anyOf: [
        {
          type: "integer",
          maximum: 2100,
          minimum: 1700,
          description: "yearFrom parameter.",
        },
        {
          type: "null",
          description: "yearFrom parameter.",
        },
      ],
      description:
        "Only return sections dated in or after this year. Combine with `yearTo` for a window. A section matches on the first of three years it carries: the most recent amendment the publisher credits in its own history note; else its effective year, for a section adopted once and never amended; else, for corpora dated by publication rather than amendment (Federal Register proposed rules, agency guidance, adjudications, the treaty record), the document's own publication or issue year. Every one of those tracks the LAW or the document, never when we last rebuilt the corpus. A section carrying none of the three is excluded once either bound is set, so an unbounded search returns strictly more.",
    },
    yearTo: {
      anyOf: [
        {
          type: "integer",
          maximum: 2100,
          minimum: 1700,
          description: "yearTo parameter.",
        },
        {
          type: "null",
          description: "yearTo parameter.",
        },
      ],
      description:
        "Only return sections dated in or before this year, on the same three years `yearFrom` describes. Note it filters the LAST such date, so a section amended in 2025 is excluded by `yearTo=2024` even though it existed in 2024. This is a currency filter, not point-in-time retrieval: the corpus holds one current text per citation.",
    },
    excludeRepealed: {
      type: "boolean",
      description:
        "Drop sections whose own status says they are no longer operative: repealed, renumbered, transferred, recodified, rescinded, revoked, expired, superseded, omitted, reserved, and the rest of the dead and not-operative vocabulary (the full set is the one behind each result's `goodLawStatus`).\n\n**This removes what we KNOW is dead. It does not promise the remainder is good law.** A section survives this filter when its status is `in_force` OR when we hold no trustworthy repeal signal for its jurisdiction, and those two are not the same thing. Read `goodLawStatus` on each surviving result to tell them apart: `good_law` is checked, `unknown` is unchecked. Filtering on the status we store and reporting the verdict we derive are deliberately separate, because only the first is indexable.\n\n**The United States Code is served from a stored annual edition** (`year` 2024, `currentThrough` 2025-01-06), so a section repealed after that edition closed still carries `actStatus: in_force` and survives this filter. Every USC result therefore reports `goodLawStatus: unknown`, which is the honest answer and the one this field's second paragraph tells you to read. Use `/section/{actId}/changes` for the timeline on a section you depend on.",
    },
    actStatus: {
      anyOf: [
        {
          type: "string",
          enum: [
            "abolished",
            "deleted",
            "expired",
            "in_force",
            "inactive",
            "non_precedential",
            "not_funded",
            "not_yet_effective",
            "omitted",
            "proposed",
            "recodified",
            "recompiled",
            "rejected",
            "relocated",
            "removed",
            "renumbered",
            "repealed",
            "rescinded",
            "reserved",
            "revoked",
            "superseded",
            "terminated",
            "transferred",
            "unconstitutional",
            "vacant",
            "vacated",
            "vetoed",
            "withdrawn",
          ],
          description: "actStatus parameter.",
        },
        {
          items: {
            type: "string",
            enum: [
              "abolished",
              "deleted",
              "expired",
              "in_force",
              "inactive",
              "non_precedential",
              "not_funded",
              "not_yet_effective",
              "omitted",
              "proposed",
              "recodified",
              "recompiled",
              "rejected",
              "relocated",
              "removed",
              "renumbered",
              "repealed",
              "rescinded",
              "reserved",
              "revoked",
              "superseded",
              "terminated",
              "transferred",
              "unconstitutional",
              "vacant",
              "vacated",
              "vetoed",
              "withdrawn",
            ],
            description: "actStatus parameter.",
          },
          type: "array",
          description: "actStatus parameter.",
        },
        {
          type: "null",
          description: "actStatus parameter.",
        },
      ],
      description:
        'Positively scope to one or more raw publisher statuses, e.g. `"repealed"` to find only dead law, or `["in_force"]` for only sections affirmatively marked current. This is the inverse of `excludeRepealed` and is what you want for a compliance diff that asks what was LOST rather than what remains.\n\nValues are the `actStatus` returned on each result. Combining a dead status here with `excludeRepealed: true` contradicts itself and is rejected with 422 rather than silently returning nothing.',
    },
    changedSince: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "changedSince parameter.",
        },
        {
          type: "null",
          description: "changedSince parameter.",
        },
      ],
      format: "date",
      description:
        "Only return sections we have OBSERVED change on or after this date (`YYYY-MM-DD`). This is the sync filter: it turns a lookup API into something a nightly job can poll, without creating a board watch per jurisdiction.\n\n**These are observed changes, not effective dates.** A refresh compared the publisher against the copy we held and found it different; the date is when we SAW it, an upper bound on when it took effect. It is the same event stream `GET /us/statutes/section/{actId}/changes` serves per section, so a hit here has a history there.\n\n**Coverage is bounded by capture, not by the age of the law.** Change capture began long after the corpus did, it is per-source, and events are swept at 5 years. An empty result means no captured change in the window, never that nothing was amended.\n\nNarrow with `corpusType` and `state` for a tighter window: the change set is resolved to concrete sections before the search runs, and a window matching too many sections is rejected with a 422 that says so rather than silently truncating your answer.",
    },
    agency: {
      anyOf: [
        {
          type: "string",
          description: "agency parameter.",
        },
        {
          items: {
            type: "string",
            description: "agency parameter.",
          },
          type: "array",
          description: "agency parameter.",
        },
        {
          type: "null",
          description: "agency parameter.",
        },
      ],
      description:
        "Federal Register agency slug, e.g. `environmental-protection-agency`. The agency's full name (`Environmental Protection Agency`) or its Federal Register acronym (`EPA`, `e.p.a.`) resolves to the same slug; an acronym the Federal Register gives to more than one agency (`FS`) or a value naming no agency the corpus holds is a 422, never a charge. Pass a list to match any of several. Applies to `FEDERAL_REGISTER` and `EXECUTIVE_ACTION`; other corpora carry no agency, so combining this with them returns nothing.",
    },
    documentType: {
      anyOf: [
        {
          type: "string",
          enum: ["final", "proposed", "presidential"],
          description: "documentType parameter.",
        },
        {
          type: "null",
          description: "documentType parameter.",
        },
      ],
      description:
        "Federal Register document stage: `final` (a rule in force), `proposed` (an NPRM), or `presidential` (a Presidential Document, the `EXECUTIVE_ACTION` corpus). The same distinction appears in each row's `actId` prefix (`FR_RULE_` vs `FR_PRORULE_`).",
    },
    publishedFrom: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "publishedFrom parameter.",
        },
        {
          type: "null",
          description: "publishedFrom parameter.",
        },
      ],
      format: "date",
      description:
        "Only return Federal Register documents published on or after this date (`YYYY-MM-DD`). This is the PUBLICATION date, which is not the same as `yearFrom`: that filters the version year of a section.",
    },
    publishedTo: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "publishedTo parameter.",
        },
        {
          type: "null",
          description: "publishedTo parameter.",
        },
      ],
      format: "date",
      description: "Only return Federal Register documents published on or before this date.",
    },
    titleNumber: {
      anyOf: [
        {
          type: "integer",
          minimum: 1,
          description: "titleNumber parameter.",
        },
        {
          type: "null",
          description: "titleNumber parameter.",
        },
      ],
      description:
        "Filter by USC/CFR title number (e.g., 17 for SEC, 42 for civil rights). Only meaningful for `USC`/`CFR`; ignored for state corpora whose titles are alphabetic (e.g. Texas `pe` = Penal Code).",
    },
    chapter: {
      anyOf: [
        {
          type: "string",
          description: "chapter parameter.",
        },
        {
          items: {
            type: "string",
            description: "chapter parameter.",
          },
          type: "array",
          description: "chapter parameter.",
        },
        {
          type: "null",
          description: "chapter parameter.",
        },
      ],
      description:
        "Scope a search to one or more chapters within a title or code, e.g. `21` for USC Title 42 Chapter 21. This is the search-side of the `parent` object on each result: pass a hit's `parent.chapter` straight back to search that hit's neighbors. Chapter numbers repeat across titles, so pair it with `titleNumber` (USC) or `code` (state); an unpaired chapter is rejected. String or list.",
    },
    part: {
      anyOf: [
        {
          type: "string",
          description: "part parameter.",
        },
        {
          items: {
            type: "string",
            description: "part parameter.",
          },
          type: "array",
          description: "part parameter.",
        },
        {
          type: "null",
          description: "part parameter.",
        },
      ],
      description:
        "Scope a search to one or more parts within a title, e.g. `240` for 17 C.F.R. Part 240. The CFR counterpart to `chapter`: pass a hit's `parent.part` straight back to search within that part. Pair it with `titleNumber`; an unpaired part is rejected. String or list.",
    },
    source: {
      anyOf: [
        {
          type: "string",
          enum: [
            "administrative_guidance",
            "ag_precedent",
            "agency_guidance",
            "bia_precedent",
            "bis_advisory_opinion",
            "cfpb_circular",
            "cfpb_enforcement_action",
            "cfpb_supervisory_guidance",
            "cftc_staff_letter",
            "cms_iom",
            "copyright_circular",
            "copyright_compendium",
            "cpsc_advisory_opinion",
            "cpsc_secg",
            "ddtc_commodity_jurisdiction",
            "ddtc_guidance",
            "dfars",
            "dfars_pgi",
            "doe_appliance_guidance",
            "doj_business_review",
            "doj_justice_manual",
            "doj_leniency",
            "eeoc_guidance",
            "far",
            "fcc_declaratory_ruling",
            "fdic_fil",
            "ferc_policy_statement",
            "fincen_amla_material",
            "fincen_boi_compliance_guide",
            "fincen_boi_faq",
            "fincen_boi_rule_qa",
            "fincen_guidance",
            "fincen_ruling",
            "frap",
            "frb_sr_letter",
            "frbp",
            "frcp",
            "frcrp",
            "fre",
            "ftc_administrative_decision",
            "ftc_advisory_opinion",
            "ftc_advocacy_filing",
            "ftc_hsr_interpretation",
            "ftc_policy_statement",
            "hhs_ocr_hipaa_faq",
            "hhs_ocr_hipaa_guidance",
            "hhs_ocr_resolution_agreement",
            "immigration_admin_precedent",
            "irs_announcement",
            "irs_irm",
            "irs_notice",
            "irs_rev_proc",
            "irs_rev_rul",
            "irs_written_determination",
            "merger_guidelines",
            "mpep",
            "mspb_nonprecedential",
            "mspb_precedential",
            "nlrb_advice_memo",
            "nlrb_board_decision",
            "nlrb_gc_memo",
            "occ_bulletin",
            "occ_interpretive_letter",
            "ofac_faq",
            "olc_opinion",
            "sct",
            "sec_commission_opinion",
            "senate_treaty",
            "senate_treaty_document",
            "senate_treaty_resolution",
            "ssa_ruling",
            "state_financial_bulletin",
            "state_insurance_bulletin",
            "tmep",
            "us_tax_treaty",
            "us_tax_treaty_technical_explanation",
            "uscis_policy_manual",
            "whd_foh",
            "whd_opinion_letter",
          ],
          description: "source parameter.",
        },
        {
          items: {
            type: "string",
            enum: [
              "administrative_guidance",
              "ag_precedent",
              "agency_guidance",
              "bia_precedent",
              "bis_advisory_opinion",
              "cfpb_circular",
              "cfpb_enforcement_action",
              "cfpb_supervisory_guidance",
              "cftc_staff_letter",
              "cms_iom",
              "copyright_circular",
              "copyright_compendium",
              "cpsc_advisory_opinion",
              "cpsc_secg",
              "ddtc_commodity_jurisdiction",
              "ddtc_guidance",
              "dfars",
              "dfars_pgi",
              "doe_appliance_guidance",
              "doj_business_review",
              "doj_justice_manual",
              "doj_leniency",
              "eeoc_guidance",
              "far",
              "fcc_declaratory_ruling",
              "fdic_fil",
              "ferc_policy_statement",
              "fincen_amla_material",
              "fincen_boi_compliance_guide",
              "fincen_boi_faq",
              "fincen_boi_rule_qa",
              "fincen_guidance",
              "fincen_ruling",
              "frap",
              "frb_sr_letter",
              "frbp",
              "frcp",
              "frcrp",
              "fre",
              "ftc_administrative_decision",
              "ftc_advisory_opinion",
              "ftc_advocacy_filing",
              "ftc_hsr_interpretation",
              "ftc_policy_statement",
              "hhs_ocr_hipaa_faq",
              "hhs_ocr_hipaa_guidance",
              "hhs_ocr_resolution_agreement",
              "immigration_admin_precedent",
              "irs_announcement",
              "irs_irm",
              "irs_notice",
              "irs_rev_proc",
              "irs_rev_rul",
              "irs_written_determination",
              "merger_guidelines",
              "mpep",
              "mspb_nonprecedential",
              "mspb_precedential",
              "nlrb_advice_memo",
              "nlrb_board_decision",
              "nlrb_gc_memo",
              "occ_bulletin",
              "occ_interpretive_letter",
              "ofac_faq",
              "olc_opinion",
              "sct",
              "sec_commission_opinion",
              "senate_treaty",
              "senate_treaty_document",
              "senate_treaty_resolution",
              "ssa_ruling",
              "state_financial_bulletin",
              "state_insurance_bulletin",
              "tmep",
              "us_tax_treaty",
              "us_tax_treaty_technical_explanation",
              "uscis_policy_manual",
              "whd_foh",
              "whd_opinion_letter",
            ],
            description: "source parameter.",
          },
          type: "array",
          description: "source parameter.",
        },
        {
          type: "null",
          description: "source parameter.",
        },
      ],
      description:
        "Scope to one or more of the following. The named source within `corpusType`, for corpora that fold several independently filterable bodies of law into one token.\n\n`FEDERAL_RULES` sources: `frcp` (Federal Rules of Civil Procedure), `frcrp` (Federal Rules of Criminal Procedure), `fre` (Federal Rules of Evidence), `frap` (Federal Rules of Appellate Procedure), `frbp` (Federal Rules of Bankruptcy Procedure), `sct` (Rules of the Supreme Court of the United States).\n\n`CFR` sources: `far` (Federal Acquisition Regulation (48 C.F.R. ch. 1)), `dfars` (Defense Federal Acquisition Regulation Supplement (48 C.F.R. ch. 2)) (both are already part of `CFR`; this only splits the existing Title 48 data by chapter, it does not add new sections).\n\n`AGENCY_GUIDANCE` sources: `administrative_guidance` (Synthesized administrative guidance (e.g. SALT cap, CTC, 401(k) limits)), `ssa_ruling` (Social Security Administration Rulings), `irs_rev_proc` (IRS Revenue Procedures), `irs_notice` (IRS Notices), `irs_rev_rul` (IRS Revenue Rulings), `irs_announcement` (IRS Announcements), `irs_irm` (Internal Revenue Manual (IRS internal procedure)), `merger_guidelines` (DOJ & FTC Merger Guidelines (2023)), `doj_leniency` (DOJ Antitrust Division Leniency Policy), `doj_business_review` (DOJ Antitrust Division Business Review Letters (1991-2021)), `cms_iom` (CMS Medicare Internet-Only Manuals (instruction to Medicare contractors, not a regulation)), `copyright_circular` (US Copyright Office Circulars), `copyright_compendium` (Compendium of U.S. Copyright Office Practices, Third Edition (2014, 2017 and 2021 editions)), `doj_justice_manual` (DOJ Justice Manual), `uscis_policy_manual` (USCIS Policy Manual), `mpep` (USPTO Manual of Patent Examining Procedure (MPEP)), `tmep` (USPTO Trademark Manual of Examining Procedure (TMEP)), `cftc_staff_letter` (CFTC Staff Letters (no-action, exemptive, interpretative; 2008-present)), `fincen_ruling` (FinCEN Administrative Rulings), `fincen_guidance` (FinCEN Guidance (alerts, advisories, notices, bulletins, fact sheets)), `fincen_boi_faq` (FinCEN Beneficial Ownership Information FAQs), `fincen_boi_rule_qa` (FinCEN BOI Rulemaking Q&As (final rule and interim final rule)), `fincen_boi_compliance_guide` (FinCEN Small Entity Compliance Guide (Beneficial Ownership Information Reporting)), `fincen_amla_material` (FinCEN Anti-Money Laundering Act of 2020 Implementation Material), `frb_sr_letter` (Federal Reserve Supervision and Regulation (SR) / Consumer Affairs (CA) Letters), `occ_bulletin` (OCC Bulletins), `occ_interpretive_letter` (OCC Interpretive Letters), `fdic_fil` (FDIC Financial Institution Letters (FILs)), `cfpb_supervisory_guidance` (CFPB Supervisory Guidance), `cfpb_circular` (CFPB Consumer Financial Protection Circulars), `dfars_pgi` (DFARS PGI (Procedures, Guidance, and Information)), `ftc_advisory_opinion` (FTC Advisory Opinions), `ftc_policy_statement` (FTC Policy Statements (1967-present)), `ftc_hsr_interpretation` (FTC HSR Premerger Notification Interpretations: the Commission's formal interpretations under 16 C.F.R. 803.30 (1978-2000, a closed series) and the Premerger Notification Office's informal interpretations (1983-present; the publisher serves none from 1997)), `ftc_advocacy_filing` (FTC Advocacy Filings: comments and letters to state legislatures, state courts, governors and other federal agencies on the competition effects of a proposed measure (1985-present). Advisory only: they bind nobody and decide no case), `nlrb_gc_memo` (NLRB General Counsel Memoranda), `nlrb_advice_memo` (NLRB Division of Advice Memoranda (rolling 10-year window, not the full archive)), `cpsc_advisory_opinion` (CPSC Office of General Counsel Advisory Opinions (historical, 1970s-2012)), `cpsc_secg` (CPSC Small Entity Compliance Guides), `whd_opinion_letter` (DOL Wage and Hour Division Opinion, Ruling and Administrator Interpretation Letters (FLSA, FMLA, DBRA, SCA, CCPA, MSPA; 1993-present)), `whd_foh` (DOL Wage and Hour Field Operations Handbook (WHD internal enforcement procedure, not law; 22 chapters)), `bis_advisory_opinion` (BIS (Bureau of Industry and Security) Advisory Opinions), `ddtc_commodity_jurisdiction` (DDTC (Directorate of Defense Trade Controls) Commodity Jurisdiction Determinations), `ddtc_guidance` (DDTC (Directorate of Defense Trade Controls) Policy Guidance Documents), `ofac_faq` (OFAC (Office of Foreign Assets Control) Frequently Asked Questions), `hhs_ocr_hipaa_faq` (HHS Office for Civil Rights HIPAA FAQs), `hhs_ocr_hipaa_guidance` (HHS Office for Civil Rights HIPAA Guidance Materials), `hhs_ocr_resolution_agreement` (HHS Office for Civil Rights HIPAA Resolution Agreements and Civil Money Penalties), `fcc_declaratory_ruling` (FCC (Federal Communications Commission) Declaratory Rulings), `ferc_policy_statement` (FERC (Federal Energy Regulatory Commission) Policy Statements), `doe_appliance_guidance` (DOE Appliance Standards Guidance and FAQs), `eeoc_guidance` (EEOC (Equal Employment Opportunity Commission) Enforcement and Policy Guidance, including Compliance Manual sections), `irs_written_determination` (IRS Written Determinations under 26 U.S.C. § 6110: Private Letter Rulings (PLR), Technical Advice Memoranda (TAM) and Chief Counsel Advice (CCA). Each is directed only to the taxpayer who requested it and, by § 6110(k)(3), may not be used or cited as precedent).\n\n`US_TAX_TREATY` sources: `us_tax_treaty` (U.S. Bilateral Income and Estate Tax Treaties), `us_tax_treaty_technical_explanation` (Treasury Technical Explanations (article-by-article commentary on a tax treaty)), `senate_treaty` (Senate Treaty Records (transmittal, parties and proceedings)), `senate_treaty_resolution` (Senate Resolutions of Advice and Consent, including the reservations, understandings and declarations that narrow a treaty's effect in US law), `senate_treaty_document` (Treaty Documents (CDOC TDOC series): the President's message transmitting a treaty to the Senate, with the instrument's text).\n\n`STATE_AGENCY_GUIDANCE` sources: `state_insurance_bulletin` (State Department of Insurance Bulletins), `state_financial_bulletin` (State Financial-Institutions Regulator Bulletins (banking, credit unions, trust companies, escrow agents, consumer lenders, money transmitters; AZ and OR only, where that regulator shares an index with the insurance regulator)).\n\n`AGENCY_ADJUDICATION` sources: `mspb_precedential` (MSPB Precedential Decisions), `mspb_nonprecedential` (MSPB Nonprecedential Orders), `olc_opinion` (DOJ Office of Legal Counsel Opinions (official bound volumes, 1933-2020)), `cfpb_enforcement_action` (CFPB Enforcement Actions), `sec_commission_opinion` (SEC Commission Opinions and Adjudicatory Orders), `bia_precedent` (BIA Precedent Decisions (I&N Dec.)), `ag_precedent` (Attorney General Immigration Decisions (I&N Dec.)), `immigration_admin_precedent` (INS and USCIS Administrative Precedent Decisions (I&N Dec.)), `nlrb_board_decision` (NLRB Board Decisions (bounded window; see coverage.mdx for the exact years covered)), `ftc_administrative_decision` (FTC Part 3 Administrative Decisions). Every result carries its own `source`, so you can pass a hit's value straight back. An unrecognized value is rejected with 422.",
    },
    fields: {
      anyOf: [
        {
          items: {
            type: "string",
            enum: [
              "abstract",
              "actId",
              "actStatus",
              "action",
              "adoptedAfterCurrentThrough",
              "adoptingCitations",
              "agencies",
              "agencySlugs",
              "alternateCitations",
              "amendmentHistory",
              "amendmentNote",
              "amendmentYears",
              "amendmentsCount",
              "articleName",
              "articleNumber",
              "audience",
              "body",
              "breadcrumb",
              "caseName",
              "chapter",
              "chapterName",
              "citation",
              "citationShort",
              "committeeNote",
              "corpusType",
              "court",
              "crossReferencesCfr",
              "crossReferencesUsc",
              "currencyNote",
              "currencyYear",
              "currentThrough",
              "datesText",
              "displayLabel",
              "displayPath",
              "documentNumber",
              "documentSubtype",
              "documentTypeLabel",
              "docxUrl",
              "edition",
              "effectiveDate",
              "effectiveDateRaw",
              "excerpt",
              "expirationDate",
              "expirationDateRaw",
              "externalUrl",
              "federalRegisterCitations",
              "forum",
              "frCommentsCloseOn",
              "frCorrectionOf",
              "frCorrections",
              "frDocketIds",
              "frEffectiveOn",
              "frEndPage",
              "frRegulationIdNumbers",
              "frRegulationsDotGovUrl",
              "frRelatedDocuments",
              "frSignificant",
              "frStartPage",
              "frVolume",
              "goodLawStatus",
              "govInfoHtmlUrl",
              "govInfoPdfUrl",
              "granuleId",
              "history",
              "historyEffectiveDate",
              "htmlUrl",
              "implementingRegulations",
              "issueDate",
              "issueDateRaw",
              "issuingAgency",
              "languageCode",
              "lastAmendedDate",
              "lastAmendedDateRaw",
              "lastAmendedYear",
              "lawImplemented",
              "licenseNote",
              "originalEnactmentDate",
              "originalEnactmentDateRaw",
              "packageId",
              "parent",
              "part",
              "partName",
              "pdfUrl",
              "pendingAdoptions",
              "popularName",
              "president",
              "priorEffectiveDates",
              "program",
              "publicLawCites",
              "publicLaws",
              "publicationDate",
              "publicationDateRaw",
              "publisherKey",
              "referencedShortTitles",
              "relatedCitations",
              "relatedDocuments",
              "releaseDate",
              "releaseDateRaw",
              "relevanceScore",
              "renumberedTo",
              "renumberedToLabel",
              "requesters",
              "rescindedOn",
              "rescindedOnRaw",
              "reviewDate",
              "reviewDateRaw",
              "ruleSet",
              "ruleSetCode",
              "sectionNumber",
              "sectionTitle",
              "settlementAmount",
              "signingDate",
              "signingDateRaw",
              "source",
              "sourceCharEnd",
              "sourceCharStart",
              "sourceCredit",
              "sourceNote",
              "sourcePageEnd",
              "sourcePageStart",
              "sourceUrl",
              "state",
              "stateHtmlUrl",
              "statutoryAuthority",
              "subchapter",
              "subchapterName",
              "subject",
              "subjectNumber",
              "subpart",
              "subpartName",
              "subtitle",
              "subtitleName",
              "supersededBy",
              "supersedes",
              "supersessionActions",
              "textUrl",
              "title",
              "titleName",
              "titleNumber",
              "topLevelTitle",
              "topics",
              "transferredTo",
              "transferredToLabel",
              "versionId",
              "volume",
              "wordCount",
              "xmlUrl",
              "year",
            ],
            description: "fields parameter.",
          },
          type: "array",
          uniqueItems: true,
          description: "fields parameter.",
        },
        {
          items: {
            type: "string",
            enum: [
              "abstract",
              "actId",
              "actStatus",
              "action",
              "adoptedAfterCurrentThrough",
              "adoptingCitations",
              "agencies",
              "agencySlugs",
              "alternateCitations",
              "amendmentHistory",
              "amendmentNote",
              "amendmentYears",
              "amendmentsCount",
              "articleName",
              "articleNumber",
              "audience",
              "body",
              "breadcrumb",
              "caseName",
              "chapter",
              "chapterName",
              "citation",
              "citationShort",
              "committeeNote",
              "corpusType",
              "court",
              "crossReferencesCfr",
              "crossReferencesUsc",
              "currencyNote",
              "currencyYear",
              "currentThrough",
              "datesText",
              "displayLabel",
              "displayPath",
              "documentNumber",
              "documentSubtype",
              "documentTypeLabel",
              "docxUrl",
              "edition",
              "effectiveDate",
              "effectiveDateRaw",
              "excerpt",
              "expirationDate",
              "expirationDateRaw",
              "externalUrl",
              "federalRegisterCitations",
              "forum",
              "frCommentsCloseOn",
              "frCorrectionOf",
              "frCorrections",
              "frDocketIds",
              "frEffectiveOn",
              "frEndPage",
              "frRegulationIdNumbers",
              "frRegulationsDotGovUrl",
              "frRelatedDocuments",
              "frSignificant",
              "frStartPage",
              "frVolume",
              "goodLawStatus",
              "govInfoHtmlUrl",
              "govInfoPdfUrl",
              "granuleId",
              "history",
              "historyEffectiveDate",
              "htmlUrl",
              "implementingRegulations",
              "issueDate",
              "issueDateRaw",
              "issuingAgency",
              "languageCode",
              "lastAmendedDate",
              "lastAmendedDateRaw",
              "lastAmendedYear",
              "lawImplemented",
              "licenseNote",
              "originalEnactmentDate",
              "originalEnactmentDateRaw",
              "packageId",
              "parent",
              "part",
              "partName",
              "pdfUrl",
              "pendingAdoptions",
              "popularName",
              "president",
              "priorEffectiveDates",
              "program",
              "publicLawCites",
              "publicLaws",
              "publicationDate",
              "publicationDateRaw",
              "publisherKey",
              "referencedShortTitles",
              "relatedCitations",
              "relatedDocuments",
              "releaseDate",
              "releaseDateRaw",
              "relevanceScore",
              "renumberedTo",
              "renumberedToLabel",
              "requesters",
              "rescindedOn",
              "rescindedOnRaw",
              "reviewDate",
              "reviewDateRaw",
              "ruleSet",
              "ruleSetCode",
              "sectionNumber",
              "sectionTitle",
              "settlementAmount",
              "signingDate",
              "signingDateRaw",
              "source",
              "sourceCharEnd",
              "sourceCharStart",
              "sourceCredit",
              "sourceNote",
              "sourcePageEnd",
              "sourcePageStart",
              "sourceUrl",
              "state",
              "stateHtmlUrl",
              "statutoryAuthority",
              "subchapter",
              "subchapterName",
              "subject",
              "subjectNumber",
              "subpart",
              "subpartName",
              "subtitle",
              "subtitleName",
              "supersededBy",
              "supersedes",
              "supersessionActions",
              "textUrl",
              "title",
              "titleName",
              "titleNumber",
              "topLevelTitle",
              "topics",
              "transferredTo",
              "transferredToLabel",
              "versionId",
              "volume",
              "wordCount",
              "xmlUrl",
              "year",
            ],
            description: "fields parameter.",
          },
          type: "array",
          description: "fields parameter.",
        },
        {
          type: "null",
          description: "fields parameter.",
        },
      ],
      description:
        'Return only these result fields, e.g. `["title", "excerpt"]`. A result carries 40+ fields and most are null on any given row, so a full page of 50 ships a lot of nulls. `actId` and `citation` are always included, because a row without them cannot be used or attributed. Unknown names are rejected with 422 so a typo does not silently drop a field you needed. Omit for the full object.',
    },
    limit: {
      type: "integer",
      maximum: 50,
      minimum: 1,
      description: "Number of results to return per page.",
    },
    offset: {
      type: "integer",
      maximum: 70,
      minimum: 0,
      description:
        "How many results to skip, for paging. Every page of a given query is cut from one ranking, so results never repeat or go missing between pages, and a later page costs no more than the first. The deepest reachable result is `offset` + `limit`; check `hasMore` to know when there is nothing further.",
    },
    includeBody: {
      type: "boolean",
      description:
        "Return the full text of every hit inline, on each result's `body`, instead of making you fetch it per section afterwards.\n\n**Why it exists.** Search returns a ranking preview, so the alternative is a search call plus one `/section/{actId}/body` call per hit. This collapses a whole page to a single round trip.\n\n**Cost**: the 4-credit search PLUS the ordinary 6-credit body price for each row that actually returns text. Ten rows with text is 4 + 60 = 64 credits. A row whose text cannot be resolved comes back with `body: null` and is NOT charged, so read `creditsConsumed` rather than computing it from `limit` -- it is the same price as fetching them yourself, so this buys latency, not a discount.\n\n⚠️ It multiplies with `limit`. `limit: 50` with this set is 304 credits in a single call. Page deliberately.\n\nPrefer this over raising `excerptChars`: the excerpt is windowed around the match and can begin mid-section, dropping a leading subsection marker, so it is not safe to quote. `body` is the publisher's text.",
    },
    excerptChars: {
      type: "integer",
      maximum: 4000,
      minimum: 100,
      description:
        "Characters of matching text to include in each result's `excerpt`. The excerpt is a ranking preview; use `/us/statutes/section/{actId}/body` for the full text. Default 500.",
    },
    matchType: {
      type: "string",
      enum: ["any", "all", "phrase"],
      description:
        "Controls exact vs. semantic matching, so there is no need for a separate keyword-only search mode. `any` (default) is hybrid semantic + keyword ranking and suits natural-language questions. Use `all` for strict keyword matching (every query word must appear in the text) or `phrase` for an exact-phrase match (the query's words, contiguous and in order), e.g. a defined term or a statutory phrase, when you want lexical precision. Both match WHOLE words, case-insensitively, ignoring punctuation: `act` does not match `fact`, `10b-5` matches `10b 5`, and `§ 1983` matches `section 1983`. To pull up one specific section, pass its citation as the query (e.g. `42 U.S.C. § 1983`, `Cal. Civ. Code § 1950.5`) and it resolves to that section at rank 1.",
    },
  },
  { required: ["query"] },
);
export const search_statutesOutput: JsonSchema = s.object(
  "Response returned by Vaquill.",
  {
    results: {
      items: {
        type: "object",
        description: "A single statute section from search results.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "Matching sections, most relevant first. Ordering is by relevance, not statutory order; use `/us/statutes/section/{actId}/related` for what sits either side of a section in its code.",
    },
    count: {
      type: "integer",
      description:
        "How many results came back in THIS response, i.e. the length of `results`. It is not a total match count: the API ranks a bounded set of candidates rather than scoring the whole corpus, so no such total exists. Use `hasMore` to decide whether to ask for another page.",
    },
    total: {
      type: "integer",
      description:
        "DEPRECATED alias for `count`, kept for backward compatibility. The name reads as a corpus-wide match total, which it never was. Use `count` instead.",
      deprecated: true,
    },
    offset: {
      type: "integer",
      description: "The offset applied to this page.",
    },
    hasMore: {
      type: "boolean",
      description: "Whether more results exist beyond this page.",
    },
    changedSectionCount: {
      anyOf: [
        {
          type: "integer",
          description: "changedSectionCount returned by Vaquill.",
        },
        {
          type: "null",
          description: "changedSectionCount returned by Vaquill.",
        },
      ],
      description:
        "Only present when `changedSince` is set: how many sections changed in that window, before ranking. Compare it against `count`. `changedSince` is a filter on a RANKED search, so a window holding more sections than one query can return is normal and the page you get is the most relevant slice of it, not all of it. When this number is larger than you can page to, the filter is a trigger rather than an inventory: subscribe to the board and poll `GET /watches/{id}/changes`, which is complete and costs no credits.",
    },
    rankingDegraded: {
      type: "boolean",
      description:
        "True when the relevance model (a cross-encoder) was unavailable and the results are in hybrid-retrieval order instead. The sections are still real matches for the query, but the ordering is coarser and `relevanceScore` is a retrieval score rather than a 0-1 relevance, so do not threshold on it. Such a ranking is never cached: retrying shortly returns the fully ranked result once the model recovers.",
    },
    noGoodMatch: {
      anyOf: [
        {
          type: "boolean",
          description: "noGoodMatch returned by Vaquill.",
        },
        {
          type: "null",
          description: "noGoodMatch returned by Vaquill.",
        },
      ],
      description:
        "True when nothing in the corpus looks on point for this query. It says nothing about whether the top result is the right section; check its citation and jurisdiction. False when the top result clears the relevance bar, or when the query is a citation or a section number that matched exactly. Null when `rankingDegraded` is true, because the bar is on the relevance model's scale. The same on every page of a query.",
    },
    matchQuality: {
      anyOf: [
        {
          type: "string",
          enum: ["exact", "strong", "moderate", "weak", "none"],
          description: "matchQuality returned by Vaquill.",
        },
        {
          type: "null",
          description: "matchQuality returned by Vaquill.",
        },
      ],
      description:
        "How strongly the evidence says result #1 answers the query. exact: a citation or section-number match. strong: the top result was correct about 94% of the time in our measurements (about 91% on questions whose answer is a statute or regulation). moderate: about 67%. weak: about 35%. none: nothing on point (same as noGoodMatch). Measured on our labelled evaluation set; tiers may be re-cut as the index changes, so treat unknown values as moderate. Null when `rankingDegraded` is true. The same on every page of a query.",
    },
    citationOutsideFilters: {
      anyOf: [
        {
          type: "object",
          description:
            'A citation that names a real section the caller\'s own filters exclude.\n\nBoth `/search` and `/resolve` treat a filter as a promise: a citation outside\nit is not forced into the results. This says so, instead of leaving a caller\nto read an unrelated top hit (or `resolved: false`) as "no such section".',
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "citationOutsideFilters returned by Vaquill.",
        },
      ],
      description:
        "Your query is a citation to a real section that your filters exclude. To read it, retry without the filters named in `excludedBy`, or call `GET /us/statutes/resolve` without them. Null when the query is not a citation, when the citation is inside your filters (it then ranks first), or when it names no section we hold. `results` are unchanged: a filter is a promise, so the section is reported here and not forced into the results. The same on every page of a query.",
    },
    citationMissReason: {
      anyOf: [
        {
          type: "object",
          description:
            "The same finding as one block, for a response that is not itself a citation verdict.\n\n`POST /us/statutes/search` carries it as `citationMissReason`, beside `citationOutsideFilters`:\nthe query was a citation, the resolver missed, and the ranked results are an ordinary search.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "citationMissReason returned by Vaquill.",
        },
      ],
      description:
        "Present only when the whole query is a citation that did not resolve to a section, so the results are an ordinary search and not the section it names. `missReason` says why (`not_held`, `former_law`, `ambiguous_jurisdiction`, `out_of_scope_corpus`), `missReasonHint` what to try, and `candidates` the held sections an ambiguous citation could mean. Absent for a question, for a citation that resolved, and when `citationOutsideFilters` already explains it. `malformed` is never reported here: a free-text question is not malformed. The same on every page of a query. No extra charge.",
    },
    query: {
      type: "string",
      description: "The search query used.",
    },
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema,
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_sectionInput: JsonSchema = s.object(
  "Parameters for get_section.",
  { act_id: actidSchema },
  { required: ["act_id"] },
);
export const get_sectionOutput: JsonSchema = s.object(
  "Detailed section metadata (no full text, use /body for that).",
  {
    section: {
      type: "object",
      description:
        "The section's metadata and source links. Full text is a separate call: `/us/statutes/section/{actId}/body`.",
      additionalProperties: true,
      properties: {},
    },
    resolvedFrom: resolvedFromSchema,
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema,
  },
  {
    required: ["section"],
    additionalProperties: true,
  },
);
export const resolve_citationInput: JsonSchema = s.object(
  "Parameters for resolve_citation.",
  {
    cite: {
      type: "string",
      minLength: 2,
      maxLength: 200,
      description: "A Bluebook citation string, e.g. '42 U.S.C. 1983' or '16 C.F.R. 444.1'.",
    },
    state: {
      anyOf: [
        {
          type: "string",
          minLength: 2,
          maxLength: 7,
          pattern: jurisdictionPattern,
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        "Optional jurisdiction to resolve WITHIN: a two-letter state code, e.g. `tx`, or `federal` for the U.S. Code, the C.F.R., federal rules and the U.S. Constitution. Some citation forms are shared: `8 CCR 1206-2` is Colorado and `22 CCR 76227` is California, and the acronym alone cannot say which. This is a constraint, not a hint -- a citation that names a different jurisdiction returns `resolved: false` rather than being forced into this one, and `citationOutsideFilters` says which section it names.",
    },
    corpusType: {
      anyOf: [
        {
          type: "string",
          enum: ["CONSTITUTION", "REGULATION", "STATE", "STATE_CONSTITUTION", "STATE_RULES"],
          description: "corpusType parameter.",
        },
        {
          type: "null",
          description: "corpusType parameter.",
        },
      ],
      description:
        "Optional corpus to resolve WITHIN: `STATE` (statutory text, federal or state), `REGULATION` (administrative codes), `STATE_RULES` (court rules), `CONSTITUTION` (constitutional text), `STATE_CONSTITUTION` (constitutional text; a synonym of `CONSTITUTION` here, since `state` is what separates the two). Narrows a citation whose form several corpora share; like `state`, a citation belonging to another corpus resolves to nothing instead.",
    },
  },
  { required: ["cite"] },
);
export const resolve_citationOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/resolve`.",
  {
    resolved: {
      type: "boolean",
      description: "True when the citation resolved to an exact section.",
    },
    inputCitation: {
      type: "string",
      description: "The citation string you asked to resolve, echoed back.",
    },
    section: {
      anyOf: [
        {
          type: "object",
          description: "A single statute section from search results.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "section returned by Vaquill.",
        },
      ],
      description: "The resolved section, or null when the citation did not resolve.",
    },
    subsection: {
      anyOf: [
        {
          type: "string",
          description: "subsection returned by Vaquill.",
        },
        {
          type: "null",
          description: "subsection returned by Vaquill.",
        },
      ],
      description:
        "Parsed pinpoint subsection when the citation carried one, e.g. 'b.2' for '42 U.S.C. 1983(b)(2)'. The returned section is the parent. It is also set when the citation names a unit SMALLER than the one the publisher issues: Rhode Island cites a regulation by section ('250-RICR-120-05-15.2') but publishes the whole Part, so `section` is Part 15 and `subsection` is '15.2'. A non-null `subsection` always means `section` is the containing document, not the exact unit you cited.",
    },
    citationOutsideFilters: {
      anyOf: [
        {
          type: "object",
          description:
            'A citation that names a real section the caller\'s own filters exclude.\n\nBoth `/search` and `/resolve` treat a filter as a promise: a citation outside\nit is not forced into the results. This says so, instead of leaving a caller\nto read an unrelated top hit (or `resolved: false`) as "no such section".',
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "citationOutsideFilters returned by Vaquill.",
        },
      ],
      description:
        "Set only when `resolved` is false because your `state` or `corpusType` scope excludes a section this citation DOES name, e.g. `42 U.S.C. 1983` under `state=ca`. The scope is a constraint, so the verdict stays `resolved: false`; this says why, so an unresolved result is not read as 'no such section'. Retry without the scope named in `excludedBy` to resolve it. No extra charge.",
    },
    matchedCorpus: {
      anyOf: [
        {
          type: "string",
          const: "session_law",
          description: "matchedCorpus returned by Vaquill.",
        },
        {
          type: "null",
          description: "matchedCorpus returned by Vaquill.",
        },
      ],
      description:
        "Present only when the citation names a STATE session law (an act as enacted, for example `CHAPTER 2025-12` or `S.F.No. 1552`) rather than a code section. `resolved` stays false and `section` stays null, because both describe a code section; the law is in `sessionLaw`.",
    },
    sessionLaw: {
      anyOf: [
        {
          type: "object",
          description: "A citation that names a STATE session law rather than a code section.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "sessionLaw returned by Vaquill.",
        },
      ],
      description:
        "The state session law this citation names, when it names no code section. `status` is `matched` (one law, read it at `href`) or `ambiguous` (several, all in `candidates`, none chosen for you). Absent when the citation resolved to a section, and whenever session laws cannot be checked. No extra charge.",
    },
    matchLevel: {
      anyOf: [
        {
          type: "string",
          enum: ["container", "multiple", "repaired", "register_reference"],
          description: "matchLevel returned by Vaquill.",
        },
        {
          type: "null",
          description: "matchLevel returned by Vaquill.",
        },
      ],
      description:
        "Present only when `section` is NOT the exact unit you cited. `container`: you cited a chapter, series, article, part or amendment, and `section` is the FIRST section inside it (see `container` for how many there are and what they are). `multiple`: you cited several sections (`§§ 8, 10`, `§§ 1983-1985`) and `section` is the first of them (see `citedSections`), or your citation fits more than one held section (`D.C.COLO.LR 7.1` is both Local Civil and Local Criminal Rule 7.1) and every candidate is listed in `container`. `repaired`: the code name you wrote is a recognised miscite and `section` is the one it names (see `repair`); or (`repair.kind: prior_edition`) the text you cited has been replaced by a current one, and `section` is NOT the text you cited: a C.F.R. or U.S.C. section the current code no longer holds, answered with the MOST RECENT historical annual edition we hold, or a superseded rule set whose rule numbers were kept, answered with the current rule (`Tex. R. Civ. Evid. 803` is answered by `Tex. R. Evid. 803`); `repair.interpretedAs` names what was served and why, and `repair.alternatives` lists the other held editions, if any; or (`repair.kind: former_law`, `former_number`) you cited a FORMER section number, recodified or renumbered since, and `section` is the successor the state's own disposition table or history line names, never the former text (a former section split into several answers `multiple`, every successor in `citedSections`). or (`repair.kind: code_name_inferred`) your citation named no code (`CODE ANN. § 73.001`, `Code 4121-3-34`) and `section` is the only one in the state that carries that number, so the code was inferred from the number and not read from your citation; `register_reference`: you cited a state register page, and `section` is a rule whose history cites it (see `registerReference`). `resolved` keeps its meaning (a section was returned) and is true at every level; read `matchLevel` to tell an exact section from a first-of-several. Absent for an exact match.",
    },
    container: {
      anyOf: [
        {
          type: "object",
          description: "What the citation named, and what lies inside it.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "container returned by Vaquill.",
        },
      ],
      description:
        "Set with `matchLevel: container`. What you cited and the sections inside it; `section` is the first of them. Also set with `matchLevel: multiple` when the citation fits several held sections and none is the one cited (kind `alternatives`): every candidate is listed, `section` is only the first offered.",
    },
    citedSections: {
      anyOf: [
        {
          items: {
            type: "string",
            description: "citedSections returned by Vaquill.",
          },
          type: "array",
          description: "citedSections returned by Vaquill.",
        },
        {
          type: "null",
          description: "citedSections returned by Vaquill.",
        },
      ],
      description:
        "Set with `matchLevel: multiple`. The sections your citation named, as written (a range such as `1983-1985` is one entry); `section` is the first.",
    },
    repair: {
      anyOf: [
        {
          type: "object",
          description: "A miscite we recognised, and how we read it.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "repair returned by Vaquill.",
        },
      ],
      description: "Set with `matchLevel: repaired`. The miscite we corrected and how we read it.",
    },
    registerReference: {
      anyOf: [
        {
          type: "object",
          additionalProperties: true,
          properties: {},
          description: "registerReference returned by Vaquill.",
        },
        {
          type: "null",
          description: "registerReference returned by Vaquill.",
        },
      ],
      description:
        "Present only when `matchLevel` is `register_reference`: the citation names a page, issue or filing of a state register or bulletin. When `registerItemHeld` is true `section` IS that register item (corpusType STATE_REGISTER, a notice as printed, not codified law). Otherwise the item is not held and `section` is a RULE whose history note cites it (the first of `ruleCount`, in document order); read `rules` for the others.",
    },
    missReason: {
      anyOf: [
        {
          type: "string",
          enum: ["not_held", "former_law", "ambiguous_jurisdiction", "malformed", "out_of_scope_corpus"],
          description: "missReason returned by Vaquill.",
        },
        {
          type: "null",
          description: "missReason returned by Vaquill.",
        },
      ],
      description:
        "Present only when `resolved` is false and none of `citationOutsideFilters` / `sessionLaw` already explains it. WHY the citation did not resolve: `ambiguous_jurisdiction` (the form is one several jurisdictions print, or names none, and no `state` was given: pass `state`; `candidates` lists the held sections it could mean when we can name them, and never picks one), `out_of_scope_corpus` (it names a body of law this route does not serve; `missReasonHint` says which and where to look), `former_law` (it names a repealed, renumbered or retired compilation we do not serve as current law; `missReasonHint` names the successor where one is known), `malformed` (no parser reads it: a docket or database token, a case or treatise citation, a string with no section number), `not_held` (it reads as a citation to a jurisdiction and corpus we serve, and that corpus does not hold the section). A miss is still charged, because the verdict is the product; the reason adds no charge. Absent on a resolved citation.",
    },
    candidates: {
      anyOf: [
        {
          items: {
            type: "object",
            description: "A held section an ambiguous citation could mean.",
            additionalProperties: true,
            properties: {},
          },
          type: "array",
          description: "candidates returned by Vaquill.",
        },
        {
          type: "null",
          description: "candidates returned by Vaquill.",
        },
      ],
      description:
        "Present only with `missReason: ambiguous_jurisdiction`, and only when we can name the held sections the citation could mean (an acronym two states print, such as `CCR`). At most 10 entries. Pass the right one's `state` to `GET /us/statutes/resolve` to resolve it. Never a pick: when several are listed, none is the answer.",
    },
    missReasonHint: {
      anyOf: [
        {
          type: "string",
          description: "missReasonHint returned by Vaquill.",
        },
        {
          type: "null",
          description: "missReasonHint returned by Vaquill.",
        },
      ],
      description:
        "Present with `missReason`. One sentence on what to try next. Prose for a human or an agent; do not parse it.",
    },
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema,
  },
  {
    required: ["resolved", "inputCitation"],
    additionalProperties: true,
  },
);
export const resolve_citationsInput: JsonSchema = s.object(
  "Parameters for resolve_citations.",
  {
    citations: {
      items: {
        type: "string",
        description: "citations parameter.",
      },
      type: "array",
      maxItems: 500,
      minItems: 1,
      description:
        "Bluebook citation strings to resolve. Duplicates are collapsed FIRST and order is preserved, so the response's `results` array lines up with the de-duplicated input.\n\nThe cap is **50 UNIQUE citations, applied after that collapse**, so a brief quoting one section sixty times is one citation and is accepted. 500 is the raw list ceiling, which exists so an unbounded list of duplicates cannot make us walk it.\n\nPriced PER CITATION at the single-resolve rate, exactly like `POST /us/statutes/sections`: batching is a round-trip and latency win, not a discount. Thirty citations cost the same 60 credits either way and take one request instead of thirty.",
    },
    state: {
      anyOf: [
        {
          type: "string",
          pattern: jurisdictionPattern,
          maxLength: 7,
          minLength: 2,
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        "Optional jurisdiction to resolve every citation WITHIN: a two-letter state code, or `federal` for the U.S. Code, the C.F.R., federal rules and the U.S. Constitution. Applies to the whole batch: a batch spanning jurisdictions should omit it and let each citation name its own. Same semantics as the single-citation route -- a constraint, not a hint.",
    },
    corpusType: {
      anyOf: [
        {
          type: "string",
          enum: ["CONSTITUTION", "REGULATION", "STATE", "STATE_CONSTITUTION", "STATE_RULES"],
          description: "corpusType parameter.",
        },
        {
          type: "null",
          description: "corpusType parameter.",
        },
      ],
      description:
        "Optional corpus to resolve every citation WITHIN: `STATE` (statutory text, federal or state), `REGULATION` (administrative codes), `STATE_RULES` (court rules), `CONSTITUTION` (constitutional text), `STATE_CONSTITUTION` (constitutional text; a synonym of `CONSTITUTION` here, since `state` is what separates the two). Same semantics as the single-citation route.",
    },
  },
  { required: ["citations"] },
);
export const resolve_citationsOutput: JsonSchema = s.object(
  "Response for `POST /us/statutes/resolve`.",
  {
    results: {
      items: {
        type: "object",
        description:
          "One citation's verdict inside a batch response.\n\nDeliberately the same field names as `StatuteResolveResponse` minus the\nper-request bookkeeping, so a caller migrating from the single route reads\neach item with the code it already has.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "One entry per de-duplicated input citation, in the order supplied. An unresolved citation is an entry with `resolved: false`, never an omission: a caller checking thirty citations needs to know which of them failed, and a shorter array cannot say.",
    },
    resolvedCount: {
      type: "integer",
      description:
        "How many of the submitted citations resolved to a code section. A citation answered only by a `sessionLaw` block is not counted.",
    },
    count: {
      type: "integer",
      description: "Total entries in `results`, after de-duplication.",
    },
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds.",
    },
    creditsConsumed: {
      type: "number",
      description:
        "Credits actually charged. Read it rather than multiplying the list price by your input length: a backend failure on some citations refunds those, so this can be lower than 2 x `count`.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_related_sectionsInput: JsonSchema = s.object(
  "Parameters for get_related_sections.",
  {
    act_id: actidSchema,
    limit: {
      type: "integer",
      maximum: 10,
      minimum: 1,
      description: "How many sections to return on EACH side.",
    },
  },
  { required: ["act_id"] },
);
export const get_related_sectionsOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/section/{act_id}/related`.",
  {
    section: {
      type: "object",
      description: "The section you asked about.",
      additionalProperties: true,
      properties: {},
    },
    previous: {
      items: {
        type: "object",
        description: "A single statute section from search results.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "Sections immediately BEFORE this one in the same container, nearest last.",
    },
    next: {
      items: {
        type: "object",
        description: "A single statute section from search results.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "Sections immediately AFTER this one, nearest first.",
    },
    container: {
      anyOf: [
        {
          type: "string",
          description: "container returned by Vaquill.",
        },
        {
          type: "null",
          description: "container returned by Vaquill.",
        },
      ],
      description:
        "Human label for the grouping the neighbours were drawn from, e.g. the chapter name. Neighbours never cross this boundary.",
    },
    resolvedFrom: resolvedFromSchema,
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema,
  },
  {
    required: ["section"],
    additionalProperties: true,
  },
);
export const get_sectionsInput: JsonSchema = s.object(
  "Parameters for get_sections.",
  {
    actIds: {
      items: {
        type: "string",
        description: "actIds parameter.",
      },
      type: "array",
      maxItems: 50,
      minItems: 1,
      description:
        "Section identifiers from a prior `/us/statutes/search` response. Up to 50 per call. Duplicates are collapsed, and order is preserved in the response. Each id encodes the citation's hierarchy: `USC_T42_C21_S1983` is Title 42, Chapter 21, Section 1983. DO NOT BUILD THESE FROM A CITATION: the chapter/article/part segments exist only in the data, so `Tex. Property Code § 93.005` is `STATE_TX_Cpr_C93_S93.005`, not `STATE_TX_C93_S93.005`. Assembled ids miss, and `notFoundDetail` will say so and suggest the real ones. A citation (`26 U.S.C. § 1`) is also accepted in place of an id: it is resolved and served, and listed in `resolved`.",
    },
    includeBody: {
      type: "boolean",
      description:
        "Return each section's full text inline on `body`, instead of metadata only. Adds the ordinary body price per row that returns text, so 20 ids resolving 20 bodies is 40 + 120 = 160 credits. Rows whose text cannot be resolved come back with `body: null` and are not charged for it, so read `creditsConsumed` rather than computing the total. Without this, use `/us/statutes/section/{actId}/body` one id at a time.",
    },
  },
  { required: ["actIds"] },
);
export const get_sectionsOutput: JsonSchema = s.object(
  "Response for `POST /us/statutes/sections`.",
  {
    sections: {
      items: {
        type: "object",
        description: "A single statute section from search results.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "Found sections, in the order the ids were supplied.",
    },
    notFound: {
      items: {
        type: "string",
        description: "notFound returned by Vaquill.",
      },
      type: "array",
      description:
        "Identifiers with no match. These are NOT charged, so a batch with misses costs less than `len(actIds)` times the per-section rate.",
    },
    notFoundDetail: {
      items: {
        type: "object",
        description:
          "Why one `actId` missed, and what to send instead.\n\nA bare id in `notFound` is ambiguous between the two things a caller most\nneeds to tell apart: an id they built by hand that never existed, and a real\nsection we do not hold. Read as the latter, the first one looks like missing\ncoverage, which is how a working integration gets abandoned.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "One entry per id in `notFound`, saying whether the id was assembled rather than taken from a search result, and suggesting the real ids where they could be recovered. Diagnostic only and never charged; it can come back empty if the lookup is unavailable, so treat it as a hint rather than a contract.",
    },
    resolved: {
      items: {
        type: "object",
        description:
          "How the identifier you sent was matched, when it was not an exact act_id.\n\nPresent only when the input did NOT match as sent. Absent (null) means the\nsection is exactly the act_id in your request.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "One entry per input that did NOT match as sent: a citation resolved to its section, or an id cleaned of whitespace, quotes or a trailing period. Use it to map your inputs onto `sections`, which carry the real act_ids. Empty when every input was an exact id.",
    },
    count: {
      type: "integer",
      description: "Number of sections returned.",
    },
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema,
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_section_bodyInput: JsonSchema = s.object(
  "Parameters for get_section_body.",
  {
    act_id: actidSchema,
    format: {
      enum: ["all", "both", "html", "markdown", "plain", "content", "operative"],
      type: "string",
      description:
        "Which representations to return. `both` (the default) returns `html` and `plain`. A long section carries the same text twice that way, so `plain` or `html` alone roughly halves the payload. Cost is unchanged: the fetch is the same either way.\n\n`all` adds `markdown` where the section has a structured rendering. It is opt-in because it is a third full copy of the text (about 600,000 extra characters on `49 CFR 172.101`), which a model-facing client would pay for in tokens without asking.\n\n`markdown` returns only `markdown`. On a section with no structured rendering it falls back to `plain` with a `note` saying so, never to an empty body. `tables` and `figures` are returned on every format, because they are small and describe the text you received.\n\n`content` omits `html` and `plain` and returns the split fields (`content`, `sourceCredit`, `notes`).\n\n`operative` omits `notes` as well, leaving `content` + `sourceCredit`: the law and what enacted it, and nothing else. This is the smallest representation of a section, and on a note-heavy section it is the difference between a payload that fits in a prompt and one that does not. Measured on `17 U.S.C. § 107`: 95,217 bytes at `both`, 30,545 at `content`, 1,564 at `operative`, all for the same 6 credits.\n\nOnly United States Code sections can be split, so on any other corpus both values fall back to returning `plain` with a `note` saying why -- `content` will be null there, so read `note` rather than assuming the section was empty.",
    },
    structured: {
      type: "boolean",
      description:
        "When true, also return a `subsections` tree parsed from the text for pincite addressing, and `markdown` as that tree rendered as nested Markdown lists. Same cost.\n\n`structured=true` OWNS `markdown`: on every `format`, and on every `source`, `markdown` is the nested-list rendering, never the table-preserving rendering a `r2_render` section otherwise returns for `format=all`/`markdown` (a `note` says so when that happens). Ask without `structured` for the tables. With `format=markdown` the nested lists are returned alone, without `html` or `plain`.",
    },
    asOf: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "asOf parameter.",
        },
        {
          type: "null",
          description: "asOf parameter.",
        },
      ],
      description:
        "Return the section's text as it stood on this date (`YYYY-MM-DD`) instead of today's. Same cost.\n\n**This is a reconstruction, not an archive.** The corpus holds one current text per citation; an earlier one is rebuilt from the before-side of the first change we OBSERVED after your date. The `asOf` block on the response says which version you got (`source`), what it rests on (`basisChangeId`), how far back the evidence reaches (`observedFrom`), and whether the answer is bounded by when capture began rather than by the law (`isBounded`). Read `isBounded` before citing the text.\n\nA section that did not exist yet returns `available: false` with `asOf.existed: false`, which is a real answer and is charged. A section we know changed but cannot rebuild returns `source: \"unavailable\"` and IS refunded, because you asked for a historical text and did not get one.\n\nA date that does not exist on a calendar (`2026-02-30`) is a 422 and is not charged.",
      format: "date",
    },
  },
  { required: ["act_id"] },
);
export const get_section_bodyOutput: JsonSchema = s.object(
  "Full text of a statute section in HTML and/or plain text.",
  {
    actId: {
      type: "string",
      description:
        "The act_id of the section served. Equal to your request unless `resolvedFrom` is set, in which case it is the id your citation or cleaned-up input resolved to.",
    },
    html: {
      anyOf: [
        {
          type: "string",
          description: "html returned by Vaquill.",
        },
        {
          type: "null",
          description: "html returned by Vaquill.",
        },
      ],
      description:
        "The section text as HTML. When `source` is `r2_render` this is our structured rendering of the publisher's source: real `<table>` elements (with `<caption>`, `colspan` and `rowspan`) and `<figure>` / `<img>` elements at the position the publisher prints them, with images hosted on `statutes-us.vaquill.ai`. When `source` is `r2_s3` this is the publisher's own markup (tables, paragraph structure, history lines), cut to the section's own content where we recognise the publisher's page layout. For any other `source` the text was not held as per-section HTML, and `html` carries the same text as `plain` with no markup.",
    },
    plain: {
      anyOf: [
        {
          type: "string",
          description: "plain returned by Vaquill.",
        },
        {
          type: "null",
          description: "plain returned by Vaquill.",
        },
      ],
      description: "Plain text version.",
    },
    source: {
      anyOf: [
        {
          type: "string",
          description: "source returned by Vaquill.",
        },
        {
          type: "null",
          description: "source returned by Vaquill.",
        },
      ],
      description:
        "Which copy the text came from: `r2_render` (our structured rendering, carrying `markdown`, `tables` and `figures`), `r2_s3` (the publisher's page for this section), `r2_text` (our per-section text extraction), `qdrant_reconstructed` (reassembled from indexed passages), and on `asOf` requests `stored_edition` or `corpus_change_history`. A storage identifier, not a citation: cite `sourceUrl`.",
    },
    sourceUrl: {
      anyOf: [
        {
          type: "string",
          description: "sourceUrl returned by Vaquill.",
        },
        {
          type: "null",
          description: "sourceUrl returned by Vaquill.",
        },
      ],
      description:
        "Where this text was published by the government, so the bytes you were served can be cited and verified against the official record. Null when we hold no publishable link for the section: a third-party compiler is never served here, and an absent link is the correct answer in that case. `source` is a storage identifier and is NOT a citation.",
    },
    content: {
      anyOf: [
        {
          type: "string",
          description: "content returned by Vaquill.",
        },
        {
          type: "null",
          description: "content returned by Vaquill.",
        },
      ],
      description:
        'The OPERATIVE TEXT of the section, with the source credit and the notes apparatus removed. This is the law; `plain` is the law plus everything the publisher prints around it.\n\nPopulated for **United States Code** sections, where GPO delimits the fields in the granule it publishes. Null for CFR and for state corpora, whose sources carry no equivalent structure -- null means "we cannot split this reliably", never "this section is empty", and `plain` is still the whole body.\n\nWorth using if you feed sections to a model: the operative text is a median 46% of `plain` across USC and as little as 3.4% (`17 U.S.C. § 107`, where nearly all of the body is committee reports and amendment notes). A model handed the full body can quote a 1992 amendment note as the law in force.',
    },
    sourceCredit: {
      anyOf: [
        {
          type: "string",
          description: "sourceCredit returned by Vaquill.",
        },
        {
          type: "null",
          description: "sourceCredit returned by Vaquill.",
        },
      ],
      description:
        "The publisher's credit line for the section, e.g. `(Pub. L. 94-553, title I, §101, Oct. 19, 1976, 90 Stat. 2546; ...)`. Split out of the body rather than left inside it.\n\nThe same value is also on `GET /us/statutes/section/{actId}` as `sourceCredit`; it is repeated here so a caller fetching the text does not need a second call to know what enacted it.",
    },
    notes: {
      anyOf: [
        {
          type: "string",
          description: "notes returned by Vaquill.",
        },
        {
          type: "null",
          description: "notes returned by Vaquill.",
        },
      ],
      description:
        'The notes apparatus the publisher prints after the section: Historical and Revision Notes, committee reports, Editorial Notes (codification and amendments), Statutory Notes and Related Subsidiaries (effective dates), and any guidelines reprinted by the editors.\n\nKept, not discarded: it is the legislative history, and it is the reason a section\'s body can be twenty times the length of the law. It is simply NOT the operative text, so it is served as its own field. Null where we cannot split the body.\n\nAlso null, deliberately, when you pass `format=operative`: that is the one format that asks us to leave the apparatus off the wire. Null there means "not sent", not "none exists" -- the same request at `format=content` returns it.',
    },
    available: {
      type: "boolean",
      description: "Whether full text is available.",
    },
    note: {
      anyOf: [
        {
          type: "string",
          description: "note returned by Vaquill.",
        },
        {
          type: "null",
          description: "note returned by Vaquill.",
        },
      ],
      description: "Note if text is unavailable.",
    },
    markdown: {
      anyOf: [
        {
          type: "string",
          description: "markdown returned by Vaquill.",
        },
        {
          type: "null",
          description: "markdown returned by Vaquill.",
        },
      ],
      description:
        "The body as GitHub-flavoured Markdown. When `source` is `r2_render` this is the structured rendering: tables as GFM pipe tables (a caption line above, footnotes below, multi-level headers joined as `Parent / Child`) and figures as `![alt](url)` at their position in the text. Returned only when `format` is `all` or `markdown`, not on the default `both`, where it would be a third full copy.\n\nFor a section with no structured rendering, `markdown` is null unless you pass `structured=true`, in which case it is the body as nested Markdown lists (the pre-existing behaviour). When both exist the structured rendering wins, because it is the one that keeps the tables; `subsections` is returned either way.",
    },
    tables: {
      anyOf: [
        {
          items: {
            type: "object",
            description: "One table inside a rendered section body.",
            additionalProperties: true,
            properties: {},
          },
          type: "array",
          description: "tables returned by Vaquill.",
        },
        {
          type: "null",
          description: "tables returned by Vaquill.",
        },
      ],
      description:
        "The tables in the body, in document order, with their size. An empty list means the section has none. Null means not known: the section's corpus has no structured rendering yet, so a table may still be present in `html`.",
    },
    figures: {
      anyOf: [
        {
          items: {
            type: "object",
            description: "One figure, equation or form image inside a rendered section body.",
            additionalProperties: true,
            properties: {},
          },
          type: "array",
          description: "figures returned by Vaquill.",
        },
        {
          type: "null",
          description: "figures returned by Vaquill.",
        },
      ],
      description:
        "The figures, equations and form images in the body, in document order, with hosted image urls and each one's offset into `markdown` and `plain`. An empty list means the section has none. Null means not known: the section's corpus has no structured rendering yet.",
    },
    hasTables: {
      anyOf: [
        {
          type: "boolean",
          description: "hasTables returned by Vaquill.",
        },
        {
          type: "null",
          description: "hasTables returned by Vaquill.",
        },
      ],
      description:
        "True when the body contains at least one table, false when it contains none. Null when not known, because the section's corpus has no structured rendering yet.",
    },
    hasFigures: {
      anyOf: [
        {
          type: "boolean",
          description: "hasFigures returned by Vaquill.",
        },
        {
          type: "null",
          description: "hasFigures returned by Vaquill.",
        },
      ],
      description:
        "True when the body contains at least one figure, equation or form image, false when it contains none. Null when not known, because the section's corpus has no structured rendering yet.",
    },
    subsections: {
      anyOf: [
        {
          items: {
            type: "object",
            description: "One node in a section's subsection tree (see `/body?structured=true`).",
            additionalProperties: true,
            properties: {},
          },
          type: "array",
          description: "subsections returned by Vaquill.",
        },
        {
          type: "null",
          description: "subsections returned by Vaquill.",
        },
      ],
      description:
        "The section broken into its lettered and numbered subsections, nested as they appear in the text. Use it to quote or link a single clause rather than the whole section. Present only when `structured=true`.",
    },
    asOf: {
      anyOf: [
        {
          type: "object",
          description:
            "Where an `asOf` body came from, and how far the evidence reaches.\n\nEvery field but `text` on the parent exists so this answer cannot be\nover-read. The corpus holds ONE current text per citation; an earlier one is\nRECONSTRUCTED from observed changes, and observation started when it started.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "asOf returned by Vaquill.",
        },
      ],
      description:
        "Present only when the request passed `asOf`. Says WHICH version of the section you are holding and how far the evidence for it goes. Read `isBounded` before treating the text as the law on that date.",
    },
    resolvedFrom: resolvedFromSchema,
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema,
  },
  {
    required: ["actId"],
    additionalProperties: true,
  },
);
export const count_statutesInput: JsonSchema = s.object(
  "Parameters for count_statutes.",
  {
    corpusType: {
      anyOf: [
        {
          type: "string",
          enum: [
            "USC",
            "CFR",
            "STATE",
            "CONSTITUTION",
            "FEDERAL_RULES",
            "FEDERAL_LOCAL_RULES",
            "STATE_CONSTITUTION",
            "STATE_RULES",
            "EXECUTIVE_ACTION",
            "REGULATION",
            "FEDERAL_REGISTER",
            "FEDERAL_REGISTER_NOTICE",
            "AGENCY_GUIDANCE",
            "SENTENCING_GUIDELINES",
            "US_TAX_TREATY",
            "STATE_AGENCY_GUIDANCE",
            "STATE_AG_OPINION",
            "STATE_REGISTER",
            "SESSION_LAW",
            "STATUTE_COMPILATION",
            "AGENCY_ADJUDICATION",
            "CFR_ANNUAL",
            "USC_ANNUAL",
          ],
          description: "corpusType parameter.",
        },
        {
          items: {
            type: "string",
            enum: [
              "USC",
              "CFR",
              "STATE",
              "CONSTITUTION",
              "FEDERAL_RULES",
              "FEDERAL_LOCAL_RULES",
              "STATE_CONSTITUTION",
              "STATE_RULES",
              "EXECUTIVE_ACTION",
              "REGULATION",
              "FEDERAL_REGISTER",
              "FEDERAL_REGISTER_NOTICE",
              "AGENCY_GUIDANCE",
              "SENTENCING_GUIDELINES",
              "US_TAX_TREATY",
              "STATE_AGENCY_GUIDANCE",
              "STATE_AG_OPINION",
              "STATE_REGISTER",
              "SESSION_LAW",
              "STATUTE_COMPILATION",
              "AGENCY_ADJUDICATION",
              "CFR_ANNUAL",
              "USC_ANNUAL",
            ],
            description: "corpusType parameter.",
          },
          type: "array",
          description: "corpusType parameter.",
        },
        {
          type: "null",
          description: "corpusType parameter.",
        },
      ],
      description: "Corpus to count, single or list. Omit to count every corpus.",
    },
    state: {
      anyOf: [
        {
          type: "string",
          pattern: jurisdictionPattern,
          description: "state parameter.",
        },
        {
          items: {
            type: "string",
            pattern: jurisdictionPattern,
            description: "state parameter.",
          },
          type: "array",
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description: "Two-letter jurisdiction code or `federal`, single or list.",
    },
    code: {
      anyOf: [
        {
          type: "string",
          description: "code parameter.",
        },
        {
          items: {
            type: "string",
            description: "code parameter.",
          },
          type: "array",
          description: "code parameter.",
        },
        {
          type: "null",
          description: "code parameter.",
        },
      ],
      description:
        "State code identifier, e.g. `tx_26`. With `corpusType=FEDERAL_RULES`, a rule set instead (`frcp`, `uscapp_t28a_fre`). Same values and checks as `code` on `/search`.",
    },
    article: {
      anyOf: [
        {
          type: "string",
          description: "article parameter.",
        },
        {
          items: {
            type: "string",
            description: "article parameter.",
          },
          type: "array",
          description: "article parameter.",
        },
        {
          type: "null",
          description: "article parameter.",
        },
      ],
      description:
        "Article label (`Amendment XIV`) on CONSTITUTION / STATE_CONSTITUTION, or article number (`2-A`) on a STATE / REGULATION code divided by article. Same values and pairing rules as `article` on `/search`.",
    },
    titleNumber: {
      anyOf: [
        {
          type: "integer",
          minimum: 1,
          description: "titleNumber parameter.",
        },
        {
          type: "null",
          description: "titleNumber parameter.",
        },
      ],
      description: "USC or CFR title number.",
    },
    chapter: {
      anyOf: [
        {
          type: "string",
          description: "chapter parameter.",
        },
        {
          items: {
            type: "string",
            description: "chapter parameter.",
          },
          type: "array",
          description: "chapter parameter.",
        },
        {
          type: "null",
          description: "chapter parameter.",
        },
      ],
      description: "Chapter identifier. Pair with `titleNumber` or `code`.",
    },
    part: {
      anyOf: [
        {
          type: "string",
          description: "part parameter.",
        },
        {
          items: {
            type: "string",
            description: "part parameter.",
          },
          type: "array",
          description: "part parameter.",
        },
        {
          type: "null",
          description: "part parameter.",
        },
      ],
      description: "CFR part identifier. Pair with `titleNumber`.",
    },
    actStatus: {
      anyOf: [
        {
          type: "string",
          enum: [
            "abolished",
            "deleted",
            "expired",
            "in_force",
            "inactive",
            "non_precedential",
            "not_funded",
            "not_yet_effective",
            "omitted",
            "proposed",
            "recodified",
            "recompiled",
            "rejected",
            "relocated",
            "removed",
            "renumbered",
            "repealed",
            "rescinded",
            "reserved",
            "revoked",
            "superseded",
            "terminated",
            "transferred",
            "unconstitutional",
            "vacant",
            "vacated",
            "vetoed",
            "withdrawn",
          ],
          description: "actStatus parameter.",
        },
        {
          items: {
            type: "string",
            enum: [
              "abolished",
              "deleted",
              "expired",
              "in_force",
              "inactive",
              "non_precedential",
              "not_funded",
              "not_yet_effective",
              "omitted",
              "proposed",
              "recodified",
              "recompiled",
              "rejected",
              "relocated",
              "removed",
              "renumbered",
              "repealed",
              "rescinded",
              "reserved",
              "revoked",
              "superseded",
              "terminated",
              "transferred",
              "unconstitutional",
              "vacant",
              "vacated",
              "vetoed",
              "withdrawn",
            ],
            description: "actStatus parameter.",
          },
          type: "array",
          description: "actStatus parameter.",
        },
        {
          type: "null",
          description: "actStatus parameter.",
        },
      ],
      description: "Count only sections carrying this status.",
    },
    excludeRepealed: {
      type: "boolean",
      description:
        "Exclude sections whose status is affirmatively dead. A section with no recorded status is KEPT, because a missing status is not evidence of repeal. The US Code is served from a stored annual edition, so a section repealed after it closed is counted here; see the same field on `/search` for the measurement.",
    },
  },
  { required: [] },
);
export const count_statutesOutput: JsonSchema = s.object(
  "Response for `POST /us/statutes/count`.",
  {
    count: {
      type: "integer",
      description:
        "Sections in scope. This is a SECTION count, not a passage count: long sections are stored as several passages and are counted once.",
    },
    isExact: {
      type: "boolean",
      description:
        "True when the figure is an exact count rather than an estimate. Present so a future estimated mode cannot be mistaken for this one.",
    },
    scope: {
      additionalProperties: true,
      type: "object",
      description:
        "The filters that produced this figure, echoed back. A count with no scope attached is not reproducible, and an ignored filter would otherwise be invisible.",
      properties: {},
    },
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds.",
    },
    creditsConsumed: {
      type: "number",
      description: "Credits actually charged for this call.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_coverageInput: JsonSchema = s.object(
  "Parameters for get_coverage.",
  {
    state: {
      anyOf: [
        {
          type: "string",
          pattern: jurisdictionPattern,
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        "Return only this jurisdiction: a 2-letter US state code (one of the 52 supported) or `federal`. Case-insensitive. Omit for every jurisdiction. The unfiltered matrix runs to about a megabyte, so pass this when you are asking about one place. `totalSections` and `stateCountWithData` stay corpus-wide.",
    },
  },
  { required: [] },
);
export const get_coverageOutput: JsonSchema = s.object(
  "What `GET /us/statutes/coverage` returns: the matrix under `data`.\n\nDeclared because the route used to return a hand-built dict with no\n`response_model`, so its published schema was `{}`. Every field was\ndiscoverable only if the example happened to show it, and the MCP tool and\ngenerated clients built from the document got no types at all for the one\nendpoint that exists to be read before anything else.",
  {
    data: {
      type: "object",
      description:
        "Response for `GET /us/statutes/coverage`.\n\nA self-describing matrix: a legend of every `corpusType` token plus, for\neach jurisdiction, the per-corpusType ingested-document counts. Use it to learn\nexactly what is queryable where before calling `/us/statutes/search`.",
      additionalProperties: true,
      properties: {},
    },
    meta: {
      type: "object",
      description: "`meta` on a free discovery endpoint.",
      additionalProperties: true,
      properties: {},
    },
  },
  {
    required: ["data", "meta"],
    additionalProperties: true,
  },
);
export const list_divisionsInput: JsonSchema = s.object(
  "Parameters for list_divisions.",
  {
    corpusType: {
      type: "string",
      description:
        "Corpus to browse. Case-insensitive. The browsable subset of the `corpusType` tokens on `/us/statutes/coverage`.",
      pattern: divisionCorpusPattern,
    },
    state: {
      anyOf: [
        {
          type: "string",
          pattern: statePattern,
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        "2-letter jurisdiction code, required for the state-scoped corpora (STATE, REGULATION, STATE_CONSTITUTION). Case-insensitive.",
    },
    titleNumber: {
      anyOf: [
        {
          type: "integer",
          minimum: 1,
          description: "titleNumber parameter.",
        },
        {
          type: "null",
          description: "titleNumber parameter.",
        },
      ],
      description: "USC/CFR title number to drill into.",
    },
    code: {
      anyOf: [
        {
          type: "string",
          description: "code parameter.",
        },
        {
          type: "null",
          description: "code parameter.",
        },
      ],
      description:
        "Code to drill into: a state code such as `tx_pe` (list them with `corpusType=STATE&state=<state>`), or a federal rule set such as `frcp` (list them with `corpusType=FEDERAL_RULES`).",
    },
    chapter: {
      anyOf: [
        {
          type: "string",
          description: "chapter parameter.",
        },
        {
          type: "null",
          description: "chapter parameter.",
        },
      ],
      description:
        "Chapter identifier to drill into (USC and state codes). Accepted alongside `part` on CFR, where it is not needed: part numbers are unique within a title.",
    },
    part: {
      anyOf: [
        {
          type: "string",
          description: "part parameter.",
        },
        {
          type: "null",
          description: "part parameter.",
        },
      ],
      description: "Part identifier to drill into (CFR).",
    },
    article: {
      anyOf: [
        {
          type: "string",
          description: "article parameter.",
        },
        {
          type: "null",
          description: "article parameter.",
        },
      ],
      description:
        "Article to drill into: a constitution's article or amendment (`Article III`, `Amendment XIV`), or the article of a state code that is divided by articles rather than chapters (New York, where the listing's `kind` is `article`). Pass the `identifier` exactly as the listing returned it.",
    },
    excludeRepealed: {
      type: "boolean",
      description:
        "Leave out sections whose status is affirmatively dead (repealed, superseded, renumbered and similar). A section carrying no recorded status is KEPT: a missing status is not evidence of repeal. Same vocabulary as the filter of this name on `POST /us/statutes/search`.",
    },
    actStatus: {
      anyOf: [
        {
          type: "string",
          enum: [
            "abolished",
            "deleted",
            "expired",
            "in_force",
            "inactive",
            "non_precedential",
            "not_funded",
            "not_yet_effective",
            "omitted",
            "proposed",
            "recodified",
            "recompiled",
            "rejected",
            "relocated",
            "removed",
            "renumbered",
            "repealed",
            "rescinded",
            "reserved",
            "revoked",
            "superseded",
            "terminated",
            "transferred",
            "unconstitutional",
            "vacant",
            "vacated",
            "vetoed",
            "withdrawn",
          ],
          description: "actStatus parameter.",
        },
        {
          type: "null",
          description: "actStatus parameter.",
        },
      ],
      description:
        "List only sections carrying this status, e.g. `repealed`. The inverse of `excludeRepealed`, and useful for auditing what a container holds that is no longer operative.",
    },
    cursor: {
      anyOf: [
        {
          type: "string",
          description: "cursor parameter.",
        },
        {
          type: "null",
          description: "cursor parameter.",
        },
      ],
      description:
        "Resume token from a previous response's `nextCursor`. Only meaningful at the level that lists sections. Omit it to start at the beginning of the container.",
    },
  },
  { required: ["corpusType"] },
);
export const list_divisionsOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/divisions`.",
  {
    corpusType: {
      type: "string",
      description: "The corpus being walked, echoed back from the request.",
    },
    state: {
      anyOf: [
        {
          type: "string",
          description: "state returned by Vaquill.",
        },
        {
          type: "null",
          description: "state returned by Vaquill.",
        },
      ],
      description: "The jurisdiction, for state-scoped corpora.",
    },
    level: {
      type: "string",
      description: "Kind of children returned: `titles`, `chapters`, `parts`, `codes`, `articles`, or `sections`.",
    },
    parentLabel: {
      anyOf: [
        {
          type: "string",
          description: "parentLabel returned by Vaquill.",
        },
        {
          type: "null",
          description: "parentLabel returned by Vaquill.",
        },
      ],
      description: "Human label for the container these divisions sit under.",
    },
    divisions: {
      items: {
        type: "object",
        description:
          "One child division in a `GET /us/statutes/divisions` listing.\n\nInterior nodes (titles, chapters, parts, codes, articles) carry a\n`sectionCount` and `isLeaf: false`; drill into one by passing its\n`identifier` back as the filter its `kind` names. Leaf nodes are sections and carry an `actId` you can pass to\n`/us/statutes/section/{actId}`.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "The child divisions, in statutory (natural) order.",
    },
    count: {
      type: "integer",
      description: "Number of divisions returned.",
    },
    nextCursor: {
      anyOf: [
        {
          type: "string",
          description: "nextCursor returned by Vaquill.",
        },
        {
          type: "null",
          description: "nextCursor returned by Vaquill.",
        },
      ],
      description:
        "Opaque token to resume this listing. Present only when `truncated` is true. Pass it back as `cursor` to get the next batch of sections in the same container, and keep going until it comes back null. Treat it as opaque: it encodes a storage position, and building one by hand will not work.\n\nOne ordering caveat. `divisions` is sorted into statutory order WITHIN each response, and pages are walked in storage order, so concatenating pages does not give you one globally sorted list. The union of every page is the complete container; sort it yourself once you hold it all.",
    },
    truncated: {
      type: "boolean",
      description:
        "True when this container held more sections than one call can walk, so `divisions` is a PREFIX of its contents rather than all of them. Check it before treating a listing as complete: the level that returns sections is bounded, and a container past that bound previously returned a short list that looked whole. When it is true, narrow the scope (drill into a chapter or part rather than a whole code), or page through it with `nextCursor`.",
    },
    note: {
      anyOf: [
        {
          type: "string",
          description: "note returned by Vaquill.",
        },
        {
          type: "null",
          description: "note returned by Vaquill.",
        },
      ],
      description:
        "Why the result is empty, when it is. Absent on a normal result. An empty `divisions` with a note is an answer; without one it would be ambiguous between a bad identifier and a level this corpus does not store.",
    },
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema,
  },
  {
    required: ["corpusType", "level"],
    additionalProperties: true,
  },
);
export const get_section_changesInput: JsonSchema = s.object(
  "Parameters for get_section_changes.",
  {
    act_id: actidSchema,
    limit: {
      type: "integer",
      maximum: 200,
      minimum: 1,
      description: "Max changes to return on this page.",
    },
    sinceId: {
      anyOf: [
        {
          type: "integer",
          minimum: 0,
          description: "sinceId parameter.",
        },
        {
          type: "null",
          description: "sinceId parameter.",
        },
      ],
      description:
        "Return only changes with an `id` greater than this: the cursor for polling forward into new changes. Ids are a monotonic sequence, so this is exact, immune to clock skew, and cannot drop two changes that share a timestamp. Carry `cursor` forward.",
    },
    beforeId: {
      anyOf: [
        {
          type: "integer",
          minimum: 0,
          description: "beforeId parameter.",
        },
        {
          type: "null",
          description: "beforeId parameter.",
        },
      ],
      description:
        "Return only changes with an `id` less than this: the cursor for walking BACK through history, which is what a newest-first reader needs. Pass the smallest `id` on your last page.",
    },
    changeKind: {
      anyOf: [
        {
          type: "array",
          items: {
            enum: ["added", "amended", "removed"],
            type: "string",
            description: "changeKind parameter.",
          },
          description: "changeKind parameter.",
        },
        {
          type: "null",
          description: "changeKind parameter.",
        },
      ],
      description:
        "Filter to these kinds. Repeat the parameter to pass several (`?changeKind=amended&changeKind=removed`). Omit for all three.",
    },
    order: {
      enum: ["asc", "desc"],
      type: "string",
      description:
        "`desc` (default) is newest first, the natural reading order for a history. Use `asc` to replay a section's life forward, or when catching up from a cursor.",
    },
  },
  { required: ["act_id"] },
);
export const get_section_changesOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/section/{act_id}/changes`.",
  {
    actId: {
      type: "string",
      description:
        "The act_id of the section served. Equal to your request unless `resolvedFrom` is set, in which case it is the id your citation or cleaned-up input resolved to.",
    },
    section: {
      anyOf: [
        {
          type: "object",
          description: "A single statute section from search results.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "section returned by Vaquill.",
        },
      ],
      description:
        "The section as it stands today. NULL is meaningful and not an error: it means the section is no longer in the corpus, which is exactly the case when the newest change is a `removed`. The history below is still the answer.",
    },
    changes: {
      items: {
        type: "object",
        description:
          "One time this section was added, amended, or removed by its publisher.\n\nAn OBSERVED change, not a publisher-declared one. It exists because a\nrefresh of the source corpus found this section's text different from the\ncopy we already held, so it carries the date WE detected it, which is at or\nafter the date the change took effect. For the publisher's own effective\nand amendment dates, read `amendmentHistory` on the section itself.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "Observed changes, newest first by default. Empty is a real answer, and it means NO CAPTURED CHANGE, not that the section has never been amended. See `coverage`.",
    },
    total: {
      type: "integer",
      description: "Size of `changes` on this page, not a corpus-wide count: it is capped by `limit`.",
    },
    hasMore: {
      type: "boolean",
      description:
        "True when the page filled to `limit`, so more may sit behind it. Page with `beforeId` (walking back) or `sinceId` (walking forward) rather than by raising `limit`.",
    },
    cursor: {
      anyOf: [
        {
          type: "integer",
          description: "cursor returned by Vaquill.",
        },
        {
          type: "null",
          description: "cursor returned by Vaquill.",
        },
      ],
      description:
        "Highest `id` on this page, or null when the page is empty. Carry it into `sinceId` to poll for what is new; keep the one you hold when a page comes back empty.",
    },
    observedFrom: {
      anyOf: [
        {
          type: "string",
          description: "observedFrom returned by Vaquill.",
        },
        {
          type: "null",
          description: "observedFrom returned by Vaquill.",
        },
      ],
      description:
        "The earliest change we ever captured for this section: the OBSERVATION HORIZON this history sits on. Read it before treating an empty or short list as the section's full history.\n\n**Null means we have never captured a change for this section**, so an empty `changes` list is not evidence that it is stable. A non-null value with an empty list means your filters or cursor excluded everything we hold, which is a different answer.\n\n`coverage` states the same caveat in prose. This is the fact behind it, and it is the same field, meaning the same thing, as `asOf.observedFrom` on `GET /section/{actId}/body`.",
    },
    coverage: {
      type: "string",
      description:
        "What this history can and cannot tell you, in one sentence. Change capture began well after the corpus itself did and is swept on a retention window, so this endpoint reports the changes we OBSERVED in that window, never the section's full legislative history. Read it before treating an empty list as 'unchanged'.",
    },
    resolvedFrom: resolvedFromSchema,
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema2,
  },
  {
    required: ["actId", "coverage"],
    additionalProperties: true,
  },
);
export const get_section_enactmentsInput: JsonSchema = s.object(
  "Parameters for get_section_enactments.",
  { act_id: actidSchema },
  { required: ["act_id"] },
);
export const get_section_enactmentsOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/section/{act_id}/enactments`.",
  {
    actId: {
      type: "string",
      description: "The section's act_id as served, after any citation or copy damage was resolved.",
    },
    resolvedFrom: {
      anyOf: [
        {
          type: "object",
          description:
            "How the identifier you sent was matched, when it was not an exact act_id.\n\nPresent only when the input did NOT match as sent. Absent (null) means the\nsection is exactly the act_id in your request.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "resolvedFrom returned by Vaquill.",
        },
      ],
      description:
        "Present only when your input was a citation or an id carrying copy damage: what it was matched as. Null when you sent an exact act_id.",
    },
    jurisdiction: {
      anyOf: [
        {
          type: "string",
          description: "jurisdiction returned by Vaquill.",
        },
        {
          type: "null",
          description: "jurisdiction returned by Vaquill.",
        },
      ],
      description: "Lowercase two-letter code of the section's jurisdiction. Null for a federal section.",
    },
    supported: {
      type: "boolean",
      description:
        "True when this section's jurisdiction is one whose publisher table is mapped to the statutes section numbers and this section is in the form that mapping was proven on: then `enactments` is an answer, even when it is empty, and the call is charged. False when it is not (see `reason`): `enactments` is empty, says nothing about the section, and the call is NOT charged.",
    },
    reason: {
      anyOf: [
        {
          type: "string",
          enum: ["unsupported_jurisdiction", "not_a_state_code_section", "section_not_in_proven_form"],
          description: "reason returned by Vaquill.",
        },
        {
          type: "null",
          description: "reason returned by Vaquill.",
        },
      ],
      description:
        "Why `supported` is false. `unsupported_jurisdiction`: we do not read this jurisdiction's table (none is printed, or its form is not verified against our section numbers), see `coverage.note`. `not_a_state_code_section`: the section is not a state statute (a federal, regulation or constitution section). `section_not_in_proven_form`: the jurisdiction is read, but this section's stored number is not in a form the mapping was proven on, so it is not guessed at. Null when `supported` is true.",
    },
    enactments: {
      items: {
        type: "object",
        description: "One printed entry of a publisher's table: this act, against this section.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "The entries of the publisher's tables whose printed section is this section, newest act first (by approval date, undated last), one per printed entry: an act that lists the section twice appears twice. NEVER a complete history: only acts we hold, in sessions we hold, whose table lists the section in the printed form this jurisdiction's mapping reads. Empty with `supported: true` is a real answer: no held table lists it.",
    },
    count: {
      type: "integer",
      description: "Entries returned in `enactments`.",
    },
    truncated: {
      type: "boolean",
      description:
        "True when more entries matched than are returned (the newest are kept). A section amended by that many acts is not a case we have met.",
    },
    coverage: {
      type: "object",
      description: "What this answer is read from, and what it is not. Show it with the list.",
      additionalProperties: true,
      properties: {},
    },
    creditsConsumed: {
      type: "integer",
      description:
        "Credits actually charged for this call, never the list price. 0 when `supported` is false (refunded) and on a failure. A citation sent in place of the act_id adds the `/us/statutes/resolve` price, charged whether or not it resolves.",
    },
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds, excluding network transit. Not billed on.",
    },
  },
  {
    required: ["actId", "supported", "coverage"],
    additionalProperties: true,
  },
);
export const extract_citationsInput: JsonSchema = s.object(
  "Parameters for extract_citations.",
  {
    text: {
      type: "string",
      maxLength: 200000,
      minLength: 1,
      description:
        "The text to read, 1 to 200,000 characters (a brief is about 30,000). Longer is a 422, never a silent truncation: a partial list reported as the whole is a wrong answer. Plain text; a body that is mostly binary is a 422.",
    },
    state: {
      anyOf: [
        {
          type: "string",
          pattern: statePattern,
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        "The jurisdiction of the DOCUMENT as a two-letter state code (the forum of a filing, the governing state of a matter). It labels and scopes a citation that names no jurisdiction of its own (`Civil Rule 56.1`, `Gov. Code § 12940`); a citation that names a jurisdiction is always checked against that one, whatever this says.",
    },
    resolve: {
      type: "boolean",
      description:
        "Resolve each distinct citation to its section (priced per distinct citation, see the endpoint's Cost). `false` returns the extraction alone, which is free.",
    },
    includeUnresolved: {
      type: "boolean",
      description:
        "`false` drops rows that did not resolve from `citations`. The `counts` and the charge are unchanged: an unresolved citation is a verdict that was paid for.",
    },
  },
  { required: ["text"] },
);
export const extract_citationsOutput: JsonSchema = s.object(
  "Response returned by Vaquill.",
  {
    citations: {
      items: {
        type: "object",
        description: "One distinct citation found in the text, and what the resolver said about it.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "The distinct citations, in order of first appearance.",
    },
    counts: {
      type: "object",
      additionalProperties: true,
      properties: {},
      description: "counts returned by Vaquill.",
    },
    truncated: {
      type: "boolean",
      description:
        "True when more than 200 distinct citations were found and `citations` holds the first of them. `counts.found` still reports the number found, and only the ones listed were resolved and charged.",
    },
    textChars: {
      type: "integer",
      description: "Characters of `text` read.",
    },
    extractorVersion: {
      type: "string",
      description:
        "The extractor's version. The same text can yield different citations when it changes, so cache extractions by text AND this value.",
    },
    creditsConsumed: {
      type: "number",
      description: "Credits actually charged. 0 when `resolve` is false.",
    },
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds. Not billed on.",
    },
  },
  {
    required: ["counts", "textChars", "extractorVersion"],
    additionalProperties: true,
  },
);
export const get_citing_sectionsInput: JsonSchema = s.object(
  "Parameters for get_citing_sections.",
  {
    act_id: actidSchema,
    limit: {
      type: "integer",
      maximum: 100,
      minimum: 1,
      description: "Maximum citing sections to return.",
    },
  },
  { required: ["act_id"] },
);
export const get_citing_sectionsOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/section/{act_id}/cited-by`.",
  {
    section: {
      type: "object",
      description: "The section you asked about.",
      additionalProperties: true,
      properties: {},
    },
    citers: {
      items: {
        type: "object",
        description: "A single statute section from search results.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "Sections whose text cross-references this one, in statutory order. Empty is a real answer: plenty of sections are cited by nothing.",
    },
    total: {
      type: "integer",
      description:
        "How many citing sections were returned. This is the size of `citers`, not a corpus-wide count: it is capped by `limit`.",
    },
    truncated: {
      type: "boolean",
      description: "True when more citing sections exist than `limit` allowed. Raise `limit` to see the rest.",
    },
    note: {
      anyOf: [
        {
          type: "string",
          description: "note returned by Vaquill.",
        },
        {
          type: "null",
          description: "note returned by Vaquill.",
        },
      ],
      description:
        "Set only when the answer is not a real zero. Reverse citation is built on the cross-reference index, which exists for USC and CFR; for any other corpus this explains that the section is out of scope and the call is refunded. When it is null, an empty `citers` means nothing cites this section.",
    },
    resolvedFrom: resolvedFromSchema,
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema2,
  },
  {
    required: ["section"],
    additionalProperties: true,
  },
);
export const get_definitionsInput: JsonSchema = s.object(
  "Parameters for get_definitions.",
  { act_id: actidSchema },
  { required: ["act_id"] },
);
export const get_definitionsOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/section/{act_id}/definitions`.",
  {
    section: {
      type: "object",
      description: "The section you asked about.",
      additionalProperties: true,
      properties: {},
    },
    definitionsSection: {
      anyOf: [
        {
          type: "object",
          description: "A single statute section from search results.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "definitionsSection returned by Vaquill.",
        },
      ],
      description:
        "The sibling section the terms were parsed from. Null when the chapter has no definitions section, in which case `terms` is empty and the call is refunded.",
    },
    terms: {
      items: {
        type: "object",
        description: "One defined term drawn from a chapter's definitions section.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "Defined terms governing this section, in the order the source lists them.",
    },
    total: {
      type: "integer",
      description: "How many terms were parsed.",
    },
    note: {
      anyOf: [
        {
          type: "string",
          description: "note returned by Vaquill.",
        },
        {
          type: "null",
          description: "note returned by Vaquill.",
        },
      ],
      description:
        "Set only when no terms could be returned, explaining which step came up empty: the chapter has no definitions section, or its text is not ingested yet. The call is refunded in both cases.",
    },
    resolvedFrom: resolvedFromSchema,
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema2,
  },
  {
    required: ["section"],
    additionalProperties: true,
  },
);
export const compare_statesInput: JsonSchema = s.object(
  "Parameters for compare_states.",
  {
    act_id: actidSchema,
    limit: {
      type: "integer",
      maximum: 25,
      minimum: 1,
      description: "Maximum states to return, one provision each.",
    },
  },
  { required: ["act_id"] },
);
export const compare_statesOutput: JsonSchema = s.object(
  "Response for `GET /us/statutes/section/{act_id}/cross-state`.",
  {
    section: {
      type: "object",
      description: "The section you asked about.",
      additionalProperties: true,
      properties: {},
    },
    neighbors: {
      items: {
        type: "object",
        description: "One out-of-state provision that addresses the same subject.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "Comparable provisions in other states, most similar first. At most one entry per state, so this reads as a jurisdiction comparison rather than a relevance list.",
    },
    statesCovered: {
      type: "integer",
      description:
        "How many distinct states are represented. Fewer than you asked for means no provision in the remaining states cleared the similarity floor, not that those states are missing from the corpus.",
    },
    note: {
      anyOf: [
        {
          type: "string",
          description: "note returned by Vaquill.",
        },
        {
          type: "null",
          description: "note returned by Vaquill.",
        },
      ],
      description:
        "Set only when the answer is not a real zero. Cross-state comparison is defined for state statute sections; for USC, CFR and other corpora this explains that the section has no state analogues and the call is refunded.",
    },
    rankingDegraded: {
      type: "boolean",
      description:
        "True when the relevance model was unavailable, so the neighbors are in retrieval order and `similarity` is a retrieval score on a much smaller scale rather than the usual 0-1. The provisions are still the retrieved analogues; retry shortly for the fully ranked answer.",
    },
    resolvedFrom: resolvedFromSchema,
    processingTimeMs: processingTimeMsSchema,
    creditsConsumed: creditsConsumedSchema2,
  },
  {
    required: ["section"],
    additionalProperties: true,
  },
);
export const get_pricingInput: JsonSchema = s.object(
  "Parameters for get_pricing.",
  {
    region: {
      anyOf: [
        {
          enum: ["US", "IN"],
          type: "string",
          description: "region parameter.",
        },
        {
          type: "null",
          description: "region parameter.",
        },
      ],
      description:
        "Jurisdiction to price. `US` for the United States primary-law surface, `IN` for the India legislation surface. Defaults to the jurisdiction of the document you are reading, so a caller who does not set it gets the prices for the endpoints that document describes and nothing else.",
    },
  },
  { required: [] },
);
export const get_pricingOutput: JsonSchema = s.object(
  "Full pricing information for the API credit system. USD only.",
  {
    dollarPerCredit: {
      type: "number",
      description: "USD cost per 1 credit (0.01 means 1 credit = $0.01).",
    },
    minCredits: {
      type: "number",
      description: "Minimum credits per purchase.",
    },
    maxCredits: {
      type: "number",
      description: "Maximum credits per purchase.",
    },
    costs: {
      items: {
        type: "object",
        description: "Single endpoint credit cost for the pricing matrix.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "Per-endpoint credit costs (USD).",
    },
  },
  {
    required: ["dollarPerCredit", "minCredits", "maxCredits", "costs"],
    additionalProperties: true,
  },
);
export const list_boardsInput: JsonSchema = s.object(
  "Parameters for list_boards.",
  {
    corpusType: {
      anyOf: [
        {
          type: "string",
          description: "corpusType parameter.",
        },
        {
          type: "null",
          description: "corpusType parameter.",
        },
      ],
      description:
        "Only boards for this corpus type, matched case-insensitively so the uppercase spelling used by the statutes endpoints (`CFR`) finds the board (`cfr`). An unknown value is an empty page with `total: 0`, not an error.",
    },
    state: {
      anyOf: [
        {
          type: "string",
          pattern: jurisdictionPattern,
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        "Only boards for this jurisdiction. Pass `federal` for the boards that have no state (USC, eCFR, the Federal Register). Omit for no jurisdiction filter -- which is NOT the same as `federal`.",
    },
    limit: {
      type: "integer",
      maximum: 500,
      minimum: 1,
      description:
        "Max boards to return. The default covers the whole registry today; check `total` rather than assuming it always will.",
    },
    offset: {
      type: "integer",
      minimum: 0,
      description: "Number of boards to skip, for paging.",
    },
  },
  { required: [] },
);
export const list_boardsOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const list_watchesInput: JsonSchema = s.object(
  "Parameters for list_watches.",
  {
    limit: {
      type: "integer",
      maximum: 200,
      minimum: 1,
      description: "Max watches to return.",
    },
    offset: {
      type: "integer",
      minimum: 0,
      description: "Number of watches to skip, for paging.",
    },
  },
  { required: [] },
);
export const list_watchesOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const create_watchInput: JsonSchema = s.object(
  "Parameters for create_watch.",
  {
    corpusType: {
      type: "string",
      description:
        "Board's corpus_type (e.g. `state`, `state_regulation`, `federal_register`, `agency_guidance`). Matched case-insensitively, so the uppercase spelling the statutes endpoints use for the same body of law (`USC`, `CFR`) works here too. Call GET /boards for the authoritative, current list -- corpus_type is a growing set as new corpora are added, not a fixed enum, and not every corpus we serve is a watchable board.",
    },
    state: {
      anyOf: [
        {
          type: "string",
          pattern: jurisdictionPattern,
          description: "state parameter.",
        },
        {
          type: "null",
          description: "state parameter.",
        },
      ],
      description:
        "Board's state (2-letter, case-insensitive). For a federal board (USC, eCFR, the Federal Register) pass `federal` or omit this entirely; the two are equivalent. Must otherwise match the `state` GET /boards returned for this corpusType -- `GET /boards?corpusType=<type>` lists exactly those.",
    },
    channel: {
      type: "string",
      enum: ["webhook", "email", "both"],
      description: "channel parameter.",
    },
    webhookUrl: {
      anyOf: [
        {
          type: "string",
          description: "webhookUrl parameter.",
        },
        {
          type: "null",
          description: "webhookUrl parameter.",
        },
      ],
      description: "Required when channel is webhook or both.",
    },
    webhookSecret: {
      anyOf: [
        {
          type: "string",
          description: "webhookSecret parameter.",
        },
        {
          type: "null",
          description: "webhookSecret parameter.",
        },
      ],
      description:
        "Optional signing secret, stored encrypted and never returned. When set, every delivery carries an `X-Vaquill-Signature: sha256=<hex>` header: HMAC-SHA256 of the raw request body bytes, keyed with this secret. To verify, compute the same HMAC over the raw body you received (before parsing JSON) and compare it, constant-time, to the hex digest after `sha256=`.",
    },
    emailAddress: {
      anyOf: [
        {
          type: "string",
          description: "emailAddress parameter.",
        },
        {
          type: "null",
          description: "emailAddress parameter.",
        },
      ],
      description: "Required when channel is email or both.",
    },
    scope: {
      anyOf: [
        {
          additionalProperties: {
            type: "string",
            description: "scope parameter.",
          },
          type: "object",
          description: "scope parameter.",
        },
        {
          type: "null",
          description: "scope parameter.",
        },
      ],
      description:
        'Optional narrowing so this alert covers one citation instead of an entire source. Four mutually exclusive forms.\n\n**Hierarchy prefix** -- keys `title`, `chapter`, `part`, `section`, e.g. `{"title": "21", "part": "314"}` for 21 CFR part 314. Every level you set must match, so each one narrows further. `title` is required whenever any narrower level is set, and `section` also needs `chapter` or `part`: a bare part number matches across unrelated titles. Only sources whose documents carry a title/chapter/part hierarchy accept this form; the rest return 400.\n\n**Exact section** -- `{"actId": "CFR_T21_P314_S314_50"}`, using the `actId` returned by search results and change events. Case-sensitive, and validated at create time against the corpus: an act_id we do not hold, or one belonging to a different source, is a 400 rather than a watch that could never fire. This form works on EVERY source, including flat ones with no hierarchy, so it is the only way to follow a single Federal Register document.\n\n**Named source** -- `{"source": "fdic_fil"}`, for the corpora that fold several independent bodies of law behind one `corpusType`. The `agency_guidance` board alone carries 47 named sources across 24 agencies, so an unscoped watch on it delivers FDIC letters, IRS notices, OFAC FAQs and DOE appliance standards together. Accepted on `agency_adjudication`, `agency_guidance`, `agency_manuals`, `cfr`, `federal_rules`; anything else returns 400. The pickable values for a given board are on that board\'s `sources` array in `GET /boards` -- deliberately narrower than the `source` filter published on `POST /us/statutes/search`, because `agency_guidance` and `agency_manuals` are two boards reading one `corpusType` and each emits only its own half.\n\n**Publishing agency** -- `{"agency": "irs"}`, covering every source that agency issues on the board. `source` is the unit we ingest and it is finer than the unit most callers think in: the IRS alone publishes 5 named series, so following it by source means one watch per series and a gap if you miss one. An agency scope is expanded WHEN AN EVENT IS MATCHED rather than when the watch is created, so a source registered after your watch is covered by it automatically, with no action from you. Accepted on `agency_adjudication`, `agency_guidance`, `agency_manuals`; the pickable values are on that board\'s `agencies` array in `GET /boards`.\n\nOmit entirely to watch the whole source, which is the default and the pre-existing behavior.',
    },
    webhookAuth: {
      anyOf: [
        {
          properties: {
            scheme: {
              type: "string",
              enum: ["none", "bearer", "basic", "header"],
              description:
                "`bearer` sends `Authorization: Bearer <secret>`. `basic` sends `Authorization: Basic <secret>` with the secret already base64-encoded by you. `header` sends `<headerName>: <secret>`, for gateways that read something like `X-Api-Key`. `none` removes any credential currently stored.",
            },
            secret: {
              anyOf: [
                {
                  type: "string",
                  description: "secret parameter.",
                },
                {
                  type: "null",
                  description: "secret parameter.",
                },
              ],
              description:
                "The credential value. Stored encrypted and never returned. Required when setting a scheme for the first time or changing scheme; on PATCH you may omit it to keep the stored one while changing only `headerName`.",
            },
            headerName: {
              anyOf: [
                {
                  type: "string",
                  description: "headerName parameter.",
                },
                {
                  type: "null",
                  description: "headerName parameter.",
                },
              ],
              description:
                "Header to send the credential on. Required for `header`, and rejected for every other scheme. Cannot be `Authorization` (use `bearer`/`basic`), a transport header, or one of ours.",
            },
          },
          type: "object",
          description:
            "How a delivery should authenticate itself to your endpoint.\n\nSEPARATE FROM `webhookSecret`, and the distinction is the point.\n`webhookSecret` signs the body so you can prove it is intact and ours.\nThis sends a credential so your gateway can reject anything else before\nit reaches your handler. Most integrations want the second, many want\nboth, and the two are set independently.",
          additionalProperties: false,
        },
        {
          type: "null",
          description: "webhookAuth parameter.",
        },
      ],
      description:
        "Optional outbound credential sent on every delivery, so your gateway can authenticate us with the header it already reads. Independent of `webhookSecret`: set neither, either, or both. Only valid on a webhook or both channel watch.",
    },
  },
  { required: ["corpusType"] },
);
export const create_watchOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const test_watchInput: JsonSchema = s.object(
  "Parameters for test_watch.",
  {
    watch_id: {
      type: "string",
      description: "watch_id parameter.",
    },
  },
  { required: ["watch_id"] },
);
export const test_watchOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const update_watchInput: JsonSchema = s.object(
  "Parameters for update_watch.",
  {
    isActive: {
      anyOf: [
        {
          type: "boolean",
          description: "isActive parameter.",
        },
        {
          type: "null",
          description: "isActive parameter.",
        },
      ],
      description: "Pause (false) or resume (true) the watch.",
    },
    webhookUrl: {
      anyOf: [
        {
          type: "string",
          description: "webhookUrl parameter.",
        },
        {
          type: "null",
          description: "webhookUrl parameter.",
        },
      ],
      description:
        "New webhook URL. Only valid on a webhook/both channel watch. Re-validated against the SSRF blocklist. Cannot be cleared.",
    },
    webhookSecret: {
      anyOf: [
        {
          type: "string",
          description: "webhookSecret parameter.",
        },
        {
          type: "null",
          description: "webhookSecret parameter.",
        },
      ],
      description:
        "New signing secret, or empty string to stop signing deliveries. Only valid on a webhook/both channel watch.",
    },
    scope: {
      anyOf: [
        {
          additionalProperties: {
            type: "string",
            description: "scope parameter.",
          },
          type: "object",
          description: "scope parameter.",
        },
        {
          type: "null",
          description: "scope parameter.",
        },
      ],
      description:
        'Optional narrowing so this alert covers one citation instead of an entire source. Four mutually exclusive forms.\n\n**Hierarchy prefix** -- keys `title`, `chapter`, `part`, `section`, e.g. `{"title": "21", "part": "314"}` for 21 CFR part 314. Every level you set must match, so each one narrows further. `title` is required whenever any narrower level is set, and `section` also needs `chapter` or `part`: a bare part number matches across unrelated titles. Only sources whose documents carry a title/chapter/part hierarchy accept this form; the rest return 400.\n\n**Exact section** -- `{"actId": "CFR_T21_P314_S314_50"}`, using the `actId` returned by search results and change events. Case-sensitive, and validated at create time against the corpus: an act_id we do not hold, or one belonging to a different source, is a 400 rather than a watch that could never fire. This form works on EVERY source, including flat ones with no hierarchy, so it is the only way to follow a single Federal Register document.\n\n**Named source** -- `{"source": "fdic_fil"}`, for the corpora that fold several independent bodies of law behind one `corpusType`. The `agency_guidance` board alone carries 47 named sources across 24 agencies, so an unscoped watch on it delivers FDIC letters, IRS notices, OFAC FAQs and DOE appliance standards together. Accepted on `agency_adjudication`, `agency_guidance`, `agency_manuals`, `cfr`, `federal_rules`; anything else returns 400. The pickable values for a given board are on that board\'s `sources` array in `GET /boards` -- deliberately narrower than the `source` filter published on `POST /us/statutes/search`, because `agency_guidance` and `agency_manuals` are two boards reading one `corpusType` and each emits only its own half.\n\n**Publishing agency** -- `{"agency": "irs"}`, covering every source that agency issues on the board. `source` is the unit we ingest and it is finer than the unit most callers think in: the IRS alone publishes 5 named series, so following it by source means one watch per series and a gap if you miss one. An agency scope is expanded WHEN AN EVENT IS MATCHED rather than when the watch is created, so a source registered after your watch is covered by it automatically, with no action from you. Accepted on `agency_adjudication`, `agency_guidance`, `agency_manuals`; the pickable values are on that board\'s `agencies` array in `GET /boards`.\n\nOmit entirely to watch the whole source, which is the default and the pre-existing behavior.',
    },
    emailAddress: {
      anyOf: [
        {
          type: "string",
          description: "emailAddress parameter.",
        },
        {
          type: "null",
          description: "emailAddress parameter.",
        },
      ],
      description: "New email address. Only valid on an email/both channel watch. Cannot be cleared.",
    },
    webhookAuth: {
      anyOf: [
        {
          properties: {
            scheme: {
              type: "string",
              enum: ["none", "bearer", "basic", "header"],
              description:
                "`bearer` sends `Authorization: Bearer <secret>`. `basic` sends `Authorization: Basic <secret>` with the secret already base64-encoded by you. `header` sends `<headerName>: <secret>`, for gateways that read something like `X-Api-Key`. `none` removes any credential currently stored.",
            },
            secret: {
              anyOf: [
                {
                  type: "string",
                  description: "secret parameter.",
                },
                {
                  type: "null",
                  description: "secret parameter.",
                },
              ],
              description:
                "The credential value. Stored encrypted and never returned. Required when setting a scheme for the first time or changing scheme; on PATCH you may omit it to keep the stored one while changing only `headerName`.",
            },
            headerName: {
              anyOf: [
                {
                  type: "string",
                  description: "headerName parameter.",
                },
                {
                  type: "null",
                  description: "headerName parameter.",
                },
              ],
              description:
                "Header to send the credential on. Required for `header`, and rejected for every other scheme. Cannot be `Authorization` (use `bearer`/`basic`), a transport header, or one of ours.",
            },
          },
          type: "object",
          description:
            "How a delivery should authenticate itself to your endpoint.\n\nSEPARATE FROM `webhookSecret`, and the distinction is the point.\n`webhookSecret` signs the body so you can prove it is intact and ours.\nThis sends a credential so your gateway can reject anything else before\nit reaches your handler. Most integrations want the second, many want\nboth, and the two are set independently.",
          additionalProperties: false,
        },
        {
          type: "null",
          description: "webhookAuth parameter.",
        },
      ],
      description:
        'Replace the outbound credential config. Sent as a whole object, not field by field: a scheme without a credential is not a partial edit, it is a broken config. Send `{"scheme": "none"}` to remove auth entirely. Keeping the same scheme and omitting `secret` retains the stored credential, so you can rename a header without re-entering the token.',
    },
    watch_id: {
      type: "string",
      description: "watch_id parameter.",
    },
  },
  { required: ["watch_id"] },
);
export const update_watchOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const delete_watchInput: JsonSchema = s.object(
  "Parameters for delete_watch.",
  {
    watch_id: {
      type: "string",
      description: "watch_id parameter.",
    },
  },
  { required: ["watch_id"] },
);
export const delete_watchOutput: JsonSchema = s.object(
  "Watch deletion result.",
  {
    deleted: {
      type: "boolean",
      description: "Whether the watch and its delivery history were deleted.",
    },
  },
  {
    required: ["deleted"],
    additionalProperties: true,
  },
);
export const get_watch_changesInput: JsonSchema = s.object(
  "Parameters for get_watch_changes.",
  {
    watch_id: {
      type: "string",
      description: "watch_id parameter.",
    },
    limit: {
      type: "integer",
      maximum: 200,
      minimum: 1,
      description: "Max changes to return.",
    },
    sinceId: {
      anyOf: [
        {
          type: "integer",
          minimum: 0,
          description: "sinceId parameter.",
        },
        {
          type: "null",
          description: "sinceId parameter.",
        },
      ],
      description:
        "Return only changes with an `id` greater than this. The cursor to build on: ids are a monotonic sequence, so this is exact, immune to clock skew, and cannot drop two changes that share a timestamp. Carry `meta.cursor` forward from your last page.",
    },
    beforeId: {
      anyOf: [
        {
          type: "integer",
          minimum: 0,
          description: "beforeId parameter.",
        },
        {
          type: "null",
          description: "beforeId parameter.",
        },
      ],
      description:
        "Return only changes with an `id` less than this: the cursor for walking BACK through history, where `sinceId` walks forward into new changes. A newest-first reader needs this one, since paging down a descending list means asking for what sits below the lowest id already held. Pass the smallest `id` on your last page.",
    },
    since: {
      anyOf: [
        {
          type: "string",
          description: "since parameter.",
        },
        {
          type: "null",
          description: "since parameter.",
        },
      ],
      description:
        "Return only changes detected strictly after this ISO-8601 timestamp. Coarser than `sinceId` (a single refresh writes many rows at the same instant, and this drops all of them), but useful when all you kept was the `detectedAt` off a `changes[]` item in a webhook body. Prefer that item's `id` as `sinceId` where you still have it. Both may be combined.",
    },
    changeKind: {
      anyOf: [
        {
          type: "array",
          items: {
            enum: ["added", "amended", "removed"],
            type: "string",
            description: "changeKind parameter.",
          },
          description: "changeKind parameter.",
        },
        {
          type: "null",
          description: "changeKind parameter.",
        },
      ],
      description:
        "Filter to these kinds. Repeat the parameter to pass several (`?changeKind=added&changeKind=amended`). Omit for all three.",
    },
    order: {
      enum: ["asc", "desc"],
      type: "string",
      description:
        "`desc` (default) is newest first, for showing a recent-activity list. Use `asc` when catching up from a cursor: walking forward means a page that hits `limit` leaves the gap at a known end.",
    },
  },
  { required: ["watch_id"] },
);
export const get_watch_changesOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_watch_diffInput: JsonSchema = s.object(
  "Parameters for get_watch_diff.",
  {
    watch_id: {
      type: "string",
      description: "watch_id parameter.",
    },
    change_id: {
      type: "integer",
      description: "change_id parameter.",
    },
  },
  { required: ["watch_id", "change_id"] },
);
export const get_watch_diffOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_watch_deliveriesInput: JsonSchema = s.object(
  "Parameters for get_watch_deliveries.",
  {
    watch_id: {
      type: "string",
      description: "watch_id parameter.",
    },
    limit: {
      type: "integer",
      maximum: 200,
      minimum: 1,
      description: "Max deliveries to return.",
    },
  },
  { required: ["watch_id"] },
);
export const get_watch_deliveriesOutput: JsonSchema = s.object(
  "Vaquill response.",
  {
    data: {
      type: "object",
      additionalProperties: true,
      description: "Business data returned by Vaquill.",
    },
    meta: {
      type: "object",
      additionalProperties: true,
      description: "Timing, credit usage and pagination metadata returned by Vaquill.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_balanceInput: JsonSchema = s.object("Parameters for get_balance.", {}, { required: [] });
export const get_balanceOutput: JsonSchema = s.object(
  "Spendable credit balance for the calling API key's account.",
  {
    creditsRemaining: {
      type: "number",
      description:
        "Credits you can actually spend right now. Deliberately the same field name that metered responses return, so one name means one thing across the API.\n\nDerived from your live credit buckets under the same expiry rule the billing path applies, so it never promises credits a call would refuse to spend.",
    },
    usdRemaining: {
      type: "number",
      description:
        "`creditsRemaining` in USD, at the published conversion rate (1 credit = $0.01). Provided so you do not have to hardcode the rate; `GET /api/v1/api-credits/pricing` is its source of truth.",
    },
    bySource: {
      items: {
        type: "object",
        description: "Live credits held under one funding source.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "`creditsRemaining` split by funding source, and it always sums to it. Worth reading because the sources do not behave alike: `subscription` credits are use-it-or-lose-it at the period end, while `payg` credits you bought are durable and burn last.",
    },
    nextExpiry: {
      anyOf: [
        {
          type: "object",
          description: "The soonest expiry, and what dies with it.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "nextExpiry returned by Vaquill.",
        },
      ],
      description:
        "The soonest expiry across your credits, or `null` if none of them expire. Poll this to avoid silently forfeiting an allowance.",
    },
    plan: {
      anyOf: [
        {
          type: "string",
          description: "plan returned by Vaquill.",
        },
        {
          type: "null",
          description: "plan returned by Vaquill.",
        },
      ],
      description:
        "Active API subscription tier, or `null` on pay-as-you-go. Also determines your rate-limit multiplier. Briefly cached, so a subscription change made seconds ago may not be reflected yet; `creditsRemaining` is always live.",
    },
    totalPurchased: {
      type: "number",
      description: "Lifetime credits added to this account.",
    },
    totalConsumed: {
      type: "number",
      description: "Lifetime credits spent by this account.",
    },
    rateLimit: {
      anyOf: [
        {
          type: "object",
          description:
            "Request-rate ceilings in force for the calling key.\n\nA SECOND, independent ceiling alongside credits, and the two are unrelated:\nyou can hold credits and still be throttled, or sit far under these limits\nand be refused for an empty balance.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "rateLimit returned by Vaquill.",
        },
      ],
      description:
        "How fast this key may call, as opposed to how much it may spend. The two ceilings are independent: holding credits does not exempt you from these, and staying under these does not pay for a call.\n\nThese are the ceilings themselves, with your plan already applied, so you can size a client BEFORE issuing a request. The `X-RateLimit-*` headers on every response report the same ceilings plus your live headroom, and the two agree.",
    },
    asOf: {
      type: "string",
      format: "date-time",
      description:
        "When this balance was computed. The value is live, not cached, so this is the instant the buckets were read.",
    },
  },
  {
    required: ["creditsRemaining", "usdRemaining", "totalPurchased", "totalConsumed", "asOf"],
    additionalProperties: true,
  },
);
export const get_session_law_changesInput: JsonSchema = s.object(
  "Parameters for get_session_law_changes.",
  {
    sinceId: {
      type: "integer",
      maximum: 9223372036854776000,
      minimum: 0,
      description:
        "Return only entries with an `id` greater than this: the cursor for walking the feed forward. Send 0 (the default) to start from the beginning, then the `cursor` of your last page. `id` is an integer that only grows, so this is exact and immune to clock skew. A negative or non-integer value is a 422 and is never charged; a value past the newest `id` is an empty page, which is charged.",
    },
    jurisdiction: {
      anyOf: [
        {
          type: "string",
          pattern: statePattern,
          description: "jurisdiction parameter.",
        },
        {
          type: "null",
          description: "jurisdiction parameter.",
        },
      ],
      description:
        "Limit the feed to one jurisdiction: a two-letter state code, `dc` or `pr`, case-insensitive. Omit for every jurisdiction. `federal` and any unknown code is a 422 and is never charged: federal session laws are not in this feed. The cursor is a position in the whole feed, so a filtered page may have gaps in `id`.",
    },
    limit: {
      type: "integer",
      maximum: 200,
      minimum: 1,
      description:
        "Most entries on this page: 1 to 200, default 50. The price is per page, however many entries it holds, so a larger page is cheaper per entry. Out of range is a 422 and is never charged.",
    },
  },
  { required: [] },
);
export const get_session_law_changesOutput: JsonSchema = s.object(
  "Response for `GET /us/session-laws/changes`.",
  {
    changes: {
      items: {
        type: "object",
        description: "One entry of the registry feed.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "The entries after `sinceId`, oldest first, at most `limit`. Empty when nothing changed since your cursor, which is an answer and is charged.",
    },
    count: {
      type: "integer",
      description: "Entries on this page.",
    },
    cursor: {
      anyOf: [
        {
          type: "integer",
          description: "cursor returned by Vaquill.",
        },
        {
          type: "null",
          description: "cursor returned by Vaquill.",
        },
      ],
      description:
        "The largest `id` on this page: send it as `sinceId` for the next page. Null when the page is empty, so keep the cursor you already hold.",
    },
    hasMore: {
      type: "boolean",
      description:
        "True when more entries follow this page: call again with `sinceId` set to `cursor` straight away. False means you have caught up as of this call.",
    },
    creditsConsumed: {
      type: "integer",
      description:
        "Credits actually charged for this call, never the list price. 0 when the call was refunded (a failure on our side).",
    },
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds, excluding network transit. Not billed on.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_session_lawsInput: JsonSchema = s.object(
  "Parameters for get_session_laws.",
  {
    ids: {
      items: {
        type: "string",
        description: "ids parameter.",
      },
      type: "array",
      maxItems: 200,
      minItems: 1,
      description:
        "State session law ids, or citations, to read: up to 50 DISTINCT entries per call. Each entry is read exactly as the `{sessionLawId}` path of `GET /us/session-laws/{sessionLawId}` reads one: an id as sent, an id carrying copy damage, or a citation (`Minn. Laws 2025, ch. 1`, `P.A. 104-0001`, `S.F.No. 1552`). Entries are trimmed, and blank ones are dropped. Duplicates collapse FIRST (the first spelling wins, order is kept) and the cap applies to what is left, so a list quoting one law sixty times is one entry; `deduped` says how many were collapsed. 200 is the ceiling on the raw list. An entry is at most 300 characters. Federal ids (`SAL_...`) and endpoint names are misses, never charged.",
    },
    jurisdiction: {
      anyOf: [
        {
          type: "string",
          pattern: statePattern,
          description: "jurisdiction parameter.",
        },
        {
          type: "null",
          description: "jurisdiction parameter.",
        },
      ],
      description:
        "Optional two-letter state code that scopes how a CITATION in `ids` is read, for the whole batch: it supplies the state a citation does not name (`Laws 2025, ch. 1` with `mn` is Minnesota's) and vetoes a state the citation does name or whose form belongs to another. Ignored for an id. The 50 states, `dc` and `pr`, case-insensitive; `federal` or an unknown code is a 422 and nothing is charged. Omit it for a batch whose citations each name their own state.",
    },
    includeBody: {
      type: "boolean",
      description:
        "Return the FIRST page of each served law's text inline, on `body`, beside the record. A page is about 30,000 characters and costs the ordinary body price (6 credits) per law whose page is served; a law whose text is withheld, not held or empty comes back with `body: null` and is not charged for it. Read `creditsConsumed` rather than computing the total: the worst case is 50 laws at 2 + 6 credits each. `bodyNextCursor` continues a longer act on `GET /us/session-laws/{sessionLawId}/body`.",
    },
  },
  { required: ["ids"] },
);
export const get_session_lawsOutput: JsonSchema = s.object(
  "Response for `POST /us/session-laws/batch`.",
  {
    laws: {
      items: {
        type: "object",
        description: "One served law: the same record `GET /us/session-laws/{sessionLawId}` returns.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "The served laws, one per distinct law, in the order the entries of `ids` first reached them. Entries that missed are NOT here, so a client mapping by position must use `input` on each law (or `notFound`), never the index.",
    },
    resolved: {
      items: {
        type: "object",
        description: "How a citation sent in place of a `sessionLawId` was matched.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "One entry per input that did NOT match an id exactly as sent: a citation resolved to its law, or an id cleaned of whitespace, quotes or a trailing period. Includes an input whose law an earlier entry already produced, so every input is mappable onto `laws`. Empty when every entry was an exact id.",
    },
    notFound: {
      items: {
        type: "object",
        description: "One entry of `ids` that did not yield a law, and why.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "Every entry that did not yield a law, in the order sent, each with its `status` and `reason`. A miss is not charged for the route's own price. An entry read as a CITATION also paid the resolve price, kept whenever we gave a verdict on it (`unparsed`, `ambiguous`, `needs_jurisdiction`, `federal`) and refunded on `session_not_fully_collected` and `error`. An id pays no resolve price.",
    },
    count: {
      type: "integer",
      description: "Number of laws returned in `laws`.",
    },
    deduped: {
      type: "integer",
      description:
        "How many entries of `ids` were collapsed because an earlier entry was identical after trimming. Zero when none were. Two DIFFERENT spellings of one law are not counted here: the law appears once in `laws` and both spellings are in `resolved`.",
    },
    creditsConsumed: {
      type: "integer",
      description:
        "Credits actually charged for this call, never the list price: 2 per law served, plus the 2-credit resolve price for each citation whose resolution is kept, plus the body price per `body` served. Misses and failures bill nothing for the route.",
    },
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds, excluding network transit. Not billed on.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const search_session_lawsInput: JsonSchema = s.object(
  "Parameters for search_session_laws.",
  {
    query: {
      type: "string",
      maxLength: 300,
      minLength: 2,
      description:
        'What to look for: a question in plain words (`can a sheriff pay with a debit card`), words from a title, a quoted phrase (`"credit card or debit card"`), a citation (`63-3004`), a code section or a bill number (`S.F.No. 1552`). Quoted parts must appear verbatim; everything else is matched on its words, stemmed, so `licensing` finds `licensed`. Words are matched as the legislature wrote them: `teeth cleaning professional` does not find an act that says `dental hygienist`. 2 to 300 characters.',
    },
    jurisdiction: {
      anyOf: [
        {
          type: "string",
          pattern: statePattern,
          description: "jurisdiction parameter.",
        },
        {
          type: "null",
          description: "jurisdiction parameter.",
        },
      ],
      description:
        "Limit to one state, `dc` or `pr`. Two-letter code, case-insensitive. Omit to search every jurisdiction we hold. `federal` and an unknown code are a 422, never charged.",
    },
    session: {
      anyOf: [
        {
          type: "string",
          maxLength: 32,
          minLength: 1,
          pattern: "^[A-Za-z0-9._-]+$",
          description: "session parameter.",
        },
        {
          type: "null",
          description: "session parameter.",
        },
      ],
      description:
        "Limit to one session, by the code `session.code` reports (`2025R`, `2025S1`). Case-sensitive. Matches the act's own session, so it narrows the TITLE, citation and bill signals; the passage text of an act carries its session year and type but not the code.",
    },
    series: {
      anyOf: [
        {
          items: {
            type: "string",
            enum: [
              "general",
              "public",
              "public_act",
              "special_act",
              "private_and_special",
              "act",
              "acts",
              "law",
              "local",
              "municipal",
              "appropriation",
              "resolve",
              "resolves",
              "resolution",
              "resolution_chapter",
              "joint_resolution",
              "concurrent_resolution",
              "memorial",
              "initiated_bill",
              "constitutional_amendment",
            ],
            description: "series parameter.",
          },
          type: "array",
          description: "series parameter.",
        },
        {
          type: "null",
          description: "series parameter.",
        },
      ],
      description:
        "Limit to these numbering series, one or more (they combine with OR). One of `general`, `public`, `public_act`, `special_act`, `private_and_special`, `act`, `acts`, `law`, `local`, `municipal`, `appropriation`, `resolve`, `resolves`, `resolution`, `resolution_chapter`, `joint_resolution`, `concurrent_resolution`, `memorial`, `initiated_bill`, `constitutional_amendment`. Any other value is a 422, never charged.",
    },
    instrumentType: {
      anyOf: [
        {
          items: {
            type: "string",
            enum: ["act", "joint_resolution", "concurrent_resolution", "resolution", "resolve", "memorial", "other"],
            description: "instrumentType parameter.",
          },
          type: "array",
          description: "instrumentType parameter.",
        },
        {
          type: "null",
          description: "instrumentType parameter.",
        },
      ],
      description:
        "Limit to these kinds of measure, one or more (OR). One of `act`, `joint_resolution`, `concurrent_resolution`, `resolution`, `resolve`, `memorial`, `other`. Any other value is a 422, never charged.",
    },
    approvedFrom: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "approvedFrom parameter.",
        },
        {
          type: "null",
          description: "approvedFrom parameter.",
        },
      ],
      format: "date",
      description:
        "Only laws approved on or after this date, `YYYY-MM-DD`, inclusive; a real calendar date (`2025-02-30` is a 422). A law with no printed approval date never matches.",
    },
    approvedTo: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "approvedTo parameter.",
        },
        {
          type: "null",
          description: "approvedTo parameter.",
        },
      ],
      format: "date",
      description:
        "Only laws approved on or before this date, `YYYY-MM-DD`, inclusive. An end before `approvedFrom` is a 422, never charged.",
    },
    limit: {
      type: "integer",
      maximum: 25,
      minimum: 1,
      description:
        "Laws per page, 1 to 25. A page costs the same however many laws it holds, so a larger `limit` is cheaper per law.",
    },
    offset: {
      type: "integer",
      maximum: 59,
      minimum: 0,
      description:
        "Laws to skip, for the next page: `offset` plus `limit` can reach at most the 60 best matches. Each page is a new search and is charged. Deeper than 60 is a 422, never charged: narrow the search with a filter instead.",
    },
  },
  { required: ["query"] },
);
export const search_session_lawsOutput: JsonSchema = s.object(
  "Response for `POST /us/session-laws/search`.",
  {
    query: {
      type: "string",
      description: "The query as read, whitespace collapsed.",
    },
    parsed: {
      type: "object",
      description: "How the query was split into words, phrases, citations and bill numbers.",
      additionalProperties: true,
      properties: {},
    },
    results: {
      items: {
        type: "object",
        description: "One law in the ranking.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description: "The laws, best first. Empty when nothing matched, which is an answer and is charged.",
    },
    count: {
      type: "integer",
      description: "Laws on this page.",
    },
    offset: {
      type: "integer",
      description: "The `offset` this page was read from.",
    },
    limit: {
      type: "integer",
      description: "The `limit` this page was read with.",
    },
    hasMore: {
      type: "boolean",
      description: "True when more laws follow: call again with `offset` raised by `limit` (within the 60 best).",
    },
    creditsConsumed: {
      type: "integer",
      description: "Credits actually charged for this call, never the list price. 0 when the call was refunded.",
    },
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds, excluding network transit. Not billed on.",
    },
  },
  {
    required: ["query", "parsed"],
    additionalProperties: true,
  },
);
export const list_session_lawsInput: JsonSchema = s.object(
  "Parameters for list_session_laws.",
  {
    jurisdiction: {
      type: "string",
      description:
        "Two-letter code of the state whose session laws to list: the 50 states, `dc` and `pr`. Case-insensitive (`MN` works). Required: the list is scoped to one jurisdiction at a time. `federal` and any unknown code is a 422; federal session laws are on `/us/statutes/section`. A jurisdiction we hold no session laws for returns an empty page with a `coverage` block saying so, which is not charged: see `sessionLaws` on `/us/statutes/coverage` for what is held.",
      pattern: statePattern,
    },
    session: {
      anyOf: [
        {
          type: "string",
          minLength: 1,
          maxLength: 32,
          pattern: "^[A-Za-z0-9._-]+$",
          description: "session parameter.",
        },
        {
          type: "null",
          description: "session parameter.",
        },
      ],
      description:
        "Only laws enacted in this session. Use the code exactly as `session.code` reports it: `2025R` is the 2025 regular session, `2025S1` the first special session of 2025. Case-sensitive, so `2025r` matches nothing. A code that matches no session returns an empty page (charged), not an error; characters other than letters, digits, `.`, `_` and `-` are a 422. Omit to list every session.",
    },
    series: {
      anyOf: [
        {
          type: "array",
          items: {
            enum: [
              "general",
              "public",
              "public_act",
              "special_act",
              "private_and_special",
              "act",
              "acts",
              "law",
              "local",
              "municipal",
              "appropriation",
              "resolve",
              "resolves",
              "resolution",
              "resolution_chapter",
              "joint_resolution",
              "concurrent_resolution",
              "memorial",
              "initiated_bill",
              "constitutional_amendment",
            ],
            type: "string",
            description: "series parameter.",
          },
          description: "series parameter.",
        },
        {
          type: "null",
          description: "series parameter.",
        },
      ],
      description:
        "Only laws in one of these numbering series. Repeat the parameter for several (`series=resolve&series=resolves`); they combine with OR. `general` is the ordinary chapter sequence of most states; others number acts, resolutions or local laws apart. One of `general`, `public`, `public_act`, `special_act`, `private_and_special`, `act`, `acts`, `law`, `local`, `municipal`, `appropriation`, `resolve`, `resolves`, `resolution`, `resolution_chapter`, `joint_resolution`, `concurrent_resolution`, `memorial`, `initiated_bill`, `constitutional_amendment`, as a result's `series` reports it. Not every jurisdiction uses every series: `sessionLaws` on `/us/statutes/coverage` lists each one's. Any other value is a 422, never charged; a valid series nothing matches returns an empty page (charged). Omit for every series.",
    },
    instrumentType: {
      anyOf: [
        {
          type: "array",
          items: {
            enum: ["act", "joint_resolution", "concurrent_resolution", "resolution", "resolve", "memorial", "other"],
            type: "string",
            description: "instrumentType parameter.",
          },
          description: "instrumentType parameter.",
        },
        {
          type: "null",
          description: "instrumentType parameter.",
        },
      ],
      description:
        "Only these kinds of measure. Repeat the parameter for several (`instrumentType=joint_resolution&instrumentType=concurrent_resolution`); they combine with OR. One of `act`, `joint_resolution`, `concurrent_resolution`, `resolution`, `resolve`, `memorial`, `other` (`act` is an ordinary law), as `instrumentType` reports it. Any other value is a 422, never charged; a valid kind nothing matches returns an empty page (charged). Omit for every kind.",
    },
    approvedFrom: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "approvedFrom parameter.",
        },
        {
          type: "null",
          description: "approvedFrom parameter.",
        },
      ],
      description:
        "Only laws approved (signed) on or after this date. Format `YYYY-MM-DD`, inclusive; it must be a real calendar date (`2025-02-30` is a 422). A law with no printed approval date never matches, and neither does one whose `approvedDate` we derived (`approvedDateDerived: true`): this filter reads the registry's own approval date, so South Dakota's derived dates are not found by it. Pair with `approvedTo` for a range; an end before the start is a 422 (never charged).",
      format: "date",
    },
    approvedTo: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "approvedTo parameter.",
        },
        {
          type: "null",
          description: "approvedTo parameter.",
        },
      ],
      description:
        "Only laws approved (signed) on or before this date. Format `YYYY-MM-DD`, inclusive; it must be a real calendar date (`2025-02-30` is a 422). Like `approvedFrom`, it does not match a derived `approvedDate`.",
      format: "date",
    },
    effectiveFrom: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "effectiveFrom parameter.",
        },
        {
          type: "null",
          description: "effectiveFrom parameter.",
        },
      ],
      description:
        "Only laws with an effective date on or after this date. Format `YYYY-MM-DD`, inclusive; it must be a real calendar date (`2025-02-30` is a 422). A law matches when the span from its first to its last effective date (`effectiveFirst` to `effectiveLast`) overlaps your window, so one whose dates straddle your day is returned even though none falls exactly on it: read `effectiveDates` on the law for the dates themselves. Only laws with a held effective date can match, and not every state's publisher prints them (Texas, Washington and Iowa do; Minnesota does not yet): a law with no effective date is never returned by this filter, though it may well be in force. To get everything taking effect on one day, send the same date to both `effectiveFrom` and `effectiveTo`; for example `jurisdiction=tx`, `effectiveFrom=2025-09-01`, `effectiveTo=2025-09-01` lists the Texas acts effective September 1, 2025.",
      format: "date",
    },
    effectiveTo: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "effectiveTo parameter.",
        },
        {
          type: "null",
          description: "effectiveTo parameter.",
        },
      ],
      description:
        "Only laws with an effective date on or before this date. Format `YYYY-MM-DD`, inclusive; it must be a real calendar date (`2025-02-30` is a 422). Overlap rule as for `effectiveFrom`. An end before `effectiveFrom` is a 422 (never charged).",
      format: "date",
    },
    hasText: {
      anyOf: [
        {
          type: "boolean",
          description: "hasText parameter.",
        },
        {
          type: "null",
          description: "hasText parameter.",
        },
      ],
      description:
        "`true`: only laws whose text is served (`textStatus: held`), the ones `/{sessionLawId}/body` will return. `false`: only laws whose text is not served (`withheld`, `not_held` or `pending`). Omit for both. Combined with `textStatus` by AND, so `hasText=true&textStatus=withheld` is always empty. Anything but a boolean is a 422.",
    },
    textStatus: {
      anyOf: [
        {
          enum: ["held", "withheld", "not_held", "pending"],
          type: "string",
          description: "textStatus parameter.",
        },
        {
          type: "null",
          description: "textStatus parameter.",
        },
      ],
      description:
        "Only laws with this text status. One of `held`, `withheld`, `not_held`, `pending`: `held` is served, `withheld` is held but kept back for a measured defect, `not_held` is known to exist without text, `pending` is collected and not yet verified. Any other value is a 422. Omit for every status.",
    },
    isLaw: {
      anyOf: [
        {
          type: "boolean",
          description: "isLaw parameter.",
        },
        {
          type: "null",
          description: "isLaw parameter.",
        },
      ],
      description:
        "`true`: only measures that are law. `false`: only numbered measures that are NOT law (a vetoed bill, a pocket veto), the ones `isLaw: false` marks. Omit for both. A measure whose outcome does not settle it (`not_presented`, `unknown`) has a null `isLaw`, so it matches neither `true` nor `false`: use `enactmentOutcome` for those. Anything but a boolean is a 422.",
    },
    enactmentOutcome: {
      anyOf: [
        {
          type: "array",
          items: {
            enum: [
              "signed",
              "became_law_without_signature",
              "veto_overridden",
              "line_item_veto",
              "vetoed",
              "pocket_veto",
              "not_presented",
              "approved_by_voters",
              "unknown",
            ],
            type: "string",
            description: "enactmentOutcome parameter.",
          },
          description: "enactmentOutcome parameter.",
        },
        {
          type: "null",
          description: "enactmentOutcome parameter.",
        },
      ],
      description:
        "Only laws with one of these outcomes. Repeat the parameter for several (`enactmentOutcome=vetoed&enactmentOutcome=pocket_veto`); they combine with OR. One of `signed`, `became_law_without_signature`, `veto_overridden`, `line_item_veto`, `vetoed`, `pocket_veto`, `not_presented`, `approved_by_voters`, `unknown`, as `enactmentOutcome` reports it. Any other value is a 422, never charged; a valid outcome nothing matches returns an empty page (charged). The order you send them in does not matter, and a cursor stays valid for the same set.",
    },
    updatedSince: {
      anyOf: [
        {
          type: "string",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
          description: "updatedSince parameter.",
        },
        {
          type: "null",
          description: "updatedSince parameter.",
        },
      ],
      description:
        "Only laws whose record changed on or after this date, midnight UTC, by `updatedAt`: the filter for a sync job that pulls only what is new or corrected since its last run. Format `YYYY-MM-DD`, inclusive; it must be a real calendar date (`2025-02-30` is a 422). A day with no change returns an empty page (charged), not an error.",
      format: "date",
    },
    q: {
      anyOf: [
        {
          type: "string",
          minLength: 3,
          maxLength: 100,
          description: "q parameter.",
        },
        {
          type: "null",
          description: "q parameter.",
        },
      ],
      description:
        "Only laws whose `title` or printed `billNumber` contains this text, case-insensitively (`grain buyers` finds `An act relating to agriculture; modifying financial reporting requirements for grain buyers ...`). A plain substring, not a search engine: no stemming, no ranking, and `%` and `_` mean themselves. The bill number is matched as the publisher prints it (`S.F.No. 1552`, not `SF 1552`): to find a law by citation, use `GET /us/session-laws/{sessionLawId}`. 3 to 100 characters after trimming and without control characters, else a 422 (never charged); text that matches nothing returns an empty page (charged). Combines with the other filters by AND within the required `jurisdiction`.",
    },
    cursor: {
      anyOf: [
        {
          type: "string",
          maxLength: 600,
          description: "cursor parameter.",
        },
        {
          type: "null",
          description: "cursor parameter.",
        },
      ],
      description:
        "Where to resume: the previous page's `nextCursor`, unchanged. Send it with the same filters that produced it (`limit` may change). It is opaque, signed and tied to those filters, and is only ever issued by this API: a value we did not issue is a 422 with `reason: invalid_cursor`, one from an older cursor format is `cursor_expired`, and one sent with different filters is `cursor_query_mismatch` (restart without `cursor`). Never an empty page. Omit for the first page.",
    },
    limit: {
      type: "integer",
      maximum: 200,
      minimum: 1,
      description:
        "Rows per page, 1 to 200; default 50. A page costs the same however many rows it holds, so a larger `limit` is cheaper per law. Outside the range is a 422.",
    },
  },
  { required: ["jurisdiction"] },
);
export const list_session_lawsOutput: JsonSchema = s.object(
  "Response for `GET /us/session-laws/list`.",
  {
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds, excluding network transit. Not billed on.",
    },
    creditsConsumed: creditsConsumedSchema3,
    results: {
      items: {
        type: "object",
        description: "One session law, as it appears in lists and citation results.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "The page of laws, by `session.code` and then `sessionLawId`, both as text in the database's collation, not chapter order (so `..._C10` comes before `..._C2`; sort by `number` client-side if you need chapter order). The record without its dates list, sources or text: fetch those with `GET /us/session-laws/{sessionLawId}`.",
    },
    count: {
      type: "integer",
      description: "Rows on this page. Never a total: the list is paged by cursor and has no corpus-wide count.",
    },
    nextCursor: {
      anyOf: [
        {
          type: "string",
          description: "nextCursor returned by Vaquill.",
        },
        {
          type: "null",
          description: "nextCursor returned by Vaquill.",
        },
      ],
      description:
        "Opaque cursor for the next page: send it as `cursor`, with the same filters. Null on the last page.",
    },
    hasMore: {
      type: "boolean",
      description:
        "True when another page follows. Each page is charged, an empty one included, except an empty page that `coverage` reports as a gap in our collection.",
    },
    coverage: {
      anyOf: [
        {
          type: "object",
          description: "What we hold of the session or state an EMPTY page was asked about.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "coverage returned by Vaquill.",
        },
      ],
      description:
        "Present only on an EMPTY page: what we hold of the session (or state) you asked about, so you can tell `nothing matches your filters` from `we have not collected this`. `status: complete` means the first: the page is charged. `partial` (the collection stopped short) and `not_held` (we hold nothing of it) mean the second: the page is NOT charged and `creditsConsumed` is 0. Omitted when the coverage cannot be read, in which case the empty page is charged as before.",
    },
  },
  {
    required: [],
    additionalProperties: true,
  },
);
export const get_session_law_bodyInput: JsonSchema = s.object(
  "Parameters for get_session_law_body.",
  {
    session_law_id: {
      type: "string",
      minLength: 1,
      maxLength: 300,
      description:
        "A STATE session law's id, for example `SSL_MN_2025S1_G_Y2025_C1`, from a `/us/session-laws/list` result.\n\nA citation also works here on `GET /us/session-laws/{sessionLawId}`, and `resolvedFrom` says what your input matched. Name the state in the citation: `Minn. Laws 2025, ch. 1`, `2025 Minn. Laws ch. 1`, `Ch. 1, Laws of Minnesota 2025`, `Ch. 2025-12, Laws of Fla.`, `2025 Wash. Sess. Laws ch. 12`, `La. Acts 2025, No. 12`, `Pa. Act 12 of 2025`, `Minn. S.F. 1552 (2025)`, `MN: Laws 2025, ch. 1`. A form only one state uses needs no state: `P.A. 104-0001` (Illinois), `Pub. Act No. 26-151` (Connecticut), `S.L. 2025-12` (North Carolina), `Stats. 2025, ch. 12` (California), `D.C. Law 25-713`. The publisher's printed form (`CHAPTER 2025-12`, `S.F.No. 1552`) and the `citation` we print on every law also work. A form several states share (`Laws 2025, ch. 1`, `HB 123`, `Act 12 of 2025`) is a 404 with `reason: needs_jurisdiction`, the states it exists in and one candidate per state: we never guess the state. A citation naming several laws of one state (Minnesota 2025 has two Chapter 1s) is a 404 listing all of them, `candidateCount` and `truncated` saying whether the list is complete, and `defaultSessionLawId` the regular session's law where there is exactly one conventional reading. An id or citation that matches nothing in a session we have only partly collected is a 404 with `reason: session_not_fully_collected` and that session's coverage: the law may exist and not be held yet, so it is never charged, the resolve price included. A citation costs the route's price PLUS the `/us/statutes/resolve` price (2 credits), the second charged whether or not it resolves. URL-encode the citation; one containing `/` cannot travel in a path segment.\n\nFederal session laws (`SAL_...`, `Pub. L. 118-5`, the Statutes at Large) are served by `/us/statutes/section`, not here, and code citations (`26 U.S.C. § 1`) by `/us/statutes/resolve`.",
    },
    cursor: {
      anyOf: [
        {
          type: "string",
          maxLength: 600,
          description: "cursor parameter.",
        },
        {
          type: "null",
          description: "cursor parameter.",
        },
      ],
      description:
        "Where to resume: the previous page's `nextCursor`, unchanged. Omit for the first page. It is opaque, signed and tied to the exact text it was cut from: a value we did not issue (`reason: invalid_cursor`), from an older cursor format (`cursor_expired`) or past the end of the text (`cursor_past_end`) is a 422, and one from before the text was re-collected is a 409 (start again without it). None is charged. Send either `cursor` or `startChar`, never both (a 422, never charged).",
    },
    startChar: {
      anyOf: [
        {
          type: "integer",
          maximum: 100000000,
          minimum: 0,
          description: "startChar parameter.",
        },
        {
          type: "null",
          description: "startChar parameter.",
        },
      ],
      description:
        "Start the page at this character offset into the text (0-based, the same scale as `pageStart` and `totalChars`): an alternative to `cursor` for jumping to a place you already know, such as the character where a section begins, without paging from the start. The page that comes back is the same size and price as any other, its `nextCursor` is a normal signed cursor you can follow, and a page is still cut at a paragraph break near its end. Send either `startChar` or `cursor`, never both (a 422, never charged). 0 to 100,000,000; a value at or beyond the end of the text is a 422 and is refunded. There is no page-size parameter: the price per page is fixed.",
    },
    expectTextSha256: {
      anyOf: [
        {
          type: "string",
          pattern: "^[0-9a-f]{16,64}$",
          description: "expectTextSha256 parameter.",
        },
        {
          type: "null",
          description: "expectTextSha256 parameter.",
        },
      ],
      description:
        "The `textSha256` you read the text under, in lowercase hex (the whole 64 characters, or any prefix of 16 or more). When this law's text no longer has that hash (it was re-collected), the answer is a 409 and nothing is charged, exactly as for a `cursor` cut from an earlier version: use it with `startChar`, which otherwise has no version binding of its own. Anything that is not 16 to 64 lowercase hex characters is a 422.",
    },
  },
  { required: ["session_law_id"] },
);
export const get_session_law_bodyOutput: JsonSchema = s.object(
  "Response for `GET /us/session-laws/{sessionLawId}/body`.",
  {
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds, excluding network transit. Not billed on.",
    },
    creditsConsumed: creditsConsumedSchema3,
    sessionLawId: {
      type: "string",
      description: "The law this page belongs to.",
    },
    citation: {
      type: "string",
      description:
        "The act's citation as its publisher prints it, the same as `citation` on `GET /us/session-laws/{sessionLawId}`. Carried here so a page is attributable on its own, with no second call.",
    },
    jurisdiction: {
      type: "string",
      description: "Lowercase two-letter code of the state, `dc` or `pr`.",
    },
    session: {
      type: "object",
      description: "The legislative session the law was enacted in.",
      additionalProperties: true,
      properties: {},
    },
    approvedDate: {
      anyOf: [
        {
          type: "string",
          format: "date",
          description: "approvedDate returned by Vaquill.",
        },
        {
          type: "null",
          description: "approvedDate returned by Vaquill.",
        },
      ],
      description:
        "Date the governor approved the act, ISO 8601, as on `GET /us/session-laws/{sessionLawId}`: never an effective date. Null when none is held. See `approvedDateDerived`.",
    },
    approvedDateDerived: {
      type: "boolean",
      description:
        "True only when `approvedDate` was filled from the publisher's dated signature label rather than held as the approval date. See the same field on `GET /us/session-laws/{sessionLawId}`.",
    },
    sourceUrl: {
      anyOf: [
        {
          type: "string",
          description: "sourceUrl returned by Vaquill.",
        },
        {
          type: "null",
          description: "sourceUrl returned by Vaquill.",
        },
      ],
      description:
        "The official page or file this text was collected from, on a government publisher's host. Present on EVERY outcome, a withheld or not-held law included, so a reader is never at a dead end: where we do not serve the text, this is where to read it. Null only when we hold no government text source for the law.",
    },
    available: {
      type: "boolean",
      description:
        "False when we do not serve this law's text; `reason` says why. A page with `available: false` is not charged.",
    },
    reason: {
      anyOf: [
        {
          type: "string",
          description: "reason returned by Vaquill.",
        },
        {
          type: "null",
          description: "reason returned by Vaquill.",
        },
      ],
      description:
        "Why `available` is false: `not_held`, `withheld`, `pending` or `empty_text`. Null when the text is served.",
    },
    textStatus: {
      type: "string",
      enum: ["held", "withheld", "not_held", "pending"],
      description:
        "Whether we serve this law's text. `held`: the text is served by `/us/session-laws/{sessionLawId}/body`. `withheld`: we hold the text but a measured defect keeps it from being served, and `withheldReason` says what. `not_held`: we know the act exists and do not hold its text. `pending`: collected and not yet verified.",
    },
    withheldReason: {
      anyOf: [
        {
          type: "string",
          description: "withheldReason returned by Vaquill.",
        },
        {
          type: "null",
          description: "withheldReason returned by Vaquill.",
        },
      ],
      description:
        "Present only when `textStatus` is `withheld`: what is wrong with the text we hold. A plain sentence to show, not an enum to branch on.",
    },
    text: {
      anyOf: [
        {
          type: "string",
          description: "text returned by Vaquill.",
        },
        {
          type: "null",
          description: "text returned by Vaquill.",
        },
      ],
      description:
        "This page of the act's text, exactly as printed, in reading order. Concatenating every page's `text` in order reproduces the whole text. Where `amendatoryMarkup` is `preserved`, struck and inserted language is in the text in the convention `markupConvention` names. Null when `available` is false.",
    },
    pageStart: {
      anyOf: [
        {
          type: "integer",
          description: "pageStart returned by Vaquill.",
        },
        {
          type: "null",
          description: "pageStart returned by Vaquill.",
        },
      ],
      description:
        "Character offset in the full text where this page starts (0-based). Pages are contiguous: the next page's `pageStart` equals this page's `pageEnd`.",
    },
    pageEnd: {
      anyOf: [
        {
          type: "integer",
          description: "pageEnd returned by Vaquill.",
        },
        {
          type: "null",
          description: "pageEnd returned by Vaquill.",
        },
      ],
      description:
        "Character offset just past this page. A page is about 30,000 characters, cut back to a paragraph break where one is near, so the length varies.",
    },
    totalChars: {
      anyOf: [
        {
          type: "integer",
          description: "totalChars returned by Vaquill.",
        },
        {
          type: "null",
          description: "totalChars returned by Vaquill.",
        },
      ],
      description: "Length of the whole text in characters. This page is the last when `pageEnd` equals it.",
    },
    totalPages: {
      anyOf: [
        {
          type: "integer",
          description: "totalPages returned by Vaquill.",
        },
        {
          type: "null",
          description: "totalPages returned by Vaquill.",
        },
      ],
      description:
        "Estimated pages in the whole text: `totalChars` divided by the page size, rounded up. Pages are cut back to a paragraph break, so a long act can run a few percent over. Null when no text is served.",
    },
    pagePrice: {
      type: "integer",
      description:
        "Credits charged for the page in this response, the same as `creditsConsumed` on this route: the price of one page when a page was served, 0 when none was (`available` is false). Each further page costs the same.",
    },
    estimatedRemainingCredits: {
      anyOf: [
        {
          type: "integer",
          description: "estimatedRemainingCredits returned by Vaquill.",
        },
        {
          type: "null",
          description: "estimatedRemainingCredits returned by Vaquill.",
        },
      ],
      description:
        "Estimated credits to read the rest of the text from `pageEnd`: the pages still to come (`totalChars` less `pageEnd`, over the page size, rounded up) times the price of a page. 0 on the last page. Null when no text is served. An estimate: a page cut back to a paragraph break can add a page on a long act. Reading a whole law costs `estimatedBodyPages` times the price of one body page (6 credits per page on `GET /us/session-laws/{sessionLawId}/body`). Ohio's 2025 budget act (HB 96) is 9,571,132 characters, about 320 pages or 1,920 credits to read in full; most acts are a page or two.",
    },
    textSha256: {
      anyOf: [
        {
          type: "string",
          description: "textSha256 returned by Vaquill.",
        },
        {
          type: "null",
          description: "textSha256 returned by Vaquill.",
        },
      ],
      description:
        "SHA-256 (hex) of the full text of this law. It changes only when the text does, so it is the cheap way to tell whether a copy you hold is current. Body pages carry the same value.",
    },
    amendatoryMarkup: {
      anyOf: [
        {
          type: "string",
          description: "amendatoryMarkup returned by Vaquill.",
        },
        {
          type: "null",
          description: "amendatoryMarkup returned by Vaquill.",
        },
      ],
      description:
        "Whether the language an amending act strikes and inserts survives in the text. `preserved`: it is in `text`, in the convention `markupConvention` names. `lost`: the publisher printed it and our text does not keep it, so deleted words can read as law: check the source before quoting. `absent`: the act carries no such markup that we found. `not_applicable`: there is no text to carry it.",
    },
    markupConvention: {
      anyOf: [
        {
          type: "string",
          description: "markupConvention returned by Vaquill.",
        },
        {
          type: "null",
          description: "markupConvention returned by Vaquill.",
        },
      ],
      description:
        "How preserved markup is written, set only when `amendatoryMarkup` is `preserved`. `wdiff`: deleted language is `[-like this-]` and inserted language `{+like this+}`. `publisher_literal`: the publisher's own words are left as printed (Minnesota prints `new text begin` / `new text end` and `deleted text begin` / `deleted text end` markers). `mixed`: both in one text.",
    },
    nextCursor: {
      anyOf: [
        {
          type: "string",
          description: "nextCursor returned by Vaquill.",
        },
        {
          type: "null",
          description: "nextCursor returned by Vaquill.",
        },
      ],
      description:
        "Opaque cursor for the next page: send it as `cursor` on the same path. Null on the last page. It is tied to this exact text, so a cursor from before the text was re-collected is a 409.",
    },
    hasMore: {
      type: "boolean",
      description: "True when more pages follow; fetch them with `nextCursor`. Each page is charged.",
    },
  },
  {
    required: ["sessionLawId", "citation", "jurisdiction", "session", "available", "textStatus"],
    additionalProperties: true,
  },
);
export const get_session_lawInput: JsonSchema = s.object(
  "Parameters for get_session_law.",
  {
    session_law_id: {
      type: "string",
      minLength: 1,
      maxLength: 300,
      description:
        "A STATE session law's id, for example `SSL_MN_2025S1_G_Y2025_C1`, from a `/us/session-laws/list` result.\n\nA citation also works here on `GET /us/session-laws/{sessionLawId}`, and `resolvedFrom` says what your input matched. Name the state in the citation: `Minn. Laws 2025, ch. 1`, `2025 Minn. Laws ch. 1`, `Ch. 1, Laws of Minnesota 2025`, `Ch. 2025-12, Laws of Fla.`, `2025 Wash. Sess. Laws ch. 12`, `La. Acts 2025, No. 12`, `Pa. Act 12 of 2025`, `Minn. S.F. 1552 (2025)`, `MN: Laws 2025, ch. 1`. A form only one state uses needs no state: `P.A. 104-0001` (Illinois), `Pub. Act No. 26-151` (Connecticut), `S.L. 2025-12` (North Carolina), `Stats. 2025, ch. 12` (California), `D.C. Law 25-713`. The publisher's printed form (`CHAPTER 2025-12`, `S.F.No. 1552`) and the `citation` we print on every law also work. A form several states share (`Laws 2025, ch. 1`, `HB 123`, `Act 12 of 2025`) is a 404 with `reason: needs_jurisdiction`, the states it exists in and one candidate per state: we never guess the state. A citation naming several laws of one state (Minnesota 2025 has two Chapter 1s) is a 404 listing all of them, `candidateCount` and `truncated` saying whether the list is complete, and `defaultSessionLawId` the regular session's law where there is exactly one conventional reading. An id or citation that matches nothing in a session we have only partly collected is a 404 with `reason: session_not_fully_collected` and that session's coverage: the law may exist and not be held yet, so it is never charged, the resolve price included. A citation costs the route's price PLUS the `/us/statutes/resolve` price (2 credits), the second charged whether or not it resolves. URL-encode the citation; one containing `/` cannot travel in a path segment.\n\nFederal session laws (`SAL_...`, `Pub. L. 118-5`, the Statutes at Large) are served by `/us/statutes/section`, not here, and code citations (`26 U.S.C. § 1`) by `/us/statutes/resolve`.",
    },
    jurisdiction: {
      anyOf: [
        {
          type: "string",
          pattern: statePattern,
          description: "jurisdiction parameter.",
        },
        {
          type: "null",
          description: "jurisdiction parameter.",
        },
      ],
      description:
        "Optional two-letter state code that scopes how a CITATION sent in place of the id is read. It supplies the state a citation does not name (`Laws 2025, ch. 1` with `jurisdiction=mn` is Minnesota's) and it vetoes a state the citation does name or whose form belongs to another: `Minn. Laws 2025, ch. 1` with `jurisdiction=tx` is a 404 `unresolved_citation` (the resolution fee is kept), never answered from Minnesota. Ignored, with no effect, when you send an id. The same codes as the list's `jurisdiction`: the 50 states, `dc` and `pr`, case-insensitive; `federal` or an unknown code is a 422 and is never charged.",
    },
  },
  { required: ["session_law_id"] },
);
export const get_session_lawOutput: JsonSchema = s.object(
  "Response for `GET /us/session-laws/{sessionLawId}`.",
  {
    processingTimeMs: {
      type: "number",
      description: "Server-side time for this request in milliseconds, excluding network transit. Not billed on.",
    },
    creditsConsumed: creditsConsumedSchema3,
    sessionLawId: {
      type: "string",
      description:
        "Permanent identifier of the law, the key to use everywhere. Shape `SSL_{state}_{session code}_{series}[_Y{numberingYear}]_{C<chapter>|B<billKey>}`. It never changes: a correction to our reading of a law keeps the old id working. Pass it to `GET /us/session-laws/{sessionLawId}`.",
    },
    lawId: {
      anyOf: [
        {
          type: "string",
          description: "lawId returned by Vaquill.",
        },
        {
          type: "null",
          description: "lawId returned by Vaquill.",
        },
      ],
      description:
        "The law's identifier in the open us1 scheme. Null until its identity is confirmed by a second source and the us1 state shape is minted, so it is null on every state law today. Use `sessionLawId`, which is always present.",
    },
    jurisdiction: {
      type: "string",
      description:
        "Lowercase two-letter code of the state, `dc` or `pr`. Federal acts are not served by this family: they are on `/us/statutes/section`.",
    },
    citation: {
      type: "string",
      description:
        "The act's citation as its publisher prints it, falling back to `{session label}, ch. {number}` when none is printed. It is NOT unique: many states print a bare `CHAPTER 1` every session. Key on `sessionLawId`.",
    },
    citableAs: {
      anyOf: [
        {
          type: "string",
          description: "citableAs returned by Vaquill.",
        },
        {
          type: "null",
          description: "citableAs returned by Vaquill.",
        },
      ],
      description:
        "The law cited the way a lawyer writes it, from the state's own form: `Minn. Laws 2025, ch. 1`, `2025 Fla. Laws ch. 3`, `Ill. Pub. Act 104-0001`, `S.L. 2025-12` (North Carolina), `Stats. 2025, ch. 12` (California), `Ohio S.B. 1 (2025)` for a state that numbers no chapters. A law in a special or extraordinary session carries it (`Minn. Laws 2025, 1st Spec. Sess., ch. 1`). Every value is read back through the grammar that `GET /us/session-laws/{sessionLawId}` accepts a citation in, and must name this law; one that would not is null, never guessed. Null where the state's form is not known, for a series with no standard form (resolutions, memorials), or for a law with neither a chapter nor a bill key. Where a regular and a special session each have a chapter 1, the bare form is the regular session's law and resolves with that law flagged as the default; the special session's carries its session. Distinct from `citation`, which is the publisher's printed form.",
    },
    citationShort: {
      anyOf: [
        {
          type: "string",
          description: "citationShort returned by Vaquill.",
        },
        {
          type: "null",
          description: "citationShort returned by Vaquill.",
        },
      ],
      description:
        "A compact label for tables and badges: `MN ch. 1 (2025)`, `IL P.A. 104-0001`, `OH S.B. 1 (2025)`. Not a form to send back: use `citableAs` or the `sessionLawId`. Null exactly when `citableAs` is null.",
    },
    session: {
      type: "object",
      description: "The legislative session the law was enacted in, and whether we hold all of it (`coverageStatus`).",
      additionalProperties: true,
      properties: {},
    },
    series: {
      type: "string",
      description:
        "The numbering series the law belongs to within its session. Most states have one, `general`. Others number acts, resolutions or local laws separately (`public`, `act`, `acts`, `law`, `public_act`, `resolve`, `resolution_chapter`, `local`, ...). An open list that grows as jurisdictions load. Filter with `series` on the list.",
    },
    instrumentType: {
      type: "string",
      description:
        "What kind of measure this is: `act`, `joint_resolution`, `concurrent_resolution`, `resolution`, `resolve`, `memorial` or `other`. An open list. A resolution that was numbered and published among the session laws is included, with `isLaw` saying whether it binds as law.",
    },
    number: {
      anyOf: [
        {
          type: "string",
          description: "number returned by Vaquill.",
        },
        {
          type: "null",
          description: "number returned by Vaquill.",
        },
      ],
      description:
        "The chapter or act number exactly as printed, as a string. It is not always an integer: `1`, `2025-12` (Florida), `104-0001` (Illinois), `1A`. Null where the state does not number its acts (see `billKey`).",
    },
    billKey: {
      anyOf: [
        {
          type: "string",
          description: "billKey returned by Vaquill.",
        },
        {
          type: "null",
          description: "billKey returned by Vaquill.",
        },
      ],
      description:
        "Normalised bill identifier (chamber and type letters plus the number) that stands in for a chapter number in states that do not number their acts (Missouri, Ohio, Nebraska). `House Bill 2` is `HB2`. Null whenever `number` is set. Part of the `sessionLawId` as `B<billKey>`.",
    },
    billNumber: {
      anyOf: [
        {
          type: "string",
          description: "billNumber returned by Vaquill.",
        },
        {
          type: "null",
          description: "billNumber returned by Vaquill.",
        },
      ],
      description:
        "The bill the act originated as, as the publisher prints it. Matches as a citation on `GET /us/session-laws/{sessionLawId}`.",
    },
    numberingYear: {
      anyOf: [
        {
          type: "integer",
          description: "numberingYear returned by Vaquill.",
        },
        {
          type: "null",
          description: "numberingYear returned by Vaquill.",
        },
      ],
      description:
        "The year of the numbering sequence the chapter number belongs to, where the state numbers by year (Minnesota, Florida, Texas). It appears in the `sessionLawId` as `_Y2025`. A chapter number is only unique within a session and numbering year: Minnesota's regular and first special sessions of 2025 each have a Chapter 1. Null where one sequence runs across the session (Louisiana).",
    },
    title: {
      anyOf: [
        {
          type: "string",
          description: "title returned by Vaquill.",
        },
        {
          type: "null",
          description: "title returned by Vaquill.",
        },
      ],
      description:
        "The act's long title as printed, usually beginning `An act relating to`. It names the code sections the act amends in prose.",
    },
    shortTitle: {
      anyOf: [
        {
          type: "string",
          description: "shortTitle returned by Vaquill.",
        },
        {
          type: "null",
          description: "shortTitle returned by Vaquill.",
        },
      ],
      description:
        "The act's short title when the publisher gives one (Ohio, New York, the District of Columbia and a few others do), otherwise null.",
    },
    approvedDate: {
      anyOf: [
        {
          type: "string",
          format: "date",
          description: "approvedDate returned by Vaquill.",
        },
        {
          type: "null",
          description: "approvedDate returned by Vaquill.",
        },
      ],
      description:
        "Date the governor (or the equivalent authority) approved the act, ISO 8601. Never an effective date: an act is usually in force on a different day, which is `effectiveDates`. Null when the publisher prints no approval date. Where the registry holds none but the publisher's own dated label on `otherDates` names the governor's signature, it is filled from that label and `approvedDateDerived` is true. The `approvedFrom` and `approvedTo` filters do NOT match a derived date: they read the registry's own approval date.",
    },
    approvedDateDerived: {
      type: "boolean",
      description:
        "True only when `approvedDate` was not held as an approval date and we filled it from a dated label printed on the act (today South Dakota's `Signed by the Governor`, listed under `otherDates`), on an act whose `enactmentOutcome` is `signed` or `line_item_veto`. False when `approvedDate` is null or is the registry's own. We never read a `presented` or `passed` date as an approval, nor a signing label on an act that became law without signature.",
    },
    effectiveFirst: {
      anyOf: [
        {
          type: "string",
          format: "date",
          description: "effectiveFirst returned by Vaquill.",
        },
        {
          type: "null",
          description: "effectiveFirst returned by Vaquill.",
        },
      ],
      description:
        "Earliest of the act's effective dates we hold. Null when we hold none: a date the publisher does not print, or prints as a relative rule (`the day following final enactment`), is not guessed. The full list is `effectiveDates` on `GET /us/session-laws/{sessionLawId}`.",
    },
    effectiveLast: {
      anyOf: [
        {
          type: "string",
          format: "date",
          description: "effectiveLast returned by Vaquill.",
        },
        {
          type: "null",
          description: "effectiveLast returned by Vaquill.",
        },
      ],
      description:
        "Latest of the act's effective dates we hold. Equal to `effectiveFirst` for an act with one date; null when we hold none.",
    },
    enactmentOutcome: {
      type: "string",
      description:
        "How the measure became, or failed to become, law. `signed`; `became_law_without_signature`; `veto_overridden`; `line_item_veto` (signed with some items vetoed); `vetoed` and `pocket_veto` (not law); `not_presented` (no governor action recorded, usual for resolutions); `approved_by_voters`; `unknown` (the publisher does not say).",
    },
    isLaw: {
      anyOf: [
        {
          type: "boolean",
          description: "isLaw returned by Vaquill.",
        },
        {
          type: "null",
          description: "isLaw returned by Vaquill.",
        },
      ],
      description:
        "True for an act that is law. False for a numbered measure that is not: a vetoed bill, a pocket veto. Null when `enactmentOutcome` does not settle it (`not_presented`, `unknown`).",
    },
    textStatus: {
      type: "string",
      enum: ["held", "withheld", "not_held", "pending"],
      description:
        "Whether we serve this law's text. `held`: the text is served by `/us/session-laws/{sessionLawId}/body`. `withheld`: we hold the text but a measured defect keeps it from being served, and `withheldReason` says what. `not_held`: we know the act exists and do not hold its text. `pending`: collected and not yet verified.",
    },
    withheldReason: {
      anyOf: [
        {
          type: "string",
          description: "withheldReason returned by Vaquill.",
        },
        {
          type: "null",
          description: "withheldReason returned by Vaquill.",
        },
      ],
      description:
        "Present only when `textStatus` is `withheld`: a plain sentence saying what is wrong with the text we hold and what would release it. Free text, not an enum: show it, do not branch on it. The record itself (dates, sources, title) is still served and still correct.",
    },
    charCount: {
      anyOf: [
        {
          type: "integer",
          description: "charCount returned by Vaquill.",
        },
        {
          type: "null",
          description: "charCount returned by Vaquill.",
        },
      ],
      description:
        "Length of the law's full text in characters, the same as `totalChars` on the body. Null when there is no text. It is reported for a withheld law too (a fact about the text we hold), though that text is not served.",
    },
    estimatedBodyPages: {
      anyOf: [
        {
          type: "integer",
          description: "estimatedBodyPages returned by Vaquill.",
        },
        {
          type: "null",
          description: "estimatedBodyPages returned by Vaquill.",
        },
      ],
      description:
        "How many body pages the text takes: `charCount` divided by the page size (30,000 characters), rounded up. Pages are cut back to a paragraph break, so a long act can run a few percent over. Null unless `textStatus` is `held`: there is nothing to read. Reading a whole law costs `estimatedBodyPages` times the price of one body page (6 credits per page on `GET /us/session-laws/{sessionLawId}/body`). Ohio's 2025 budget act (HB 96) is 9,571,132 characters, about 320 pages or 1,920 credits to read in full; most acts are a page or two.",
    },
    textSha256: {
      anyOf: [
        {
          type: "string",
          description: "textSha256 returned by Vaquill.",
        },
        {
          type: "null",
          description: "textSha256 returned by Vaquill.",
        },
      ],
      description:
        "SHA-256 (hex) of the full text of this law. It changes only when the text does, so it is the cheap way to tell whether a copy you hold is current. Body pages carry the same value.",
    },
    versionNo: {
      anyOf: [
        {
          type: "integer",
          description: "versionNo returned by Vaquill.",
        },
        {
          type: "null",
          description: "versionNo returned by Vaquill.",
        },
      ],
      description:
        "Revision counter of our record of this law: 1 for the first collection, higher after a re-collection changed the text or the metadata. Not a legislative version.",
    },
    amendatoryMarkup: {
      anyOf: [
        {
          type: "string",
          description: "amendatoryMarkup returned by Vaquill.",
        },
        {
          type: "null",
          description: "amendatoryMarkup returned by Vaquill.",
        },
      ],
      description:
        "Whether the language an amending act strikes and inserts survives in the text. `preserved`: it is in `text`, in the convention `markupConvention` names. `lost`: the publisher printed it and our text does not keep it, so deleted words can read as law: check the source before quoting. `absent`: the act carries no such markup that we found. `not_applicable`: there is no text to carry it.",
    },
    markupConvention: {
      anyOf: [
        {
          type: "string",
          description: "markupConvention returned by Vaquill.",
        },
        {
          type: "null",
          description: "markupConvention returned by Vaquill.",
        },
      ],
      description:
        "How preserved markup is written, set only when `amendatoryMarkup` is `preserved`. `wdiff`: deleted language is `[-like this-]` and inserted language `{+like this+}`. `publisher_literal`: the publisher's own words are left as printed (Minnesota prints `new text begin` / `new text end` and `deleted text begin` / `deleted text end` markers). `mixed`: both in one text.",
    },
    documentKind: {
      anyOf: [
        {
          type: "string",
          description: "documentKind returned by Vaquill.",
        },
        {
          type: "null",
          description: "documentKind returned by Vaquill.",
        },
      ],
      description:
        "What kind of document the text was taken from: `session_law_print` (the publisher's printed chapter), `enrolled_bill`, `slip_law`, `volume_extract` (carved out of a bound volume) or `other`. An open list. Null when there is no text.",
    },
    identityConfidence: {
      type: "string",
      description:
        "How firmly the law's identity (session and number) is established. `single_source`: read from one publisher source, which is every state law at launch. `confirmed`: agreed by a second independent source, the level at which a `lawId` can be minted. `inferred`: derived by us rather than printed. `disputed`: sources disagree. The `sessionLawId` is the same at every level.",
    },
    licenseNote: {
      anyOf: [
        {
          type: "string",
          description: "licenseNote returned by Vaquill.",
        },
        {
          type: "null",
          description: "licenseNote returned by Vaquill.",
        },
      ],
      description:
        "What the law's licence class is and what it means for reuse, in a plain sentence: `Government public: published by a government body with no restrictive terms, so the text may be reused, including commercially.` Every law served with text is of a class that permits reuse; a note saying otherwise describes a record whose text is held back. Free text to show, not an enum to branch on: branch on `textStatus`.",
    },
    updatedAt: {
      anyOf: [
        {
          type: "string",
          description: "updatedAt returned by Vaquill.",
        },
        {
          type: "null",
          description: "updatedAt returned by Vaquill.",
        },
      ],
      description:
        "When this law's record last changed in our registry, ISO 8601 UTC with a `+00:00` offset, the same form as the statutes routes. Use it with `updatedSince` on the list to sync only what changed.",
    },
    citationAsPrinted: {
      anyOf: [
        {
          type: "string",
          description: "citationAsPrinted returned by Vaquill.",
        },
        {
          type: "null",
          description: "citationAsPrinted returned by Vaquill.",
        },
      ],
      description: "The citation exactly as the publisher prints it. Null when none is printed.",
    },
    vetoStatusAsPrinted: {
      anyOf: [
        {
          type: "string",
          description: "vetoStatusAsPrinted returned by Vaquill.",
        },
        {
          type: "null",
          description: "vetoStatusAsPrinted returned by Vaquill.",
        },
      ],
      description:
        "The publisher's own words on the governor's action. `enactmentOutcome` is our normalised reading of it.",
    },
    pageCount: {
      anyOf: [
        {
          type: "integer",
          description: "pageCount returned by Vaquill.",
        },
        {
          type: "null",
          description: "pageCount returned by Vaquill.",
        },
      ],
      description: "Pages in the source document when it is a PDF. Null for HTML sources.",
    },
    sourceUrl: {
      anyOf: [
        {
          type: "string",
          description: "sourceUrl returned by Vaquill.",
        },
        {
          type: "null",
          description: "sourceUrl returned by Vaquill.",
        },
      ],
      description:
        "The official page or file the act's text was collected from, on a government publisher's host: the first `sources` entry whose `role` is `text` and whose `hostClass` is `gov`. Open it to verify the text against the publisher. Null when we hold no such source (a law we know exists and have not collected) or when the text source is not a government host. Present on a withheld law too: the official copy is always where to go when we hold the text back.",
    },
    effectiveDates: {
      items: {
        type: "object",
        description: "One printed date on a session law.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "Every effective date the publisher prints for the act, in printed order. Always a list, never null; empty when none is held. Empty does NOT mean the act is not in force: a date printed as a rule (`the day following final enactment`) or not printed in the publisher's metadata is not guessed, and the approval date is never substituted for it. An act can take effect in parts, so a date may carry a `scopeAsPrinted`.",
    },
    otherDates: {
      items: {
        type: "object",
        description: "One printed date on a session law.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "Every other date printed on the act, each with its `kind`: the approval date, filing dates and the publisher's own milestones (presentment to the governor).",
    },
    codeSectionsAffected: {
      items: {
        type: "object",
        description: "A code section the publisher lists the act as affecting.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "The code sections the publisher's own table lists the act as affecting, as printed. Always a list. Empty when the publisher prints no such table, which is common: the title still names sections in prose. We do not read sections out of the act text into this list.",
    },
    sources: {
      items: {
        type: "object",
        description: "A document the record was collected from.",
        additionalProperties: true,
        properties: {},
      },
      type: "array",
      description:
        "The publisher documents the record was collected from, with the hash and fetch time of each: the audit trail from this response back to the official copy.",
    },
    publisher: {
      anyOf: [
        {
          type: "object",
          description:
            "What the publisher itself printed or published about an act, beyond the record's dates and citation.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "publisher returned by Vaquill.",
        },
      ],
      description:
        "What the publisher itself printed or published about the act, beyond the dates and citation above: its own structured fields verbatim (`publisherFields`: the bill's action history, committees, sponsors, and vote counts where the publisher gives them), its own identifiers, the legislature number and the printed pages. Omitted, not null, when it cannot be read or we only know the act exists.",
    },
    provenance: {
      anyOf: [
        {
          type: "object",
          description: "How the text of an act was obtained, and what the collector noted about the record.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "provenance returned by Vaquill.",
        },
      ],
      description:
        "How we came by the text (the extraction method, the bound volume it was cut from) and the collector's own `caveats` on the record. Omitted, not null, when it cannot be read or we only know the act exists.",
    },
    resolvedFrom: {
      anyOf: [
        {
          type: "object",
          description: "How a citation sent in place of a `sessionLawId` was matched.",
          additionalProperties: true,
          properties: {},
        },
        {
          type: "null",
          description: "resolvedFrom returned by Vaquill.",
        },
      ],
      description:
        "Present only when your input did not match an id as sent: it says what was matched and how. Null when you sent an exact id.",
    },
  },
  {
    required: [
      "sessionLawId",
      "jurisdiction",
      "citation",
      "session",
      "series",
      "instrumentType",
      "enactmentOutcome",
      "textStatus",
      "identityConfidence",
    ],
    additionalProperties: true,
  },
);
