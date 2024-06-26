import { blankContext } from '@/common/core/commands/context'
import Listeners from '@/common/core/commands/listeners'
import { onMounted, onUnmounted } from 'vue'

export default class NearestElement {
  public readonly onFocused = new Listeners<{ target: HTMLElement }>()
  public readonly onUnfocused = new Listeners<{ target: HTMLElement }>()
  private readonly query: string
  private focusedElement?: HTMLElement

  constructor(query: string) {
    this.query = query
    const onMove = this.onMove.bind(this)
    onMounted(() => window.addEventListener('mousemove', onMove))
    onUnmounted(() => window.removeEventListener('mousemove', onMove))
  }

  public get currentNearestElement(): HTMLElement | undefined {
    return this.focusedElement
  }

  private onMove(event: MouseEvent) {
    const nearestElement = this.findNearest(event.clientX, event.clientY)
    if (nearestElement == this.focusedElement) return

    const call = blankContext()
    if (this.focusedElement) this.onUnfocused.emit(call, { target: this.focusedElement })
    this.focusedElement = nearestElement
    if (this.focusedElement) this.onFocused.emit(call, { target: this.focusedElement })
  }

  private findNearest(x: number, y: number): HTMLElement | undefined {
    const elements = document.querySelectorAll(this.query)

    let nearestElement: HTMLElement | undefined
    let minDistance = Number.MAX_VALUE

    for (const element of elements) {
      const rect = element.getBoundingClientRect()
      const elX = rect.left + rect.width / 2
      const elY = rect.top + rect.height / 2

      const distance =
        Math.pow(x - elX, 2) +
        Math.pow(y - elY, 2) -
        Math.pow(Math.max(rect.width, rect.height) / 2, 2)
      if (distance < minDistance) {
        minDistance = distance
        nearestElement = element as HTMLElement
      }
    }

    return nearestElement
  }
}
