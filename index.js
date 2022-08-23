let NanoXAddRoute = require("@gregvanko/nanox").NanoXAddRoute

async function Start({Port = 9000, Name = "Memento", Debug = false, SplashScreenFilePath = null, IconFilePath = null, MongoDbUrl = "mongodb://localhost:27017"} = {}){
    if (SplashScreenFilePath == null){SplashScreenFilePath = __dirname + "/Frontend/SplashScreen/SplashScreen.html"}
    if (IconFilePath == null){IconFilePath = __dirname + "/Frontend/Icon/apple-icon-192x192.png"}

    // NonoX Option
    const OptionNanoX = {
        AppName: Name,
        AppColor: "rgb(20, 163, 255)",
        AppPort: Port,
        AppSecret: "MementoSecret",
        MongoUrl: MongoDbUrl,
        Debug: Debug,
        IconPath:  IconFilePath,
        ApiServer: true,
        AllowVideo: true,
        AllowSignUp: false,
        AppPath: "",
        NanoXAppOption : {
            SplashScreen : GetSplashScreen(SplashScreenFilePath),
            SplashScreenBackgroundColor : "black",
            ShowMenuBar: true,
            MenuBarIstransparent:false,
            ShowNameInMenuBar: true,
            //CssClassForName: "TestClassName",
            ColorMenuBar: "white",
            ColorIconMenuBar: "black",
            HeightMenuBar: "3rem",
            AppFolderClient: __dirname + "/Frontend/App",
            //AppFolderAdmin: __dirname + "/Frontend/Admin",
            UseAppModule: true
        }
    }
    // Initiation de NanoX
    require("@gregvanko/nanox").NanoXInitiation(OptionNanoX)

    // Add route Blog
    NanoXAddRoute("/blog", require("./Backend/Route/RouteBlog"))
    // Add route Post
    NanoXAddRoute("/post", require("./Backend/Route/RoutePost"))

    // Start NanoX
    await require("@gregvanko/nanox").NanoXStart()

}

function GetSplashScreen(FilePath){
    const fs = require('fs')
    const path = require('path')

    var dir = path.resolve(FilePath)
    let HtmlString = null
    if (fs.existsSync(dir)){
        HtmlString = fs.readFileSync(FilePath, 'utf8')
        HtmlString = HtmlString.replace(/\r?\n|\r/g, " ")
        return HtmlString
    } else {
        console.log("SplashScreen file not found: " + FilePath)
        return HtmlString
    }
}

module.exports.Start = Start