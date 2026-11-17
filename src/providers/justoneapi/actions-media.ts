import type { JustoneapiEndpoint } from "./endpoint-definition.ts";

import { s } from "../../core/json-schema.ts";

const imdbLanguageCountry = s.withDefault(
  s.withEnum(
    s.string(
      "Language and country preferences.\n\nAvailable Values:\n- `en_US`: English (US)\n- `fr_CA`: French (Canada)\n- `fr_FR`: French (France)\n- `de_DE`: German (Germany)\n- `hi_IN`: Hindi (India)\n- `it_IT`: Italian (Italy)\n- `pt_BR`: Portuguese (Brazil)\n- `es_ES`: Spanish (Spain)\n- `es_US`: Spanish (US)\n- `es_MX`: Spanish (Mexico)",
    ),
    ["en_US", "fr_CA", "fr_FR", "de_DE", "hi_IN", "it_IT", "pt_BR", "es_ES", "es_US", "es_MX"],
  ),
  "en_US",
);

export const mediaEndpoints: readonly JustoneapiEndpoint[] = [
  {
    name: "douban_movie_movie_reviews",
    method: "GET",
    path: "/api/douban/get-movie-reviews/v1",
    authLocation: "query",
    description:
      "Retrieves paginated Douban long-form reviews for a movie or TV subject, ordered by time or popularity. Use it to browse in-depth audience reviews for a known subject.",
    inputSchema: s.object(
      "Input for Douban Movie Movie Reviews.",
      {
        subjectId: s.string("The unique ID for a movie or TV subject on Douban.", { minLength: 1 }),
        sort: s.withDefault(
          s.withEnum(
            s.string("Sort order for the result set.\n\nAvailable Values:\n- `time`: Time\n- `hotest`: Hotest"),
            ["time", "hotest"],
          ),
          "time",
        ),
        page: s.integer("Page number for pagination.", { default: 1 }),
      },
      { required: ["subjectId"] },
    ),
  },
  {
    name: "douban_movie_review_details",
    method: "GET",
    path: "/api/douban/get-movie-review-detail/v1",
    authLocation: "query",
    description:
      "Retrieves a single Douban long-form review by its review ID. Use it to inspect a known review after discovering it in a subject's review list.",
    inputSchema: s.object(
      "Input for Douban Movie Review Details.",
      {
        reviewId: s.string("The unique ID for a specific review on Douban.", { minLength: 1 }),
      },
      { required: ["reviewId"] },
    ),
  },
  {
    name: "douban_movie_subject_details",
    method: "GET",
    path: "/api/douban/get-subject-detail/v1",
    authLocation: "query",
    description:
      "Retrieves the public detail page data for a Douban movie or TV subject by subject ID. Use it to inspect a known title before requesting its reviews or comments.",
    inputSchema: s.object(
      "Input for Douban Movie Subject Details.",
      {
        subjectId: s.string("The unique ID for a movie or TV subject on Douban.", { minLength: 1 }),
      },
      { required: ["subjectId"] },
    ),
  },
  {
    name: "douban_movie_comments",
    method: "GET",
    path: "/api/douban/get-movie-comments/v1",
    authLocation: "query",
    description:
      "Retrieves paginated Douban short comments for a movie or TV subject, ordered by time or newest rating. Use it to review concise audience feedback for a known subject.",
    inputSchema: s.object(
      "Input for Douban Movie Comments.",
      {
        subjectId: s.string("The unique ID for a movie or TV subject on Douban.", { minLength: 1 }),
        sort: s.withDefault(
          s.withEnum(
            s.string("Sort order for the result set.\n\nAvailable Values:\n- `time`: Time\n- `new_score`: New Score"),
            ["time", "new_score"],
          ),
          "time",
        ),
        page: s.integer("Page number for pagination.", { default: 1 }),
      },
      { required: ["subjectId"] },
    ),
  },
  {
    name: "douban_movie_recent_hot_movie",
    method: "GET",
    path: "/api/douban/get-recent-hot-movie/v1",
    authLocation: "query",
    description:
      "Retrieves a paginated list of movies currently featured in Douban's recent-hot collection. Use it to discover popular movie titles and continue through result pages.",
    inputSchema: s.object(
      "Input for Douban Movie Recent Hot Movie.",
      {
        page: s.integer("Page number for pagination.", { default: 1 }),
      },
      { required: [] },
    ),
  },
  {
    name: "douban_movie_recent_hot_tv",
    method: "GET",
    path: "/api/douban/get-recent-hot-tv/v1",
    authLocation: "query",
    description:
      "Retrieves a paginated list of TV titles currently featured in Douban's recent-hot collection. Use it to discover popular series and continue through result pages.",
    inputSchema: s.object(
      "Input for Douban Movie Recent Hot Tv.",
      {
        page: s.integer("Page number for pagination.", { default: 1 }),
      },
      { required: [] },
    ),
  },
  {
    name: "youku_video_search",
    method: "GET",
    path: "/api/youku/search-video/v1",
    authLocation: "query",
    description:
      "Searches Youku videos by keyword with page-based pagination. Use it to discover videos related to a topic, title, creator, or other search term.",
    inputSchema: s.object(
      "Input for YOUKU Video Search.",
      {
        keyword: s.string("Keyword to search for.", { minLength: 1 }),
        page: s.integer("Page number for pagination, starting from 1.", { default: 1 }),
      },
      { required: ["keyword"] },
    ),
  },
  {
    name: "youku_video_details",
    method: "GET",
    path: "/api/youku/get-video-detail/v1",
    authLocation: "query",
    description:
      "Retrieves details for a Youku video identified by video ID. Use it to look up a known video for content review, cataloging, or subsequent video analysis.",
    inputSchema: s.object(
      "Input for YOUKU Video Details.",
      {
        videoId: s.string("The unique identifier for the video.", { minLength: 1 }),
      },
      { required: ["videoId"] },
    ),
  },
  {
    name: "youku_user_profile",
    method: "GET",
    path: "/api/youku/get-user-detail/v1",
    authLocation: "query",
    description:
      "Retrieves a Youku user profile identified by UID. Use it to look up a known account for creator research, profile review, or related video discovery.",
    inputSchema: s.object(
      "Input for YOUKU User Profile.",
      {
        uid: s.string("The unique identifier for the user.", { minLength: 1 }),
      },
      { required: ["uid"] },
    ),
  },
  {
    name: "imdb_release_expectation",
    method: "GET",
    path: "/api/imdb/title-release-expectation-query/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb release-expectation information for a title ID using selected language and country preferences. Use it to monitor a title's release context or support release-planning research.",
    inputSchema: s.object(
      "Input for IMDb Release Expectation.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_extended_details",
    method: "GET",
    path: "/api/imdb/title-extended-details-query/v1",
    authLocation: "query",
    description:
      "Retrieves extended IMDb details for a title ID using selected language and country preferences. Use it to enrich a title catalog or perform deeper research after a basic lookup.",
    inputSchema: s.object(
      "Input for IMDb Extended Details.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_top_cast_and_crew",
    method: "GET",
    path: "/api/imdb/title-top-cast-and-crew/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb top cast and crew information for a title ID using selected language and country preferences. Use it to research principal talent or enrich title credits.",
    inputSchema: s.object(
      "Input for IMDb Top Cast and Crew.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_base_info",
    method: "GET",
    path: "/api/imdb/title-base-query/v1",
    authLocation: "query",
    description:
      "Retrieves base IMDb information for a title ID using selected language and country preferences. Use it to perform a lightweight title lookup or populate basic catalog context.",
    inputSchema: s.object(
      "Input for IMDb Base Info.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_redux_overview",
    method: "GET",
    path: "/api/imdb/title-redux-overview-query/v1",
    authLocation: "query",
    description:
      "Retrieves the IMDb Redux overview for a title ID using selected language and country preferences. Use it to obtain a consolidated title overview for catalog review or content research.",
    inputSchema: s.object(
      "Input for IMDb Redux Overview.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_did_you_know_insights",
    method: "GET",
    path: "/api/imdb/title-did-you-know-query/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb 'Did You Know' information for a title ID using selected language and country preferences. Use it to research title trivia and add editorial context.",
    inputSchema: s.object(
      "Input for IMDb 'Did You Know' Insights.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_critics_review_summary",
    method: "GET",
    path: "/api/imdb/title-critics-review-summary-query/v1",
    authLocation: "query",
    description:
      "Retrieves the IMDb critics-review summary for a title ID using selected language and country preferences. Use it to review critical reception or compare titles during research.",
    inputSchema: s.object(
      "Input for IMDb Critics Review Summary.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_awards_summary",
    method: "GET",
    path: "/api/imdb/title-awards-summary-query/v1",
    authLocation: "query",
    description:
      "Retrieves the IMDb awards summary for a title ID using selected language and country preferences. Use it to research a title's awards record or support awards-focused catalog review.",
    inputSchema: s.object(
      "Input for IMDb Awards Summary.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_user_reviews_summary",
    method: "GET",
    path: "/api/imdb/title-user-reviews-summary-query/v1",
    authLocation: "query",
    description:
      "Retrieves the IMDb user-reviews summary for a title ID using selected language and country preferences. Use it to review audience reception or support title comparison and research.",
    inputSchema: s.object(
      "Input for IMDb User Reviews Summary.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_plot_summary",
    method: "GET",
    path: "/api/imdb/title-plot-query/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb plot information for a title ID using selected language and country preferences. Use it to review a movie or series storyline or enrich title descriptions.",
    inputSchema: s.object(
      "Input for IMDb Plot Summary.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_contribution_questions",
    method: "GET",
    path: "/api/imdb/title-contribution-questions/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb contribution questions associated with a title ID using selected language and country preferences. Use it to review available prompts for title-data contribution workflows.",
    inputSchema: s.object(
      "Input for IMDb Contribution Questions.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_details",
    method: "GET",
    path: "/api/imdb/title-details-query/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb title details for a title ID using selected language and country preferences. Use it to support detailed title research or enrich a movie and television catalog.",
    inputSchema: s.object(
      "Input for IMDb Details.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_box_office_summary",
    method: "GET",
    path: "/api/imdb/title-box-office-summary/v1",
    authLocation: "query",
    description:
      "Retrieves the IMDb box-office summary for a title ID using selected language and country preferences. Use it to research reported theatrical performance or compare titles.",
    inputSchema: s.object(
      "Input for IMDb Box Office Summary.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_recommendations",
    method: "GET",
    path: "/api/imdb/title-more-like-this-query/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb titles similar to a specified title ID using selected language and country preferences. Use it to support related-title discovery, recommendations, or catalog curation.",
    inputSchema: s.object(
      "Input for IMDb Recommendations.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "imdb_streaming_picks",
    method: "GET",
    path: "/api/imdb/streaming-picks-query/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb streaming picks for Prime Video using selected language and country preferences. Use it to explore streaming titles for discovery, catalog review, or watchlist research.",
    inputSchema: s.object(
      "Input for IMDb Streaming Picks.",
      {
        languageCountry: imdbLanguageCountry,
      },
      { required: [] },
    ),
  },
  {
    name: "imdb_news_by_category",
    method: "GET",
    path: "/api/imdb/news-by-category-query/v1",
    authLocation: "query",
    description:
      "Retrieves IMDb news for a selected top, movie, TV, or celebrity category using language and country preferences. Use it to monitor entertainment news or research a specific category.",
    inputSchema: s.object(
      "Input for IMDb News by Category.",
      {
        category: s.withEnum(
          s.string(
            "News category to filter by.\n\nAvailable Values:\n- `TOP`: Top News\n- `MOVIE`: Movie News\n- `TV`: TV News\n- `CELEBRITY`: Celebrity News",
            { minLength: 1 },
          ),
          ["TOP", "MOVIE", "TV", "CELEBRITY"],
        ),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["category"] },
    ),
  },
  {
    name: "imdb_chart_rankings",
    method: "GET",
    path: "/api/imdb/title-chart-rankings/v1",
    authLocation: "query",
    description:
      "Retrieves the IMDb Top 250 movie or TV chart selected by ranking type using language and country preferences. Use it to monitor chart positions or compare highly ranked titles.",
    inputSchema: s.object(
      "Input for IMDb Chart Rankings.",
      {
        rankingsChartType: s.withEnum(
          s.string(
            "Type of rankings chart to retrieve.\n\nAvailable Values:\n- `TOP_250`: Top 250 Movies\n- `TOP_250_TV`: Top 250 TV Shows",
            { minLength: 1 },
          ),
          ["TOP_250", "TOP_250_TV"],
        ),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["rankingsChartType"] },
    ),
  },
  {
    name: "imdb_countries_of_origin",
    method: "GET",
    path: "/api/imdb/title-countries-of-origin/v1",
    authLocation: "query",
    description:
      "Retrieves countries of origin associated with an IMDb title ID using selected language and country preferences. Use it to enrich regional catalog metadata or support origin-based analysis.",
    inputSchema: s.object(
      "Input for IMDb Countries of Origin.",
      {
        id: s.string("The IMDb title identifier in tt<digits> format.", { minLength: 1 }),
        languageCountry: imdbLanguageCountry,
      },
      { required: ["id"] },
    ),
  },
  {
    name: "vcg_image_search",
    method: "GET",
    path: "/api/vcg/search-image/v1",
    authLocation: "query",
    description:
      "Searches VCG images by keyword with page controls, resource ID exclusions, and an optional 500px Select/Prime filter excluding AIGC. Use full image details for collection or candidate_ids for single-page ID inspection.",
    inputSchema: s.object(
      "Input for VCG Image Search.",
      {
        keyword: s.string("Image search keyword, up to 200 characters without control characters.", {
          maxLength: 200,
          minLength: 1,
        }),
        limit: s.integer("Maximum number of unique images to return, excluding the supplied resource IDs.", {
          maximum: 10000,
          minimum: 1,
        }),
        startPage: s.integer(
          "First page to search, starting from 1. For continuation, use the next page returned by the previous request.",
          { maximum: 10000, minimum: 1 },
        ),
        maxPages: s.integer(
          "Maximum number of pages to visit in this request. The last requested page must not exceed 10000.",
          { maximum: 100, minimum: 1 },
        ),
        excludeResourceIds: s.array(
          "Previously collected VCG resource IDs to exclude when continuing a search. Supply comma-separated IDs or repeat this query parameter.",
          s.string("One resource ID to exclude from search results.", {
            pattern: "^VCG[A-Za-z0-9_-]{1,125}$",
          }),
          { maxItems: 100000 },
        ),
        contentFilter: s.withDefault(
          s.withEnum(
            s.string(
              "Optional brand and AIGC search restriction. Keep this value unchanged across pagination and continuation.\n\nAvailable Values:\n- `all`: Keep the default search without additional brand or AIGC filters.\n- `selected_500px_no_aigc`: Select only 500px Select and 500px Prime, exclude AIGC using the site's filter, and retain best ordering. Do not expand to other brands when results run out.",
            ),
            ["all", "selected_500px_no_aigc"],
          ),
          "all",
        ),
        resultMode: s.withDefault(
          s.withEnum(
            s.string(
              "Result mode: full returns normal image details; candidate_ids only inspects one page of resource IDs and requires limit 10000, maxPages 1, and no excluded resource IDs. A candidate inspection does not complete or advance an image search.\n\nAvailable Values:\n- `full`: Return the normal image search result with complete image details.\n- `candidate_ids`: Inspect resource IDs from one validated search page without image details. Requires limit 10000, maxPages 1, and no excluded resource IDs; this is not an image result or a completion receipt.",
            ),
            ["full", "candidate_ids"],
          ),
          "full",
        ),
      },
      { required: ["keyword"] },
    ),
  },
  {
    name: "pixabay_photo_search",
    method: "GET",
    path: "/api/pixabay/search-image/v1",
    authLocation: "query",
    description:
      "Searches public Pixabay photo result pages by keyword with a requested image count and page controls. Each result includes its Pixabay photo page, public contributor information when shown, and a source-provided image URL.",
    inputSchema: s.object(
      "Input for Pixabay Photo Search.",
      {
        keyword: s.string("Photo search keyword, up to 100 characters without control characters.", {
          maxLength: 100,
          minLength: 1,
        }),
        limit: s.integer("Maximum number of unique photos to return.", {
          maximum: 10000,
          minimum: 1,
        }),
        startPage: s.integer("First result page to search, starting from 1.", {
          maximum: 10000,
          minimum: 1,
        }),
        maxPages: s.integer("Maximum number of pages to visit in this request. The last page must not exceed 10000.", {
          maximum: 100,
          minimum: 1,
        }),
      },
      { required: ["keyword"] },
    ),
  },
];
