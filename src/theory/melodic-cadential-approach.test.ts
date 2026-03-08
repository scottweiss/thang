import { describe, it, expect } from 'vitest';
import { cadentialApproachType, cadentialApproachGain } from './melodic-cadential-approach';

describe('melodic-cadential-approach', () => {
  describe('cadentialApproachType', () => {
    it('identifies leading tone (B→C)', () => {
      expect(cadentialApproachType(71, 60)).toBe('leading-tone');
    });

    it('identifies supertonic (D→C)', () => {
      expect(cadentialApproachType(62, 60)).toBe('supertonic');
    });

    it('returns null for tonic itself', () => {
      expect(cadentialApproachType(60, 60)).toBeNull();
    });

    it('returns null for non-approach intervals', () => {
      expect(cadentialApproachType(64, 60)).toBeNull(); // M3
      expect(cadentialApproachType(67, 60)).toBeNull(); // P5
    });

    it('works across octaves', () => {
      expect(cadentialApproachType(83, 72)).toBe('leading-tone'); // B5→C5
      expect(cadentialApproachType(50, 48)).toBe('supertonic');   // D3→C3
    });
  });

  describe('cadentialApproachGain', () => {
    it('returns 1 for non-approach tones', () => {
      const gain = cadentialApproachGain(64, 60, 0.9, 'avril', 'peak');
      expect(gain).toBe(1);
    });

    it('returns 1 early in phrase', () => {
      const gain = cadentialApproachGain(71, 60, 0.3, 'avril', 'peak');
      expect(gain).toBe(1);
    });

    it('boosts leading tone near phrase end', () => {
      const gain = cadentialApproachGain(71, 60, 0.95, 'avril', 'peak');
      expect(gain).toBeGreaterThan(1);
    });

    it('boosts supertonic near phrase end', () => {
      const gain = cadentialApproachGain(62, 60, 0.95, 'downtempo', 'build');
      expect(gain).toBeGreaterThan(1);
    });

    it('leading tone boost > supertonic boost', () => {
      const lt = cadentialApproachGain(71, 60, 0.95, 'trance', 'peak');
      const st = cadentialApproachGain(62, 60, 0.95, 'trance', 'peak');
      expect(lt - 1).toBeGreaterThan(st - 1);
    });

    it('stronger at phrase end than at 75%', () => {
      const late = cadentialApproachGain(71, 60, 0.95, 'avril', 'peak');
      const early = cadentialApproachGain(71, 60, 0.75, 'avril', 'peak');
      expect(late - 1).toBeGreaterThan(early - 1);
    });

    it('weaker in ambient mood', () => {
      const ambient = cadentialApproachGain(71, 60, 0.95, 'ambient', 'peak');
      const avril = cadentialApproachGain(71, 60, 0.95, 'avril', 'peak');
      expect(avril - 1).toBeGreaterThan(ambient - 1);
    });
  });
});
