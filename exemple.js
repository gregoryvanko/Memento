let MementoCoreX = require('./index').MementoCoreX
const Name = "MementoDev"
const Port = 5000
const Debug = true
const VideoFolder= "/Video"
const VideoTagName = "name"
let MyApp = new MementoCoreX(Name, Port, Debug, VideoFolder, VideoTagName)
MyApp.Start()