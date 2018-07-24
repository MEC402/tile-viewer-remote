import WebSocketAsPromised from 'websocket-as-promised'

export default class RemoteControlClient {
  constructor (host, port = 16502, route = '/ws') {
    if (host == null) {
      host = location.hostname
      port = location.port
    }
    this.serverAddress = this.getProtocol() + host + ':' + port + route
    this.socket = null
    this.transactionID = 0
    this.responseQueue = {}
    this.socket = this.getSocket()
  }

  getProtocol () {
    return location.protocol === 'https:' ? 'wss://' : 'ws://'
  }

  configure (host = '10.29.2.116', port = 16502, route = '/ws') {
    this.serverAddress = this.getProtocol() + host + ':' + port + route
  }

  reconnect () {
    this.close()
    return this.ensureSocket()
  }

  open () {
    this.socket.close()
  }

  close () {
    this.socket.close()
  }

  getSocket () {
    return new WebSocketAsPromised(this.serverAddress,
      {
        packMessage: message => JSON.stringify(message),
        unpackMessage: message => JSON.parse(message),
        attachRequestId: (data, requestId) => Object.assign({id: requestId}, data), // attach requestId to message as `id` field
        extractRequestId: data => data && data.id
      }
    )
  }

  ensureSocket () {
    try {
      if (!(this.socket.isOpened || this.socket.isOpening)) {
        this.socket = this.getSocket()
      }
      return this.socket.open()
    } catch (error) {
      Promise.reject(error)
    }
  }

  refresh () {
    return new Promise((resolve, reject) => {
      this.ensureSocket().then(() => {
        Promise.all([this.refreshClients(), this.refreshMedia()]).then(
          (responses) => {
            resolve({clients: responses[0], media: responses[1]})
          },
          (error) => {
            reject(error)
          }
        )
      }, reject)
    })
  }

  refreshClients () {
    return new Promise((resolve, reject) => {
      this.ensureSocket().then(() => {
        this.socket.sendRequest(
          {
            command: 'get_clients',
            body: ''
          }
        ).then(response => {
          if (response['command'] === 'get_clients_response') {
            resolve(response['body'])
          } else {
            reject(Error('Recieved nonmatching response type from server'))
          }
        }, (error) => {
          reject(error)
        }
        )
      }, reject)
    })
  }

  refreshMedia () {
    return new Promise((resolve, reject) => {
      this.ensureSocket().then(() => {
        this.socket.sendRequest(
          {
            command: 'get_media',
            body: ''
          }
        ).then(response => {
          if (response['command'] === 'get_media_response') {
            resolve(response['body'])
          } else {
            reject(Error('Recieved nonmatching response type from server'))
          }
        }, (error) => {
          reject(error)
        }
        )
      }, reject)
    })
  }

  setURI (address, uri) {
    // TODO catch errors when the connection is dropped
    this.ensureSocket().then(() => {
      return this.socket.sendPacked({
        command: 'route_to_client',
        body: {
          destination: address,
          message: {
            command: 'set_image',
            body: {
              uri: uri
            }
          }
        }
      })
    })
  }
  init () {
    return this.getSocket().then((result) => {
      this.socket = result
    })
  }
}
