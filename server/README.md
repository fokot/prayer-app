# server

Server which connects mobile app and web via websockets.

Created whit the help of this [blog](https://www.paramander.com/blog/playing-with-websockets-in-haskell-and-elm) and this [gist](https://gist.github.com/andrevdm/9560b5e31933391694811bf22e25c312) for scotty.

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
ws://localhost:3000/web
```
and it returns the code (`clientId`) e.g.
```
{"id":"5777"}
```
with which we can connect single client e.g. 
```
ws://localhost:3000/5777
```

Request with `web` as path are always accepted and new `clientId` is returned. 
 
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
