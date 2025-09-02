# Memento
A Node.js Blog application.

## Usage
First, install the package using npm:
```bash
npm install @gregvanko/memento --save
```

## File App.js:
Create a file "App.js" with this content:
```js
const Option = {
    Port:9002,
    Name:"Memento",
    Debug: false,
    SplashScreenFilePath: __dirname + "/SplashScreen.html",
    IconFilePath : __dirname + "/IconBrown.png",
    MongoDbUrl: "mongodb://localhost:27017"
}
require('@gregvanko/memento').Start(Option)
```

It is possible to start the application with default values (Port=9000, Name=Memento, Debug=false, SplashScreenFilePath= default splach screen, IconFilePath= default icon, MongoDbUrl= mongodb://localhost:27017):
```js
require('@gregvanko/memento').Start()
```

## Env variables for docker
- PORT
- MONGOURL
- APP_NAME
- APP_DEBUG
- APP_SCREEN
- APP_ICON