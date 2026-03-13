import { cronJobs } from 'convex/server';

export const cronNames = {
  nightlyDataCleanup: 'nightlyDataCleanup',
} as const;

const crons = cronJobs();

export default crons;
