# medusa-qikink
> Medusa v2 plugin that integrates Qikink APIs (token/orders), maps Qikink SKUs to Medusa variants, auto-creates Qikink orders on `order.placed`, and tracks/syncs Qikink order status.

## Plugin Overview

`medusa-qikink` provides a complete Qikink integration layer for Medusa:

- Qikink API client for token retrieval, order creation, order listing, and single-order retrieval.
- Product mapping module (`qikink_sku_id` <-> Medusa `variant_id`) with admin APIs + admin widget.
- Order mapping module (`qikink_order_id` <-> Medusa `order_id`, status) with store/admin read APIs.
- `order.placed` subscriber that auto-creates Qikink orders for mapped variants and stores mapping.
- Scheduled/admin-triggered status refresh flow that syncs Qikink statuses to internal mapping status.
- Built-in request rate limiting and token caching for outbound Qikink calls.

### Problem It Solves

It centralizes Qikink POD/dropship integration so merchants can:

- map catalog SKUs once,
- automatically route eligible Medusa orders to Qikink,
- and keep Qikink order status synchronized inside Medusa.

### Medusa Version

Built for **Medusa v2** (`@medusajs/framework` / `@medusajs/medusa` `2.12.4`).

## Installation & Setup

### Install

```bash
npm install medusa-qikink
```

or

```bash
yarn add medusa-qikink
```

### Register plugin and modules in `medusa-config.ts`

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "medusa-qikink",
      options: {
        apiUrl: process.env.QIKINK_API_URL,
        clientId: process.env.QIKINK_CLIENT_ID,
        clientSecret: process.env.QIKINK_CLIENT_SECRET,
        rateLimitRequestsPerMinute: 30,
      },
    },
  ],
  modules: [
    require("medusa-qikink/modules/qikink-product-mapping"),
    require("medusa-qikink/modules/qikink-order-mapping"),
  ],
})
```

### Run migrations

```bash
npx medusa db:migrate
```

Required to create:

- `qikink_product_mapping`
- `qikink_order_mapping`
- related unique/secondary indexes

## Configuration (`config.ts` / plugin options)

The plugin resolves config from:

1. plugin options (highest priority),
2. env-backed `src/config.ts` defaults/fallbacks.

### Plugin options

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiUrl` | `string` | Yes | env-backed | Qikink base URL (normalizes/removes trailing `/v1` or `/api`). |
| `clientId` | `string` | Yes | env-backed | Qikink API Client ID. |
| `clientSecret` | `string` | Yes | env-backed | Qikink API client secret. |
| `rateLimitRequestsPerMinute` | `number` | No | env-backed (`30`) | Outbound Qikink request limit per minute (`0` disables). |

### Runtime config values from `src/config.ts`

| Config Key | Type | Default | Purpose |
|---|---|---|---|
| `rateLimitRequestsPerMinute` | `number` | `30` | Qikink request limiter window cap. |
| `refreshCoolingTimeMinutes` | `number` | `10` | Skip refresh for recently-updated mappings. |
| `refreshCronIntervalMinutes` | `number` | `15` | Interval for scheduled refresh job; clamped to `1..60`. |

### Complete example config block

```ts
{
  resolve: "medusa-qikink",
  options: {
    apiUrl: "https://api.qikink.com",
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    rateLimitRequestsPerMinute: 30,
  },
}
```

## Environment Variables

Direct runtime env usage exists in `src/config.ts`.

| Variable | Required | Default | Purpose | Example |
|---|---|---|---|---|
| `QIKINK_API_URL` | Yes (unless plugin option provided) | `""` | Qikink base URL. | `https://api.qikink.com` |
| `QIKINK_CLIENT_ID` | Yes (unless plugin option provided) | `""` | Qikink Client ID. | `abc123` |
| `QIKINK_CLIENT_SECRET` | Yes (unless plugin option provided) | `""` | Qikink client secret. | `secret_xyz` |
| `QIKINK_RATE_LIMIT_REQUESTS_PER_MINUTE` | No | `30` | Max outbound Qikink requests/minute; `0` disables limiter. | `60` |
| `QIKINK_REFRESH_COOLING_TIME_MINUTES` | No | `10` | Cooling window before a mapping can be refreshed again. | `5` |
| `QIKINK_REFRESH_CRON_INTERVAL_MINUTES` | No | `15` | Scheduled job interval in minutes (1..60). | `20` |

## REST APIs / Routes

### Store routes

#### `POST /store/qikink/token`

- **Auth**: public store route
- **Body**: none
- **Response**: `{ access_token, ...tokenResponse }`
- **Description**: Gets Qikink access token via configured credentials.

#### `GET /store/qikink/orders`

- **Auth**: public store route
- **Query params**:

| Param | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | No | If present, fetch single order. |
| `from_date` | `string` | No | Optional date range start for single-order style request. |
| `to_date` | `string` | No | Optional date range end. |

- **Response**:
  - order list (when no `id/from_date/to_date`), or
  - single order payload.
- **Description**: Proxies Qikink order read APIs.

#### `POST /store/qikink/orders`

- **Auth**: public store route
- **Body**: Qikink create-order payload (`order_number`, `line_items`, `shipping_address`, etc.)
- **Response**: Qikink create-order response
- **Description**: Creates an order in Qikink.

#### `GET /store/qikink-order-mapping`

- **Auth**: public store route
- **Query params**:

| Param | Type | Required | Default |
|---|---|---|---|
| `qikink_order_id` | `string` | No | - |
| `medusa_order_id` | `uuid` | No | - |
| `status` | `string` | No | - |
| `limit` | `number` | No | `20` |
| `offset` | `number` | No | `0` |
| `order` | `"created_at" \| "updated_at" \| "qikink_order_id" \| "status"` | No | `created_at` |
| `order_direction` | `"ASC" \| "DESC"` | No | `DESC` |

- **Response**: `{ mappings, count, offset, limit }`

#### `GET /store/qikink-order-mapping/:id`

- **Auth**: public store route
- **Response**: `{ mapping }`

#### `GET /store/plugin`

- **Auth**: public
- **Response**: HTTP `200`

### Admin routes

#### Product mapping

##### `GET /admin/qikink-product-mapping`

- **Auth**: admin JWT/session
- **Query params**: `qikink_sku_id`, `variant_id`, `limit`, `offset`, `order`, `order_direction`
- **Response**: `{ mappings, count, offset, limit }`

##### `POST /admin/qikink-product-mapping`

- **Auth**: admin JWT/session
- **Body**:

| Field | Type | Required |
|---|---|---|
| `qikink_sku_id` | `string` | Yes |
| `variant_id` | `string` | Yes |
| `print_type_id` | `number` | No (validated allowed values) |

- **Response**: `{ mapping }`

##### `GET /admin/qikink-product-mapping/:id`
- **Auth**: admin
- **Response**: `{ mapping }`

##### `PATCH /admin/qikink-product-mapping/:id`
- **Auth**: admin
- **Body**: optional `qikink_sku_id`, optional `print_type_id`
- **Response**: `{ mapping }`

##### `DELETE /admin/qikink-product-mapping/:id`
- **Auth**: admin
- **Response**: `{ id, object: "qikink_product_mapping", deleted: true }`

#### Order mapping

##### `GET /admin/qikink-order-mapping`
- **Auth**: admin
- **Query params**: same shape as store list route
- **Response**: `{ mappings, count, offset, limit }`

##### `GET /admin/qikink-order-mapping/:id`
- **Auth**: admin
- **Response**: `{ mapping }`

##### `POST /admin/qikink-order-mapping/refresh`

- **Auth**: admin
- **Query params**:

| Param | Type | Required | Default |
|---|---|---|---|
| `order_id` | `string` | No | - |
| `limit` | `number` | No | `500` (max `1000`) |
| `concurrency` | `number` | No | `20` (max `100`) |

- **Behavior**:
  - with `order_id`: refresh one mapping by Qikink order ID (respects cooling window),
  - without `order_id`: bulk refresh eligible non-terminal mappings.
- **Response**:
  - single refresh: `{ updated: 1, mapping }` or `{ updated: 0, skipped_cooling: true }`
  - bulk refresh: `{ updated, processed, total_eligible, limit }`

#### `GET /admin/plugin`

- **Auth**: admin
- **Response**: HTTP `200`

### Important endpoint examples

```bash
curl -X POST "http://localhost:9000/store/qikink/token" \
  -H "x-publishable-api-key: <pk>"
```

```bash
curl -X POST "http://localhost:9000/store/qikink/orders" \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: <pk>" \
  -d '{
    "order_number": "MED-1001",
    "qikink_shipping": "1",
    "gateway": "COD",
    "total_order_value": "999",
    "line_items": [],
    "shipping_address": { "country_code": "IN", "province": "Tamil nadu" }
  }'
```

```bash
curl -X POST "http://localhost:9000/admin/qikink-order-mapping/refresh?limit=200&concurrency=10" \
  -H "Authorization: Bearer <admin_jwt>"
```

```ts
await fetch("/admin/qikink-product-mapping", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    qikink_sku_id: "SKU123",
    variant_id: "var_123",
    print_type_id: 1,
  }),
})
```

## Services

### `QikinkProductMappingModuleService`

- **Location**: `src/modules/qikink-product-mapping/service.ts`
- **Manages**: mapping between `qikink_sku_id` and Medusa `variant_id`.
- **Key methods**:

| Method | Signature |
|---|---|
| `listMappings` | `(selector?, config?) => Promise<{ mappings, count }>` |
| `getMapping` | `(id: string) => Promise<QikinkProductMappingDTO>` |
| `getMappingByQikinkSku` | `(qikink_sku_id: string) => Promise<QikinkProductMappingDTO \| null>` |
| `getMappingByVariantId` | `(variant_id: string) => Promise<QikinkProductMappingDTO \| null>` |
| `createMapping` | `(input) => Promise<QikinkProductMappingDTO>` |
| `updateMapping` | `(id, input) => Promise<QikinkProductMappingDTO>` |
| `deleteMapping` | `(id) => Promise<void>` |

### `QikinkOrderMappingModuleService`

- **Location**: `src/modules/qikink-order-mapping/service.ts`
- **Manages**: mapping between `qikink_order_id`, `medusa_order_id`, and sync status.
- **Key methods**:

| Method | Signature |
|---|---|
| `listMappings` | `(selector?, config?) => Promise<{ mappings, count }>` |
| `listMappingsForRefresh` | `(config?) => Promise<{ mappings, count }>` |
| `getMapping` | `(id: string) => Promise<QikinkOrderMappingDTO>` |
| `getMappingByQikinkOrderId` | `(qikink_order_id: string) => Promise<QikinkOrderMappingDTO \| null>` |
| `createMapping` | `(input) => Promise<QikinkOrderMappingDTO>` |
| `updateStatus` | `(id, status) => Promise<QikinkOrderMappingDTO>` |
| `updateStatusByQikinkOrderId` | `(qikink_order_id, status) => Promise<QikinkOrderMappingDTO \| null>` |

### Qikink client/helper layer

- `createQikinkClient` (`src/helpers/qikink-client.ts`) with:
  - `getToken`
  - `createOrder`
  - `listOrders`
  - `getOrder`
- shared token cache by `(apiUrl|clientId)`.
- rate limiter hook via `checkAndRecordRateLimit`.

## Workflows & Steps (Medusa v2)

No custom workflows/steps are implemented in runtime code.  
`src/workflows/README.md` is a template doc only.

## Subscribers / Event Hooks

### `order.placed` subscriber

- **File**: `src/subscribers/order-placed-qikink.ts`
- **Event**: `order.placed`
- **What it does**:
  - retrieves order and line items
  - resolves variant -> Qikink SKU mappings
  - builds Qikink order payload
  - requests token + creates Qikink order
  - creates `qikink_order_mapping` record with initial status `"created"`
- **Failure handling**: logs and returns (non-blocking), avoids throwing to block order flow.

## Admin UI / Widgets

### Product Variant widget

- **File**: `src/admin/widgets/qikink-variant-mapping-widget.tsx`
- **Zone**: `product_variant.details.after`
- **Renders**:
  - current SKU/print-type mapping status
  - create/edit modal with `qikink_sku_id` + `print_type_id`
  - delete prompt
- **Interactions**:
  - fetch mapping by `variant_id`
  - create, patch, delete mapping APIs
  - invalidate product/variant query caches

### Admin route: Qikink Orders

- **File**: `src/admin/routes/qikink-orders/page.tsx`
- **Route config**: label `Qikink Orders`, icon `ArrowPathMini`
- **Renders**:
  - mapping list table (medusa order ID, qikink order ID, status, created)
  - status filter
  - refresh button
- **Interactions**:
  - triggers refresh API (also on first page load)
  - reloads mapping list

## Models & Entities

### `qikink_product_mapping`

| Field | Type | Nullable |
|---|---|---|
| `id` | `varchar` | No |
| `qikink_sku_id` | `varchar` | No |
| `variant_id` | `varchar` | No |
| `print_type_id` | `integer` | No (default `1`) |
| `created_at` | `timestamptz` | No |
| `updated_at` | `timestamptz` | No |
| `deleted_at` | `timestamptz` | Yes |

Indexes/constraints:

- unique active index on `qikink_sku_id`
- unique active index on `variant_id`

### `qikink_order_mapping`

| Field | Type | Nullable |
|---|---|---|
| `id` | `varchar` | No |
| `qikink_order_id` | `varchar` | No |
| `medusa_order_id` | `varchar` | No |
| `status` | `varchar` | No |
| `created_at` | `timestamptz` | No |
| `updated_at` | `timestamptz` | No |
| `deleted_at` | `timestamptz` | Yes |

Indexes/constraints:

- unique active index on `qikink_order_id`
- indexes on `medusa_order_id`, `status`, and `deleted_at`

Relationships:

- logical linkage to Medusa order/variant IDs via text fields (no explicit ORM relation declared).

## Use Cases & Examples

1. **Automatic POD order forwarding**
   - Scenario: a placed order contains mapped Qikink variants.
   - Feature: `order.placed` subscriber creates Qikink order and mapping automatically.

2. **Qikink SKU catalog linking**
   - Scenario: merchandiser links Medusa variant to Qikink SKU.
   - Feature: admin product-variant widget + product mapping APIs.

3. **Operational order tracking**
   - Scenario: ops team monitors Qikink fulfillment lifecycle in admin.
   - Feature: Qikink Orders admin page + status badges.

4. **Manual or scheduled status synchronization**
   - Scenario: keep mappings current with Qikink delivery state.
   - Feature: refresh endpoint + scheduled job.

5. **Direct Qikink API passthrough for storefront/backend flows**
   - Scenario: client or middleware needs token/list/get/create order calls.
   - Feature: store Qikink token/orders routes.

## Troubleshooting

### `apiUrl/clientId/clientSecret is required`

- **Cause**: missing config in env/plugin options.
- **Fix**: set `QIKINK_API_URL`, `QIKINK_CLIENT_ID`, `QIKINK_CLIENT_SECRET` or plugin options.

### `Qikink did not return an access token`

- **Cause**: credential or upstream token response issue.
- **Fix**: verify Qikink credentials/base URL and inspect server logs.

### 429 `Rate limit exceeded...`

- **Cause**: outbound request cap reached.
- **Fix**: reduce call volume, wait for next window, or tune `QIKINK_RATE_LIMIT_REQUESTS_PER_MINUTE`.

### Product mapping create returns duplicate conflict

- **Cause**: SKU or variant already mapped (unique active constraints).
- **Fix**: edit/delete existing mapping first.

### Refresh endpoint updates `0` with `skipped_cooling`

- **Cause**: mapping updated recently within cooling window.
- **Fix**: wait until cooling threshold passes or adjust `QIKINK_REFRESH_COOLING_TIME_MINUTES`.

### Subscriber appears to skip order

- **Cause**: no mapped variants, module/config missing, or upstream Qikink call failure.
- **Fix**: ensure variant mappings exist, modules are registered, and Qikink config is valid.



