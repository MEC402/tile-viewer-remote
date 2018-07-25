import RemoteControlClient from './remoteControlClient.js'

const config = {
  state: {
    // remote: (() => { let remote = new RemoteControlClient(); remote.init(); return remote })(),
    remote: new RemoteControlClient(),
    clients: [],
    media: [],
    currentMediaItem: undefined,
    connectionSettings: {
      host: undefined,
      port: undefined,
      route: undefined
    }
  },
  mutations: {
    setClients (state, payload) {
      state.clients = payload
    },
    setMedia (state, payload) {
      state.media = payload
    },
    setCurrentMediaItem (state, payload) {
      state.currentMediaItem = payload
    },
    setConnectionSettings (state, payload) {
      state.connectionSettings = payload
      state.remote.configure(payload.host, payload.port, payload.route)
    }
  },
  getters: {
    getClients (state, getters) {
      return state.clients
    },
    getMedia (state, getters) {
      return state.media
    },
    getCurrentURI (state, getters) {
      if (state.currentMediaItem != null) {
        return state.currentMediaItem.uri
      }
    },
    getCurrentThumbnailURI (state, getters) {
      if (state.currentMediaItem != null) {
        return state.currentMediaItem.thumbnailURI
      }
    }
  },
  actions: {
    refresh (context) {
      return new Promise((resolve, reject) => {
        context.state.remote.refresh().then(
          (result) => {
            context.commit('setClients', result.clients)
            context.commit('setMedia', result.media)
            resolve()
          },
          (error) => {
            context.commit('setClients', [])
            context.commit('setMedia', [])
            reject(error)
          }
        )
      })
    },
    applyURI (context, {address, uri}) {
      return context.state.remote.setURI(address, uri)
    },
    changeConnectionSettings (context, settings) {
      context.commit('setConnectionSettings', settings)
      return context.state.remote.reconnect()
    }
  }
}

export default config
