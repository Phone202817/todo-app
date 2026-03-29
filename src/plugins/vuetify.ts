import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'

export const vuetify = createVuetify({
	components: {
		...components,
		...labsComponents,
	},
	directives,
})