import { describe, it, expect } from 'vitest';
import {
  gravityMultiplier,
  shouldEscalate,
  escalationStrength,
} from './gravity-escalation';

describe('gravityMultiplier', () => {
  it('1.0 at normal momentum', () => {
    expect(gravityMultiplier(2, 'lofi', 'groove')).toBe(1.0);
  });

  it('> 1.0 at high momentum', () => {
    expect(gravityMultiplier(4, 'lofi', 'groove')).toBeGreaterThan(1.0);
  });

  it('stronger during builds', () => {
    const build = gravityMultiplier(4, 'avril', 'build');
    const bd = gravityMultiplier(4, 'avril', 'breakdown');
    expect(build).toBeGreaterThan(bd);
  });

  it('capped at 2.0', () => {
    expect(gravityMultiplier(10, 'avril', 'build')).toBeLessThanOrEqual(2.0);
  });

  it('avril has strongest escalation', () => {
    const avril = gravityMultiplier(4, 'avril', 'groove');
    const ambient = gravityMultiplier(4, 'ambient', 'groove');
    expect(avril).toBeGreaterThan(ambient);
  });
});

describe('shouldEscalate', () => {
  it('true at high momentum', () => {
    expect(shouldEscalate(3, 'lofi')).toBe(true);
  });

  it('false at normal momentum', () => {
    expect(shouldEscalate(1.5, 'lofi')).toBe(false);
  });
});

describe('escalationStrength', () => {
  it('avril is strongest', () => {
    expect(escalationStrength('avril')).toBe(0.55);
  });

  it('ambient is weakest', () => {
    expect(escalationStrength('ambient')).toBe(0.15);
  });
});
