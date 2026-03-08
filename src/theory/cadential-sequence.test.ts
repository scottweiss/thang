import { describe, it, expect } from 'vitest';
import {
  shouldStartCadentialSequence,
  createCadentialPlan,
  nextCadentialDegree,
  advanceCadentialPlan,
  isCadentialPlanActive,
} from './cadential-sequence';

describe('shouldStartCadentialSequence', () => {
  it('triggers at high section progress', () => {
    expect(shouldStartCadentialSequence(0.85, 'build', null)).toBe(true);
  });

  it('does not trigger early in section', () => {
    expect(shouldStartCadentialSequence(0.5, 'build', null)).toBe(false);
  });

  it('does not trigger if plan already active', () => {
    const plan = { degrees: [4, 0], position: 0 };
    expect(shouldStartCadentialSequence(0.9, 'build', plan)).toBe(false);
  });

  it('triggers when previous plan is complete', () => {
    const plan = { degrees: [4, 0], position: 2 };
    expect(shouldStartCadentialSequence(0.9, 'build', plan)).toBe(true);
  });
});

describe('createCadentialPlan', () => {
  it('lofi creates ii-V-I pattern', () => {
    const plan = createCadentialPlan('lofi', 3); // starting from IV
    expect(plan.degrees).toContain(4); // should include V
    expect(plan.degrees[plan.degrees.length - 1]).toBe(0); // ends on I
  });

  it('trance creates short V-I', () => {
    const plan = createCadentialPlan('trance', 3);
    expect(plan.degrees.length).toBeLessThanOrEqual(2);
    expect(plan.degrees[plan.degrees.length - 1]).toBe(0);
  });

  it('already on V creates [I] plan', () => {
    const plan = createCadentialPlan('lofi', 4);
    expect(plan.degrees).toEqual([0]);
  });

  it('already on I creates empty plan', () => {
    const plan = createCadentialPlan('lofi', 0);
    expect(plan.degrees).toEqual([]);
  });

  it('ambient prefers plagal (IV-I)', () => {
    const plan = createCadentialPlan('ambient', 2);
    expect(plan.degrees[plan.degrees.length - 1]).toBe(0);
  });
});

describe('cadential plan lifecycle', () => {
  it('steps through plan correctly', () => {
    const plan = createCadentialPlan('lofi', 5); // from vi
    expect(isCadentialPlanActive(plan)).toBe(true);

    const firstDegree = nextCadentialDegree(plan);
    expect(firstDegree).not.toBeNull();

    advanceCadentialPlan(plan);

    if (plan.degrees.length > 1) {
      const secondDegree = nextCadentialDegree(plan);
      expect(secondDegree).not.toBeNull();
      expect(secondDegree).not.toBe(firstDegree);
    }
  });

  it('plan becomes inactive after all degrees played', () => {
    const plan = { degrees: [4, 0], position: 0 };

    advanceCadentialPlan(plan); // played V
    expect(isCadentialPlanActive(plan)).toBe(true);

    advanceCadentialPlan(plan); // played I
    expect(isCadentialPlanActive(plan)).toBe(false);
    expect(nextCadentialDegree(plan)).toBeNull();
  });

  it('null plan is not active', () => {
    expect(isCadentialPlanActive(null)).toBe(false);
  });
});
