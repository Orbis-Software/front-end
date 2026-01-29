import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'

/* =========================
   PrimeVue Theme
========================= */
import Lara from '@primevue/themes/lara'
import 'primeicons/primeicons.css'

/* =========================
   PrimeVue Components
========================= */
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select' // ✅ NEW (replaces Dropdown)
import Dropdown from 'primevue/dropdown' // ✅ NEW (replaces Dropdown)
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Divider from 'primevue/divider'
import Fieldset from 'primevue/fieldset'
import Steps from 'primevue/steps'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ConfirmationService from 'primevue/confirmationservice'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea' // ✅ ensure global
import FileUpload from 'primevue/fileupload' // ✅ NEW

import "@fontsource/inter/latin-400.css"
import "@fontsource/ibm-plex-sans/latin-500.css"
import "@fontsource/ibm-plex-sans/latin-600.css"
import "./assets/tailwind.css"

/* =========================
   App Init
========================= */
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ConfirmationService)

app.use(PrimeVue, {
  theme: {
    preset: Lara,
  },
})

app.use(ToastService)

/* =========================
   Global Component Registration
========================= */
app.component('Dialog', Dialog)
app.component('Password', Password)
app.component('Button', Button)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Tag', Tag)
app.component('Checkbox', Checkbox)
app.component('Card', Card)

app.component('Select', Select)         // ✅ NEW
app.component('Dropdown', Dropdown)  

app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Divider', Divider)
app.component('Fieldset', Fieldset)
app.component('Steps', Steps)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Toast', Toast)
app.component('Textarea', Textarea)     // ✅
app.component('FileUpload', FileUpload) // ✅ NEW

app.mount('#app')
