let MementoCoreX = require('./index').MementoCoreX
const Name = "MementoDev"
const Port = 3000
const Debug = true
let MyApp = new MementoCoreX(Name, Port, Debug)
MyApp.Start()