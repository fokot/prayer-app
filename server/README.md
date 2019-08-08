# server

Server which connects mobile app and web.

Created whit the help of this [blog](https://www.paramander.com/blog/playing-with-websockets-in-haskell-and-elm) and this [gist](https://gist.github.com/andrevdm/9560b5e31933391694811bf22e25c312) for scotty.

```
          websockets               http POST
 ___                        ___                   _______
| p | --- 1. ws connect -> | s |                 |       | <-- 3. user enters code
| h |                      | e |                 |  web  |
| o | <-- 2. code -------- | r | <- 5. update -- |       | <-- 4. user edits prayers
| n |                      | v |                  -------         and press update
| e | <-- 6. update ------ | e |                /......./
 ---                       | r |               /......./
                            ---                --------
```

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
