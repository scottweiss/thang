import { describe, it, expect, vi, afterEach } from 'vitest';
import { MarkovChain } from './markov';

describe('MarkovChain', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const states = ['A', 'B', 'C'];

  // Deterministic matrix: state 0 -> 1, state 1 -> 2, state 2 -> 0
  const deterministicMatrix = [
    [0, 1, 0], // from A -> always B
    [0, 0, 1], // from B -> always C
    [1, 0, 0], // from C -> always A
  ];

  describe('nextByIndex', () => {
    it('returns valid indices within state bounds', () => {
      const chain = new MarkovChain(states, deterministicMatrix);
      for (let i = 0; i < states.length; i++) {
        const result = chain.nextByIndex(i);
        expect(result.index).toBeGreaterThanOrEqual(0);
        expect(result.index).toBeLessThan(states.length);
        expect(states).toContain(result.state);
      }
    });

    it('follows deterministic transitions correctly', () => {
      const chain = new MarkovChain(states, deterministicMatrix);
      expect(chain.nextByIndex(0)).toEqual({ state: 'B', index: 1 });
      expect(chain.nextByIndex(1)).toEqual({ state: 'C', index: 2 });
      expect(chain.nextByIndex(2)).toEqual({ state: 'A', index: 0 });
    });
  });

  describe('nextWithHistory', () => {
    it('falls back to first-order when no second-order matrix is provided', () => {
      const chain = new MarkovChain(states, deterministicMatrix);
      // No second-order matrix set, no explicit matrix passed
      const result = chain.nextWithHistory(0, 0);
      // Should behave like nextByIndex(0) -> B
      expect(result).toEqual({ state: 'B', index: 1 });
    });

    it('falls back to first-order when prevIndex is out of bounds', () => {
      const secondOrder: number[][][] = [
        [
          [0, 0, 1], // prev=0, cur=0 -> C
          [1, 0, 0], // prev=0, cur=1 -> A
          [0, 1, 0], // prev=0, cur=2 -> B
        ],
      ];
      const chain = new MarkovChain(states, deterministicMatrix);
      // prevIndex=5 is out of bounds for secondOrder
      const result = chain.nextWithHistory(5, 0, secondOrder);
      // Falls back to nextByIndex(0) -> B
      expect(result).toEqual({ state: 'B', index: 1 });
    });

    it('falls back to first-order when currentIndex is out of bounds in second-order matrix', () => {
      const secondOrder: number[][][] = [
        [
          [0, 0, 1], // only one inner array
        ],
      ];
      const chain = new MarkovChain(states, deterministicMatrix);
      // currentIndex=2 is out of bounds for secondOrder[0]
      const result = chain.nextWithHistory(0, 2, secondOrder);
      // Falls back to nextByIndex(2) -> A
      expect(result).toEqual({ state: 'A', index: 0 });
    });

    it('uses the second-order matrix when provided as parameter', () => {
      // Second-order: when prev=0 and cur=1, always go to C (index 2)
      const secondOrder: number[][][] = [
        [
          [0, 1, 0], // prev=0, cur=0 -> B
          [0, 0, 1], // prev=0, cur=1 -> C
          [1, 0, 0], // prev=0, cur=2 -> A
        ],
        [
          [1, 0, 0], // prev=1, cur=0 -> A
          [0, 1, 0], // prev=1, cur=1 -> B
          [0, 0, 1], // prev=1, cur=2 -> C
        ],
        [
          [0, 0, 1], // prev=2, cur=0 -> C
          [1, 0, 0], // prev=2, cur=1 -> A
          [0, 1, 0], // prev=2, cur=2 -> B
        ],
      ];
      const chain = new MarkovChain(states, deterministicMatrix);

      expect(chain.nextWithHistory(0, 1, secondOrder)).toEqual({ state: 'C', index: 2 });
      expect(chain.nextWithHistory(1, 0, secondOrder)).toEqual({ state: 'A', index: 0 });
      expect(chain.nextWithHistory(2, 0, secondOrder)).toEqual({ state: 'C', index: 2 });
      expect(chain.nextWithHistory(2, 2, secondOrder)).toEqual({ state: 'B', index: 1 });
    });

    it('uses deterministic second-order matrix to verify correct state selection', () => {
      // All transitions from (prev=0, cur=0) go to state index 2 (C)
      const secondOrder: number[][][] = [
        [
          [0, 0, 1], // prev=0, cur=0 -> always C
          [0, 0, 1], // prev=0, cur=1 -> always C
          [0, 0, 1], // prev=0, cur=2 -> always C
        ],
        [
          [1, 0, 0], // prev=1, cur=0 -> always A
          [1, 0, 0], // prev=1, cur=1 -> always A
          [1, 0, 0], // prev=1, cur=2 -> always A
        ],
        [
          [0, 1, 0], // prev=2, cur=0 -> always B
          [0, 1, 0], // prev=2, cur=1 -> always B
          [0, 1, 0], // prev=2, cur=2 -> always B
        ],
      ];
      const chain = new MarkovChain(states, deterministicMatrix);

      // When previous state was A (0), always go to C regardless of current
      for (let cur = 0; cur < 3; cur++) {
        expect(chain.nextWithHistory(0, cur, secondOrder).state).toBe('C');
      }
      // When previous state was B (1), always go to A
      for (let cur = 0; cur < 3; cur++) {
        expect(chain.nextWithHistory(1, cur, secondOrder).state).toBe('A');
      }
      // When previous state was C (2), always go to B
      for (let cur = 0; cur < 3; cur++) {
        expect(chain.nextWithHistory(2, cur, secondOrder).state).toBe('B');
      }
    });
  });

  describe('setSecondOrderMatrix', () => {
    it('stores the matrix and uses it in subsequent nextWithHistory calls', () => {
      const secondOrder: number[][][] = [
        [
          [0, 0, 1], // prev=0, cur=0 -> C
          [0, 0, 1], // prev=0, cur=1 -> C
          [0, 0, 1], // prev=0, cur=2 -> C
        ],
        [
          [0, 0, 1], // prev=1, cur=0 -> C
          [0, 0, 1], // prev=1, cur=1 -> C
          [0, 0, 1], // prev=1, cur=2 -> C
        ],
        [
          [0, 0, 1], // prev=2, cur=0 -> C
          [0, 0, 1], // prev=2, cur=1 -> C
          [0, 0, 1], // prev=2, cur=2 -> C
        ],
      ];
      const chain = new MarkovChain(states, deterministicMatrix);

      // Before setting: falls back to first-order
      expect(chain.nextWithHistory(0, 0)).toEqual({ state: 'B', index: 1 });

      // After setting: uses second-order
      chain.setSecondOrderMatrix(secondOrder);
      expect(chain.nextWithHistory(0, 0)).toEqual({ state: 'C', index: 2 });
      expect(chain.nextWithHistory(1, 1)).toEqual({ state: 'C', index: 2 });
    });

    it('explicit parameter overrides stored matrix', () => {
      const storedMatrix: number[][][] = [
        [
          [0, 0, 1], // stored: prev=0, cur=0 -> C
          [0, 0, 1],
          [0, 0, 1],
        ],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1]],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1]],
      ];
      const explicitMatrix: number[][][] = [
        [
          [1, 0, 0], // explicit: prev=0, cur=0 -> A
          [1, 0, 0],
          [1, 0, 0],
        ],
        [[1, 0, 0], [1, 0, 0], [1, 0, 0]],
        [[1, 0, 0], [1, 0, 0], [1, 0, 0]],
      ];
      const chain = new MarkovChain(states, deterministicMatrix);
      chain.setSecondOrderMatrix(storedMatrix);

      // Without explicit param: uses stored -> C
      expect(chain.nextWithHistory(0, 0)).toEqual({ state: 'C', index: 2 });

      // With explicit param: uses explicit -> A
      expect(chain.nextWithHistory(0, 0, explicitMatrix)).toEqual({ state: 'A', index: 0 });
    });
  });
});
