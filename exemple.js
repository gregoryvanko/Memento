const Option = {
    Port:9999,
    Name: process.env.APP_NAME || "Memento",
    Debug: false,
    SplashScreenFilePath: __dirname + "/Frontend/SplashScreen/SplashScreen.html",
    IconFilePath : process.env.APP_ICON || __dirname + "/Backend/Icon/IconBrown.png",
    MongoDbUrl: "mongodb://mongo:27017"
}

require('./index').Start(Option)