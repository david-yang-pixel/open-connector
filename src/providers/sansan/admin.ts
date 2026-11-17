import type { SansanActionHandler, SansanContext } from "./request.ts";

import {
  normalizeSansanPage,
  readSansanJson,
  requestSansan,
  requestSansanJson,
  sansanPageQuery,
  sansanPathId,
} from "./request.ts";

export const sansanAdminHandlers: Record<string, SansanActionHandler> = {
  async list_departments(input, context) {
    return normalizeSansanPage(
      await requestSansanJson("/admin/departments", { query: sansanPageQuery(input) }, context),
    );
  },
  async get_department_access_control(input, context) {
    return requestSansanJson(departmentPath(input), {}, context);
  },
  async set_department_access_control(input, context) {
    return changeAdmin(departmentPath(input), "PUT", { aclPatternId: input.aclPatternId }, context);
  },
  async list_access_control_patterns(input, context) {
    return normalizeSansanPage(
      await requestSansanJson("/admin/accessControl/pattern", { query: sansanPageQuery(input) }, context),
    );
  },
  async create_access_control_pattern(input, context) {
    return requestSansanJson("/admin/accessControl/pattern", { method: "POST", json: input }, context);
  },
  async update_access_control_pattern(input, context) {
    const { patternId, ...body } = input;
    return changeAdmin(`/admin/accessControl/pattern/${sansanPathId(patternId, "patternId")}`, "PUT", body, context);
  },
  async delete_access_control_pattern(input, context) {
    return changeAdmin(
      `/admin/accessControl/pattern/${sansanPathId(input.patternId, "patternId")}`,
      "DELETE",
      undefined,
      context,
    );
  },
  async get_default_email_client(_input, context) {
    return requestSansan("/organizationSettings/emailClient", {}, context, async (response) => ({
      settings: await readSansanJson(response, true),
    }));
  },
  async set_default_email_client(input, context) {
    return requestSansan(
      "/organizationSettings/emailClient",
      { method: "PUT", json: input },
      context,
      async (response) => ({ settings: await readSansanJson(response) }),
    );
  },
};

function departmentPath(input: Record<string, unknown>) {
  return `/admin/accessControl/department/${sansanPathId(input.departmentId, "departmentId")}/pattern`;
}

function changeAdmin(path: string, method: "PUT" | "DELETE", json: unknown, context: SansanContext) {
  return requestSansan(path, { method, json }, context, async (response) => ({
    success: true,
    data: await readSansanJson(response, true),
  }));
}
