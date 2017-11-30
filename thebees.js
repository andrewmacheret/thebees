class Hex {
  constructor(radius) {
    this.radius = radius
    const diameter = (radius << 1) | 1

    this.grid = Array.from({length: diameter}, (_, i) => Array.from(
      {length: diameter - Math.abs(i - radius)}, _ => Hex.unknown
    ))
  }

  draw() {
    let nodeWidth = 1
    for (const row of this.grid) {
      for (const value of row) {
        nodeWidth = Math.max(nodeWidth, String(value).length)
      }
    }

    const startSpacing = ' '.repeat(Math.floor(nodeWidth / 2) + 1)
    const midSpacing = ' '.repeat(2 - (nodeWidth & 1))

    const lines = []
    for (const row of this.grid) {
      let line = startSpacing.repeat(this.grid.length - row.length)
      let first = true
      for (const value of row) {
        if (!first) line += midSpacing; else first = false
        line += String(value).padStart(nodeWidth, Hex.unknown)
      }
      lines.push(line + '\n')
    }
    return lines.join('')
  }

  toRowCol(x, y) {
    const row = y + this.radius
    const col = Math.min(row, this.radius) + x
    return [row, col]
  }

  inRange(x, y) {
    return Math.abs(x) <= this.radius &&
      Math.abs(y) <= this.radius &&
      Math.abs(x + y) <= this.radius
  }

  get(x, y) {
    const [row, col] = this.toRowCol(x, y)
    return this.grid[row][col]
  }

  set(x, y, value) {
    const [row, col] = this.toRowCol(x, y)
    this.grid[row][col] = value
    if (!this.inRange(x, y)) throw new Error('BAD!')
  }
}

Hex.directions = [
  {x: 1, y: 0},
  {x: 0, y: 1},
  {x:-1, y: 1},
  {x:-1, y: 0},
  {x: 0, y:-1},
  {x: 1, y:-1},
]

Hex.unknown = '-'
Hex.bee = 'B'
Hex.empty = 'x'


class Solver {
  constructor({radius, numBees, hints}) {
    this.numBees = numBees

    this.hex = new Hex(radius)
    this.hints = hints
    for (const hint of hints) {
      this.hex.set(hint.x, hint.y, hint.bees)
    }

    this.numUnknown = 0
    for (const row of this.hex.grid) {
      for (const value of row) {
        if (value === Hex.unknown) {
          this.numUnknown++
        }
      }
    }
  }

  solve() {
    const undos = []
    for (const hint of this.hints) {
      const {x, y} = hint
      for (const dir of Hex.directions) {
        const x = hint.x + dir.x
        const y = hint.y + dir.y
        if (this.hex.inRange(x, y) && this.hex.get(x, y) === Hex.unknown) {
          this.hex.set(x, y, Hex.empty) // unknown -> empty
          this.numUnknown--
          undos.push({x, y})
        }
      }
    }
    for (let x=-this.hex.radius; x<=this.hex.radius; x++) {
      outer: for (let y=-this.hex.radius; y<=this.hex.radius; y++) {
        if (this.hex.inRange(x, y)) {
          for (const hint of this.hints) {
            if (hint.x === x || hint.y === y || hint.x + hint.y === x + y) {
              continue outer
            }
          }
          this.hex.set(x, y, Hex.empty) // unknown -> empty
          this.numUnknown--
          undos.push({x, y})
        }
      }
    }

    if (this.dfs()) return

    for (const undo of undos) {
      this.hex.set(undo.x, undo.y, Hex.unknown) // empty -> unknown
      this.numUnknown++
    }
  }

  dfs(hintIndex = 0) {
    // if we went through all the hints, check if we're in a solved state
    if (hintIndex === this.hints.length) {
      return this.numBees === 0
    }

    const hint = this.hints[hintIndex]

    // if this hint doesn't have any bees left, skip it
    if (hint.bees === 0) {
      return this.dfs(hintIndex + 1)
    }

    const bigUndos = []

    for (const dir of Hex.directions) {
      let x = hint.x + dir.x * 2
      let y = hint.y + dir.y * 2
      while (this.hex.inRange(x, y)) {
        // make sure this space isn't claimed yet
        if (this.hex.get(x, y) === Hex.unknown) {

          // try a bee here
          const undos = []
          //undos.push({x, y})
          this.hex.set(x, y, Hex.bee) // unknown -> bee
          this.numUnknown--
          this.numBees--
          for (const dir1 of Hex.directions) {
            const x1 = x + dir1.x
            const y1 = y + dir1.y
            if (this.hex.inRange(x1, y1) && this.hex.get(x1, y1) === Hex.unknown) {
              undos.push({x: x1, y: y1})
              this.hex.set(x1, y1, Hex.empty) // unknown -> empty
              this.numUnknown--
            }
          }

          // reduce all linear matching hints by 1
          let brokeAHint = false
          for (const hint1 of this.hints) {
            if (x == hint1.x || y == hint1.y || x + y == hint1.x + hint1.y) {
              if (--hint1.bees === 0) {

                // fill rest of the hint with x's
                for (const dir1 of Hex.directions) {
                  let x = hint1.x + dir1.x * 2
                  let y = hint1.y + dir1.y * 2
                  while (this.hex.inRange(x, y)) {
                    // make sure this space isn't claimed yet
                    if (this.hex.get(x, y) === Hex.unknown) {
                      undos.push({x, y})
                      this.hex.set(x, y, Hex.empty) // unknown -> empty
                      this.numUnknown--
                    }
                    // step forward
                    x += dir1.x
                    y += dir1.y
                  }
                }
              } else if (hint1.bees < 0) {
                brokeAHint = true
              }
            }
          }

          // if no hint went below 0
          if (!brokeAHint) {
            // if that was the last bee of the hint
            if (hint.bees === 0) {

              // fill rest of the hint with x's
              for (const dir1 of Hex.directions) {
                let x = hint.x + dir1.x * 2
                let y = hint.y + dir1.y * 2
                while (this.hex.inRange(x, y)) {
                  // make sure this space isn't claimed yet
                  if (this.hex.get(x, y) === Hex.unknown) {
                    undos.push({x, y})
                    this.hex.set(x, y, Hex.empty) // unknown -> empty
                    this.numUnknown--
                  }
                  // step forward
                  x += dir1.x
                  y += dir1.y
                }
              }

              // dfs to the next hint
              if (this.dfs(hintIndex + 1)) {
                return true
              }
            }
            // otherwise, dfs to the same hint
            else {
              if (this.dfs(hintIndex)) {
                return true
              }
            }
          }

          // increase all linear matching hints by 1
          for (const hint1 of this.hints) {
            if (x == hint1.x || y == hint1.y || x + y == hint1.x + hint1.y) {
              hint1.bees++
            }
          }

          // undo what we've done
          for (const undo of undos) {
            this.hex.set(undo.x, undo.y, Hex.unknown) // empty -> unknown
            this.numUnknown++
          }

          // fill current spot with an x
          this.hex.set(x, y, Hex.empty) // bee -> empty
          this.numBees++
          bigUndos.push({x, y})
        }

        // step forward
        x += dir.x
        y += dir.y
      }
    }

    // if we reached here, then there's not enough bees for the hint
    // undo what we've done
    for (const undo of bigUndos) {
      this.hex.set(undo.x, undo.y, Hex.unknown) // empty -> unknown
      this.numUnknown++
    }

    return false
  }
}

const solvePuzzle = (name, {radius, numBees, hints}) => {
  console.log(name)
  
  const solver = new Solver({radius, numBees, hints})
  
  console.log(solver.hex.draw())
  
  solver.solve()
  
  console.log(solver.hex.draw())
}

solvePuzzle('PUZZLE 1', {
  radius: 4,
  numBees: 8,
  hints: [
    {x:  0, y: -4, bees: 1},
    {x:  4, y: -1, bees: 1},
    {x: -2, y:  0, bees: 4},
    {x:  1, y:  1, bees: 3},
    {x: -1, y:  2, bees: 4},
  ]
})

solvePuzzle('PUZZLE 2', {
  radius: 4,
  numBees: 8,
  hints: [
    {x:  1, y: -1, bees: 1},
    {x:  3, y:  0, bees: 3},
    {x: -3, y:  1, bees: 3},
    {x: -3, y:  4, bees: 2},
    {x: -2, y:  4, bees: 3},
  ]
})

solvePuzzle('PUZZLE 3', {
  radius: 4,
  numBees: 8,
  hints: [
    {x:  3, y: -4, bees: 1},
    {x:  4, y: -4, bees: 2},
    {x: -1, y: -3, bees: 3},
    {x:  4, y:  0, bees: 1},
    {x: -4, y:  3, bees: 4},
    {x: -1, y:  4, bees: 1},
  ]
})

solvePuzzle('PUZZLE 4', {
  radius: 4,
  numBees: 8,
  hints: [
    {x:  3, y: -4, bees: 2},
    {x: -1, y: -1, bees: 4},
    {x: -4, y:  0, bees: 2},
    {x:  1, y:  0, bees: 3},
    {x:  0, y:  2, bees: 4},
    {x:  1, y:  3, bees: 1},
  ]
})

solvePuzzle('PUZZLE 5', {
  radius: 4,
  numBees: 8,
  hints: [
    {x:  4, y: -3, bees: 2},
    {x:  1, y: -2, bees: 3},
    {x:  3, y:  0, bees: 2},
    {x: -3, y:  1, bees: 2},
    {x:  0, y:  2, bees: 3},
    {x: -4, y:  4, bees: 3},
  ]
})

solvePuzzle('PUZZLE 6', {
  radius: 4,
  numBees: 8,
  hints: [
    {x: -2, y: -2, bees: 2},
    {x: -1, y: -1, bees: 4},
    {x:  3, y:  0, bees: 2},
    {x:  2, y:  2, bees: 1},
    {x: -4, y:  3, bees: 2},
    {x:  0, y:  4, bees: 3},
  ]
})






