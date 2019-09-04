# server

Server which connects mobile app and web via websockets.

Created whit the help of this [blog](https://www.paramander.com/blog/playing-with-websockets-in-haskell-and-elm)

```
 ___                     ___                     _______
| p |                   | s |                   |       |
| h |                   | e |                   |  web  |
| o | <-- websocket --> | r | <-- websocket --> |       |
| n |                   | v |                    ------- 
| e |                   | e |                  /......./
 ---                    | r |                 /......./
                         ---                  --------
```

Web is connected with with `web` path like 
```
ws://localhost:3000/ws/web
```
and it returns the code (`clientId`) e.g.
```
{"id":"5777"}
```
with which we can connect single client e.g. 
```
ws://localhost:3000/ws/5777
```

Request with `/ws/web` as path are always accepted and new `clientId` is returned. 
 
Requests with other paths are accepted only if there is websocket with such `clientId` connected.
Only single client can be connected. All subsequent tries are rejected.

Install dependencies
```
stack install --dependencies-only 
```

Run
```
stack run server
```

Test / play
```
stack ghci server
```

One can connect easily to ws and test it in JS like
```javascript
var ws = new WebSocket('ws://localhost:3000/');

ws.onmessage = (event) => console.log('Received: ' + event.data);
```

`Hlint` used to fix linting errors
To install `hlint`
```bash
stack install hlint
```

To run `hlint`
```bash
hlit .
```

# Deployment

To build docker image run
```bash
docker build -t fokot/prayer-app-server:latest .
```
Tag it
```bash
docker tag fokot/prayer-app-server gcr.io/prayerapp-248514/fokot/prayer-app-server:v1
```
Push it
```bash
gcloud docker -- push gcr.io/prayerapp-248514/fokot/prayer-app-server:v1
```

