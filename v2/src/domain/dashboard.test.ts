import { describe, expect, it } from 'vitest';

import {
  createDashboardSnapshot,
  dashboardSnapshotSchema,
  markDashboardBlocked,
} from './dashboard';

describe('Zenzy orientation dashboard', () => {
  it('creates a valid start snapshot', () => {
    const snapshot = createDashboardSnapshot(
      'start',
      new Date('2026-09-03T03:00:00.000Z'),
    );

    expect(dashboardSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.stage).toBe('start');
    expect(snapshot.now).toContain('Tell Zenzy');
  });

  it('makes explicit acceptance visible in the execution state', () => {
    const snapshot = createDashboardSnapshot(
      'execution',
      new Date('2026-09-03T03:01:00.000Z'),
    );

    expect(snapshot.currentUnderstanding).toContain('accepted');
    expect(snapshot.done).toContain('accepted');
  });

  it('records a blocker without losing the current stage', () => {
    const snapshot = createDashboardSnapshot(
      'clarity',
      new Date('2026-09-03T03:02:00.000Z'),
    );
    const blocked = markDashboardBlocked(
      snapshot,
      'The request could not be completed.',
      new Date('2026-09-03T03:03:00.000Z'),
    );

    expect(blocked.stage).toBe('clarity');
    expect(blocked.blocked).toBe('The request could not be completed.');
    expect(blocked.currentUnderstanding).toContain('blocker');
  });
});
