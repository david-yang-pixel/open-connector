import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const repo = s.nonWhitespaceString(
  "Repository path without .git, including parent organizations, for example team/project.",
);
const number = s.string("Issue or pull request number as a decimal string.", {
  pattern: "^[0-9]+$",
});
const page = s.optional(s.integer("Page number, starting at 1.", { minimum: 1, default: 1 }));
const pageSize = s.optional(s.integer("Number of items per page.", { minimum: 1, default: 10 }));
const pagination = { page, page_size: pageSize };
const title = s.nonWhitespaceString("Issue or pull request title.");
const body = s.optional(s.string("Markdown body content."));
const priority = s.optional(s.stringEnum("Issue priority.", ["-2P", "-1P", "P0", "P1", "P2", "P3"]));
const state = s.optional(s.stringEnum("Issue or pull request state.", ["open", "closed"]));
const labels = s.optional(s.string("Comma-separated label names."));
const authors = s.optional(s.string("Comma-separated author names."));
const assignees = s.optional(s.string("Comma-separated assignee names; use - for unassigned."));
const operator = s.optional(s.stringEnum("Match any or all supplied values.", ["contains_any", "contains_all"]));
const updated = {
  updated_time_begin: s.optional(s.string("Start of the update date range, for example 2026-01-01.")),
  updated_time_end: s.optional(s.string("End of the update date range, for example 2026-12-31.")),
};
const issueDates = {
  start_date: s.optional(s.string("Issue start date, for example 2026-01-01.")),
  end_date: s.optional(s.string("Issue end date, for example 2026-12-31.")),
};
const commonOutput = {
  number: s.string("Issue or pull request number."),
  title: s.string("Issue or pull request title."),
  body: s.string("Markdown body content."),
  state: s.string("Current state returned by CNB."),
};
const repositoryOutput = s.looseObject("Repository information, including any additional CNB fields.", {
  id: s.string("Repository ID."),
  name: s.string("Repository name."),
  path: s.string("Full repository path."),
  web_url: s.string("Repository web URL."),
  description: s.string("Repository description."),
});
const issueFields = {
  number: commonOutput.number,
  title: commonOutput.title,
  state: commonOutput.state,
  priority: s.string("Issue priority."),
  state_reason: s.string("Reason for the current issue state."),
};
const issueListOutput = s.looseObject("Issue information, including any additional CNB fields.", issueFields);
const issueOutput = s.looseObject("Issue information, including any additional CNB fields.", {
  ...issueFields,
  body: commonOutput.body,
});
const pullOutput = s.looseObject("Pull request information, including any additional CNB fields.", {
  ...commonOutput,
  is_merged: s.boolean("Whether the pull request has been merged."),
  mergeable_state: s.string("Current mergeability state."),
  head: s.looseObject("Source branch information.", {}),
  base: s.looseObject("Target branch information.", {}),
});
const commentOutput = s.looseObject("Issue comment information, including any additional CNB fields.", {
  id: s.string("Comment ID."),
  body: s.string("Comment content."),
  created_at: s.string("Comment creation time."),
});
export const cnbActions: ActionDefinition[] = [
  defineProviderAction("cnb", {
    name: "list_repositories",
    operationType: "read",
    requiredScopes: [],
    description:
      "List repositories accessible to the current user. Requires account-engage:r. The default minimum role is Guest; increase page until an empty page is returned.",
    inputSchema: s.requiredObject("Repository list filters.", {
      ...pagination,
      search: s.optional(s.string("Filter repositories by name.")),
      filter_type: s.optional(s.stringEnum("Repository visibility.", ["private", "public", "secret"])),
      role: s.optional({
        ...s.stringEnum("Minimum repository role; defaults to Guest to include all accessible repositories.", [
          "Guest",
          "Reporter",
          "Developer",
          "Master",
          "Owner",
        ]),
        default: "Guest",
      }),
      flags: s.optional(s.string("Comma-separated repository flags: KnowledgeBase, NPC, Skills.")),
      flags_match: s.optional(s.stringEnum("How multiple repository flags are matched.", ["intersection", "union"])),
      status: s.optional(s.stringEnum("Repository status.", ["active", "archived"])),
      order_by: s.optional(
        s.stringEnum("Repository sort field.", ["created_at", "last_updated_at", "stars", "slug_path", "forks"]),
      ),
      desc: s.optional(s.boolean("Whether to sort in descending order.")),
    }),
    outputSchema: s.requiredObject("One page of repositories.", {
      items: s.array("Repositories on this page.", repositoryOutput),
    }),
  }),
  defineProviderAction("cnb", {
    name: "get_repository",
    operationType: "read",
    requiredScopes: [],
    description: "Get repository information. Requires repo-basic-info:r.",
    inputSchema: s.requiredObject("Repository selection.", { repo }),
    outputSchema: repositoryOutput,
  }),
  defineProviderAction("cnb", {
    name: "list_issues",
    operationType: "read",
    requiredScopes: [],
    description:
      "List and filter repository issues. Requires repo-issue:r. Increase page until an empty page is returned.",
    inputSchema: s.requiredObject("Issue list filters.", {
      repo,
      ...pagination,
      page_size: s.optional(
        s.integer("Number of issues per page, at most 100.", {
          minimum: 1,
          maximum: 100,
          default: 10,
        }),
      ),
      state,
      keyword: s.optional(s.string("Search issue titles and content.")),
      priority: s.optional(s.string("Comma-separated priorities: -2P, -1P, P0, P1, P2, P3.")),
      labels,
      labels_operator: operator,
      authors,
      assignees,
      ...updated,
      close_time_begin: s.optional(s.string("Start of the issue closure date range.")),
      close_time_end: s.optional(s.string("End of the issue closure date range.")),
      order_by: s.optional(
        s.stringEnum("Issue sort field; a leading minus means descending.", [
          "created_at",
          "-created_at",
          "-updated_at",
          "-last_acted_at",
        ]),
      ),
    }),
    outputSchema: s.requiredObject("One page of issues.", {
      items: s.array("Issues on this page.", issueListOutput),
    }),
  }),
  defineProviderAction("cnb", {
    name: "get_issue",
    operationType: "read",
    requiredScopes: [],
    description: "Get an issue with its full description and metadata. Requires repo-issue:r.",
    inputSchema: s.requiredObject("Issue selection.", { repo, number }),
    outputSchema: issueOutput,
  }),
  defineProviderAction("cnb", {
    name: "create_issue",
    operationType: "write",
    requiredScopes: [],
    description:
      "Create a repository issue with optional labels, assignees, dates and priority. Requires repo-issue:rw.",
    inputSchema: s.requiredObject("Issue creation parameters.", {
      repo,
      title,
      body,
      priority,
      ...issueDates,
      invisible: s.optional(s.boolean("Whether the issue is private.")),
      work_mode: s.optional(s.boolean("Whether work mode is enabled.")),
      assignees: s.optional(s.array("Issue assignee names, at most 8.", s.string("Assignee name."), { maxItems: 8 })),
      labels: s.optional(s.array("Issue label names, at most 10.", s.string("Label name."), { maxItems: 10 })),
    }),
    outputSchema: issueOutput,
  }),
  defineProviderAction("cnb", {
    name: "update_issue",
    operationType: "write",
    requiredScopes: [],
    description:
      "Update issue content, dates, visibility, priority or workflow state. Supply state and state_reason together. Requires repo-issue:rw.",
    inputSchema: {
      ...s.object("Issue changes; omitted fields are unchanged.", {
        repo,
        number,
        title: s.optional(title),
        body,
        priority,
        ...issueDates,
        invisible: s.optional(s.boolean("Whether the issue is private.")),
        state,
        state_reason: s.optional(
          s.stringEnum("Issue state reason; use reopened with open, completed or not_planned with closed.", [
            "completed",
            "not_planned",
            "reopened",
          ]),
        ),
      }),
      minProperties: 3,
      dependentRequired: { state: ["state_reason"], state_reason: ["state"] },
    },
    outputSchema: issueOutput,
  }),
  defineProviderAction("cnb", {
    name: "list_issue_comments",
    operationType: "read",
    requiredScopes: [],
    description: "List issue comments. Requires repo-notes:r. Increase page until an empty page is returned.",
    inputSchema: s.requiredObject("Issue comment list filters.", {
      repo,
      number,
      ...pagination,
      sort: s.optional(
        s.stringEnum("Comment sort order; a leading minus means descending.", [
          "created",
          "updated",
          "-created",
          "-updated",
        ]),
      ),
    }),
    outputSchema: s.requiredObject("One page of comments.", {
      items: s.array("Comments on this page.", commentOutput),
    }),
  }),
  defineProviderAction("cnb", {
    name: "create_issue_comment",
    operationType: "write",
    requiredScopes: [],
    description: "Add a comment to an issue. Requires repo-notes:rw.",
    inputSchema: s.requiredObject("Issue comment creation parameters.", {
      repo,
      number,
      body: s.nonWhitespaceString("Comment content."),
      work_mode: s.optional(s.boolean("Whether work mode is enabled.")),
    }),
    outputSchema: commentOutput,
  }),
  defineProviderAction("cnb", {
    name: "list_pull_requests",
    operationType: "read",
    requiredScopes: [],
    description:
      "List repository pull requests with filters. Requires repo-pr:r. Increase page until an empty page is returned.",
    inputSchema: s.requiredObject("Pull request list filters.", {
      repo,
      ...pagination,
      state: s.optional(s.stringEnum("Pull request state filter; CNB defaults to open.", ["open", "closed", "all"])),
      authors,
      assignees,
      labels,
      assignees_operator: operator,
      labels_operator: operator,
      reviewers: s.optional(s.string("Comma-separated reviewer names; use - for no reviewer.")),
      reviewers_operator: operator,
      base_ref: s.optional(s.string("Target branch name.")),
      ...updated,
      order_by: s.optional(
        s.stringEnum("Pull request sort field; a leading minus means descending.", [
          "created_at",
          "-created_at",
          "-updated_at",
        ]),
      ),
    }),
    outputSchema: s.requiredObject("One page of pull requests.", {
      items: s.array("Pull requests on this page.", pullOutput),
    }),
  }),
  defineProviderAction("cnb", {
    name: "get_pull_request",
    operationType: "read",
    requiredScopes: [],
    description: "Get pull request details and mergeability information. Requires repo-pr:r.",
    inputSchema: s.requiredObject("Pull request selection.", { repo, number }),
    outputSchema: pullOutput,
  }),
  defineProviderAction("cnb", {
    name: "create_pull_request",
    operationType: "write",
    requiredScopes: [],
    description: "Create a pull request from a source branch into a target branch. Requires repo-pr:rw.",
    inputSchema: s.requiredObject("Pull request creation parameters.", {
      repo,
      title,
      body,
      head: s.nonWhitespaceString("Source branch name."),
      base: s.nonWhitespaceString("Target branch name."),
      head_repo: s.optional(s.nonWhitespaceString("Source repository path for a cross-repository pull request.")),
    }),
    outputSchema: pullOutput,
  }),
  defineProviderAction("cnb", {
    name: "update_pull_request",
    operationType: "write",
    requiredScopes: [],
    description: "Update a pull request title, description or open/closed workflow state. Requires repo-pr:rw.",
    inputSchema: {
      ...s.object("Pull request changes; omitted fields are unchanged.", {
        repo,
        number,
        title: s.optional(title),
        body,
        state,
      }),
      minProperties: 3,
    },
    outputSchema: pullOutput,
  }),
  defineProviderAction("cnb", {
    name: "list_builds",
    operationType: "read",
    requiredScopes: [],
    description:
      "List pipeline build history, filtered by branch, event, commit or status. Requires repo-cnb-history:r.",
    inputSchema: s.requiredObject("Build history filters.", {
      repo,
      page,
      page_size: s.optional(
        s.integer("Builds per page, at most 100; defaults to 30.", {
          minimum: 1,
          maximum: 100,
          default: 30,
        }),
      ),
      createTime: s.optional(s.string("Start date in YYYY-MM-DD format.")),
      endTime: s.optional(s.string("End date in YYYY-MM-DD format.")),
      event: s.optional(s.string("Build event, for example push.")),
      sha: s.optional(s.string("Commit SHA.")),
      sn: s.optional(s.string("Build serial number.")),
      sourceRef: s.optional(s.string("Source branch name.")),
      targetRef: s.optional(s.string("Target branch name.")),
      status: s.optional(s.stringEnum("Build status filter.", ["pending", "success", "error", "cancel"])),
      userId: s.optional(s.string("Build user ID.")),
      userName: s.optional(s.string("Build username.")),
    }),
    outputSchema: s.looseObject("Build history page and total count.", {
      data: s.array(
        "Build records on this page.",
        s.looseObject("Build history record.", {
          sn: s.string("Build serial number."),
          status: s.string("Build status."),
          sha: s.string("Commit SHA."),
          buildLogUrl: s.string("Build log URL."),
        }),
      ),
      total: s.integer("Total number of builds matching the filters."),
      timestamp: s.integer("Current timestamp returned by CNB."),
    }),
  }),
  defineProviderAction("cnb", {
    name: "get_build_status",
    operationType: "read",
    requiredScopes: [],
    description: "Get the current state and pipeline progress of an existing build. Requires repo-cnb-trigger:r.",
    inputSchema: s.requiredObject("Build selection.", {
      repo,
      sn: s.nonWhitespaceString("Build serial number."),
    }),
    outputSchema: s.looseObject("Build status and pipeline progress.", {
      status: s.string("Build status."),
      pipelinesStatus: s.record(
        "Pipeline states keyed by pipeline ID.",
        s.looseObject("Pipeline progress.", {
          id: s.string("Pipeline ID."),
          name: s.string("Pipeline name."),
          status: s.string("Pipeline status."),
        }),
      ),
    }),
  }),
];
