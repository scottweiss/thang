import { GenerativeState } from '../types';

export interface Layer {
  name: string;
  orbit: number;
  generate(state: GenerativeState): string;
}
