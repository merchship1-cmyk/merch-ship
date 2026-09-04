import type { SyncStatus } from '../domain/contracts';

const allowedTransitions: Record<SyncStatus, readonly SyncStatus[]> = {
  queued: ['running', 'failed', 'dead_lettered'],
  running: ['succeeded', 'failed', 'dead_lettered'],
  succeeded: [],
  failed: ['queued', 'dead_lettered'],
  dead_lettered: [],
};

export function canTransitionSyncStatus(
  from: SyncStatus,
  to: SyncStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertSyncStatusTransition(
  from: SyncStatus,
  to: SyncStatus,
): void {
  if (!canTransitionSyncStatus(from, to)) {
    throw new Error(`Invalid sync status transition: ${from} → ${to}`);
  }
}

export function nextRetryAttempt(currentAttempt: number): number {
  if (!Number.isInteger(currentAttempt) || currentAttempt < 1) {
    throw new Error('Current attempt must be a positive integer.');
  }

  return currentAttempt + 1;
}
