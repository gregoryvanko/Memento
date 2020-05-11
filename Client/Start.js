class MementoClient{
    constructor(HtmlId){
        this._HtmlId = HtmlId
        this._DivApp = null
    }

    /** fonction de demarage de l'application */
    Start(){
        // On vide la vue app
        document.getElementById(this._HtmlId).innerHTML=""
        // construction et ajout au body de la page HTML start
        this._DivApp = CoreXBuild.Div("App","DivContent")
        document.getElementById(this._HtmlId).appendChild(this._DivApp)
        
        // Titre de l'application
        let DivTitre = CoreXBuild.DivTexte(document.title,"Titre","","text-align: center;")
        this._DivApp.appendChild(DivTitre)
        // Call du serveur pour obtenir tous les blog
        let MyBlog = new Blog(this._DivApp, this.Start.bind(this))
        MyBlog.GetAllBlog()
    }
    /** Titre de cette application */
    GetTitre(){
        return "Memento"
    }
}

// Creation de l'application 1
let MyMementoClient = new MementoClient(GlobalCoreXGetAppContentId())
// Ajout de l'application 1
GlobalCoreXAddApp(MyMementoClient.GetTitre(), "",MyMementoClient.Start.bind(MyMementoClient))
