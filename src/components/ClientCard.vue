<template lang="pug">
f7-card(v-if="client.name != null && client.address != null")
  f7-card-header
    div {{client.name}}
    div {{addressString}}
  f7-card-content
    div(v-if="currentThumbnailURI == null" style="padding: 0.25em;") No Media Staged
    img(v-else v-bind:src="currentThumbnailURI")
  f7-card-footer
    div
    f7-button(outline v-on:click="applyURI") Send
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  f7Card,
  f7CardHeader,
  f7CardFooter,
  f7CardContent,
  f7Button,
  f7Link
} from 'framework7-vue'

export default {
  name: 'ClientCard',
  props: ['client'],
  data () {
    return {
      ...mapGetters(['getCurrentURI']),
      currentThumbnailURI: ''
    }
  },
  computed: {
    addressString () {
      return this.client.address[0] + ':' + this.client.address[1]
    }
  },
  methods: {
    ...mapActions({serverApplyURI: 'applyURI'}),
    applyURI () {
      this.currentThumbnailURI = this.$store.getters.getCurrentThumbnailURI
      this.serverApplyURI({address: this.client.address, uri: this.getCurrentURI()})
    }
  },
  components: {
    f7Card,
    f7CardHeader,
    f7CardFooter,
    f7CardContent,
    f7Button,
    f7Link
  }
}
</script>

<style lang="scss" scoped>
div.card > div.card-header {
  > div:first-of-type {
    padding-right: 1em;
  }

  > div:last-of-type {
    padding-left: 1em;
  }
}
</style>
