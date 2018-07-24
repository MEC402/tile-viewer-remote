from tornado import websocket, web, tcpserver, httpserver, ioloop, gen, iostream
import os
import select
import json

# NOTE clients are keyed by address tuple (hostname, port)
clients = {}
clients_broadcast = {("0.0.0.0", 0): {"name": "All Clients"}}
# clients = {("localhost.test", 0): {"name": "server test", }}

# media = []
# media = [
#     {"name": "test-image 1", "thumbnailURI": "https://picsum.photos/512/256/?random", "uri": "https://picsum.photos/2048/1024/?random"},
#     {"name": "test-image 2", "thumbnailURI": "https://picsum.photos/512/256/?image=911", "uri": "https://picsum.photos/2048/1024/?random"},
#     {"name": "test-image 3", "thumbnailURI": "https://picsum.photos/512/256/?image=274", "uri": "https://picsum.photos/2048/1024/?random"},
# ]

media = [
    # {"name": "test-image 1", "thumbnailURI": "https://picsum.photos/1024/512/?random", "uri": "https://picsum.photos/2048/1024/?random"},
    {"name": "Golden Gate Bridge (U)", "thumbnailURI": "https://farm6.staticflickr.com/5613/15543972421_dffbe3133a_b.jpg",
        "uri": "File:U:\\scratch\CAtiles\\bridgeonly.json"},
    {"name": "Golden Gate Bridge (Z)", "thumbnailURI": "https://farm6.staticflickr.com/5613/15543972421_dffbe3133a_b.jpg",
        "uri": "File:Z:\\scratch\CAtiles\\bridgeonly.json"},
    {"name": "Online Panorama", "thumbnailURI": "https://picsum.photos/512/512/?random",
        "uri": "http://silvrcity.com/rlc/panoramas.json"},
    {"name": "test-image 2", "thumbnailURI": "https://picsum.photos/512/256/?random",
        "uri": "https://picsum.photos/2048/1024/?random"},
    {"name": "test-image 3", "thumbnailURI": "https://picsum.photos/256/128/?random",
        "uri": "https://picsum.photos/2048/1024/?random"},
]


# TODO remove this command or pass some useful data from the app to the server
def app_connect(wsHandler, id, body):
    # figure out why get_clients was being called here
    wsHandler.write_message(json.dumps({"command": "noop", "body": None, id: None}))
    # get_clients(wsHandler, id, body)
    # pass


def get_clients(wsHandler, id, body):
    client_list = []
    for address, client in clients.items():
        client_list.append({"name": client["name"], "address": address, })
    response = {"id": id, "command": "get_clients_response",
                "body": client_list}
    wsHandler.write_message(json.dumps(response))


def get_media(wsHandler, id, body):
    # TODO send through handler the list of avaliable image URIs, nice names, and maybe some thumbnail URLs
    media_list = []
    for item in media:
        media_list.append(
            {"name": item["name"], "uri": item["uri"], "thumbnailURI": item["thumbnailURI"]})
    response = {"id": id, "command": "get_media_response", "body": media_list}
    wsHandler.write_message(json.dumps(response))


def route_to_client(wsHandler, id, body):
    # NOTE: destination is an address tuple, not a name
    # NOTE: destination as retrieved from body["destination"] is an array and must be cast with tuple()
    # NOTE: use destination 0.0.0.0:0 for broadcast

    destination_addresses = []
    if not body["destination"] is None:
        destination_addresses = [tuple(body["destination"])]

    if tuple(body["destination"]) in clients_broadcast.keys():
        destination_addresses = clients.copy().keys()

    for address in destination_addresses:
        try:
            # TODO either get the socket tornado is holding or check if the tornado IOStream is still open
            # TODO possibly instead use IOStream.set_close_callback to remove disconnected automatically
            # TODO 
            if not clients[address]["socket"].closed():
                # select.select([clients[address]["socket"]], [clients[address]["socket"]], [])
                clients[address]["socket"].write(bytes(json.dumps(body["message"]) + "\x04", "utf-8"))
                print("sending message \"", json.dumps(body["message"]), "\" to ", str(tuple(body["destination"])))
            else:
                # TODO inform webapp clients that the list of clients has changed
                # TODO (not relevant to this script) the webapp should only clear the currently selected image if that image is no longer in it's current media list
                print("client disconnected")
                del clients[address]
        except OSError:
            print("Unable to send to ", address, " ", clients[address])
            del clients[address]

def remove_client(address):
    del clients[tuple(address)]

def client_connect(tcpStream, address, id, body):
    # TODO add more client data, such as current image
    tcpStream.set_close_callback(remove_client)
    clients[tuple(address)] = {"name": body["name"], "socket": tcpStream, }

def client_disconnect(tcpStream, address, id, body):
    remove_client(address)

def noop():
    pass

app_commands = {
    "app_connect": app_connect,
    "get_clients": get_clients,
    "get_media": get_media,
    "route_to_client": route_to_client,
    "noop": noop,
}

client_commands = {
    "client_connect": client_connect,
    "client_disconnect": client_disconnect,
    "noop": noop,
}


class WSServer(websocket.WebSocketHandler):
    # Allow connections from any client (prevents 403 error)
    def check_origin(self, origin):
        return True

    # Set compression to automatic
    def get_compression_options(self):
        return {}

    def open(self):
        app_commands["app_connect"](self, None, "")
        # print("ws open called")

    def on_message(self, message):
        print("ws: " + message)
        json_msg = json.loads(message)
        if not "id" in json_msg.keys():
            json_msg["id"] = None
        app_commands[json_msg["command"]](
            self, json_msg["id"], json_msg["body"])

    def on_close(self):
        # TODO add stuff to do on closed connection
        # print("ws on_close called")
        pass


class SocketServer(tcpserver.TCPServer):
    @gen.coroutine
    def handle_stream(self, stream, address):
        while True:
            try:
                if not address in clients.keys():
                    print("New connection from " +
                          str(address[0]) + ':' + str(address[1]))
                    self.open(stream, address)
                data = yield stream.read_until(b'\x04')
                # data = yield stream.read_bytes(1024)'
                # trim EOT char and trigger on_message handler
                self.on_message(data[:-1].decode("utf-8"), stream, address)
                # yield stream.write(data)
            except iostream.StreamClosedError:
                # TODO remove the socket that closed from the clients list
                break

    def open(self, stream, address):
        # clients are not serviced until they send a client_connect command
        pass

    def on_message(self, message, stream, address):
        json_msg = json.loads(message)
        print("ts: " + message)
        if "id" in json_msg.keys():
            client_commands[json_msg["command"]](
                stream, address, json_msg["id"], json_msg["body"])
        else:
            client_commands[json_msg["command"]](
                stream, address, None, json_msg["body"])
        # yield stream.write(str(json_msg))
        print(json_msg)

class UncachedFileHandler(web.StaticFileHandler):
    def set_extra_headers(self, path):
        # Disable cache
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

if __name__ == "__main__":
    # TODO return to original values
    # http_port = 16502
    # socket_port = 16503

    http_port = 16503
    https_port = 16505
    socket_port = 16504

    # settings = {
    #     "static_path": os.path.join(os.path.dirname(__file__), ""),
    #     "static_url_prefix": "/",
    # }

    routes = [
        (r"/ws", WSServer),
        # (r"/(.*)", UncachedFileHandler,
        (r"/(.*)", web.StaticFileHandler,
         {"path": os.path.join(os.path.dirname(__file__), "app-dist"), "default_filename": "index.html"}),
    ]

    # httpApp = web.Application(routes, **settings)
    httpApp = web.Application(routes)
    httpServer = httpserver.HTTPServer(httpApp)
    httpsServer = httpserver.HTTPServer(httpApp, ssl_options={
        "certfile": os.path.join("./ssl/cert.pem"),
        "keyfile": os.path.join("./ssl/key.pem")
    })
    socketServer = SocketServer()
    httpServer.bind(http_port)
    httpsServer.bind(https_port)
    socketServer.bind(socket_port)
    # httpServer.start(0)   # Windows doesn't support os.fork() so we can't run with multiple threads
    httpServer.start()
    httpsServer.start()
    # socketServer.start(0)
    socketServer.start()
    try:
        ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        pass
