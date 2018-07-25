<template lang="pug">
div(class="card-container")
  f7-card(v-if="media.length <= 0")
    f7-card-content
      div
      | No media available
      f7-button(@click="$emit('refresh')") Refresh
  media-card(v-for="item in media" v-bind:key="item.name" :item="item")
</template>

<script>
import {
  f7Statusbar,
  f7View,
  f7Page,
  f7Navbar,
  f7Card,
  f7CardHeader,
  f7CardFooter,
  f7CardContent,
  f7Button
} from 'framework7-vue'
import MediaCard from './MediaCard.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'MediaCards',
  computed: {
    ...mapGetters({media: 'getMedia'})
  },
  methods: {
    setURI (newURI) {
      this.uri = newURI
    }
  },
  components: {
    f7Statusbar,
    f7Navbar,
    f7View,
    f7Page,
    f7Card,
    f7CardHeader,
    f7CardFooter,
    f7CardContent,
    f7Button,
    MediaCard
  }
}
</script>
