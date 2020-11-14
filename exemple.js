let MementoCoreX = require('./index').MementoCoreX
const Name = "MementoDev"
const Port = 5000
const Debug = true
const VideoFolder= __dirname + "/Video"
//const Icon = __dirname + "/Memento.png"
//let MyApp = new MementoCoreX(Name, Port, Debug, VideoFolder, Icon)
let MyApp = new MementoCoreX(Name, Port, Debug, VideoFolder)
MyApp.Start()