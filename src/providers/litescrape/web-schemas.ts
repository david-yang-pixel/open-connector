import type { DataTool } from "./shared.ts";

import { s } from "../../core/json-schema.ts";
export const webTools: DataTool[] = [
  {
    name: "web_fetch",
    path: "/api/web/fetch",
    description: "Get a web page as Markdown, HTML or plain text. This upstream API is Alpha.",
    input: s.object(
      "Fetch parameters.",
      {
        url: s.string(
          "Public HTTP(S) URL to capture, 1-8,192 characters. Include http:// or https://; bare domains are rejected. The host must be public, on port 80 or 443, without embedded credentials.",
          { minLength: 1, maxLength: 8192 },
        ),
        remove_overlay: s.nullable(s.boolean("Remove modal and cookie-banner overlays from the page.")),
        detach_invisibles: s.nullable(s.boolean("Drop display:none elements from the page.")),
        wait_for_selector: s.anyOf(
          "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
          [
            s.string(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              s.string(
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
            }),
          ],
        ),
        set_cookies: s.nullable(
          s.array(
            "POST only. 1-100 cookies in Set-Cookie syntax (name=value; Path=/; Domain=...), one line each, up to 4,096 characters.",
            s.string("set cookies value. item.", { minLength: 3, maxLength: 4096 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        user_agent: s.nullable(
          s.string(
            "User-Agent for the page request, 1-1,024 characters without control characters. Defaults to the browser's own.",
            { minLength: 1, maxLength: 1024 },
          ),
        ),
        inject_page_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in the main frame.",
            s.string("inject page script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        inject_frame_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in every frame.",
            s.string("inject frame script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        page_timeout: s.nullable(
          s.integer(
            "Seconds from 1 through 180 for page loading and browser operations. Cannot extend the total request budget set by timeout.",
            { minimum: 1, maximum: 180 },
          ),
        ),
        locale: s.nullable(
          s.string("Browser locale as a language tag, 2-64 characters. Defaults to the browser's own.", {
            minLength: 2,
            maxLength: 64,
            pattern: "^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$",
          }),
        ),
        referer: s.nullable(s.string("HTTP(S) URL sent as the Referer.", { minLength: 1, maxLength: 8192 })),
        assert_status_code: s.nullable(
          s.integer(
            "Expected origin HTTP status, 100-599. A different status is rejected; otherwise a rendered error page is a successful capture.",
            { minimum: 100, maximum: 599 },
          ),
        ),
        viewport: s.nullable(
          s.object(
            "POST only. Browser viewport; width and height are required. Default: 1280 x 1280.",
            {
              width: s.integer("Viewport width in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              height: s.integer("Viewport height in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              device_scale_factor: s.nullable(
                s.number("Device pixel ratio, greater than 0 and at most 4.", {
                  maximum: 4,
                  exclusiveMinimum: 0,
                }),
              ),
              is_mobile: s.nullable(s.boolean("Emulate a mobile device.")),
              is_landscape: s.nullable(s.boolean("Use landscape orientation.")),
              has_touch: s.nullable(s.boolean("Emulate touch support.")),
            },
            { required: ["width", "height"] },
          ),
        ),
        robots_txt: s.nullable(
          s.string(
            "User agent, 1-256 characters, to check against the site's robots.txt; disallowed URLs are rejected.",
            { minLength: 1, maxLength: 256 },
          ),
        ),
        respond_timing: s.nullable(
          s.withEnum(s.unknown("Page readiness condition to reach before responding."), [
            "html",
            "visible-content",
            "mutation-idle",
            "resource-idle",
            "media-idle",
            "network-idle",
          ]),
        ),
        respond_with: s.nullable(
          s.string(
            "Output format: content (default; main content as Markdown, or the whole page when extraction keeps too little), markdown (whole page as Markdown), html, text, frontmatter (content plus front matter), or a '+' combination such as markdown+frontmatter. For screenshots use /api/web/screenshot.",
            { minLength: 3, maxLength: 64 },
          ),
        ),
        with_links_summary: s.anyOf("true, false or all: add a links list to the response.", [
          s.boolean("true, false or all: add a links list to the response."),
          s.literal("all", {
            description: "true, false or all: add a links list to the response.",
          }),
          s.literal(null, {
            description: "true, false or all: add a links list to the response.",
          }),
        ]),
        with_images_summary: s.nullable(s.boolean("Add an images list to the response.")),
        retain_images: s.nullable(
          s.withEnum(s.unknown("Images to keep: all (default), alt (alt text only) or none."), ["none", "all", "alt"]),
        ),
        retain_links: s.nullable(
          s.withEnum(
            s.unknown(
              "Links to keep: all (default), text (link text only), none, or gpt-oss (citation format with a links summary).",
            ),
            ["none", "all", "text", "gpt-oss"],
          ),
        ),
        retain_media: s.nullable(
          s.withEnum(
            s.unknown("How video, audio and embedded video appear: none, text, link (default), image or html."),
            ["none", "text", "link", "image", "html"],
          ),
        ),
        preset: s.nullable(
          s.withEnum(s.unknown("Option preset. Fills only the options the request leaves unset."), [
            "reader",
            "index",
            "research",
            "agent",
            "spider",
          ]),
        ),
        no_gfm: s.anyOf("true, false or table: disable GitHub-flavored Markdown, or only its tables.", [
          s.boolean("true, false or table: disable GitHub-flavored Markdown, or only its tables."),
          s.literal("table", {
            description: "true, false or table: disable GitHub-flavored Markdown, or only its tables.",
          }),
          s.literal(null, {
            description: "true, false or table: disable GitHub-flavored Markdown, or only its tables.",
          }),
        ]),
        target_selector: s.anyOf(
          "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
          [
            s.string(
              "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
              s.string(
                "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
            }),
          ],
        ),
        remove_selector: s.anyOf(
          "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
          [
            s.string(
              "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
              s.string(
                "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
            }),
          ],
        ),
        keep_img_data_url: s.nullable(s.boolean("Keep inline data: images in Markdown.")),
        with_iframe: s.anyOf("true, false or quoted: include iframe content before extraction.", [
          s.boolean("true, false or quoted: include iframe content before extraction."),
          s.literal("quoted", {
            description: "true, false or quoted: include iframe content before extraction.",
          }),
          s.literal(null, {
            description: "true, false or quoted: include iframe content before extraction.",
          }),
        ]),
        with_shadow_dom: s.nullable(s.boolean("Include open shadow DOM content before extraction.")),
        engine: s.nullable(
          s.withEnum(
            s.unknown(
              "auto (default; lightweight HTTP first, a browser when needed), browser, or curl (no JavaScript).",
            ),
            ["auto", "browser", "curl"],
          ),
        ),
        token_budget: s.nullable(
          s.integer("Integer 1-10,000,000. Reject the page when its token count exceeds the budget.", {
            minimum: 1,
            maximum: 10000000,
          }),
        ),
        markdown: s.nullable(
          s.object(
            "POST only. Markdown formatting options.",
            {
              heading_style: s.nullable(
                s.withEnum(s.unknown("Markdown heading style: setext (underlined) or atx (# prefixed)."), [
                  "setext",
                  "atx",
                ]),
              ),
              hr: s.nullable(
                s.string("Markdown used for horizontal rules, 1-128 characters.", {
                  minLength: 1,
                  maxLength: 128,
                }),
              ),
              bullet_list_marker: s.nullable(s.withEnum(s.unknown("Marker for bulleted list items."), ["-", "+", "*"])),
              em_delimiter: s.nullable(s.withEnum(s.unknown("Delimiter for emphasis."), ["_", "*"])),
              strong_delimiter: s.nullable(s.withEnum(s.unknown("Delimiter for strong emphasis."), ["__", "**"])),
              link_style: s.nullable(
                s.withEnum(s.unknown("How links are written: inlined, referenced (reference-style) or discarded."), [
                  "inlined",
                  "referenced",
                  "discarded",
                ]),
              ),
              link_reference_style: s.nullable(
                s.withEnum(s.unknown("Reference format when link_style is referenced."), [
                  "full",
                  "collapsed",
                  "shortcut",
                  "discarded",
                ]),
              ),
            },
            { required: [] },
          ),
        ),
        markdown_chunking: s.nullable(
          s.withEnum(s.unknown("true, h1-h5, structured or s1-s5: split the Markdown and return chunks."), [
            "true",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "structured",
            "s1",
            "s2",
            "s3",
            "s4",
            "s5",
          ]),
        ),
        max_tokens: s.nullable(
          s.integer("Integer 500-10,000,000. Trim content to this many tokens.", {
            minimum: 500,
            maximum: 10000000,
          }),
        ),
        base: s.nullable(
          s.withEnum(
            s.unknown(
              "Resolve relative links against the requested URL (initial, default) or the final URL after redirects (final).",
            ),
            ["initial", "final"],
          ),
        ),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Fetch asynchronous parameters.",
      {
        url: s.string(
          "Public HTTP(S) URL to capture, 1-8,192 characters. Include http:// or https://; bare domains are rejected. The host must be public, on port 80 or 443, without embedded credentials.",
          { minLength: 1, maxLength: 8192 },
        ),
        remove_overlay: s.nullable(s.boolean("Remove modal and cookie-banner overlays from the page.")),
        detach_invisibles: s.nullable(s.boolean("Drop display:none elements from the page.")),
        wait_for_selector: s.anyOf(
          "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
          [
            s.string(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              s.string(
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
            }),
          ],
        ),
        set_cookies: s.nullable(
          s.array(
            "POST only. 1-100 cookies in Set-Cookie syntax (name=value; Path=/; Domain=...), one line each, up to 4,096 characters.",
            s.string("set cookies value. item.", { minLength: 3, maxLength: 4096 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        user_agent: s.nullable(
          s.string(
            "User-Agent for the page request, 1-1,024 characters without control characters. Defaults to the browser's own.",
            { minLength: 1, maxLength: 1024 },
          ),
        ),
        inject_page_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in the main frame.",
            s.string("inject page script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        inject_frame_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in every frame.",
            s.string("inject frame script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        page_timeout: s.nullable(
          s.integer(
            "Seconds from 1 through 180 for page loading and browser operations. Cannot extend the total request budget set by timeout.",
            { minimum: 1, maximum: 180 },
          ),
        ),
        locale: s.nullable(
          s.string("Browser locale as a language tag, 2-64 characters. Defaults to the browser's own.", {
            minLength: 2,
            maxLength: 64,
            pattern: "^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$",
          }),
        ),
        referer: s.nullable(s.string("HTTP(S) URL sent as the Referer.", { minLength: 1, maxLength: 8192 })),
        assert_status_code: s.nullable(
          s.integer(
            "Expected origin HTTP status, 100-599. A different status is rejected; otherwise a rendered error page is a successful capture.",
            { minimum: 100, maximum: 599 },
          ),
        ),
        viewport: s.nullable(
          s.object(
            "POST only. Browser viewport; width and height are required. Default: 1280 x 1280.",
            {
              width: s.integer("Viewport width in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              height: s.integer("Viewport height in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              device_scale_factor: s.nullable(
                s.number("Device pixel ratio, greater than 0 and at most 4.", {
                  maximum: 4,
                  exclusiveMinimum: 0,
                }),
              ),
              is_mobile: s.nullable(s.boolean("Emulate a mobile device.")),
              is_landscape: s.nullable(s.boolean("Use landscape orientation.")),
              has_touch: s.nullable(s.boolean("Emulate touch support.")),
            },
            { required: ["width", "height"] },
          ),
        ),
        robots_txt: s.nullable(
          s.string(
            "User agent, 1-256 characters, to check against the site's robots.txt; disallowed URLs are rejected.",
            { minLength: 1, maxLength: 256 },
          ),
        ),
        respond_timing: s.nullable(
          s.withEnum(s.unknown("Page readiness condition to reach before responding."), [
            "html",
            "visible-content",
            "mutation-idle",
            "resource-idle",
            "media-idle",
            "network-idle",
          ]),
        ),
        respond_with: s.nullable(
          s.string(
            "Output format: content (default; main content as Markdown, or the whole page when extraction keeps too little), markdown (whole page as Markdown), html, text, frontmatter (content plus front matter), or a '+' combination such as markdown+frontmatter. For screenshots use /api/web/screenshot.",
            { minLength: 3, maxLength: 64 },
          ),
        ),
        with_links_summary: s.anyOf("true, false or all: add a links list to the response.", [
          s.boolean("true, false or all: add a links list to the response."),
          s.literal("all", {
            description: "true, false or all: add a links list to the response.",
          }),
          s.literal(null, {
            description: "true, false or all: add a links list to the response.",
          }),
        ]),
        with_images_summary: s.nullable(s.boolean("Add an images list to the response.")),
        retain_images: s.nullable(
          s.withEnum(s.unknown("Images to keep: all (default), alt (alt text only) or none."), ["none", "all", "alt"]),
        ),
        retain_links: s.nullable(
          s.withEnum(
            s.unknown(
              "Links to keep: all (default), text (link text only), none, or gpt-oss (citation format with a links summary).",
            ),
            ["none", "all", "text", "gpt-oss"],
          ),
        ),
        retain_media: s.nullable(
          s.withEnum(
            s.unknown("How video, audio and embedded video appear: none, text, link (default), image or html."),
            ["none", "text", "link", "image", "html"],
          ),
        ),
        preset: s.nullable(
          s.withEnum(s.unknown("Option preset. Fills only the options the request leaves unset."), [
            "reader",
            "index",
            "research",
            "agent",
            "spider",
          ]),
        ),
        no_gfm: s.anyOf("true, false or table: disable GitHub-flavored Markdown, or only its tables.", [
          s.boolean("true, false or table: disable GitHub-flavored Markdown, or only its tables."),
          s.literal("table", {
            description: "true, false or table: disable GitHub-flavored Markdown, or only its tables.",
          }),
          s.literal(null, {
            description: "true, false or table: disable GitHub-flavored Markdown, or only its tables.",
          }),
        ]),
        target_selector: s.anyOf(
          "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
          [
            s.string(
              "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
              s.string(
                "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector to extract, 1-2,048 characters; POST also accepts a list of 1-16 selectors. Implies waiting for the selector. Match-all selectors are rejected.",
            }),
          ],
        ),
        remove_selector: s.anyOf(
          "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
          [
            s.string(
              "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
              s.string(
                "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector removed before extraction, 1-2,048 characters; POST also accepts a list of 1-16 selectors.",
            }),
          ],
        ),
        keep_img_data_url: s.nullable(s.boolean("Keep inline data: images in Markdown.")),
        with_iframe: s.anyOf("true, false or quoted: include iframe content before extraction.", [
          s.boolean("true, false or quoted: include iframe content before extraction."),
          s.literal("quoted", {
            description: "true, false or quoted: include iframe content before extraction.",
          }),
          s.literal(null, {
            description: "true, false or quoted: include iframe content before extraction.",
          }),
        ]),
        with_shadow_dom: s.nullable(s.boolean("Include open shadow DOM content before extraction.")),
        engine: s.nullable(
          s.withEnum(
            s.unknown(
              "auto (default; lightweight HTTP first, a browser when needed), browser, or curl (no JavaScript).",
            ),
            ["auto", "browser", "curl"],
          ),
        ),
        token_budget: s.nullable(
          s.integer("Integer 1-10,000,000. Reject the page when its token count exceeds the budget.", {
            minimum: 1,
            maximum: 10000000,
          }),
        ),
        markdown: s.nullable(
          s.object(
            "POST only. Markdown formatting options.",
            {
              heading_style: s.nullable(
                s.withEnum(s.unknown("Markdown heading style: setext (underlined) or atx (# prefixed)."), [
                  "setext",
                  "atx",
                ]),
              ),
              hr: s.nullable(
                s.string("Markdown used for horizontal rules, 1-128 characters.", {
                  minLength: 1,
                  maxLength: 128,
                }),
              ),
              bullet_list_marker: s.nullable(s.withEnum(s.unknown("Marker for bulleted list items."), ["-", "+", "*"])),
              em_delimiter: s.nullable(s.withEnum(s.unknown("Delimiter for emphasis."), ["_", "*"])),
              strong_delimiter: s.nullable(s.withEnum(s.unknown("Delimiter for strong emphasis."), ["__", "**"])),
              link_style: s.nullable(
                s.withEnum(s.unknown("How links are written: inlined, referenced (reference-style) or discarded."), [
                  "inlined",
                  "referenced",
                  "discarded",
                ]),
              ),
              link_reference_style: s.nullable(
                s.withEnum(s.unknown("Reference format when link_style is referenced."), [
                  "full",
                  "collapsed",
                  "shortcut",
                  "discarded",
                ]),
              ),
            },
            { required: [] },
          ),
        ),
        markdown_chunking: s.nullable(
          s.withEnum(s.unknown("true, h1-h5, structured or s1-s5: split the Markdown and return chunks."), [
            "true",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "structured",
            "s1",
            "s2",
            "s3",
            "s4",
            "s5",
          ]),
        ),
        max_tokens: s.nullable(
          s.integer("Integer 500-10,000,000. Trim content to this many tokens.", {
            minimum: 500,
            maximum: 10000000,
          }),
        ),
        base: s.nullable(
          s.withEnum(
            s.unknown(
              "Resolve relative links against the requested URL (initial, default) or the final URL after redirects (final).",
            ),
            ["initial", "final"],
          ),
        ),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Fetch response.", {
      url: s.string("url value."),
      title: s.nullable(s.string("title value.")),
      description: s.nullable(s.string("description value.")),
      content: s.nullable(s.string("content value.")),
      html: s.nullable(s.string("html value.")),
      text: s.nullable(s.string("text value.")),
      markdown: s.nullable(s.string("markdown value.")),
      published_time: s.nullable(s.string("published time value.")),
      num_pages: s.nullable(s.integer("num pages value.")),
      warning: s.nullable(s.string("warning value.")),
      images: s.anyOf("images value.", [
        s.looseObject("images value.", {}),
        s.array("images value.", s.unknown("images value. item.")),
        s.literal(null, {
          description: "images value.",
        }),
      ]),
      links: s.anyOf("links value.", [
        s.looseObject("links value.", {}),
        s.array("links value.", s.unknown("links value. item.")),
        s.literal(null, {
          description: "links value.",
        }),
      ]),
      usage: s.nullable(s.looseObject("usage value.", {})),
      metadata: s.nullable(s.looseObject("metadata value.", {})),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
  {
    name: "web_screenshot",
    path: "/api/web/screenshot",
    description: "Take a screenshot of a web page. This upstream API is Alpha.",
    input: s.object(
      "Screenshot parameters.",
      {
        url: s.string(
          "Public HTTP(S) URL to capture, 1-8,192 characters. Include http:// or https://; bare domains are rejected. The host must be public, on port 80 or 443, without embedded credentials.",
          { minLength: 1, maxLength: 8192 },
        ),
        remove_overlay: s.nullable(s.boolean("Remove modal and cookie-banner overlays from the page.")),
        detach_invisibles: s.nullable(s.boolean("Drop display:none elements from the page.")),
        wait_for_selector: s.anyOf(
          "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
          [
            s.string(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              s.string(
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
            }),
          ],
        ),
        set_cookies: s.nullable(
          s.array(
            "POST only. 1-100 cookies in Set-Cookie syntax (name=value; Path=/; Domain=...), one line each, up to 4,096 characters.",
            s.string("set cookies value. item.", { minLength: 3, maxLength: 4096 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        user_agent: s.nullable(
          s.string(
            "User-Agent for the page request, 1-1,024 characters without control characters. Defaults to the browser's own.",
            { minLength: 1, maxLength: 1024 },
          ),
        ),
        inject_page_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in the main frame.",
            s.string("inject page script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        inject_frame_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in every frame.",
            s.string("inject frame script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        page_timeout: s.nullable(
          s.integer(
            "Seconds from 1 through 180 for page loading and browser operations. Cannot extend the total request budget set by timeout.",
            { minimum: 1, maximum: 180 },
          ),
        ),
        locale: s.nullable(
          s.string("Browser locale as a language tag, 2-64 characters. Defaults to the browser's own.", {
            minLength: 2,
            maxLength: 64,
            pattern: "^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$",
          }),
        ),
        referer: s.nullable(s.string("HTTP(S) URL sent as the Referer.", { minLength: 1, maxLength: 8192 })),
        assert_status_code: s.nullable(
          s.integer(
            "Expected origin HTTP status, 100-599. A different status is rejected; otherwise a rendered error page is a successful capture.",
            { minimum: 100, maximum: 599 },
          ),
        ),
        viewport: s.nullable(
          s.object(
            "POST only. Browser viewport; width and height are required. Default: 1280 x 1280.",
            {
              width: s.integer("Viewport width in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              height: s.integer("Viewport height in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              device_scale_factor: s.nullable(
                s.number("Device pixel ratio, greater than 0 and at most 4.", {
                  maximum: 4,
                  exclusiveMinimum: 0,
                }),
              ),
              is_mobile: s.nullable(s.boolean("Emulate a mobile device.")),
              is_landscape: s.nullable(s.boolean("Use landscape orientation.")),
              has_touch: s.nullable(s.boolean("Emulate touch support.")),
            },
            { required: ["width", "height"] },
          ),
        ),
        robots_txt: s.nullable(
          s.string(
            "User agent, 1-256 characters, to check against the site's robots.txt; disallowed URLs are rejected.",
            { minLength: 1, maxLength: 256 },
          ),
        ),
        respond_timing: s.nullable(
          s.withEnum(s.unknown("Page readiness condition to reach before responding."), [
            "html",
            "visible-content",
            "mutation-idle",
            "resource-idle",
            "media-idle",
            "network-idle",
          ]),
        ),
        full_page: s.boolean("Capture the full page when true. The default, false, captures the viewport."),
      },
      { required: ["url"] },
    ),
    asyncInput: s.object(
      "Screenshot asynchronous parameters.",
      {
        url: s.string(
          "Public HTTP(S) URL to capture, 1-8,192 characters. Include http:// or https://; bare domains are rejected. The host must be public, on port 80 or 443, without embedded credentials.",
          { minLength: 1, maxLength: 8192 },
        ),
        remove_overlay: s.nullable(s.boolean("Remove modal and cookie-banner overlays from the page.")),
        detach_invisibles: s.nullable(s.boolean("Drop display:none elements from the page.")),
        wait_for_selector: s.anyOf(
          "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
          [
            s.string(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              { minLength: 1, maxLength: 2048 },
            ),
            s.array(
              "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
              s.string(
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors. item.",
                { minLength: 1, maxLength: 2048 },
              ),
              { minItems: 1, maxItems: 16 },
            ),
            s.literal(null, {
              description:
                "CSS selector to wait for after navigation, 1-2,048 characters. POST also accepts a list of 1-16 selectors.",
            }),
          ],
        ),
        set_cookies: s.nullable(
          s.array(
            "POST only. 1-100 cookies in Set-Cookie syntax (name=value; Path=/; Domain=...), one line each, up to 4,096 characters.",
            s.string("set cookies value. item.", { minLength: 3, maxLength: 4096 }),
            { minItems: 1, maxItems: 100 },
          ),
        ),
        user_agent: s.nullable(
          s.string(
            "User-Agent for the page request, 1-1,024 characters without control characters. Defaults to the browser's own.",
            { minLength: 1, maxLength: 1024 },
          ),
        ),
        inject_page_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in the main frame.",
            s.string("inject page script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        inject_frame_script: s.nullable(
          s.array(
            "POST only. 1-8 scripts (source, or a URL to a script), up to 8,192 characters each, run in every frame.",
            s.string("inject frame script value. item.", { minLength: 1, maxLength: 8192 }),
            { minItems: 1, maxItems: 8 },
          ),
        ),
        page_timeout: s.nullable(
          s.integer(
            "Seconds from 1 through 180 for page loading and browser operations. Cannot extend the total request budget set by timeout.",
            { minimum: 1, maximum: 180 },
          ),
        ),
        locale: s.nullable(
          s.string("Browser locale as a language tag, 2-64 characters. Defaults to the browser's own.", {
            minLength: 2,
            maxLength: 64,
            pattern: "^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$",
          }),
        ),
        referer: s.nullable(s.string("HTTP(S) URL sent as the Referer.", { minLength: 1, maxLength: 8192 })),
        assert_status_code: s.nullable(
          s.integer(
            "Expected origin HTTP status, 100-599. A different status is rejected; otherwise a rendered error page is a successful capture.",
            { minimum: 100, maximum: 599 },
          ),
        ),
        viewport: s.nullable(
          s.object(
            "POST only. Browser viewport; width and height are required. Default: 1280 x 1280.",
            {
              width: s.integer("Viewport width in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              height: s.integer("Viewport height in CSS pixels, 1-4,096. Required.", {
                minimum: 1,
                maximum: 4096,
              }),
              device_scale_factor: s.nullable(
                s.number("Device pixel ratio, greater than 0 and at most 4.", {
                  maximum: 4,
                  exclusiveMinimum: 0,
                }),
              ),
              is_mobile: s.nullable(s.boolean("Emulate a mobile device.")),
              is_landscape: s.nullable(s.boolean("Use landscape orientation.")),
              has_touch: s.nullable(s.boolean("Emulate touch support.")),
            },
            { required: ["width", "height"] },
          ),
        ),
        robots_txt: s.nullable(
          s.string(
            "User agent, 1-256 characters, to check against the site's robots.txt; disallowed URLs are rejected.",
            { minLength: 1, maxLength: 256 },
          ),
        ),
        respond_timing: s.nullable(
          s.withEnum(s.unknown("Page readiness condition to reach before responding."), [
            "html",
            "visible-content",
            "mutation-idle",
            "resource-idle",
            "media-idle",
            "network-idle",
          ]),
        ),
        full_page: s.boolean("Capture the full page when true. The default, false, captures the viewport."),
        timeout: s.number(
          "Execution budget in seconds for each attempt. Queue and retry backoff time do not consume it. Supply once, in the JSON body or query string.",
          { maximum: 90, exclusiveMinimum: 0 },
        ),
      },
      { required: ["url"] },
    ),
    output: s.looseObject("Screenshot response.", {
      url: s.string("url value."),
      title: s.nullable(s.string("title value.")),
      description: s.nullable(s.string("description value.")),
      full_page: s.boolean("full page value."),
      submit_feedback_for_this_response_here: s.string("Optional URL for submitting feedback about this result.", {
        format: "uri",
      }),
    }),
  },
];
