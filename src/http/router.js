import { env } from '../config/env.js';
import {
  runCommerceSync,
  createProductSpec,
  alignOffer,
  routeProof,
  alignDelivery,
  pricingCalculator,
  dashboardSnapshot,
  listJobs,
  buildPrompt
} from '../modules/index.js';

const readJson = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload, null, 2));
};

export const createRouter = () => async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, { status: 'ok', service: 'MERCH SHIP OS', environment: env.environment });
    }

    if (request.method === 'GET' && url.pathname === '/api/automation/jobs') {
      return sendJson(response, 200, listJobs());
    }

    if (request.method === 'POST' && url.pathname === '/api/sync/commerce') {
      return sendJson(response, 200, runCommerceSync(await readJson(request), env));
    }

    if (request.method === 'POST' && url.pathname === '/api/products/spec') {
      return sendJson(response, 200, createProductSpec(await readJson(request)));
    }

    if (request.method === 'POST' && url.pathname === '/api/offers/align') {
      return sendJson(response, 200, alignOffer(await readJson(request), env));
    }

    if (request.method === 'POST' && url.pathname === '/api/proof/route') {
      return sendJson(response, 200, routeProof(await readJson(request)));
    }

    if (request.method === 'POST' && url.pathname === '/api/delivery/align') {
      return sendJson(response, 200, alignDelivery(await readJson(request)));
    }

    if (request.method === 'POST' && url.pathname === '/api/tools/pricing') {
      return sendJson(response, 200, pricingCalculator(await readJson(request)));
    }

    if (request.method === 'POST' && url.pathname === '/api/tools/dashboard') {
      return sendJson(response, 200, dashboardSnapshot(await readJson(request)));
    }

    if (request.method === 'POST' && url.pathname === '/api/ai/prompt') {
      return sendJson(response, 200, buildPrompt(await readJson(request)));
    }

    return sendJson(response, 404, { status: 'not_found', path: url.pathname });
  } catch (error) {
    return sendJson(response, 500, { status: 'error', message: error.message });
  }
};
