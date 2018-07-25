import WebSocketAsPromised from 'websocket-as-promised'

export default class RemoteControlClient {
  constructor (host = '10.29.2.116', port = 16503, route = '/ws') {
    this.serverAddress = 'ws://' + host + ':' + port + route
    this.socket = null
    this.transactionID = 0
    this.responseQueue = {}
    this.socket = this.getSocket()
  }
  configure (host = '10.29.2.116', port = 16503, route = '/ws') {
    this.serverAddress = 'ws://' + host + ':' + port + route
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
    if (!(this.socket.isOpened || this.socket.isOpening)) {
      this.socket = this.getSocket()
    }
    return this.socket.open()
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
