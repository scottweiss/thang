import { noteIndex } from './scales';

// Parse "C#4" into { note, octave, midiApprox }
function parseNote(noteStr: string): { name: string; octave: number; midi: number } {
  const match = noteStr.match(/^([A-G]#?)(\d)$/);
  if (!match) return { name: noteStr, octave: 3, midi: 60 };
  const name = match[1];
  const octave = parseInt(match[2]);
  const midi = octave * 12 + noteIndex(name as any) + 12; // +12 so C0 = 12
  return { name, octave, midi };
}

function midiToNote(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor((midi - 12) / 12);
  const noteIdx = ((midi - 12) % 12 + 12) % 12;
  return `${noteNames[noteIdx]}${octave}`;
}

// Find the voicing of newChordNotes that minimizes total movement from prevNotes
export function smoothVoicing(prevNotes: string[], newChordNotes: string[], range: [number, number] = [48, 84]): string[] {
  if (prevNotes.length === 0) return newChordNotes;

  const prevMidi = prevNotes.map(n => parseNote(n).midi);
  const newParsed = newChordNotes.map(n => parseNote(n));

  // For each new chord tone, find all possible octave placements within range
  const candidates: number[][] = newParsed.map(n => {
    const pitchClass = noteIndex(n.name as any);
    const options: number[] = [];
    for (let oct = 1; oct <= 7; oct++) {
      const midi = oct * 12 + pitchClass + 12;
      if (midi >= range[0] && midi <= range[1]) {
        options.push(midi);
      }
    }
    return options.length > 0 ? options : [n.midi];
  });

  // Greedy assignment: for each voice, pick the pitch closest to the corresponding prev voice
  const result: number[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const target = i < prevMidi.length ? prevMidi[i] : prevMidi[prevMidi.length - 1];
    let bestPitch = candidates[i][0];
    let bestDist = Math.abs(bestPitch - target);
    for (const pitch of candidates[i]) {
      const dist = Math.abs(pitch - target);
      if (dist < bestDist) {
        bestDist = dist;
        bestPitch = pitch;
      }
    }
    result.push(bestPitch);
  }

  // Sort so voicing is in ascending order
  result.sort((a, b) => a - b);
  return result.map(midiToNote);
}
