import { describe, it, expect } from 'vitest';
import {
  shouldStartChain,
  createChainPlan,
  chainSuspensionOffset,
  advanceChain,
  isChainActive,
  chainProbability,
} from './suspension-chain';

describe('shouldStartChain', () => {
  it('does not start if chain already active', () => {
    const plan = { length: 3, type: '7-6' as const, position: 1, suspendedInterval: 11, resolutionInterval: 9 };
    // Should never start with active plan
    let started = false;
    for (let i = 0; i < 100; i++) {
      if (shouldStartChain('lofi', 'build', plan)) started = true;
    }
    expect(started).toBe(false);
  });

  it('can start with no existing plan', () => {
    let started = false;
    for (let i = 0; i < 200; i++) {
      if (shouldStartChain('lofi', 'breakdown', null)) {
        started = true;
        break;
      }
    }
    expect(started).toBe(true);
  });

  it('can start when previous plan is complete', () => {
    const completePlan = { length: 2, type: '4-3' as const, position: 2, suspendedInterval: 5, resolutionInterval: 4 };
    let started = false;
    for (let i = 0; i < 200; i++) {
      if (shouldStartChain('lofi', 'groove', completePlan)) {
        started = true;
        break;
      }
    }
    expect(started).toBe(true);
  });
});

describe('createChainPlan', () => {
  it('creates plan with valid length', () => {
    const plan = createChainPlan('lofi');
    expect(plan.length).toBeGreaterThanOrEqual(2);
    expect(plan.length).toBeLessThanOrEqual(4);
  });

  it('starts at position 0', () => {
    const plan = createChainPlan('lofi');
    expect(plan.position).toBe(0);
  });

  it('has valid type', () => {
    const plan = createChainPlan('lofi');
    expect(['7-6', '4-3', 'mixed']).toContain(plan.type);
  });

  it('has valid intervals', () => {
    for (let i = 0; i < 20; i++) {
      const plan = createChainPlan('lofi');
      expect([5, 11]).toContain(plan.suspendedInterval);
      expect([4, 9]).toContain(plan.resolutionInterval);
    }
  });
});

describe('chainSuspensionOffset', () => {
  it('returns suspension and resolution for active plan', () => {
    const plan = { length: 2, type: '7-6' as const, position: 0, suspendedInterval: 11, resolutionInterval: 9 };
    const offset = chainSuspensionOffset(plan);
    expect(offset).not.toBeNull();
    expect(offset!.suspended).toBe(11);
    expect(offset!.resolution).toBe(9);
  });

  it('returns null for complete plan', () => {
    const plan = { length: 2, type: '4-3' as const, position: 2, suspendedInterval: 5, resolutionInterval: 4 };
    expect(chainSuspensionOffset(plan)).toBeNull();
  });

  it('mixed chain alternates types', () => {
    const plan = { length: 4, type: 'mixed' as const, position: 0, suspendedInterval: 11, resolutionInterval: 9 };
    const first = chainSuspensionOffset(plan);
    expect(first!.suspended).toBe(11); // 7-6

    plan.position = 1;
    const second = chainSuspensionOffset(plan);
    expect(second!.suspended).toBe(5); // 4-3 (alternated)
  });
});

describe('chain lifecycle', () => {
  it('advances through plan correctly', () => {
    const plan = createChainPlan('lofi');
    expect(isChainActive(plan)).toBe(true);

    for (let i = 0; i < plan.length; i++) {
      expect(chainSuspensionOffset(plan)).not.toBeNull();
      advanceChain(plan);
    }

    expect(isChainActive(plan)).toBe(false);
    expect(chainSuspensionOffset(plan)).toBeNull();
  });

  it('null plan is not active', () => {
    expect(isChainActive(null)).toBe(false);
  });
});

describe('chainProbability', () => {
  it('lofi has highest probability', () => {
    expect(chainProbability('lofi')).toBe(0.30);
  });

  it('trance has lowest probability', () => {
    expect(chainProbability('trance')).toBe(0.05);
  });
});
