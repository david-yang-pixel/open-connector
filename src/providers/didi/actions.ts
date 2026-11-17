import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const contentSchema = s.array(
  "Original MCP content blocks, including ride descriptions and links.",
  s.object(
    "An MCP content block.",
    {
      type: s.string("Content block type."),
      text: s.string("Text content when present."),
    },
    { required: [], additionalProperties: true },
  ),
);

export const didiActions: ActionDefinition[] = [
  defineProviderAction("didi", {
    name: "maps_direction_bicycling",
    description: "Plan a cycling route using coordinates obtained from maps_textsearch.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for maps_direction_bicycling.",
      {
        destination: s.string("Destination coordinates as longitude,latitude; obtain them from maps_textsearch."),
        need_geo: s.boolean("Whether to return route geometry points. The upstream default is true."),
        origin: s.string("Origin coordinates as longitude,latitude; obtain them from maps_textsearch."),
      },
      { required: ["origin", "destination"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.unknown("Provider-defined result data."),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "maps_direction_driving",
    description: "Plan a driving route using coordinates obtained from maps_textsearch.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for maps_direction_driving.",
      {
        destination: s.string("Destination coordinates as longitude,latitude; obtain them from maps_textsearch."),
        need_geo: s.boolean("Whether to return route geometry points. The upstream default is true."),
        origin: s.string("Origin coordinates as longitude,latitude; obtain them from maps_textsearch."),
      },
      { required: ["origin", "destination"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.unknown("Provider-defined result data."),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "maps_direction_transit",
    description: "Plan a public transit route in the specified city using coordinates obtained from maps_textsearch.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for maps_direction_transit.",
      {
        city: s.string("Full city name, such as 北京市."),
        destination: s.string("Destination coordinates as longitude,latitude; obtain them from maps_textsearch."),
        origin: s.string("Origin coordinates as longitude,latitude; obtain them from maps_textsearch."),
      },
      { required: ["origin", "destination", "city"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.unknown("Provider-defined result data."),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "maps_direction_walking",
    description: "Plan a walking route using coordinates obtained from maps_textsearch.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for maps_direction_walking.",
      {
        destination: s.string("Destination coordinates as longitude,latitude; obtain them from maps_textsearch."),
        need_geo: s.boolean("Whether to return route geometry points. The upstream default is true."),
        origin: s.string("Origin coordinates as longitude,latitude; obtain them from maps_textsearch."),
      },
      { required: ["origin", "destination"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.unknown("Provider-defined result data."),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "maps_place_around",
    description: "Search for nearby places using map-derived coordinates and an optional radius.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for maps_place_around.",
      {
        keywords: s.string("Place search keywords."),
        location: s.string("Coordinates as longitude,latitude, obtained from a map tool."),
        max_distance: s.string("Search radius in meters, encoded as a string."),
        show_fields: s.string("Pass sub_poi_list to include child POIs; omit to exclude them."),
      },
      { required: ["keywords", "location"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.unknown("Provider-defined result data."),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "maps_regeocode",
    description: "Convert map-derived coordinates into an address.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for maps_regeocode.",
      {
        location: s.string("Coordinates as longitude,latitude, obtained from a map tool."),
      },
      { required: ["location"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.unknown("Provider-defined result data."),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "maps_textsearch",
    description:
      "Search for places by keyword and city. Use returned coordinates for ride estimates and route planning; do not guess coordinates or the user starting location. Ask the user to choose when multiple candidates match.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for maps_textsearch.",
      {
        city: s.string("Full city name, such as 北京市."),
        keywords: s.string("Place search keywords."),
        location: s.string("Coordinates as longitude,latitude, obtained from a map tool."),
        show_fields: s.string("Pass sub_poi_list to include child POIs; omit to exclude them."),
      },
      { required: ["keywords", "city"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.array(
        "Matching places.",
        s.object(
          "A place returned by DiDi.",
          {
            display_name: s.string("Place name."),
            address: s.string("Place address."),
            address_all: s.string("Full address including the place name."),
            city: s.string("City containing the place."),
            location: s.object(
              "Place coordinates.",
              {
                lng: s.number("Longitude."),
                lat: s.number("Latitude."),
              },
              { required: [], additionalProperties: true },
            ),
          },
          { required: [], additionalProperties: true },
        ),
      ),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "taxi_cancel_order",
    description: "Cancel a specified ride order. Trips in progress and completed trips cannot be canceled.",
    operationType: "destructive",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for taxi_cancel_order.",
      {
        order_id: s.string(
          "Order ID returned by order creation or lookup. When optional and omitted, query the current account\u2019s unfinished order.",
        ),
        reason: s.string("Optional cancellation reason."),
      },
      { required: ["order_id"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.nullable(
        s.object(
          "Cancellation result.",
          {
            success: s.boolean("Whether cancellation succeeded."),
          },
          { required: [], additionalProperties: true },
        ),
      ),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "taxi_create_order",
    description:
      "Create a real ride order using an unexpired taxi_estimate traceId. Show the selected vehicle categories and estimated prices, and obtain explicit user confirmation before calling. On a transport failure, stop and do not automatically retry or switch keys; the booking outcome may be unknown.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for taxi_create_order.",
      {
        caller_car_phone: s.string("Caller phone number. Omit to use the account phone number."),
        device_context: s.object(
          "Optional device context.",
          {
            brand: s.string("Device brand, such as honor."),
            device_id: s.string("Unique device identifier."),
          },
          { required: [] },
        ),
        estimate_trace_id: s.string("Unexpired traceId from taxi_estimate. Obtain a new estimate if it expires."),
        product_category: s.string(
          "Product categories from taxi_estimate, separated by commas without spaces. For app links, supply only categories explicitly selected by the user.",
        ),
        tenant_extensions: s.object(
          "Tenant-specific extension fields. Only fields registered for the current tenant are parsed; other fields are ignored by DiDi.",
          {},
          { required: [], additionalProperties: true },
        ),
      },
      { required: ["product_category", "estimate_trace_id"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.nullable(
        s.object(
          "Created ride order data.",
          {
            orderId: s.string("Order ID for later lookup or cancellation."),
            status: s.string("Initial order status."),
          },
          { required: [], additionalProperties: true },
        ),
      ),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "taxi_estimate",
    description:
      "Estimate available ride categories and prices. Obtain coordinates from maps_textsearch first; ask for the starting location if unknown. Use the exact user-selected category from the returned options; never silently substitute another category. The returned traceId is required for ordering and expires.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for taxi_estimate.",
      {
        from_lat: s.string("Origin latitude as a string; obtain it from maps_textsearch, never guess."),
        from_lng: s.string("Origin longitude as a string; obtain it from maps_textsearch, never guess."),
        from_name: s.string("Origin place name."),
        to_lat: s.string("Destination latitude as a string; obtain it from maps_textsearch, never guess."),
        to_lng: s.string("Destination longitude as a string; obtain it from maps_textsearch, never guess."),
        to_name: s.string("Destination place name."),
      },
      { required: ["from_lng", "from_lat", "from_name", "to_lng", "to_lat", "to_name"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.nullable(
        s.object(
          "Ride estimate data, including the expiring traceId.",
          {
            traceId: s.string("Estimate trace ID used as estimate_trace_id when ordering."),
            items: s.array(
              "Available vehicle categories and prices.",
              s.object(
                "One available vehicle category.",
                {
                  productName: s.string("Vehicle category name."),
                  productCategory: s.string("Vehicle category identifier used as product_category."),
                  priceText: s.string("Estimated price in yuan."),
                },
                { required: [], additionalProperties: true },
              ),
            ),
          },
          { required: [], additionalProperties: true },
        ),
      ),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "taxi_generate_ride_app_link",
    description:
      "Generate a deep link for the user to finish ordering in DiDi app version 7.1.2 or later. Obtain coordinates from maps_textsearch; this action does not place an order.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for taxi_generate_ride_app_link.",
      {
        from_lat: s.string("Origin latitude as a string; obtain it from maps_textsearch, never guess."),
        from_lng: s.string("Origin longitude as a string; obtain it from maps_textsearch, never guess."),
        product_category: s.string(
          "Product categories from taxi_estimate, separated by commas without spaces. For app links, supply only categories explicitly selected by the user.",
        ),
        to_lat: s.string("Destination latitude as a string; obtain it from maps_textsearch, never guess."),
        to_lng: s.string("Destination longitude as a string; obtain it from maps_textsearch, never guess."),
      },
      { required: ["from_lng", "from_lat", "to_lng", "to_lat"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.nullable(s.unknown("Provider-defined result data.")),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "taxi_get_driver_location",
    description: "Get the driver\u2019s current coordinates for an ongoing ride order.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for taxi_get_driver_location.",
      {
        order_id: s.string(
          "Order ID returned by order creation or lookup. When optional and omitted, query the current account\u2019s unfinished order.",
        ),
      },
      { required: ["order_id"] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.nullable(
        s.object(
          "Driver coordinates.",
          {
            longitude: s.number("Current driver longitude."),
            latitude: s.number("Current driver latitude."),
          },
          { required: [], additionalProperties: true },
        ),
      ),
      content: contentSchema,
    }),
  }),
  defineProviderAction("didi", {
    name: "taxi_query_order",
    description:
      "Query ride status, driver details, and progress. Omit order_id to query the current account\u2019s unfinished order. Query once per call; do not interpret unknown status codes as completion.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.object(
      "Input for taxi_query_order.",
      {
        order_id: s.string(
          "Order ID returned by order creation or lookup. When optional and omitted, query the current account\u2019s unfinished order.",
        ),
      },
      { required: [] },
    ),
    outputSchema: s.requiredObject("Normalized DiDi response.", {
      data: s.nullable(
        s.object(
          "Current order status and provider-defined trip details.",
          {
            statusCode: s.integer("Order status code; the provider can add new states."),
            statusText: s.string("Human-readable order status."),
            driver: s.object(
              "Driver details when available.",
              {
                name: s.string("Driver name."),
                phone: s.string("Driver contact phone number."),
                carModel: s.string("Vehicle model and color."),
                carPlate: s.string("Vehicle license plate."),
              },
              { required: [], additionalProperties: true },
            ),
          },
          { required: [], additionalProperties: true },
        ),
      ),
      content: contentSchema,
    }),
  }),
];
