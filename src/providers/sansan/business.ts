import type { SansanActionHandler, SansanContext } from "./request.ts";

import { looseArray, optionalString } from "../../core/cast.ts";
import { providerInputError } from "../provider-runtime.ts";
import { downloadSansanSource, encodeSansanMultipart, requireSansanTransit, uploadSansanDownload } from "./files.ts";
import { requestSansan, requestSansanJson, sansanPathId } from "./request.ts";

export const sansanBusinessHandlers: Record<string, SansanActionHandler> = {
  async create_business_card(input, context) {
    if (![input.companyName, input.firstName, input.lastName].some((value) => optionalString(value)?.trim())) {
      throw providerInputError("A non-empty companyName, firstName, or lastName is required");
    }
    return requestSansanJson(importPath("bizCards", input), { method: "POST", json: input }, context);
  },
  async create_contact_report(input, context) {
    for (const field of ["startTime", "endTime"]) {
      const time = String(input[field]).slice(11);
      const seconds = time.split(":")[2]?.split("+")[0]?.split("-")[0]?.toUpperCase().split("Z")[0];
      const [wholeSeconds, fraction = ""] = (seconds ?? "").split(".");
      if (wholeSeconds !== "00" || [...fraction].some((digit) => digit !== "0")) {
        throw providerInputError(`${field} must have zero seconds`);
      }
    }
    return requestSansanJson(importPath("reports", input), { method: "POST", json: input }, context);
  },
  async upload_business_card_image(input, context) {
    const form = new FormData();
    await addImage(form, "frontImage", "frontImageUrl", input, context);
    if (input.backImageUrl !== undefined) await addImage(form, "backImage", "backImageUrl", input, context);
    for (const key of ["ownerUserId", "exchangeDate", "prioritizeHandWrittenDates", "memo"]) {
      if (input[key] !== undefined) form.append(key, String(input[key]));
    }
    for (const value of looseArray(input.languages)) form.append("language", String(value));
    for (const value of looseArray(input.tagIds)) form.append("tagIds", String(value));
    return requestSansanJson(
      importPath("bizCards/images", input),
      { method: "POST", ...(await encodeSansanMultipart(form)) },
      context,
    );
  },
  async get_business_card_image(input, context) {
    requireSansanTransit(context);
    const id = sansanPathId(input.businessCardId, "businessCardId");
    const side = optionalString(input.side) ?? "front";
    return requestSansan(`/bizCards/${id}/image`, { query: { side } }, context, (response) =>
      uploadSansanDownload(response, `sansan-business-card-${side}.jpg`, "image/jpeg", context),
    );
  },
};

function importPath(resource: string, input: Record<string, unknown>) {
  return input.ownerUserId === undefined ? `/${resource}` : `/admin/import/${resource}`;
}

async function addImage(
  form: FormData,
  part: string,
  field: string,
  input: Record<string, unknown>,
  context: SansanContext,
) {
  const bytes = await downloadSansanSource(String(input[field]), field, context, true);
  form.append(part, new Blob([bytes as BlobPart], { type: "image/jpeg" }), `${part}.jpg`);
}
