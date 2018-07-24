<template lang="pug">
f7-card(v-if="item != null")
  f7-card-header
    div {{item.name}}
  f7-card-content(class="image-card-content")
    img(v-bind:src="item.thumbnailURI")
  f7-card-footer
    div
    f7-button(outline v-on:click="setURI") Select
</template>

<script>
import {
  f7Card,
  f7CardHeader,
  f7CardFooter,
  f7CardContent,
  f7Button,
  f7Link
} from 'framework7-vue'

export default {
  name: 'MediaCard',
  components: {
    f7Card,
    f7CardHeader,
    f7CardFooter,
    f7CardContent,
    f7Button,
    f7Link
  },
  props: ['item'],
  methods: {
    setURI () {
      this.$store.commit('setCurrentMediaItem', this.item)
    }
  }
}
</script>