let MementoCoreX = require('./index').MementoCoreX
const Name = "MementoDev"
const Port = 5000
const Debug = true
//const Icon = __dirname + "/Memento.png"
//let MyApp = new MementoCoreX(Name, Port, Debug, Icon)
let MyApp = new MementoCoreX(Name, Port, Debug)
MyApp.Start()