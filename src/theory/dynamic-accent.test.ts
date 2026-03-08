import { describe, it, expect } from 'vitest';
import {
  dynamicAccents,
  shouldApplyDynamicAccent,
  accentDepth,
} from './dynamic-accent';

describe('dynamicAccents', () => {
  it('returns array same length as input', () => {
    const elements = ['C4', 'D4', '~', 'E4'];
    expect(dynamicAccents(elements, 'lofi').length).toBe(4);
  });

  it('highest note gets accent', () => {
    const elements = ['C4', 'E4', 'G4', 'E4'];
    const accents = dynamicAccents(elements, 'avril');
    // G4 (index 2) is highest
    expect(accents[2]).toBeGreaterThan(accents[1]);
  });

  it('note after rest gets accent', () => {
    const elements = ['C4', '~', 'E4', 'G4'];
    const accents = dynamicAccents(elements, 'lofi');
    // E4 (index 2) follows a rest
    expect(accents[2]).toBeGreaterThan(1.0);
  });

  it('leap arrival gets accent', () => {
    const elements = ['C4', 'G4']; // 7 semitone jump
    const accents = dynamicAccents(elements, 'lofi');
    expect(accents[1]).toBeGreaterThan(1.0);
  });

  it('rests get 1.0', () => {
    const elements = ['C4', '~', 'E4'];
    const accents = dynamicAccents(elements, 'lofi');
    expect(accents[1]).toBe(1.0);
  });

  it('single note returns flat accents', () => {
    const elements = ['C4'];
    const accents = dynamicAccents(elements, 'lofi');
    expect(accents[0]).toBe(1.0);
  });

  it('stronger moods have bigger accents', () => {
    const elements = ['C4', '~', 'G4', 'C5'];
    const avril = dynamicAccents(elements, 'avril');
    const ambient = dynamicAccents(elements, 'ambient');
    // avril should have stronger accents
    const avrilMax = Math.max(...avril);
    const ambientMax = Math.max(...ambient);
    expect(avrilMax).toBeGreaterThan(ambientMax);
  });
});

describe('shouldApplyDynamicAccent', () => {
  it('avril applies', () => {
    expect(shouldApplyDynamicAccent('avril')).toBe(true);
  });

  it('ambient does not', () => {
    expect(shouldApplyDynamicAccent('ambient')).toBe(false);
  });
});

describe('accentDepth', () => {
  it('avril is highest', () => {
    expect(accentDepth('avril')).toBe(0.45);
  });

  it('ambient is lowest', () => {
    expect(accentDepth('ambient')).toBe(0.10);
  });
});
