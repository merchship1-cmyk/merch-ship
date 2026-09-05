# Environment Setup

MERCH SHIP uses Node.js 20+ and has no required third-party runtime dependencies for the initial operating-system spine.

## Configure

Copy the example environment file:

```bash
cp .env.example .env
```

Set values as needed:

- `MERCH_SHIP_PORT`: HTTP service port.
- `MERCH_SHIP_ENV`: Runtime environment label.
- `MERCH_SHIP_STORE_URL`: Storefront or Shopify URL.
- `MERCH_SHIP_DEFAULT_CURRENCY`: Default commerce currency.
- `MERCH_SHIP_MIN_MARGIN_PERCENT`: Minimum protected margin for offer pricing.
- `MERCH_SHIP_AI_MODEL`: Model name used in AI prompt payloads.

## Run

```bash
npm start
```

## Test

```bash
npm test
```

## Manual Commerce Sync

```bash
npm run sync:commerce
```

You can also pass a JSON file path:

```bash
npm run sync:commerce -- ./path/to/input.json
```
