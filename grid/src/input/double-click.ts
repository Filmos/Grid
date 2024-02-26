import { onMounted, onUnmounted } from 'vue'
import Input from './input'
import singleton from '@/common/singleton'


class DoubleClickInput extends Input {
    constructor() {
        super()
        const onDblClick = (event: MouseEvent) => this.onTrigger(event.target as HTMLElement)
        onMounted(() => window.addEventListener('dblclick', onDblClick))
        onUnmounted(() => window.removeEventListener('dblclick', onDblClick))
    }
}
export default singleton(DoubleClickInput)