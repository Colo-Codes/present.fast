import { httpRouter } from 'convex/server';

export const httpRouteNames = {
  health: '/health',
} as const;

const http = httpRouter();

export default http;
