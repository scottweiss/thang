import { describe, it, expect } from 'vitest';
import {
  voiceCrossingAvoidanceGain,
  avoidanceStrengthValue,
} from './harmonic-voice-crossing-avoidance';

describe('voiceCrossingAvoidanceGain', () => {
  it('no crossing is neutral', () => {
    // Melody (72) above harmony (60), should be higher = true
    const gain = voiceCrossingAvoidanceGain(72, 60, true, 'avril', 'build');
    expect(gain).toBe(1.0);
  });

  it('crossing gets reduction', () => {
    // Melody (55) below harmony (60), should be higher = true → crossing
    const gain = voiceCrossingAvoidanceGain(55, 60, true, 'avril', 'build');
    expect(gain).toBeLessThan(1.0);
  });

  it('more crossing = more reduction', () => {
    const small = voiceCrossingAvoidanceGain(58, 60, true, 'avril', 'build');
    const large = voiceCrossingAvoidanceGain(50, 60, true, 'avril', 'build');
    expect(large).toBeLessThan(small);
  });

  it('works for lower layer too', () => {
    // Harmony (70) above melody (65), should be lower = crossing
    const gain = voiceCrossingAvoidanceGain(70, 65, false, 'avril', 'build');
    expect(gain).toBeLessThan(1.0);
  });

  it('avril avoids more than syro', () => {
    const av = voiceCrossingAvoidanceGain(55, 60, true, 'avril', 'build');
    const sy = voiceCrossingAvoidanceGain(55, 60, true, 'syro', 'build');
    expect(av).toBeLessThan(sy);
  });

  it('stays in 0.96-1.0 range', () => {
    for (let diff = -12; diff <= 12; diff++) {
      const gain = voiceCrossingAvoidanceGain(60 + diff, 60, true, 'avril', 'peak');
      expect(gain).toBeGreaterThanOrEqual(0.96);
      expect(gain).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('avoidanceStrengthValue', () => {
  it('avril is highest', () => {
    expect(avoidanceStrengthValue('avril')).toBe(0.55);
  });

  it('syro is lowest', () => {
    expect(avoidanceStrengthValue('syro')).toBe(0.15);
  });
});
