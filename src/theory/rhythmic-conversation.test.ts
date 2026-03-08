import { describe, it, expect } from 'vitest';
import {
  speakingLayer,
  conversationGainMultiplier,
  shouldApplyConversation,
  conversationStrength,
} from './rhythmic-conversation';

describe('speakingLayer', () => {
  it('returns melody for single-layer', () => {
    expect(speakingLayer(['melody'], 0, 'lofi', 'groove')).toBe('melody');
  });

  it('changes over time', () => {
    const speakers = new Set<string>();
    const layers = ['melody', 'arp', 'harmony', 'texture'];
    for (let t = 0; t < 20; t++) {
      speakers.add(speakingLayer(layers, t, 'lofi', 'groove'));
    }
    expect(speakers.size).toBeGreaterThan(1);
  });

  it('favors melody at peak', () => {
    const layers = ['melody', 'arp', 'harmony', 'drone'];
    let melodyCount = 0;
    for (let t = 0; t < 20; t++) {
      if (speakingLayer(layers, t, 'lofi', 'peak') === 'melody') melodyCount++;
    }
    expect(melodyCount).toBeGreaterThan(0);
  });

  it('returns first for empty', () => {
    expect(speakingLayer([], 0, 'lofi', 'groove')).toBe('melody');
  });
});

describe('conversationGainMultiplier', () => {
  it('speaking layer gets boost', () => {
    const mult = conversationGainMultiplier('melody', 'melody', 'lofi');
    expect(mult).toBeGreaterThan(1.0);
  });

  it('non-speaking layer gets dip', () => {
    const mult = conversationGainMultiplier('arp', 'melody', 'lofi');
    expect(mult).toBeLessThan(1.0);
  });

  it('trance has subtle effect', () => {
    const boost = conversationGainMultiplier('melody', 'melody', 'trance');
    const dip = conversationGainMultiplier('arp', 'melody', 'trance');
    expect(boost - 1.0).toBeLessThan(0.05);
    expect(1.0 - dip).toBeLessThan(0.05);
  });

  it('lofi has stronger effect', () => {
    const boost = conversationGainMultiplier('melody', 'melody', 'lofi');
    expect(boost - 1.0).toBeGreaterThan(0.1);
  });
});

describe('shouldApplyConversation', () => {
  it('needs 3+ layers', () => {
    expect(shouldApplyConversation('lofi', 2)).toBe(false);
    expect(shouldApplyConversation('lofi', 3)).toBe(true);
  });

  it('trance with few layers does not apply', () => {
    expect(shouldApplyConversation('trance', 3)).toBe(false);
  });
});

describe('conversationStrength', () => {
  it('lofi is highest', () => {
    expect(conversationStrength('lofi')).toBe(0.45);
  });

  it('trance is lowest', () => {
    expect(conversationStrength('trance')).toBe(0.10);
  });
});
