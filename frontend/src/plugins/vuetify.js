/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
import * as labsComponents from 'vuetify/labs/components'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        colors: {
          primary: '#4F46E5', // Indigo 600
          secondary: '#06B6D4', // Cyan 500
          success: '#22C55E', // Green 500
          warning: '#F59E0B', // Amber 500
          error: '#EF4444', // Red 500
          info: '#0EA5E9', // Sky 500
        },
      },
      dark: {
        colors: {
          primary: '#A5B4FC', // Indigo 300
          secondary: '#22D3EE', // Cyan 400
          success: '#4ADE80', // Green 400
          warning: '#FBBF24', // Amber 400
          error: '#F87171', // Red 400
          info: '#38BDF8', // Sky 400
        },
      },
    },
  },
  defaults: {
    global: { density: 'comfortable' },
    // Consistent component defaults for cohesive spacing/shape
    VCard: { rounded: 'xl', elevation: 8 },
    VCardTitle: { class: 'py-3 px-6' },
    VCardText: { class: 'py-4 px-6' },
    VCardActions: { class: 'py-3 px-6' },
    VBtn: { rounded: 'lg', variant: 'flat' },
    VChip: { rounded: 'lg' },
    VTextField: { variant: 'outlined', color: 'primary' },
    VTextarea: { variant: 'outlined', color: 'primary' },
    VDataTable: { density: 'comfortable' },
    VList: { density: 'comfortable' },
    VAlert: { variant: 'tonal' },
  },
  components: {
    ...labsComponents,
  },
})
