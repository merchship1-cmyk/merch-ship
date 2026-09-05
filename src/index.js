import http from 'node:http';
import { env } from './config/env.js';
import { createRouter } from './http/router.js';

const server = http.createServer(createRouter());

server.listen(env.port, () => {
  console.log(`MERCH SHIP OS listening on port ${env.port}`);
});
