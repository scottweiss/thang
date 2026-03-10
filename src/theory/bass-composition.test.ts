import { describe, it, expect } from 'vitest';
import { getBassStyle, composeBassLine } from './bass-composition';

describe('getBassStyle', () => {
  it('lofi is walking', () => expect(getBassStyle('lofi')).toBe('walking'));
  it('downtempo is walking', () => expect(getBassStyle('downtempo')).toBe('walking'));
  it('flim is walking', () => expect(getBassStyle('flim')).toBe('walking'));
  it('ambient is pedal', () => expect(getBassStyle('ambient')).toBe('pedal'));
  it('avril is pedal', () => expect(getBassStyle('avril')).toBe('pedal'));
  it('xtal is pedal', () => expect(getBassStyle('xtal')).toBe('pedal'));
  it('trance is riff', () => expect(getBassStyle('trance')).toBe('riff'));
  it('disco is riff', () => expect(getBassStyle('disco')).toBe('riff'));
  it('blockhead is syncopated', () => expect(getBassStyle('blockhead')).toBe('syncopated'));
  it('syro is syncopated', () => expect(getBassStyle('syro')).toBe('syncopated'));
});

describe('composeBassLine', () => {
  it('walking bass starts with root on beat 1', () => {
    const line = composeBassLine('walking', 'C', ['C', 'E', 'G'], 'F', 4);
    expect(line[0]).toBe('C2');
    expect(line).toHaveLength(4);
  });

  it('walking bass beat 2 is chord 3rd', () => {
    const line = composeBassLine('walking', 'C', ['C', 'E', 'G'], 'F', 4);
    expect(line[1]).toBe('E2');
  });

  it('walking bass beat 3 is chord 5th', () => {
    const line = composeBassLine('walking', 'C', ['C', 'E', 'G'], 'F', 4);
    expect(line[2]).toBe('G2');
  });

  it('walking bass has approach to next root', () => {
    const line = composeBassLine('walking', 'C', ['C', 'E', 'G'], 'F', 4);
    // Beat 4 should approach F (could be E or Gb)
    expect(line[3]).toBeDefined();
    expect(line[3]).not.toBe('~');
  });

  it('walking bass approach is half step from next root', () => {
    const line = composeBassLine('walking', 'C', ['C', 'E', 'G'], 'F', 4);
    // Half step below F is E, half step above F is F#
    expect(['E2', 'F#2', 'Gb2']).toContain(line[3]);
  });

  it('walking bass falls back to 5th when no 3rd available', () => {
    // Only root and 5th in chord tones
    const line = composeBassLine('walking', 'C', ['C', 'G'], 'F', 4);
    expect(line[1]).toBe('G2'); // 5th instead of 3rd
  });

  it('walking bass beat 3 falls back to root when no 5th', () => {
    // Only root and 3rd
    const line = composeBassLine('walking', 'C', ['C', 'E'], 'F', 4);
    expect(line[2]).toBe('C2');
  });

  it('pedal bass repeats root', () => {
    const line = composeBassLine('pedal', 'C', ['C', 'E', 'G'], 'F', 4);
    expect(line.every(n => n === 'C2')).toBe(true);
  });

  it('pedal bass repeats root for any length', () => {
    const line = composeBassLine('pedal', 'D', ['D', 'F#', 'A'], null, 8);
    expect(line).toHaveLength(8);
    expect(line.every(n => n === 'D2')).toBe(true);
  });

  it('riff bass has rests', () => {
    const line = composeBassLine('riff', 'C', ['C', 'E', 'G'], 'F', 8);
    expect(line.some(n => n === '~')).toBe(true);
  });

  it('riff bass pattern is root, ~, root, 5th', () => {
    const line = composeBassLine('riff', 'C', ['C', 'E', 'G'], 'F', 4);
    expect(line[0]).toBe('C2');
    expect(line[1]).toBe('~');
    expect(line[2]).toBe('C2');
    expect(line[3]).toBe('G2');
  });

  it('riff bass repeats pattern for longer steps', () => {
    const line = composeBassLine('riff', 'C', ['C', 'E', 'G'], 'F', 8);
    expect(line).toHaveLength(8);
    expect(line[4]).toBe('C2');
    expect(line[5]).toBe('~');
    expect(line[6]).toBe('C2');
    expect(line[7]).toBe('G2');
  });

  it('syncopated bass has off-beat rests', () => {
    const line = composeBassLine('syncopated', 'C', ['C', 'E', 'G'], 'F', 8);
    expect(line.some(n => n === '~')).toBe(true);
    expect(line[0]).toBe('~'); // Off-beat: rest on beat 1
  });

  it('syncopated bass follows pattern: ~, root, ~, 5th, root, ~, 5th, ~', () => {
    const line = composeBassLine('syncopated', 'C', ['C', 'E', 'G'], 'F', 8);
    expect(line[0]).toBe('~');
    expect(line[1]).toBe('C2');
    expect(line[2]).toBe('~');
    expect(line[3]).toBe('G2');
    expect(line[4]).toBe('C2');
    expect(line[5]).toBe('~');
    expect(line[6]).toBe('G2');
    expect(line[7]).toBe('~');
  });

  it('respects custom octave', () => {
    const line = composeBassLine('pedal', 'C', ['C', 'E', 'G'], null, 4, 1);
    expect(line[0]).toBe('C1');
  });

  it('custom octave applies to all styles', () => {
    const walking = composeBassLine('walking', 'C', ['C', 'E', 'G'], 'F', 4, 3);
    expect(walking[0]).toBe('C3');
    expect(walking[1]).toBe('E3');

    const riff = composeBassLine('riff', 'C', ['C', 'E', 'G'], null, 4, 1);
    expect(riff[0]).toBe('C1');

    const syncopated = composeBassLine('syncopated', 'C', ['C', 'E', 'G'], null, 8, 3);
    expect(syncopated[1]).toBe('C3');
  });

  it('handles missing next root gracefully', () => {
    const line = composeBassLine('walking', 'C', ['C', 'E', 'G'], null, 4);
    expect(line).toHaveLength(4);
    expect(line[3]).not.toBe('~');
    // When no next root, beat 4 should be root
    expect(line[3]).toBe('C2');
  });

  it('handles various root notes', () => {
    const line = composeBassLine('walking', 'F#', ['F#', 'A#', 'C#'], 'B', 4);
    expect(line[0]).toBe('F#2');
    expect(line[1]).toBe('A#2');
    expect(line[2]).toBe('C#2');
  });

  it('riff uses root when no 5th in chord tones', () => {
    const line = composeBassLine('riff', 'C', ['C', 'E'], null, 4);
    expect(line[0]).toBe('C2');
    // Position 3 would be 5th, but no 5th available so falls back to root
    expect(line[3]).toBe('C2');
  });

  it('syncopated uses root when no 5th', () => {
    const line = composeBassLine('syncopated', 'C', ['C', 'E'], null, 8);
    expect(line[1]).toBe('C2');
    // 5th positions fall back to root
    expect(line[3]).toBe('C2');
  });

  it('returns correct length for short steps', () => {
    const line = composeBassLine('syncopated', 'C', ['C', 'E', 'G'], 'F', 3);
    expect(line).toHaveLength(3);
  });
});
