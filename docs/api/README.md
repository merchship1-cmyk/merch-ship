# MERCH SHIP API

Start the service:

```bash
npm start
```

Default base URL: `http://localhost:3000`.

## Endpoints

### `GET /health`

Returns service status and runtime environment.

### `POST /api/sync/commerce`

Runs `SYNC.NODE.COMMERCE` across offer, proof, and delivery payloads.

### `POST /api/products/spec`

Creates a `PRODUCT_FACTORY` product specification and distribution manifest.

### `POST /api/offers/align`

Aligns offer pricing, value props, margin, and storefront message.

### `POST /api/proof/route`

Routes proof to approved surfaces and marks review requirements.

### `POST /api/delivery/align`

Checks whether delivery assets satisfy promised outcomes.

### `POST /api/tools/pricing`

Runs the creator pricing calculator.

### `POST /api/tools/dashboard`

Creates a dashboard-ready summary from a commerce sync result.

### `GET /api/automation/jobs`

Lists registered automation jobs.

### `POST /api/ai/prompt`

Builds an AI prompt payload using the configured MERCH SHIP assistant model.
