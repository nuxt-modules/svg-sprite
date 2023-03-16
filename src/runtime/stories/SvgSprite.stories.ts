// @ts-ignore
import IconsPage from '../components/icons-page.vue'

export default {
  title: 'Modules/Svg Sprite',
  argTypes: {
    size: {
      name: 'Icons Size',
      control: { type: 'number', required: false }
    },
    onClick: { action: 'clicked' }
  }
}

export const icons = () => IconsPage

icons.args = {
  size: 80
}
