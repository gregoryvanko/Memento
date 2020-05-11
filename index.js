class MementoCoreX{
    constructor(Name = "Memento", Port = 4000, Debug = true){
        // Creation de l'application CoreX
        let corex = require('@gregvanko/corex').corex
        this._OptionApplication = {
            AppName: Name,                          // Nom de l'application
            Port: Port,                             // Port du serveur
            Secret: "MementoAppSecret",             // phrase secrete pour l'encodage du token 
            MongoUrl: "mongodb://localhost:27017"   // Url de la DB Mongo
        }
        this._MyApp = new corex(this._OptionApplication)
        // Variable interne
        this._Debug = Debug
        // Varaible interne MongoDB
        let MongoR = require('@gregvanko/corex').Mongo
        this._Mongo = new MongoR(this._OptionApplication.MongoUrl,this._OptionApplication.AppName)

        this._MongoBlogCollection = "Blog"
        this._MongoBlogTitre = "Titre"
        this._MongoBlogCreationDate = "CreationDate"
        this._MongoBlogUserId = "UserId"
        this._MongoBlogPublic = "Public"
        this._MongoBlogImage = "Image"

        this._MongoPostCollection = "Post"
        this._MongoPostTitre = "Titre"
        this._MongoPostBlogId = "BlogId"
        this._MongoPostCreationDate = "CreationDate"
        this._MongoPostContent = "Content"

        this._MongoPictureCollection = "PostPicture"
        this._MongoPictureBlogId = "BlogId"
        this._MongoPicturePostId = "PostId"
        this._MongoPictureData = "Image"

        this._FonctionClient = require('./FonctionsClient').FonctionClient
        this._FonctionAdmin = require('./FonctionsAdmin').FonctionAdmin
    }
    Start(){
        // Css de l'application CoreX
        const CSS= {
            FontSize:{
                TexteNomrale:"1.5vw",               //--CoreX-font-size
                TexteIphone:"3vw",                  //--CoreX-Iphone-font-size
                TexteMax:"18px",                    //--CoreX-Max-font-size
                TitreNormale:"4vw",                 //--CoreX-Titrefont-size
                TitreIphone:"7vw",                  //--CoreX-TitreIphone-font-size
                TitreMax:"50px"                     //--CoreX-TitreMax-font-size
            },
            Color:{
                Normale:"rgb(20, 163, 255)"         //--CoreX-color
            }
        }
        // Affichier les message de debug du serveur
        this._MyApp.Debug = this._Debug
        // L'application est elle securisee par un login
        this._MyApp.AppIsSecured = true
        // Css de base de l'application
        this._MyApp.CSS = CSS
        // L'application utilise SocketIo
        this._MyApp.Usesocketio = false
        // Chemin vers le dossier contenant les sources Js et CSS de l'app client
        this._MyApp.ClientAppFolder = __dirname + "/Client"
        // Chemin vers le dossier contenant les sources Js et CSS de l'app Admin
        this._MyApp.AdminAppFolder = __dirname + "/Admin"
        // Chemin relatif de l'icone
        this._MyApp.IconRelPath = __dirname + "/apple-icon-192x192.png"
        // Ajout des API client
        this._MyApp.AddApiFct("GetAllBlog", this._FonctionClient.ApiGetAllBlog.bind(this))
        this._MyApp.AddApiFct("GetBlogData", this._FonctionClient.ApiGetBlogData.bind(this))
        this._MyApp.AddApiFct("AddNewBlog", this._FonctionClient.ApiAddNewBlog.bind(this))
        this._MyApp.AddApiFct("UpdateBlog", this._FonctionClient.ApiUpdateBlog.bind(this))
        this._MyApp.AddApiFct("DeleteBlog", this._FonctionClient.ApiDeleteBlog.bind(this))
        this._MyApp.AddApiFct("GetPostData", this._FonctionClient.ApiGetPostData.bind(this))
        this._MyApp.AddApiFct("UpdatePost", this._FonctionClient.ApiUpdatePost.bind(this))
        this._MyApp.AddApiFct("NewPost", this._FonctionClient.ApiNewPost.bind(this))
        this._MyApp.AddApiFct("DeletePost", this._FonctionClient.ApiDeletePost.bind(this))
        this._MyApp.AddApiFct("AddPostPicture", this._FonctionClient.ApiAddPostPicture.bind(this))
        this._MyApp.AddApiFct("DeletePostPicture", this._FonctionClient.ApiDeletePostPicture.bind(this))
        this._MyApp.AddApiFct("UpdatePostPicture", this._FonctionClient.ApiUpdatePostPicture.bind(this))
        // Ajout des API Admin
        this._MyApp.AddApiAdminFct("AdminGetAllBlog", this._FonctionAdmin.ApiAdminGetAllBlog.bind(this))
        this._MyApp.AddApiAdminFct("AdminUpdateBlog", this._FonctionAdmin.ApiAdminUpdateBlog.bind(this))
        // Lancement de l'application
        this._MyApp.Start()
    }
}

module.exports.MementoCoreX = MementoCoreX