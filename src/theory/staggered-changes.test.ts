import { describe, it, expect } from 'vitest';
import { shouldLayerAcceptChordChange, getStaggerConfig } from './staggered-changes';

describe('shouldLayerAcceptChordChange', () => {
  it('drone always changes immediately', () => {
    expect(shouldLayerAcceptChordChange('drone', 'ambient', 0)).toBe(true);
    expect(shouldLayerAcceptChordChange('drone', 'trance', 0)).toBe(true);
  });

  it('melody is delayed in ambient', () => {
    expect(shouldLayerAcceptChordChange('melody', 'ambient', 0)).toBe(false);
    expect(shouldLayerAcceptChordChange('melody', 'ambient', 1)).toBe(false);
    expect(shouldLayerAcceptChordChange('melody', 'ambient', 2)).toBe(true);
  });

  it('all layers change immediately in trance', () => {
    expect(shouldLayerAcceptChordChange('harmony', 'trance', 0)).toBe(true);
    expect(shouldLayerAcceptChordChange('melody', 'trance', 0)).toBe(true);
    expect(shouldLayerAcceptChordChange('arp', 'trance', 0)).toBe(true);
  });

  it('unknown layers change immediately', () => {
    expect(shouldLayerAcceptChordChange('atmosphere', 'ambient', 0)).toBe(true);
  });
});

describe('getStaggerConfig', () => {
  it('returns config for each mood', () => {
    const config = getStaggerConfig('xtal');
    expect(config.drone).toBe(0);
    expect(config.melody).toBe(2);
    expect(config.arp).toBe(2);
  });

  it('trance has zero stagger', () => {
    const config = getStaggerConfig('trance');
    expect(config.drone + config.harmony + config.melody + config.arp).toBe(0);
  });
});
