const Option = {
    Port:5000,
    Name:"MementoDev",
    Debug: true,
    SplashScreenFilePath: __dirname + "/Frontend/SplashScreen/SplashScreen.html",
    IconFilePath : __dirname + "/IconBrown.png"
}

require('./index').Start(Option)