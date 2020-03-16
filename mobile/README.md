Run with
```bash
expo start
```

Publish new version which will be automatically downloaded to app
```bash
git commit
./generate-version.sh
expo publish
```

Build like
```bash
expo build:android
```
or
```bash
expo build:ios
```

Build like this for play store. It builds `aab` file and will result in smaller apps
```bash
expo build:android -t app-bundle
```

Add types for ramda like
```bash
yarn add @types/ramda
``` 

Check typescript errors like
```bash
yarn run tsc --resolveJsonModule
```

Sometimes clearing expo cache is needed
```bash
expo start -c
```

To deploy to app store run
```bash
expo build:ios
expo upload:ios --apple-id XXX --apple-id-password XXX
```
