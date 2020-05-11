# Memento
A Node.js application for Blog creation, based on CoreX.

## Usage
First, install the package using npm:
```bash
npm install @gregvanko/mementocorex --save
```

# File App.js:
Créer un fichier "App.js" qui contiendra le code de démarrage du module.
```js
/*------------------------------------*/
/* Creation de l'application          */
/*------------------------------------*/
let MementoCoreX = require('@gregvanko/mementocorex').MementoCoreX
const Name = "Memento"
const Port = 4000
const Debug = true
let MyApp = new MementoCoreX(Name, Port, Debug)
MyApp.Start()
```