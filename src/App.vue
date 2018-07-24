<template lang="pug">
div
  f7-statusbar
  f7-view(main)
    f7-page(ptr @ptr:refresh="pullRefresh" ptr-preloader:false)
      div(class="ptr-preloader")
        div(class="preloader color-multi")
      f7-navbar(title="TileViewer Remote")
      //- Main cards
      div(style="padding-bottom: 5.5em;")
        div(class="card-container")
          //- Currently selected image
          div(class="card-container")
            f7-card(v-if="currentURI !== ''")
              f7-card-header
                div Currently Selected
              f7-card-content(style="justify: left" class="image-card-content")
                div(v-if="currentThumbnailURI == null" style="padding: 0.25em;") No Media Selected
                img(v-else v-bind:src="currentThumbnailURI")
              //- f7-card-footer
              //-   div
              //-   f7-button(outline v-on:click="") Apply All
          //- Media
          media-cards(:media="media" @refresh="refresh")
          //- Clients
          client-cards(:clients="clients" @refresh="refresh")
      //- configuration Floating Action Button (FAB)
      f7-fab
        f7-icon(fa="wrench" class="fa-lg")
        f7-icon(fa="times" class="fa-lg")
        f7-fab-buttons
          f7-fab-button(@click="refresh" fab-close)
            f7-icon(fa="undo" class="fa-lg fa-flip-horizontal")
          f7-fab-button(@click="serverModalOpen = true")
            f7-icon(fa="server" class="fa-lg")
    //- TODO move server setings modal into separate component
    f7-sheet(:opened="serverModalOpen" @sheet:closed="serverModalOpen = false")
      f7-toolbar
        div Server Connection
        div(style="display:flex; align-items: center;")
          f7-button(@click="changeServerSettings(serverHostText, serverPortNumber, serverRouteText)" sheet-close) Apply
          f7-button(sheet-close) Close
      f7-list(no-hairlines-md)
        f7-list-item
          f7-label Hostname/IP Address
          f7-input(type="text" placeholder="localhost" :value="serverHostText" @input="serverHostText=$event.target.value" validate)
        f7-list-item
          f7-label Port
          f7-input(type="number" pattern="[1-9]|[1-9][]" placeholder="16502" :value="serverPortNumber" @input="serverPortNumber=$event.target.value" validate)
        f7-list-item
          f7-label Route
          f7-input(type="text" pattern="/.*" placeholder="/ws" :value="serverRouteText" @input="serverRouteText=$event.target.value" validate)
</template>

<script>
// eslint-disable-next-line no-unused-vars
import Framework7 from 'framework7'
import {mapActions, mapGetters} from 'vuex'

import { f7Statusbar, f7View, f7Page, f7Navbar, f7Fab, f7FabButtons, f7FabButton, f7Icon, f7Sheet, f7List, f7ListItem, f7Label, f7Input } from 'framework7-vue'
import ClientCards from './components/ClientCards.vue'
import MediaCards from './components/MediaCards.vue'

export default {
  name: 'App',
  created () {
    this.refresh()
  },
  data () {
    return {
      currentImageIndex: 0,
      serverModalOpen: false,
      unableToConnectToast: null,
      serverHostText: 'localhost',
      serverPortNumber: 16502,
      serverRouteText: '/ws'
    }
  },
  computed: {
    ...mapGetters({
      clients: 'getClients',
      media: 'getMedia',
      currentURI: 'getCurrentURI',
      currentThumbnailURI: 'getCurrentThumbnailURI'
    })
  },
  methods: {
    ...mapActions({serverRefresh: 'refresh'}),
    ...mapActions(['changeConnectionSettings']),
    onF7Ready (f7) {
      this.unableToConnectToast = f7.toast.create({
        text: 'Unable to connect to server',
        // closeButton: true,
        // closeButtonText: 'Dismiss',
        closeTimeout: 2000
      })
    },
    refresh () {
      // TODO add popup to show loading indication
      // eslint-disable-next-line handle-callback-err
      this.serverRefresh().catch((error) => {
        this.openUnableToConnectToast()
      }).then(() => { /* finally */ })
    },
    pullRefresh (event, done) {
      this.serverRefresh().then(
        () => {
          setTimeout(done, 500)
        },
        () => {
          this.openUnableToConnectToast()
          setTimeout(done, 500)
        })
    },
    changeServerSettings (host, port, route) {
      this.changeConnectionSettings({host, port, route}).then(() => {
        this.refresh()
      // eslint-disable-next-line handle-callback-err
      }, (error) => {
        this.refresh()
      })
    },
    openSetServerModal () {
      this.$refs.setServerModal.open()
    },
    openUnableToConnectToast () {
      this.unableToConnectToast.open()
    }
  },
  components: {
    f7Statusbar,
    f7Navbar,
    f7View,
    f7Page,
    f7Fab,
    f7FabButton,
    f7FabButtons,
    f7Icon,
    f7Sheet,
    f7List,
    f7ListItem,
    f7Label,
    f7Input,
    ClientCards,
    MediaCards
  }
}
</script>

<style lang="scss" scoped>
div.sheet-modal {
  > div.sheet-modal-inner > div.list {
    margin-top: 0;
  }
  > div.toolbar > div.toolbar-inner {
    > div:first-of-type {
      padding-left: 1em;
    }
    > div:last-of-type {
      padding-right: 1em;
    }
  }
}
</style>
