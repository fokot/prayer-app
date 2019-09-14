# Web

Web editor built with [Elm](https://elm-lang.org/)

## Run
```bash
elm make Main.elm --output=main.js
```
and then run server in `web` directory e.g.
```bash
python -m SimpleHTTPServer
```
and then open Now go to [http://localhost:8000/](http://localhost:8000/)

`elm reactor` is not working with it as I needed custom ports to do websockets.
They are not supported in Elm 0.19 yet...

For production build it with flag `--optimize` 
```bash
elm make Main.elm --output=main.js --optimize
```


To debug Elm-ui you can use `Attribute`
```elm
Element.explain Debug.todo
```
