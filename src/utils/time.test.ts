import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRelativeTime } from './time';

describe('getRelativeTime', () => {
  beforeEach(() => {
    // Tell vitest we use mocked time
    vi.useFakeTimers();
    // Set system time to a fixed date
    const date = new Date(2026, 6, 13, 12, 0, 0); // 2026-07-13 12:00:00
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for times under 60 seconds ago', () => {
    const timestamp = new Date(2026, 6, 13, 11, 59, 10).getTime(); // 50 seconds ago
    expect(getRelativeTime(timestamp)).toBe('just now');
  });

  it('returns minutes ago for times under 60 minutes ago', () => {
    const timestamp = new Date(2026, 6, 13, 11, 30, 0).getTime(); // 30 mins ago
    expect(getRelativeTime(timestamp)).toBe('30m ago');
  });

  it('returns hours ago for times under 24 hours ago', () => {
    const timestamp = new Date(2026, 6, 13, 7, 0, 0).getTime(); // 5 hours ago
    expect(getRelativeTime(timestamp)).toBe('5h ago');
  });

  it('returns days ago for times under 7 days ago', () => {
    const timestamp = new Date(2026, 6, 10, 12, 0, 0).getTime(); // 3 days ago
    expect(getRelativeTime(timestamp)).toBe('3d ago');
  });

  it('returns formatted date string for times over 7 days ago', () => {
    const pastDate = new Date(2026, 5, 1, 12, 0, 0); // long ago
    expect(getRelativeTime(pastDate)).toBe(pastDate.toLocaleDateString());
  });
});
