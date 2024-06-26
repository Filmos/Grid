import { Command, command, enableCommandLogging } from '@/common/core/commands/command'
import type { ContextCall } from '@/common/core/commands/context'
import Entity from '@/common/core/commands/entity'
import type { StateDisplayReader } from './state-display'

export default class ModelScatter {
  private readonly renderCommand: Command<{ x: number; y: number; char: string; owner: Entity }>
  displayEntry = command((call: ContextCall, { entry, eid }: { entry: string; eid: string }) => {
    const pos = this.findPositionForEntry(entry)
    if (!pos) throw new Error('No position found')
    for (const [i, char] of entry.split('').entries())
      call(this.renderCommand, { ...pos(i), char, owner: new Entity(eid) })
  })
  private readonly state: StateDisplayReader
  updateEntry = command((call: ContextCall, { eid }: { eid: string }) => {
    const pos = this.state.getOwnedBy(new Entity(eid))
    if (pos.length == 0) throw new Error('Tried updating non-existent entry')
    for (const { x, y } of pos) {
      call(this.renderCommand, { x, y, char: this.state.getAt(x, y)!, owner: new Entity(eid) })
    }
  })

  constructor(
    renderCommand: Command<{ x: number; y: number; char: string; owner: Entity }>,
    state: StateDisplayReader
  ) {
    this.renderCommand = renderCommand
    this.state = state
    enableCommandLogging(this)
  }

  findPositionForEntry(
    entry: string
  ): ((offset: number, suboffset?: number) => { x: number; y: number }) | undefined {
    let horizontal: boolean, mi: number, si: number // Main and secondary axis
    const mx = this.state.columns,
      my = this.state.rows

    const generatePos = (): void => {
      horizontal = Math.random() > 0.5
      mi = Math.floor(1 + Math.random() * ((horizontal ? mx : my) - entry.length - 1))
      si = Math.floor(1 + Math.random() * ((horizontal ? my : mx) - 2))
    }
    const posToKey = (offset: number, suboffset: number = 0): { x: number; y: number } => {
      return horizontal
        ? { x: mi + offset * 1, y: si + suboffset * 1 }
        : { x: si + suboffset * 1, y: mi + offset * 1 }
    }
    const get = (offset: number, suboffset: number = 0): string | undefined => {
      const position = posToKey(offset, suboffset)
      return this.state.getAt(position.x, position.y)
    }

    const isPosValid = () => {
      if (get(-1) || get(entry.length)) return false
      let overlap = true
      for (let i = 0; i < entry.length; i++) {
        if (get(i) && get(i)![0] != entry[i]) return false
        if (!get(i)) for (const j of [-1, 1]) if (get(i, j)) return false
        if (!get(i)) overlap = false
      }
      if (overlap) return false
      return true
    }
    let maxTries = 1e4
    do {
      generatePos()
    } while (!isPosValid() && maxTries-- > 0)
    if (maxTries <= 0) return // TODO: Can be improved with a cyclic shuffler
    return posToKey
  }
}
