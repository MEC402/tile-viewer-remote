import Vue from 'vue'
import Vuex from 'vuex'
// import Framework7 from 'framework7'
import Framework7 from 'framework7/framework7.esm.bundle.js'
// import Framework7Vue from 'framework7-vue'
import Framework7Vue from 'framework7-vue/dist/framework7-vue.esm.bundle.js'
// eslint-disable-next-line no-unused-vars
import Framework7Styles from 'framework7/css/framework7.min.css'
import './theme.scss'

import * as OfflinePluginRuntime from 'offline-plugin/runtime'
import NoSleep from 'nosleep.js'

import App from './App.vue'
import config from './store'

OfflinePluginRuntime.install()

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(Framework7Vue, Framework7)

const store = new Vuex.Store(config)
const root = '#app'

const noSleep = new NoSleep()
function enableNoSleep () {
  noSleep.enable()
  document.removeEventListener('click', enableNoSleep, false)
}
document.addEventListener('click', enableNoSleep, false)

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  event.prompt()
})

// eslint-disable-next-line no-new
new Vue({
  render: h => h(App),
  store,
  framework7: {
    root: root,
    id: 'edu.boisestate.coen.cs.vr.tile-viewer-remote',
    name: 'TileViewer Remote',
    theme: 'auto'
    // theme: 'md'
    // theme: 'ios'
  }
}).$mount(root)
