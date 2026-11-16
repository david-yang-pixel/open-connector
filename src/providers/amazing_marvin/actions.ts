import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const date = s.string("Calendar date in YYYY-MM-DD format.", { format: "date" });
const timeZoneOffset = s.integer("UTC offset in minutes, positive east of UTC; used for local dates.");
const creationProperties = {
  title: s.nonEmptyString("Item title; Marvin processes supported task input shortcuts."),
  done: s.boolean("Whether the new item is already complete."),
  day: s.nullable(date),
  parentId: s.nonEmptyString("Parent category or project ID; unassigned is the inbox."),
  labelIds: s.array("Label IDs to attach.", s.nonEmptyString("A label ID.")),
  firstScheduled: date,
  rank: s.number("Sort rank within the parent."),
  dailySection: s.string("Daily section name, such as Morning."),
  bonusSection: s.stringEnum("Essential or bonus section.", ["Essential", "Bonus"]),
  customSection: s.string("Custom section ID from the user's settings."),
  timeBlockSection: s.string("Time block ID."),
  note: s.string("Item notes."),
  dueDate: date,
  timeEstimate: s.number("Estimated duration in milliseconds."),
  isReward: s.boolean("Whether the item is a reward."),
  isFrogged: s.integer("Frog difficulty level."),
  plannedWeek: date,
  plannedMonth: s.string("Planned month in YYYY-MM format."),
  rewardPoints: s.number("Reward points for completing the item."),
  backburner: s.boolean("Whether to manually place the item on the backburner."),
  reviewDate: date,
  timeZoneOffset,
};
const resultSchema = s.object(
  "Write operation response.",
  {
    result: s.unknown(
      "Upstream JSON or text confirmation, or null for an empty response; an item ID is not guaranteed.",
    ),
  },
  {
    optional: [],
  },
);
const itemsSchema = s.object(
  "Matching Marvin items.",
  {
    items: s.array(
      "Items returned by Marvin; these endpoints do not paginate.",
      s.looseObject("A Marvin item with its upstream fields."),
    ),
  },
  {
    optional: [],
  },
);
export const amazingMarvinActions: ActionDefinition[] = [
  defineProviderAction("amazing_marvin", {
    name: "create_task",
    description: "Create a Marvin task with scheduling, labels, notes, and optional title shortcuts.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Task creation input.",
      {
        ...creationProperties,
        isStarred: s.integer("Task priority star level."),
        autoComplete: s.boolean(
          "Process title shortcuts; defaults to Marvin's enabled behavior. Set false to keep the title literal.",
        ),
      },
      {
        required: ["title"],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "create_project",
    description: "Create a Marvin project with scheduling, labels, notes, and priority.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Project creation input; set day to null for an unscheduled project.",
      {
        ...creationProperties,
        priority: s.stringEnum("Project priority.", ["high", "mid", "low"]),
        rewardId: s.string("ID of the attached reward."),
        itemSnoozeTime: s.number("Snooze until this Unix timestamp in milliseconds."),
        permaSnoozeTime: s.string("Daily snooze time in HH:mm format."),
      },
      {
        required: ["title"],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "complete_task",
    description:
      "Mark a Marvin task complete. This experimental API does not reproduce all client recurrence and reward behavior.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Task completion input.",
      {
        itemId: s.nonEmptyString("ID of the task to complete."),
        timeZoneOffset,
      },
      {
        optional: ["timeZoneOffset"],
      },
    ),
    outputSchema: resultSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "list_today_items",
    description:
      "List tasks and projects scheduled on a day, including enabled rollover and auto-scheduled due items. Omitted date uses the server's UTC date.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Scheduled items query.",
      { date },
      {
        optional: ["date"],
      },
    ),
    outputSchema: itemsSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "list_done_items",
    description: "List tasks and projects completed on a day. Omitted date uses the server's UTC date.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Completed items query.",
      { date },
      {
        optional: ["date"],
      },
    ),
    outputSchema: itemsSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "list_due_items",
    description: "List open tasks and projects due on or before a date. Omitted by uses the server's UTC date.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Due items query.",
      { by: date },
      {
        optional: ["by"],
      },
    ),
    outputSchema: itemsSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "list_children",
    description: "List open direct child tasks and projects of a category or project; descendants are not expanded.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Direct children query.",
      {
        parentId: s.nonEmptyString("Parent category or project ID; use unassigned for the inbox."),
      },
      {
        optional: [],
      },
    ),
    outputSchema: itemsSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "list_categories",
    description: "List all Marvin categories for organizing tasks and projects.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Category list input.",
      {},
      {
        optional: [],
      },
    ),
    outputSchema: itemsSchema,
  }),
  defineProviderAction("amazing_marvin", {
    name: "list_labels",
    description: "List all Marvin labels in their configured sort order.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Label list input.",
      {},
      {
        optional: [],
      },
    ),
    outputSchema: itemsSchema,
  }),
];
