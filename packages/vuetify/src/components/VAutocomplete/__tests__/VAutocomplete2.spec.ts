// Components
import VAutocomplete from '../VAutocomplete'

// Utilities
import {
  mount,
  Wrapper
} from '@vue/test-utils'
import { compileToFunctions } from 'vue-template-compiler'

describe('VAutocomplete.ts', () => {
  type Instance = InstanceType<typeof VAutocomplete>
  let mountFunction: (options?: object) => Wrapper<Instance>
  let el

  beforeEach(() => {
    el = document.createElement('div')
    el.setAttribute('data-app', 'true')
    document.body.appendChild(el)
    mountFunction = (options = {}) => {
      return mount(VAutocomplete, {
        ...options,
        mocks: {
          $vuetify: {
            lang: {
              t: (val: string) => val
            },
            theme: {
              dark: false
            }
          }
        }
      })
    }
  })

  it('should not filter results', async () => {
    const wrapper = mountFunction({
      propsData: {
        items: ['foo', 'bar']
      }
    })

    const input = wrapper.find('input')
    input.element.value = 'foo'
    input.trigger('input')

    expect(wrapper.vm.filteredItems).toHaveLength(1)

    wrapper.setProps({ noFilter: true })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.filteredItems).toHaveLength(2)
  })

  it('should hide menu when no data', async () => {
    const wrapper = mountFunction()

    const input = wrapper.find('input')
    input.trigger('focus')
    input.element.value = 'foo'
    input.trigger('input')

    expect(wrapper.vm.menuCanShow).toBe(true)

    wrapper.setProps({ hideNoData: true })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.menuCanShow).toBe(false)

    wrapper.setProps({ hideNoData: false })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.menuCanShow).toBe(true)

    // If we are hiding selected
    // filtered will have a positive length
    // but the hidden items will not show
    // check to make sure when all values are
    // selected to close the menu
    wrapper.setProps({
      hideNoData: true,
      hideSelected: true,
      items: [1, 2, 3, 4],
      multiple: true,
      value: [1, 2, 3]
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.menuCanShow).toBe(true)

    wrapper.setProps({ value: [1, 2, 3, 4] })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.menuCanShow).toBe(false)
  })

  it('should not hide menu when no data but has no-data slot', async () => {
    const wrapper = mountFunction({
      propsData: {
        combobox: true
      },
      slots: {
        'no-data': [compileToFunctions('<span>show me</span>')]
      }
    })

    const input = wrapper.find('input')
    input.trigger('focus')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.menuCanShow).toBe(true)
  })

  // https://github.com/vuetifyjs/vuetify/issues/2834
  it('should not update search if selectedIndex is > -1', () => {
    const wrapper = mountFunction()

    const input = wrapper.find('input')

    input.trigger('focus')
    input.element.value = 'foo'
    input.trigger('input')

    expect(wrapper.vm.internalSearch).toBe('foo')

    wrapper.setData({
      lazySearch: '',
      selectedIndex: 0
    })

    expect(wrapper.vm.internalSearch).toBe('')

    input.element.value = 'bar'
    input.trigger('input')

    expect(wrapper.vm.internalSearch).toBe('')
  })

  it('should clear search input on clear callback', async () => {
    const wrapper = mountFunction({
      propsData: {
        clearable: true
      }
    })

    const icon = wrapper.find('.v-input__append-inner .v-icon')
    const input = wrapper.find('input')

    input.element.value = 'foobar'
    input.trigger('input')

    expect(wrapper.vm.internalSearch).toBe('foobar')

    icon.trigger('click')

    expect(wrapper.vm.internalSearch).toBeUndefined()
  })

  it('should propagate content class', () => {
    const wrapper = mountFunction({
      propsData: {
        menuProps: { contentClass: 'foobar' }
      }
    })

    const content = wrapper.find('.v-autocomplete__content')

    expect(content.element.classList.contains('foobar')).toBe(true)
  })

  it('should update the displayed value when items changes', async () => {
    const wrapper = mountFunction({
      propsData: {
        value: 1,
        items: []
      }
    })

    const input = wrapper.find('input')

    await wrapper.vm.$nextTick()
    wrapper.setProps({ items: [{ text: 'foo', value: 1 }] })
    await wrapper.vm.$nextTick()
    expect(input.element.value).toBe('foo')
  })

  it('should show menu when items are added for the first time and hide-no-data is enabled', async () => {
    const wrapper = mountFunction({
      propsData: {
        hideNoData: true,
        items: []
      }
    })

    const input = wrapper.find('input')

    input.trigger('focus')

    expect(wrapper.vm.isMenuActive).toBe(false)
    expect(wrapper.vm.isFocused).toBe(true)

    wrapper.setProps({
      items: ['Foo', 'Bar']
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isMenuActive).toBe(true)
  })

  it('should not show menu when items are updated and hide-no-data is enabled ', async () => {
    const wrapper = mountFunction({
      propsData: {
        hideNoData: true,
        items: [ 'Something first' ]
      }
    })

    const input = wrapper.find('input')

    input.trigger('focus')

    expect(wrapper.vm.isMenuActive).toBe(false)
    expect(wrapper.vm.isFocused).toBe(true)

    wrapper.setProps({
      items: ['Foo', 'Bar']
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isMenuActive).toBe(false)
  })

  // https://github.com/vuetifyjs/vuetify/issues/5110
  it('should set internal search', async () => {
    const wrapper = mountFunction({
      propsData: {
        value: undefined,
        items: [0, 1, 2]
      }
    })

    // Initial value
    expect(wrapper.vm.internalSearch).toBeUndefined()

    wrapper.vm.setSearch()

    await wrapper.vm.$nextTick()

    // !this.selectedItem
    expect(wrapper.vm.internalSearch).toBeNull()

    wrapper.setData({ internalSearch: undefined })
    wrapper.setProps({ multiple: true, value: 1 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selectedItems).toHaveLength(1)

    wrapper.vm.setSearch()

    await wrapper.vm.$nextTick()

    // this.multiple
    expect(wrapper.vm.internalSearch).toBeNull()

    wrapper.setData({ internalSearch: undefined })
    wrapper.setProps({ multiple: false, value: 0 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.internalSearch).toBe(0)
  })

  it('should auto select first', async () => {
    const wrapper = mountFunction({
      propsData: {
        autoSelectFirst: true,
        items: [
          'foo',
          'foobar',
          'bar'
        ]
      }
    })

    wrapper.setData({ internalSearch: 'fo' })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.getMenuIndex()).toBe(0)
  })

  // https://github.com/vuetifyjs/vuetify/issues/4580
  it('should display menu when hide-no-date and hide-selected are enabled and selected item does not match search', async () => {
    const wrapper = mountFunction({
      propsData: {
        items: [1, 2],
        value: 1,
        hideNoData: true,
        hideSelected: true
      }
    })

    const input = wrapper.find('input')
    input.trigger('focus')
    await wrapper.vm.$nextTick()

    input.element.value = 2
    input.trigger('input')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.menuCanShow).toBe(true)
  })

  it('should retain search value when item selected and multiple is enabled', async () => {
    const wrapper = mountFunction({
      propsData: {
        items: ['Sandra Adams', 'Ali Connors', 'Trevor Hansen', 'Tucker Smith'],
        multiple: true
      }
    })

    await wrapper.vm.$nextTick()

    const input = wrapper.find('input')

    input.trigger('focus')
    input.element.value = 't'
    input.trigger('input')
    wrapper.vm.selectItem('Trevor Hansen')

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedItems).toHaveLength(1)
    expect(wrapper.vm.internalSearch).toBe('t')
  })

  it('should update render dynamically when itemText changes', async () => {
    const wrapper = mountFunction({
      propsData: {
        returnObject: true,
        itemText: 'labels.1033',
        items: [
          {
            id: 1,
            labels: { '1033': 'ID 1 English', '1036': 'ID 1 French' }
          },
          {
            id: 2,
            labels: { '1033': 'ID 2 English', '1036': 'ID 2 French' }
          }
        ]
      }
    })

    await wrapper.vm.$nextTick()

    wrapper.vm.selectItem(wrapper.vm.items[0])
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.internalSearch).toEqual('ID 1 English')

    wrapper.setProps({ itemText: 'labels.1036' })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.computedItems).toHaveLength(2)
    expect(wrapper.vm.internalSearch).toEqual('ID 1 French')
  })

  it('should not replicate html select hotkeys in v-autocomplete', async () => {
    // const wrapper = mountFunction()
    const wrapper = mountFunction({
      propsData: {
        items: ['aaa', 'foo', 'faa']
      }
    })

    const onKeyPress = jest.fn()
    wrapper.setMethods({ onKeyPress })

    const input = wrapper.find('input')
    input.trigger('focus')
    await wrapper.vm.$nextTick()

    input.trigger('keypress', { key: 'f' })
    await wrapper.vm.$nextTick()
    expect(onKeyPress).not.toHaveBeenCalled()
  })
})
