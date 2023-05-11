import './src/style.scss';
import { VSelect } from "./src/script.js";

const select = new VSelect('#my-select', {
    data: [
        { id: 1, value: 'Vue' },
        { id: 2, value: 'React' },
    ],
    isInline: true,
    isOpen: true,
    sortType: 'desc',
    onSelect(prev, next) {
        console.log(prev, next)
    }
})

window.select = select