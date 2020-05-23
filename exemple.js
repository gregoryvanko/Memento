let MementoCoreX = require('./index').MementoCoreX
const Name = "MementoDev"
const Port = 5000
const Debug = true
let MyApp = new MementoCoreX(Name, Port, Debug)
MyApp.Start()