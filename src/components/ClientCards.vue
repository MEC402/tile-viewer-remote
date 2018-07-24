<template lang="pug">
div(class="card-container")
  f7-card(v-if="clients.length <= 0")
    f7-card-content
      div
      | No clients available
      f7-button(@click="$emit('refresh')") Refresh
  client-card(v-for="client in clients" :key="client.name" :client="client")
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
import ClientCard from './ClientCard.vue'

export default {
  name: 'ClientCards',
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
    ClientCard
  },
  props: [ 'clients' ],
  data () {
    return {
      uriOverride: '',
      uri: ''
    }
  }
}
</script>

<style scoped lang="scss">
div.client-card-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
