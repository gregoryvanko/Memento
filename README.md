# Memento
A Node.js application for Blog creation, based on CoreX.

## Usage
First, install the package using npm:
```bash
npm install @gregvanko/memento --save
```

# File App.js:
Créer un fichier "App.js" qui contiendra le code de démarrage du module.
```js
/*------------------------------------*/
/* Creation de l'application          */
/*------------------------------------*/
let Memento = require('@gregvanko/memento').MementoCoreX
const Name = "Memento"
const Port = 4000
const Debug = false
const VideoFolder= __dirname + "/Video"
const VideoTagName = "name"
let MyApp = new Memento(Name, Port, Debug, VideoFolder, VideoTagName)
MyApp.Start()
```