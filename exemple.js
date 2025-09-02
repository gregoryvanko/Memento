const Option = {
    Port:9999,
    Name: process.env.APP_NAME || "Memento",
    Debug: process.env.APP_DEBUG || false,
    SplashScreenFilePath: process.env.APP_SCREEN || __dirname + "/Frontend/SplashScreen/SplashScreen.html",
    IconFilePath : process.env.APP_ICON || __dirname + "/IconBrown.png",
    MongoDbUrl: "mongodb://mongo:27017"
}

require('./index').Start(Option)