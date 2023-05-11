export class VSelect {
    ACTIVE_CLASS = 'is-active'
    EMPTY_CLASS = 'is-empty'
    INLINE_CLASS = 'is-inline'
    CHECKED_CLASS = 'is-checked'
    DEFAULT_LANG = 'en'

    #selectedItems
    #selectedId
    #selectElements

    constructor(selector, options) {
        this.selectElement = this.#getSelectElement(selector)
        this.options = options
        this.events = this.#getAllEvents()
        this.data = options.data
        this.#selectedId = +options.selectedId
        this.#selectedItems = []

        this.#render()
        this.#setListener()

        this.#selectElements = this.#getSelectElements()
    }

    get currentLang() {
        return !this.options.lang ? this.DEFAULT_LANG : this.options.lang.toLowerCase()
    }

    get currentItem() {
        if (this.data) {
            return this.data.find(item => +item.id === this.#selectedId)
        }
    }

    get isOpen() {
        return this.selectElement.classList.contains(this.ACTIVE_CLASS)
    }

    clickHandler(event) {
        const target = event.target

        if (target.closest('.v-select__header')) {
            this.toggle()
        }

        if (target.closest('.v-select__item')) {
            this.select(target.closest('.v-select__item').dataset.selectId)
        }
    }

    select(id) {
        const { headerValueElement, inputValueElement, itemElements } = this.#selectElements

        this.#selectedId = +id

        headerValueElement.innerText = this.currentItem.value
        itemElements.forEach(item => {
            item.classList.remove(this.CHECKED_CLASS)
            item.disabled = false
        })

        this.selectElement.querySelector(`.v-select__item[data-select-id="${ this.#selectedId }"]`).classList.add(this.CHECKED_CLASS)
        this.#selectedItems.push(this.currentItem)

        this.close()

        this.#executeEvent('onSelect', this.#selectedItems.at(-2) ?? {}, this.currentItem)
    }

    open() {
        this.#executeEvent('onBeforeOpen')
        this.selectElement.classList.add(this.ACTIVE_CLASS)
        this.#executeEvent('onAfterOpen')
    }

    close() {
        this.#executeEvent('onBeforeClose')
        this.selectElement.classList.remove(this.ACTIVE_CLASS)
        this.#executeEvent('onAfterClose')
    }

    toggle() {
        this.isOpen ? this.close() : this.open()
    }

    destroy() {
        this.#executeEvent('onBeforeDestroy')
        this.selectElement.remove()
        this.#executeEvent('onAfterDestroy')
    }

    #renderSelect() {
        const placeholder = this.#getPlaceholder()
        const items = this.data ? this.#getItems() : ''

        return `
          <div class="v-select__header">
            <span class="v-select__header-value">
              ${ placeholder }
            </span>
            <svg class="v-select__header-icon" width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.00005 6.97499C5.86672 6.97499 5.73772 6.94999 5.61305 6.89999C5.48772 6.84999 5.38338 6.78332 5.30005 6.69999L0.700048 2.09999C0.516715 1.91665 0.425049 1.68332 0.425049 1.39999C0.425049 1.11665 0.516715 0.883321 0.700048 0.699987C0.883382 0.516654 1.11672 0.424988 1.40005 0.424988C1.68338 0.424988 1.91672 0.516654 2.10005 0.699987L6.00005 4.59999L9.90005 0.699987C10.0834 0.516654 10.3167 0.424988 10.6 0.424988C10.8834 0.424988 11.1167 0.516654 11.3 0.699987C11.4834 0.883321 11.575 1.11665 11.575 1.39999C11.575 1.68332 11.4834 1.91665 11.3 2.09999L6.70005 6.69999C6.60005 6.79999 6.49172 6.87065 6.37505 6.91199C6.25838 6.95399 6.13338 6.97499 6.00005 6.97499Z" fill="#232323"/>
            </svg>
          </div>
          <div class="v-select__dropdown">
            ${ items }
          </div>
        `
    }

    #render() {
        const translations = this.#getTranslations()[this.currentLang]

        this.#executeEvent('onBeforeRender')

        if (!this.data || !this.data.length) {
            this.selectElement.classList.add(this.EMPTY_CLASS)
            console.error(translations.noItems)
        }

        this.selectElement.className = `${ this.selectElement.className } v-select ${ this.options.isInline ? this.INLINE_CLASS : '' }`
        this.selectElement.innerHTML = this.#renderSelect()

        if (this.options.isOpen) {
            this.open()
        }

        this.#executeEvent('onAfterRender')
    }

    #getAllEvents() {
        const events = {}

        for (const key in this.options) {
            if (typeof this.options[key] === 'function') {
                events[key] = this.options[key]
            }
        }

        return events
    }

    #getSelectElement(selector) {
        return selector instanceof Element ? selector : document.querySelector(selector)
    }

    #getSelectElements() {
        return {
            headerValueElement: this.selectElement.querySelector('.v-select__header-value'),
            itemElements: this.selectElement.querySelectorAll('.v-select__item')
        }
    }

    #getPlaceholder() {
        const translations = this.#getTranslations()[this.currentLang]
        const { placeholder } = this.options

        if (!placeholder || !placeholder.length) {
            return translations.defaultPlaceholder
        }

        if (this.#selectedId !== null && this.#selectedId !== undefined && !isNaN(this.#selectedId)) {
            if (!this.getSelectedItem()?.value) {
                console.error(translations.wrongId)
                return translations.defaultPlaceholder
            }

            return this.getSelectedItem()?.value
        } else {
            return placeholder
        }
    }

    #getItems() {
        const sortFunctions = {
            'default': items => items,
            'asc': items => items.sort((a, b) => b.value.localeCompare(a.value)),
            'desc': items => items.sort((a, b) => a.value.localeCompare(b.value))
        }

        const sortedItems = sortFunctions[this.options.sortType || 'default'](this.data)

        return sortedItems.map((item, index) => `
              <button class="v-select__item ${ this.#selectedId === +item.id ? this.CHECKED_CLASS : '' }"
                      data-select-id="${ item.id }"
                      ${ this.#selectedId === +item.id ? 'disabled' : '' }>
                      <span class="v-select__item-value">
                        ${ this.options.isOrder ? `${ index + 1 }.` : '' } ${ item.value }           
                      </span>
                      <span class="v-select__item-info">
                        ${ item.info ?? '' }      
                      </span>
              </button>
          `).join('')
    }

    #executeEvent(name, ...payload) {
        this.events[name] ? this.events[name](...payload) : null
    }

    #setListener() {
        this.selectElement.addEventListener('click', this.clickHandler.bind(this))
    }

    #getTranslations() {
        return {
            ru: {
                defaultPlaceholder: 'Выберите ваши варианты',
                wrongId: 'Вы указали несуществующий ID',
                noItems: 'Вы не добавили ни одного списка селекта'
            },
            en: {
                defaultPlaceholder: 'Chose your options',
                wrongId: 'You specified a non-existent ID',
                noItems: 'You have not added any list of selections'
            }
        }
    }
}
