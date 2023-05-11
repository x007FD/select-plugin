import './src/style.scss'
import { VSelect } from "./src/script.js";

const select = new VSelect('#my-select', {
    data: [
        { id: 1, value: 'Vue', info: 30 },
        { id: 2, value: 'React' },
    ],
    isOpen: true,
    sortType: 'desc',
    onSelect(prev, next) {
        console.log(prev, next)
    }
})

window.select = select