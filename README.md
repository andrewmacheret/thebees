# thebees

Solver for the "Honey Bunch" category of puzzle.

Goal: Place 8 bees within a 5-radius hexagon using the numerical clues provided.

Rules:
 1. The number of the clue states how many bees are linearly aligned with the clue
   - Two cells are linearly aligned if they are on the same line horizontally, diagonally left, or diagonally right, regardless of line of sight
 2. Bees cannot be on or adjacent to a clue, nor can they be on or adjacent to another bee.
 3. All bees are linearly aligned with at least one clue.

Example:
```
    1 - - - -
   - - - - - -
  - - - - - - -
 - - - - - - - 1
- - 4 - - - - - -
 - - - - - 3 - -
  - - - 4 - - -
   - - - - - -
    - - - - -
```

Solution:
```
    1 x x x x
   x x B x x x
  x B x x x B x
 x x x x B x x 1
B x 4 x x x x x x
 x x x x x 3 x x
  B x x 4 x x B
   x x x x x x
    x x B x x
```

Additional puzzles:
```
    - - - - -
   - - - - - -
  - - - - - - -
 - - - - 1 - - -
- - - - - - - 3 -
 - 3 - - - - - -
  - - - - - - -
   - - - - - -
    - 2 3 - -

    - - - 1 2
   3 - - - - -
  - - - - - - -
 - - - - - - - -
- - - - - - - - 1
 - - - - - - - -
  - - - - - - -
   4 - - - - -
    - - - 1 -

    - - - 2 -
   - - - - - -
  - - - - - - -
 - - 4 - - - - -
2 - - - - 3 - - -
 - - - - - - - -
  - - - - 4 - -
   - - - - - 1
    - - - - -

    - - - - -
   - - - - - 2
  - - - 3 - - -
 - - - - - - - -
- - - - - - - 2 -
 - 2 - - - - - -
  - - - - 3 - -
   - - - - - -
    3 - - - -

    - - - - -
   - - - - - -
  2 - - - - - -
 - - 4 - - - - -
- - - - - - - 2 -
 - - - - - - - -
  - - - - - - 1
   2 - - - - -
    - - - - 3
```

