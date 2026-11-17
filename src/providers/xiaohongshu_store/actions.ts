import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "xiaohongshu_store";

const rawOrderSchema = s.looseObject("A Xiaohongshu order record. Available fields depend on the order type.");
const rawCustomsSchema = s.looseObject("A Xiaohongshu supported customs port with customs_name and customs_code.");
const rawAfterSaleSchema = s.looseObject(
  "A Xiaohongshu after-sale record. Available fields depend on the after-sale status.",
);
const rawItemSchema = s.looseObject("A Xiaohongshu item record. Available fields depend on the query form.");
const rawStockSchema = s.looseObject("A Xiaohongshu SKU stock result, including per-warehouse breakdowns.");

const timestampMsSchema = s.nonNegativeInteger("A Unix timestamp in milliseconds.");
// order.getOrderList is the one API whose query window is in seconds; its response times are still milliseconds.
const orderListTimestampSchema = s.nonNegativeInteger("A Unix timestamp in seconds.");
const pageNoSchema = s.integer("The one-based page number. Defaults to 1.", { minimum: 1 });
const pageSizeSchema = s.integer("The number of records per page. Defaults to 50 and cannot exceed 100.", {
  minimum: 1,
  maximum: 100,
});
const orderIdSchema = s.nonWhitespaceString("The Xiaohongshu order ID.");
const expressCompanyCodeSchema = s.nonWhitespaceString(
  "The Xiaohongshu express company code, as returned by list_express_companies.",
);
const itemImageSchema = s.looseObject("One image.", {
  link: s.nonWhitespaceString("The image URL returned by upload_material."),
});
const itemDeliveryTimeSchema = s.looseObject("The SKU delivery time.", {
  type: s.integer("The delivery time type: 3 for same-day, 4 for relative hours, or 5 for an absolute time.", {
    minimum: 3,
    maximum: 5,
  }),
  time: s.nonWhitespaceString("The delivery time value for the chosen type."),
});
const createItemSkuSchema = s.looseObject(
  "One SKU to create. Other upstream SKU fields such as originalPrice, variants, barcode, erpCode, and specImage pass through unchanged.",
  {
    price: s.nonNegativeInteger("The SKU price in fen."),
    stock: s.nonNegativeInteger("The SKU stock."),
    logisticsPlanId: s.nonWhitespaceString("The logistics plan ID, from list_logistics_plans."),
    deliveryTime: itemDeliveryTimeSchema,
  },
);
const updateItemSkuSchema = s.looseObject(
  "One SKU to update. Other upstream SKU fields such as originalPrice, variants, barcode, erpCode, and specImage pass through unchanged.",
  {
    skuId: s.nonWhitespaceString("The SKU ID, from list_item_skus or get_item."),
    price: s.nonNegativeInteger("The SKU price in fen."),
    stock: s.nonNegativeInteger("The SKU stock."),
    logisticsPlanId: s.nonWhitespaceString("The logistics plan ID, from list_logistics_plans."),
    deliveryTime: itemDeliveryTimeSchema,
  },
);
const shippingGrossWeightSchema = s.nonNegativeInteger(
  "The item shipping weight in grams. Required to be positive when the carriage template charges by weight.",
);

export const xiaohongshuStoreActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "refresh_token",
    operationType: "write",
    description:
      "Refresh the access token using the refresh token stored in the connection credential. Xiaohongshu only issues new tokens when the access token has under 30 minutes left or has expired; otherwise it returns the current ones unchanged. A changed token set must be saved back to the connection, and the old access token stays valid for only 5 more minutes. Access tokens expire after 7 days.",
    inputSchema: s.object(
      "No input is required to refresh the token; the refresh token comes from the connection credential.",
      {},
    ),
    outputSchema: s.object("The refreshed Xiaohongshu token set.", {
      token: s.looseObject(
        "The token record with accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, sellerId, and sellerName.",
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "list_orders",
    operationType: "read",
    description:
      "List Xiaohongshu orders by creation or update time. startTime and endTime are Unix timestamps in seconds, while the returned order times are in milliseconds. Creation-time windows are limited to 24 hours and update-time windows to 30 minutes.",
    inputSchema: s.object(
      "The time range and filters used to list Xiaohongshu orders.",
      {
        timeType: s.integer("The time field to filter on: 1 for creation time or 2 for update time.", {
          minimum: 1,
          maximum: 2,
        }),
        startTime: orderListTimestampSchema,
        endTime: orderListTimestampSchema,
        orderType: s.integer(
          "The order type: 0 for all, 1 for in-stock, 2 for deposit presale, 4 for full-payment presale, or 5 for exchange reshipment.",
          { minimum: 0, maximum: 5 },
        ),
        orderStatus: s.integer(
          "The order status: 0 for all, 1 unpaid, 2 paid processing, 3 in customs clearance, 4 pending shipment, 5 partially shipped, 6 shipped, 7 completed, 8 closed, 9 canceled, or 10 exchange requested.",
          { minimum: 0, maximum: 10 },
        ),
        pageNo: s.integer("The one-based page number. Defaults to 1 and cannot exceed 100.", {
          minimum: 1,
          maximum: 100,
        }),
        pageSize: pageSizeSchema,
      },
      { optional: ["orderType", "orderStatus", "pageNo", "pageSize"] },
    ),
    outputSchema: s.object("A paginated Xiaohongshu order result.", {
      orders: s.array("The Xiaohongshu order records.", rawOrderSchema),
      total: s.nonNegativeInteger("The total number of matching orders reported by Xiaohongshu."),
      pageNo: s.positiveInteger("The requested one-based page number."),
      pageSize: s.positiveInteger("The requested number of orders per page."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_order",
    operationType: "read",
    description: "Get a Xiaohongshu order by its order ID, including SKU, amount, and delivery package details.",
    inputSchema: s.object("The order identifier used to retrieve a Xiaohongshu order.", { orderId: orderIdSchema }),
    outputSchema: s.object("The Xiaohongshu order detail result.", { order: rawOrderSchema }),
  }),
  defineProviderAction(service, {
    name: "get_order_receiver_info",
    operationType: "read",
    description:
      "Get receiver addresses for Xiaohongshu orders. Only available while an order is pending shipment; call it right before printing shipping labels.",
    inputSchema: s.object(
      "The receiver queries used to retrieve Xiaohongshu order receiver information.",
      {
        receiverQueries: s.array(
          "Up to 20 receiver queries. Each needs the order ID and the openAddressId returned by get_order.",
          s.object("A single receiver query.", {
            orderId: orderIdSchema,
            openAddressId: s.nonWhitespaceString("The address credential returned by get_order as openAddressId."),
          }),
        ),
        isReturn: s.boolean("Whether the query targets exchange orders instead of regular orders. Defaults to false."),
      },
      { optional: ["isReturn"] },
    ),
    outputSchema: s.object("The Xiaohongshu order receiver result.", {
      receivers: s.array(
        "The receiver records, one per matched order.",
        s.looseObject(
          "A Xiaohongshu order receiver record. Name, phone, and address are ciphertext until decrypted with the batch-decrypt API.",
        ),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "modify_order_remark",
    operationType: "write",
    description: "Modify the seller remark and flag of a Xiaohongshu order.",
    inputSchema: s.object("The seller remark update for a Xiaohongshu order.", {
      orderId: orderIdSchema,
      sellerMarkNote: s.nonWhitespaceString("The seller remark content."),
      operator: s.nonWhitespaceString("The name of the operator making the change."),
      sellerMarkPriority: s.integer("The remark flag: 1 gray, 2 red, 3 yellow, 4 green, 5 blue, or 6 purple.", {
        minimum: 1,
        maximum: 6,
      }),
    }),
    outputSchema: s.object("The seller remark update result.", {
      success: s.boolean("Whether Xiaohongshu accepted the update."),
    }),
  }),
  defineProviderAction(service, {
    name: "deliver_order",
    operationType: "write",
    description:
      "Ship a Xiaohongshu order with an express tracking number. Supports split shipments by passing the SKU IDs of one package.",
    inputSchema: s.object(
      "The shipment details used to deliver a Xiaohongshu order.",
      {
        orderId: orderIdSchema,
        expressNo: s.nonWhitespaceString(
          "The express tracking number, or the delivery content for no-logistics delivery.",
        ),
        expressCompanyCode: s.nonWhitespaceString(
          "The express company code, as returned by list_express_companies. Use selfdelivery for no-logistics delivery.",
        ),
        expressCompanyName: s.nonWhitespaceString("The express company name. Matched from the code when omitted."),
        deliveringTime: timestampMsSchema,
        unpack: s.boolean("Whether this is a split shipment. Requires skuIdList."),
        skuIdList: s.array(
          "The SKU IDs shipped in this package when unpack is true.",
          s.nonWhitespaceString("A SKU ID."),
        ),
        returnAddressId: s.nonWhitespaceString("The return address ID used for this shipment."),
        skuIdentifyCodeInfo: s.object(
          "The device identification codes required by subsidy or drone orders.",
          {
            sNCode: s.nonWhitespaceString("The device SN code."),
            barCode: s.nonWhitespaceString("The device barcode."),
            iMEI1Code: s.nonWhitespaceString("The first IMEI code."),
            iMEI2Code: s.nonWhitespaceString("The second IMEI code."),
          },
          { optional: ["sNCode", "barCode", "iMEI1Code", "iMEI2Code"] },
        ),
      },
      {
        optional: [
          "expressCompanyName",
          "deliveringTime",
          "unpack",
          "skuIdList",
          "returnAddressId",
          "skuIdentifyCodeInfo",
        ],
      },
    ),
    outputSchema: s.object("The delivery result.", {
      success: s.boolean("Whether Xiaohongshu accepted the shipment."),
    }),
  }),
  defineProviderAction(service, {
    name: "modify_order_express",
    operationType: "write",
    description:
      "Change the express tracking number of a shipped Xiaohongshu order. Only available after shipment and before receipt.",
    inputSchema: s.object(
      "The express update for a shipped Xiaohongshu order.",
      {
        orderId: orderIdSchema,
        expressNo: s.nonWhitespaceString("The new express tracking number."),
        expressCompanyCode: expressCompanyCodeSchema,
        expressCompanyName: s.nonWhitespaceString("The express company name."),
        deliveryOrderIndex: s.integer(
          "The delivery package index from the order detail simpleDeliveryOrderList. Required for split shipments.",
        ),
        oldExpressNo: s.nonWhitespaceString(
          "The tracking number to replace. Takes precedence over deliveryOrderIndex and rewrites every package using it.",
        ),
        expressUrlProofList: s.array(
          "The new delivery links for automatically delivered orders.",
          s.nonWhitespaceString("A delivery proof URL."),
        ),
      },
      { optional: ["deliveryOrderIndex", "oldExpressNo", "expressUrlProofList"] },
    ),
    outputSchema: s.object("The express update result.", {
      success: s.boolean("Whether Xiaohongshu accepted the update."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_order_tracking",
    operationType: "read",
    description: "Get the logistics tracking records of every package in a Xiaohongshu order.",
    inputSchema: s.object("The order identifier used to retrieve Xiaohongshu logistics tracking.", {
      orderId: orderIdSchema,
    }),
    outputSchema: s.object("The Xiaohongshu order tracking result.", {
      packages: s.array(
        "The logistics packages with tracking records.",
        s.looseObject("A Xiaohongshu logistics package with tracking records."),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "get_order_declare_info",
    operationType: "read",
    description: "Get the customs declaration identity information of a cross-border Xiaohongshu order.",
    inputSchema: s.object("The order identifier used to retrieve Xiaohongshu customs declaration information.", {
      orderId: orderIdSchema,
    }),
    outputSchema: s.object("The Xiaohongshu customs declaration result.", {
      declarations: s.array(
        "The customs declaration records.",
        s.looseObject("A Xiaohongshu customs declaration record with buyer identity details."),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "list_supported_ports",
    operationType: "read",
    description: "List the customs ports supported by Xiaohongshu for cross-border clearance.",
    inputSchema: s.object("No input is required to list supported customs ports.", {}),
    outputSchema: s.object("The supported customs ports result.", {
      platformPorts: s.array("The customs ports supported by the platform.", rawCustomsSchema),
      sellerPorts: s.array("The customs ports the seller may declare through.", rawCustomsSchema),
    }),
  }),
  defineProviderAction(service, {
    name: "resend_payment_record",
    operationType: "write",
    description:
      "Ask Xiaohongshu to notify the payment company to push the payment record to customs again for a bonded cross-border order.",
    inputSchema: s.object("The order whose bonded payment record should be pushed again.", {
      orderId: orderIdSchema,
      customsType: s.stringEnum("The customs system to push to.", ["zongshu", "local"]),
    }),
    outputSchema: s.object("The payment record resend result.", {
      message: s.string("The result message returned by Xiaohongshu."),
    }),
  }),
  defineProviderAction(service, {
    name: "list_after_sales",
    operationType: "read",
    description:
      "List Xiaohongshu after-sale records by order or by creation/update time. Pass an order ID, or a time window (24 hours by creation time, 30 minutes by update time).",
    inputSchema: s.object(
      "The filters used to list Xiaohongshu after-sale records.",
      {
        orderId: orderIdSchema,
        timeType: s.integer(
          "The time field to filter on: 1 for creation time or 2 for update time. Required with startTime and endTime when orderId is omitted.",
          { minimum: 1, maximum: 2 },
        ),
        startTime: timestampMsSchema,
        endTime: timestampMsSchema,
        statuses: s.array(
          "The after-sale statuses to include: 1 pending audit, 2 pending buyer return, 3 pending seller receipt, 4 completed, 5 canceled, 6 closed, 9 audit rejected, 9001 receipt rejected, 12 exchange pending seller shipment, 13 exchange pending buyer confirmation, or 14 platform intervening.",
          s.integer("An after-sale status code."),
        ),
        returnTypes: s.array(
          "The after-sale types to include: 1 return, 2 exchange, 4 refund only after shipment, 5 refund only before shipment, or 6 price protection.",
          s.integer("An after-sale type code.", { minimum: 1, maximum: 6 }),
        ),
        pageNo: pageNoSchema,
        pageSize: pageSizeSchema,
      },
      { optional: ["orderId", "timeType", "startTime", "endTime", "statuses", "returnTypes", "pageNo", "pageSize"] },
    ),
    outputSchema: s.object("A paginated Xiaohongshu after-sale result.", {
      afterSales: s.array("The Xiaohongshu after-sale records.", rawAfterSaleSchema),
      total: s.nonNegativeInteger("The total number of matching after-sale records reported by Xiaohongshu."),
      pageNo: s.positiveInteger("The requested one-based page number."),
      pageSize: s.positiveInteger("The requested number of records per page."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_after_sale",
    operationType: "read",
    description: "Get a Xiaohongshu after-sale record by its after-sale ID, including SKUs, amounts, and logistics.",
    inputSchema: s.object(
      "The after-sale identifier used to retrieve a Xiaohongshu after-sale record.",
      {
        returnsId: s.nonWhitespaceString("The Xiaohongshu after-sale ID."),
        needNegotiateRecord: s.boolean("Whether to include the buyer-seller negotiation records."),
      },
      { optional: ["needNegotiateRecord"] },
    ),
    outputSchema: s.object("The Xiaohongshu after-sale detail result.", { afterSale: rawAfterSaleSchema }),
  }),
  defineProviderAction(service, {
    name: "audit_after_sale",
    operationType: "write",
    description: "Audit a Xiaohongshu after-sale request. Only callable while the after-sale is pending seller audit.",
    inputSchema: s.object(
      "The audit decision for a Xiaohongshu after-sale request.",
      {
        returnsId: s.nonWhitespaceString("The Xiaohongshu after-sale ID."),
        action: s.integer(
          "The audit decision: 1 to agree to a direct refund (refund-only requests), 2 to agree to a return shipment (not for refund-only requests), or 3 to reject.",
          { minimum: 1, maximum: 3 },
        ),
        reason: s.integer("The reject reason ID from list_after_sale_reject_reasons. Required when action is 3."),
        description: s.nonWhitespaceString("The reject reason description. Required when the reject reason is other."),
        message: s.nonWhitespaceString("A message shown to the buyer when agreeing to a return shipment."),
        sellerAddressRecordId: s.nonNegativeInteger(
          "The seller return address record ID. Required when agreeing to a return shipment.",
        ),
        droneSnCodes: s.array(
          "The drone SN codes copied from the after-sale detail.",
          s.nonWhitespaceString("A drone SN code."),
        ),
      },
      { optional: ["reason", "description", "message", "sellerAddressRecordId", "droneSnCodes"] },
    ),
    outputSchema: s.object("The audit result.", {
      success: s.boolean("Whether Xiaohongshu accepted the audit decision."),
    }),
  }),
  defineProviderAction(service, {
    name: "confirm_after_sale_receive",
    operationType: "write",
    description:
      "Confirm receipt of a buyer-returned package for a Xiaohongshu after-sale. Only callable while the after-sale waits for seller receipt.",
    inputSchema: s.object(
      "The receipt decision for a returned Xiaohongshu after-sale package.",
      {
        returnsId: s.nonWhitespaceString("The Xiaohongshu after-sale ID."),
        action: s.integer("The receipt decision: 1 to confirm receipt, 2 to reject, or 3 to extend the wait.", {
          minimum: 1,
          maximum: 3,
        }),
        reason: s.integer("The reject reason ID from list_after_sale_reject_reasons. Required when action is 2."),
        description: s.nonWhitespaceString("The reject reason description."),
        droneSnCodes: s.array(
          "The drone SN codes copied from the after-sale detail.",
          s.nonWhitespaceString("A drone SN code."),
        ),
      },
      { optional: ["reason", "description", "droneSnCodes"] },
    ),
    outputSchema: s.object("The receipt decision result.", {
      success: s.boolean("Whether Xiaohongshu accepted the receipt decision."),
    }),
  }),
  defineProviderAction(service, {
    name: "ship_after_sale_exchange",
    operationType: "write",
    description:
      "Confirm receipt of the returned package and report the exchange shipment tracking number for a Xiaohongshu exchange after-sale.",
    inputSchema: s.object("The exchange shipment for a Xiaohongshu after-sale.", {
      returnsId: s.nonWhitespaceString("The Xiaohongshu after-sale ID."),
      expressCompanyCode: expressCompanyCodeSchema,
      expressNo: s.nonWhitespaceString("The express tracking number of the exchange shipment."),
    }),
    outputSchema: s.object("The exchange shipment result.", {
      success: s.boolean("Whether Xiaohongshu accepted the exchange shipment."),
    }),
  }),
  defineProviderAction(service, {
    name: "list_after_sale_reject_reasons",
    operationType: "read",
    description:
      "List the reject reason options available when auditing or confirming receipt of a Xiaohongshu after-sale.",
    inputSchema: s.object("The after-sale whose reject reasons should be listed.", {
      returnsId: s.nonWhitespaceString("The Xiaohongshu after-sale ID."),
      rejectReasonType: s.integer("The reject reason group: 1 for audit rejection or 2 for receipt rejection.", {
        minimum: 1,
        maximum: 2,
      }),
    }),
    outputSchema: s.object("The reject reason options result.", {
      reasons: s.array(
        "The available reject reason options.",
        s.looseObject("A Xiaohongshu after-sale reject reason option with reasonType, reasonId, and reasonName."),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "list_items",
    operationType: "read",
    description: "List Xiaohongshu items with basic fields using ID, time, stock, barcode, or availability filters.",
    inputSchema: s.object(
      "The filters used to list Xiaohongshu items. Passing an item ID ignores the other filters.",
      {
        id: s.nonWhitespaceString("An exact Xiaohongshu item ID."),
        createTimeFrom: timestampMsSchema,
        createTimeTo: timestampMsSchema,
        updateTimeFrom: timestampMsSchema,
        updateTimeTo: timestampMsSchema,
        buyable: s.boolean("Whether to include only items currently on sale."),
        stockGte: s.nonNegativeInteger("The minimum stock quantity to include."),
        stockLte: s.nonNegativeInteger("The maximum stock quantity to include."),
        barcode: s.nonWhitespaceString("An item barcode."),
        skucode: s.nonWhitespaceString("A Xiaohongshu item code."),
        freeze: s.boolean("Whether to include only frozen items."),
        singlePackOnly: s.boolean("Whether to return only single-item packs."),
        lastId: s.nonWhitespaceString("The cursor from the previous page when syncing the whole catalog."),
        isChannel: s.boolean("Whether to include only channel items."),
        pageNo: pageNoSchema,
        pageSize: pageSizeSchema,
      },
      {
        optional: [
          "id",
          "createTimeFrom",
          "createTimeTo",
          "updateTimeFrom",
          "updateTimeTo",
          "buyable",
          "stockGte",
          "stockLte",
          "barcode",
          "skucode",
          "freeze",
          "singlePackOnly",
          "lastId",
          "isChannel",
          "pageNo",
          "pageSize",
        ],
      },
    ),
    outputSchema: s.object("A paginated Xiaohongshu item result.", {
      items: s.array("The Xiaohongshu item records.", rawItemSchema),
      total: s.nonNegativeInteger("The total number of matching items reported by Xiaohongshu."),
      pageNo: s.positiveInteger("The requested one-based page number."),
      pageSize: s.positiveInteger("The requested number of items per page."),
    }),
  }),
  defineProviderAction(service, {
    name: "search_items",
    operationType: "read",
    description:
      "Search Xiaohongshu items with full publish fields using keywords, item codes, or availability filters.",
    inputSchema: s.object(
      "The search filters used to find Xiaohongshu items.",
      {
        keyword: s.nonWhitespaceString("A keyword matched against the item title."),
        keywords: s.array(
          "Exact item identifiers to look up, such as item codes, barcodes, item IDs, SPU IDs, or article numbers.",
          s.nonWhitespaceString("An item identifier."),
        ),
        buyable: s.boolean("Whether to include only items currently on sale."),
        createTimeFrom: timestampMsSchema,
        createTimeTo: timestampMsSchema,
        lastId: s.nonWhitespaceString("The starting item ID cursor for deep-paging a full-catalog sync."),
        pageNo: pageNoSchema,
        pageSize: pageSizeSchema,
      },
      {
        optional: ["keyword", "keywords", "buyable", "createTimeFrom", "createTimeTo", "lastId", "pageNo", "pageSize"],
      },
    ),
    outputSchema: s.object("A paginated Xiaohongshu item search result.", {
      items: s.array("The Xiaohongshu item records with full publish fields.", rawItemSchema),
      total: s.nonNegativeInteger("The total number of matching items reported by Xiaohongshu."),
      pageNo: s.positiveInteger("The requested one-based page number."),
      pageSize: s.positiveInteger("The requested number of items per page."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_item",
    operationType: "read",
    description: "Get a Xiaohongshu item by its item ID, including its SKU list.",
    inputSchema: s.object(
      "The item identifier used to retrieve a Xiaohongshu item.",
      {
        itemId: s.nonWhitespaceString("The Xiaohongshu item ID."),
        pageNo: s.integer("The one-based page number of the SKU list.", { minimum: 1 }),
        pageSize: s.integer("The number of SKUs per page.", { minimum: 1, maximum: 100 }),
      },
      { optional: ["pageNo", "pageSize"] },
    ),
    outputSchema: s.object("The Xiaohongshu item detail result.", {
      item: rawItemSchema,
      skus: s.array(
        "The SKU records of the item.",
        s.looseObject("A Xiaohongshu SKU record with price, stock, and logistics details."),
      ),
      total: s.nonNegativeInteger("The total number of SKUs reported by Xiaohongshu."),
    }),
  }),
  defineProviderAction(service, {
    name: "set_sku_availability",
    operationType: "write",
    description: "List or delist a Xiaohongshu SKU.",
    inputSchema: s.object("The availability update for a Xiaohongshu SKU.", {
      skuId: s.nonWhitespaceString("The Xiaohongshu SKU ID."),
      available: s.boolean("Whether the SKU should be on sale."),
    }),
    outputSchema: s.object("The availability update result.", {
      success: s.boolean("Whether Xiaohongshu accepted the update."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_sku_stock",
    operationType: "read",
    description:
      "Get the sellable, total, and occupied stock of a Xiaohongshu SKU, including per-warehouse breakdowns.",
    inputSchema: s.object("The SKU whose stock should be read.", {
      skuId: s.nonWhitespaceString("The Xiaohongshu SKU ID."),
    }),
    outputSchema: s.object("The Xiaohongshu SKU stock result.", { stock: rawStockSchema }),
  }),
  defineProviderAction(service, {
    name: "sync_sku_stock",
    operationType: "write",
    description:
      "Set the total stock of a Xiaohongshu SKU. Xiaohongshu derives the sellable stock from the difference with occupied and channel stock.",
    inputSchema: s.object("The total stock to set for a Xiaohongshu SKU.", {
      skuId: s.nonWhitespaceString("The Xiaohongshu SKU ID."),
      qty: s.nonNegativeInteger("The new total stock, including occupied and channel quantities."),
    }),
    outputSchema: s.object("The stock sync result.", { stock: rawStockSchema }),
  }),
  defineProviderAction(service, {
    name: "adjust_sku_stock",
    operationType: "write",
    description: "Increase or decrease the sellable stock of a Xiaohongshu SKU.",
    inputSchema: s.object("The stock adjustment for a Xiaohongshu SKU.", {
      skuId: s.nonWhitespaceString("The Xiaohongshu SKU ID."),
      qty: s.integer("The quantity to add when positive or remove when negative."),
    }),
    outputSchema: s.object("The stock adjustment result.", { stock: rawStockSchema }),
  }),
  defineProviderAction(service, {
    name: "list_categories",
    operationType: "read",
    description: "List the Xiaohongshu item categories under a parent category, or the top-level categories.",
    inputSchema: s.object(
      "The parent category whose children should be listed.",
      { categoryId: s.nonWhitespaceString("The parent category ID. Lists top-level categories when omitted.") },
      { optional: ["categoryId"] },
    ),
    outputSchema: s.object("The Xiaohongshu category result.", {
      categories: s.array("The child category records.", s.looseObject("A Xiaohongshu category record.")),
    }),
  }),
  defineProviderAction(service, {
    name: "get_category_attributes",
    operationType: "read",
    description: "Get the attributes and validation rules of a leaf Xiaohongshu category.",
    inputSchema: s.object("The leaf category whose attributes should be read.", {
      categoryId: s.nonWhitespaceString("The leaf category ID."),
    }),
    outputSchema: s.object("The Xiaohongshu category attribute result.", {
      attributes: s.array(
        "The attribute records with validation rules.",
        s.looseObject("A Xiaohongshu category attribute with its validation rules."),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "list_express_companies",
    operationType: "read",
    description: "List the express companies supported by Xiaohongshu for order shipment.",
    inputSchema: s.object("No input is required to list express companies.", {}),
    outputSchema: s.object("The Xiaohongshu express company result.", {
      companies: s.array(
        "The express company records.",
        s.looseObject("A Xiaohongshu express company with code and name."),
      ),
    }),
  }),
  defineProviderAction(service, {
    name: "list_item_skus",
    operationType: "read",
    description:
      "List Xiaohongshu items together with their full SKU details such as price, stock, and logistics plan.",
    inputSchema: s.object(
      "The filters used to list Xiaohongshu items with SKU details. Passing a SKU ID ignores the other filters.",
      {
        id: s.nonWhitespaceString("An exact Xiaohongshu SKU ID."),
        createTimeFrom: timestampMsSchema,
        createTimeTo: timestampMsSchema,
        updateTimeFrom: timestampMsSchema,
        updateTimeTo: timestampMsSchema,
        buyable: s.boolean("Whether to include only items currently on sale."),
        stockGte: s.nonNegativeInteger("The minimum stock quantity to include."),
        stockLte: s.nonNegativeInteger("The maximum stock quantity to include."),
        barcode: s.nonWhitespaceString("An item barcode."),
        scSkucode: s.nonWhitespaceString("A Xiaohongshu SKU code."),
        singlePackOnly: s.boolean("Whether to return only single-item packs."),
        lastId: s.nonWhitespaceString("The cursor from the previous page when syncing the whole catalog."),
        isChannel: s.boolean("Whether to include only channel items."),
        pageNo: pageNoSchema,
        pageSize: pageSizeSchema,
      },
      {
        optional: [
          "id",
          "createTimeFrom",
          "createTimeTo",
          "updateTimeFrom",
          "updateTimeTo",
          "buyable",
          "stockGte",
          "stockLte",
          "barcode",
          "scSkucode",
          "singlePackOnly",
          "lastId",
          "isChannel",
          "pageNo",
          "pageSize",
        ],
      },
    ),
    outputSchema: s.object("A paginated Xiaohongshu item and SKU result.", {
      items: s.array(
        "The item records, each with its item and sku details.",
        s.looseObject("A Xiaohongshu item and SKU pair."),
      ),
      total: s.nonNegativeInteger("The total number of matching SKUs reported by Xiaohongshu."),
      pageNo: s.positiveInteger("The requested one-based page number."),
      pageSize: s.positiveInteger("The requested number of records per page."),
    }),
  }),
  defineProviderAction(service, {
    name: "create_item",
    operationType: "write",
    description:
      "Create a Xiaohongshu item with its SKUs. Typical setup order: list_categories, get_category_attributes, search_brands, list_carriage_templates, list_logistics_plans, then upload_material for the images.",
    inputSchema: s.object(
      "The item and SKU data used to create a Xiaohongshu product.",
      {
        name: s.nonWhitespaceString("The item title."),
        categoryId: s.nonWhitespaceString("The leaf category ID, from list_categories."),
        shippingTemplateId: s.nonWhitespaceString("The carriage template ID, from list_carriage_templates."),
        shippingGrossWeight: shippingGrossWeightSchema,
        images: s.array(
          "The main images. Upload files with upload_material first and pass each returned url as link.",
          itemImageSchema,
          { minItems: 1 },
        ),
        createSkuList: s.array(
          "The SKUs to create. Each needs price (in fen), stock, logisticsPlanId (from list_logistics_plans), and deliveryTime ({ type, time }).",
          createItemSkuSchema,
          { minItems: 1 },
        ),
        brandId: s.nonWhitespaceString("The brand ID, from search_brands."),
        attributes: s.array(
          "The category attributes, from get_category_attributes: { propertyId, name, value, valueId, valueList }.",
          s.looseObject("One attribute assignment."),
        ),
        variantIds: s.array("The spec type IDs of the item.", s.nonWhitespaceString("A spec type ID.")),
        articleNo: s.nonWhitespaceString("The merchant article number."),
        description: s.nonWhitespaceString("The item description, up to 500 characters."),
        itemShortTitle: s.nonWhitespaceString("The item short title."),
        deliveryMode: s.integer("The delivery mode: 0 for normal delivery or 1 for no-logistics delivery.", {
          minimum: 0,
          maximum: 1,
        }),
        freeReturn: s.integer("The free-return policy: 1 or 2.", { minimum: 1, maximum: 2 }),
        videos: s.array(
          "The main videos, in the same { link } shape as images.",
          s.looseObject("One video: { link }."),
        ),
        imageDescriptions: s.array(
          "The description images, in the same { link } shape as images.",
          s.looseObject("One description image: { link }."),
        ),
      },
      {
        optional: [
          "shippingGrossWeight",
          "brandId",
          "attributes",
          "variantIds",
          "articleNo",
          "description",
          "itemShortTitle",
          "deliveryMode",
          "freeReturn",
          "videos",
          "imageDescriptions",
        ],
      },
    ),
    outputSchema: s.object("The created Xiaohongshu item.", { item: rawItemSchema }),
  }),
  defineProviderAction(service, {
    name: "update_item",
    operationType: "write",
    description:
      "Update a Xiaohongshu item and its SKUs: edit item fields, change existing SKUs through updateSkuList, add new ones through createSkuList, and remove SKUs through deleteSkuIdList.",
    inputSchema: s.object(
      "The item and SKU data used to update a Xiaohongshu product.",
      {
        itemId: s.nonWhitespaceString("The Xiaohongshu item ID."),
        name: s.nonWhitespaceString("The item title."),
        categoryId: s.nonWhitespaceString("The leaf category ID, from list_categories."),
        shippingTemplateId: s.nonWhitespaceString("The carriage template ID, from list_carriage_templates."),
        shippingGrossWeight: shippingGrossWeightSchema,
        images: s.array(
          "The main images. Upload files with upload_material first and pass each returned url as link.",
          itemImageSchema,
          { minItems: 1 },
        ),
        updateSkuList: s.array(
          "The existing SKUs to update. Each needs skuId, price (in fen), stock, logisticsPlanId (from list_logistics_plans), and deliveryTime ({ type, time }).",
          updateItemSkuSchema,
          { minItems: 1 },
        ),
        createSkuList: s.array(
          "The new SKUs to add to the item, in the same shape as updateSkuList without skuId.",
          createItemSkuSchema,
        ),
        deleteSkuIdList: s.array("The SKU IDs to remove from the item.", s.nonWhitespaceString("A SKU ID.")),
        brandId: s.nonWhitespaceString("The brand ID, from search_brands."),
        attributes: s.array(
          "The category attributes, from get_category_attributes: { propertyId, name, value, valueId, valueList }.",
          s.looseObject("One attribute assignment."),
        ),
        variantIds: s.array("The spec type IDs of the item.", s.nonWhitespaceString("A spec type ID.")),
        articleNo: s.nonWhitespaceString("The merchant article number."),
        description: s.nonWhitespaceString("The item description, up to 500 characters."),
        itemShortTitle: s.nonWhitespaceString("The item short title."),
        deliveryMode: s.integer("The delivery mode: 0 for normal delivery or 1 for no-logistics delivery.", {
          minimum: 0,
          maximum: 1,
        }),
        freeReturn: s.integer("The free-return policy: 1 or 2.", { minimum: 1, maximum: 2 }),
        videos: s.array(
          "The main videos, in the same { link } shape as images.",
          s.looseObject("One video: { link }."),
        ),
        imageDescriptions: s.array(
          "The description images, in the same { link } shape as images.",
          s.looseObject("One description image: { link }."),
        ),
      },
      {
        optional: [
          "shippingGrossWeight",
          "createSkuList",
          "deleteSkuIdList",
          "brandId",
          "attributes",
          "variantIds",
          "articleNo",
          "description",
          "itemShortTitle",
          "deliveryMode",
          "freeReturn",
          "videos",
          "imageDescriptions",
        ],
      },
    ),
    outputSchema: s.object("The updated Xiaohongshu item.", { item: rawItemSchema }),
  }),
  defineProviderAction(service, {
    name: "upload_material",
    operationType: "write",
    description: "Upload an image or video to the Xiaohongshu material center and get its url for use in item images.",
    inputSchema: s.object("The material to upload.", {
      name: s.nonWhitespaceString("The material file name."),
      type: s.stringEnum("The material type.", ["IMAGE", "VIDEO"]),
      contentBase64: s.nonWhitespaceString("The file content as a base64 string."),
    }),
    outputSchema: s.object("The uploaded material.", {
      material: s.looseObject("The material record with materialId, url, and upload status."),
    }),
  }),
  defineProviderAction(service, {
    name: "list_materials",
    operationType: "read",
    description: "List materials in the Xiaohongshu material center, for example to check an upload status.",
    inputSchema: s.object(
      "The filters used to list Xiaohongshu materials.",
      {
        materialId: s.nonWhitespaceString("An exact material ID."),
        name: s.nonWhitespaceString("A material file name filter."),
        type: s.stringEnum("The material type.", ["IMAGE", "VIDEO"]),
        status: s.integer("The upload status: 1 for success, 2 for uploading, or 3 for failed.", {
          minimum: 1,
          maximum: 3,
        }),
        createTimeFrom: timestampMsSchema,
        createTimeTo: timestampMsSchema,
        ascByCreateTime: s.boolean("Whether to sort by creation time ascending instead of descending."),
        pageNo: pageNoSchema,
        pageSize: s.integer("The number of materials per page. Defaults to 50 and cannot exceed 500.", {
          minimum: 1,
          maximum: 500,
        }),
      },
      {
        optional: [
          "materialId",
          "name",
          "type",
          "status",
          "createTimeFrom",
          "createTimeTo",
          "ascByCreateTime",
          "pageNo",
          "pageSize",
        ],
      },
    ),
    outputSchema: s.object("The Xiaohongshu material list.", {
      materials: s.array("The material records.", s.looseObject("A Xiaohongshu material record.")),
    }),
  }),
  defineProviderAction(service, {
    name: "search_brands",
    operationType: "read",
    description: "Search the brands available for a leaf Xiaohongshu category.",
    inputSchema: s.object(
      "The category and keyword used to search Xiaohongshu brands.",
      {
        categoryId: s.nonWhitespaceString("The leaf category ID, from list_categories."),
        keyword: s.nonWhitespaceString("A brand name keyword."),
        pageNo: pageNoSchema,
        pageSize: s.integer("The number of brands per page. Defaults to 20 and cannot exceed 20.", {
          minimum: 1,
          maximum: 20,
        }),
      },
      { optional: ["keyword", "pageNo", "pageSize"] },
    ),
    outputSchema: s.object("The Xiaohongshu brand search result.", {
      brands: s.array("The matching brands.", s.looseObject("A Xiaohongshu brand with id, name, enName, and image.")),
    }),
  }),
  defineProviderAction(service, {
    name: "list_carriage_templates",
    operationType: "read",
    description: "List the carriage (freight) templates of the Xiaohongshu shop.",
    inputSchema: s.object(
      "The pagination used to list carriage templates.",
      {
        pageIndex: s.integer("The one-based page number. Defaults to 1.", { minimum: 1 }),
        pageSize: s.integer("The number of carriage templates per page. Defaults to 20 and cannot exceed 100.", {
          minimum: 1,
          maximum: 100,
        }),
      },
      { optional: ["pageIndex", "pageSize"] },
    ),
    outputSchema: s.object("A paginated Xiaohongshu carriage template result.", {
      templates: s.array("The carriage template records.", s.looseObject("A Xiaohongshu carriage template.")),
      total: s.nonNegativeInteger("The total number of carriage templates reported by Xiaohongshu."),
    }),
  }),
  defineProviderAction(service, {
    name: "list_logistics_plans",
    operationType: "read",
    description:
      "List the logistics plans of the Xiaohongshu shop. planInfoId is the logisticsPlanId used when creating SKUs.",
    inputSchema: s.object("No input is required to list logistics plans.", {}),
    outputSchema: s.object("The Xiaohongshu logistics plan result.", {
      plans: s.array("The logistics plan records.", s.looseObject("A Xiaohongshu logistics plan.")),
    }),
  }),
  defineProviderAction(service, {
    name: "list_address_records",
    operationType: "read",
    description:
      "List the seller address records of the Xiaohongshu shop, including return addresses. sellerAddressRecordId is required when agreeing to a return shipment in audit_after_sale.",
    inputSchema: s.object(
      "The pagination used to list seller address records.",
      {
        pageIndex: s.integer("The one-based page number. Defaults to 1.", { minimum: 1 }),
        pageSize: s.integer("The number of address records per page. Defaults to 20 and cannot exceed 200.", {
          minimum: 1,
          maximum: 200,
        }),
      },
      { optional: ["pageIndex", "pageSize"] },
    ),
    outputSchema: s.object("A paginated Xiaohongshu seller address result.", {
      addresses: s.array("The seller address records.", s.looseObject("A Xiaohongshu seller address record.")),
      total: s.nonNegativeInteger("The total number of address records reported by Xiaohongshu."),
    }),
  }),
];
