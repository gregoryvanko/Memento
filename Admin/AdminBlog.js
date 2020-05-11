class AdminBlog{
    constructor(HtmlId){
        this._HtmlId = HtmlId
        this._DivApp = null
    }
    /** Start de l'application */
    Start(){
        // Clear view
        document.getElementById(this._HtmlId).innerHTML = ""
        // Add CSS
        document.getElementById(this._HtmlId).innerHTML = this.GetCss()
        // construction et ajout au body de la page HTML start
        this._DivApp = CoreXBuild.Div("App","DivContent")
        document.getElementById(this._HtmlId).appendChild(this._DivApp)
        // Clear view
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Blog Management", "Titre", "", "margin-top:4%"))
        // Conteneur pour la liste des blogs
        let BlogConteneur = CoreXBuild.DivFlexColumn("BlogConteneur")
        this._DivApp.appendChild(BlogConteneur)
        // on construit le texte d'attente des Blog
        BlogConteneur.appendChild(CoreXBuild.DivTexte("Wainting for all blogs...","DivWaiting","Text"))
        // on construit le texte du message d'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorStart","Text","color:red; text-align: center;")
        this._DivApp.appendChild(DivErrorTexte)
        // On appel l'API
        GlobalCallApiPromise("AdminGetAllBlog", "", "", "").then((reponseBlog)=>{
            document.getElementById("DivWaiting").innerHTML = "Wainting for all users data..."
            GlobalGetUserDataPromise().then((reponse)=>{
                this.BuildListOfAllBlog(reponseBlog, reponse)
            },(erreur)=>{
                document.getElementById("DivWaiting").parentNode.removeChild(document.getElementById("DivWaiting"))
                document.getElementById("ErrorStart").innerHTML=erreur
            })
        },(erreur)=>{
            document.getElementById("DivWaiting").parentNode.removeChild(document.getElementById("DivWaiting"))
            document.getElementById("ErrorStart").innerHTML=erreur
        })
    }
    /** Clear view */
    ClearView(){
        // Global action
        GlobalClearActionList()
        GlobalAddActionInList("Refresh", this.Start.bind(this))
        // Clear view
        this._DivApp.innerHTML=""
    }

    /** Construction de la liste des caractéristiques d'un blog */
    BuildListOfAllBlog(Blogs, Users){
        // On vide l'element ListOfBlog 
        let BlogConteneur = document.getElementById("BlogConteneur")
        BlogConteneur.innerHTML=""
        if (Blogs == null) {
            BlogConteneur.appendChild(CoreXBuild.DivTexte("There is no Blog","","Text"))
        } else {
            // Ajout d'un espace
            BlogConteneur.appendChild(CoreXBuild.Div("","","margin-bottom: 2%;"))
            // Ajout du titre des parametres des blogs
            let DivTitre = CoreXBuild.Div("", "BoxElementBlogTitre")
            BlogConteneur.appendChild(DivTitre)
            let BoxTitre = CoreXBuild.DivFlexRowAr("")
            DivTitre.appendChild(BoxTitre)
            BoxTitre.appendChild(CoreXBuild.DivTexte("Titre","","TextBoxTitre", "width: 50%;color: var(--CoreX-color);"))
            BoxTitre.appendChild(CoreXBuild.DivTexte("Public","","TextBoxTitre", "width: 10%;color: var(--CoreX-color);"))
            BoxTitre.appendChild(CoreXBuild.DivTexte("User Name","","TextBoxTitre", "width: 30%;color: var(--CoreX-color);"))
            // Ajout d'une ligne
            BlogConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            Blogs.forEach(element => {
                // Creation du div du Blog
                let BoxBlog = CoreXBuild.Div("", "BoxElementBlog")
                BoxBlog.addEventListener("click", this.ClickOnBlog.bind(this, element._id, element.Titre, element.Public, Users))
                BlogConteneur.appendChild(BoxBlog)
                let BoxElementBlog = CoreXBuild.DivFlexRowAr("BoxElementBlog")
                BoxBlog.appendChild(BoxElementBlog)
                // Ajout du titre du Blog
                BoxElementBlog.appendChild(CoreXBuild.DivTexte(element.Titre,"","TextBoxTitre", "width: 50%;"))
                // Ajout du statu Public
                BoxElementBlog.appendChild(CoreXBuild.DivTexte(element.Public,"","TextBoxTitre", "width: 10%;"))
                // Ajout du UserId
                // recherche du nom du user
                let UserName = "Not Found"
                Users.forEach(elementuser => {
                    if(element.UserId == elementuser._id){UserName = elementuser.User}
                });
                BoxElementBlog.appendChild(CoreXBuild.DivTexte(UserName,"","TextBoxTitre", "width: 30%;"))
                // Ajout d'une ligne
                BlogConteneur.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            })
        }
    }
    /** Click on Blog */
    ClickOnBlog(Id, Titre, Public, Users){
        // ToDo
        this.ClearView()
        // Titre
        this._DivApp.appendChild(CoreXBuild.DivTexte("Modify blog: " + Titre, "Titre", "", "margin-top:4%"))
        // on ajoute un espace vide
        this._DivApp.appendChild(CoreXBuild.Div("","","height:2vh;"))
        // Blog Public
        let DivPublicSection = CoreXBuild.DivFlexRowStart()
        DivPublicSection.style.margin = "2vh 0px 2vh 0px"
        let txtPublicBlog = CoreXBuild.DivTexte("Blog is Public :", "", "Text", "margin:1%;")
        txtPublicBlog.classList.add("WidthInfoText")
        DivPublicSection.appendChild(txtPublicBlog)
        let TooglePublic= CoreXBuild.ToggleSwitch("TooglePublic", Public, 30)
        let me = this
        TooglePublic.addEventListener('change', (event) => {
            if (event.target.checked) {
                me.UpdatePublicBlog(Id, true)
            } else {
                me.UpdatePublicBlog(Id, false)
            }
        })
        DivPublicSection.appendChild(TooglePublic)
        this._DivApp.appendChild(DivPublicSection)
        // Delete blog
        let DivDeleteSection = CoreXBuild.DivFlexRowStart()
        DivDeleteSection.style.margin = "2vh 0px 2vh 0px"
        let txtDeletBlog = CoreXBuild.DivTexte("Delete the Blog and his content :", "", "Text", "margin:1%;")
        txtDeletBlog.classList.add("WidthInfoText")
        DivDeleteSection.appendChild(txtDeletBlog)
        DivDeleteSection.appendChild(CoreXBuild.Button("Delete Blog",this.DeleteBlog.bind(this, Id),"Button"))
        this._DivApp.appendChild(DivDeleteSection)
        // Change Owner blog
        let DivChangeUserSection = CoreXBuild.DivFlexRowStart()
        DivChangeUserSection.style.margin = "2vh 0px 2vh 0px"
        let txtChangeUser = CoreXBuild.DivTexte("Change Owner of the blog :", "", "Text", "margin:1%;")
        txtChangeUser.classList.add("WidthInfoText")
        DivChangeUserSection.appendChild(txtChangeUser)
        DivChangeUserSection.appendChild(CoreXBuild.Button("Change Owner",this.OpenViewChangeOwnerBlog.bind(this, Id, Users),"Button"))
        this._DivApp.appendChild(DivChangeUserSection)
        // Error Message
        this._DivApp.appendChild(CoreXBuild.DivTexte("", "ErrorModifBlog", "Text", "color:red; text-align: center;"))
        // Close button
        let DivButton = CoreXBuild.DivFlexColumn("ListOfAdminBlogButton")
        let ButtonGoToBlog = CoreXBuild.Button("Close",this.Start.bind(this),"Button")
        ButtonGoToBlog.setAttribute("Style", "margin: 4vh 0vh 1vh 0vh;")
        DivButton.appendChild(ButtonGoToBlog)
        this._DivApp.appendChild(DivButton)
    }
    /** Delete blog */
    DeleteBlog(Id){
        if (confirm('Are you sure you want to Dete this Blog?')){
            // Creation DataForApi
            let DataForApi = new Object()
            DataForApi.Fct = "DeleteBlog"
            DataForApi.Id= Id
            // On appel l'API
            GlobalCallApiPromise("AdminUpdateBlog", DataForApi, "", "").then((reponse)=>{
                this.Start()
            },(erreur)=>{
                document.getElementById("ErrorModifBlog").innerHTML=erreur
            })
        }
    }
    /** Update Public blog */
    UpdatePublicBlog(Id, Public){
        // Creation DataForApi
        let DataForApi = new Object()
        DataForApi.Fct = "UpdatePublicBlog"
        DataForApi.BlogId= Id
        DataForApi.PublicValue= Public
         // On appel l'API
         GlobalCallApiPromise("AdminUpdateBlog", DataForApi, "", "").then((reponse)=>{
        },(erreur)=>{
            document.getElementById("TooglePublic").checked = !Public
            document.getElementById("ErrorModifBlog").innerHTML=erreur
        })
    }
    /** Open viex change Owner of the blog */
    OpenViewChangeOwnerBlog(Id, Users){
        // Creation de la window avec la liste des users
        let DivContent = CoreXBuild.Div("DivContentListUser")
        // Ajout d'un texte
        DivContent.appendChild(CoreXBuild.DivTexte("List of user", "", "Text"))
        // Liste des users
        if (Users == null){
            DivContent.appendChild(CoreXBuild.DivTexte("No User defined", "", "Text", "text-align:center; color:red;"))
        } else {
            // Ajout d'un espace
            DivContent.appendChild(CoreXBuild.Div("","","margin-bottom: 4vh;"))
            // Div liste user
            let BoxElementUser = CoreXBuild.DivFlexRowAr("")
            DivContent.appendChild(BoxElementUser)
            // Ajout d'une ligne
            BoxElementUser.appendChild(CoreXBuild.Line("90%", "Opacity:0.5;"))
            Users.forEach(element => {
                let DivUser = CoreXBuild.DivTexte(element.User,"","BoxElementUser", "text-align:center; width: 90%;")
                BoxElementUser.appendChild(DivUser)
                DivUser.addEventListener("click", this.ChangeOwnerBlog.bind(this, Id, element._id))
                // Ajout d'une ligne
                BoxElementUser.appendChild(CoreXBuild.Line("90%", "Opacity:0.5;"))
            })
        }
        // construction de la fenetre
        CoreXWindow.BuildWindow(DivContent)
    }
    /** Change Owner of the blog */
    ChangeOwnerBlog(Id, NewOwnerId){
        CoreXWindow.DeleteWindow()
        // Creation DataForApi
        let DataForApi = new Object()
        DataForApi.Fct = "ChangeOwnerBlog"
        DataForApi.BlogId= Id
        DataForApi.NewOwnerId= NewOwnerId
        // On appel l'API
        GlobalCallApiPromise("AdminUpdateBlog", DataForApi, "", "").then((reponse)=>{
            this.Start()
        },(erreur)=>{
            document.getElementById("ErrorModifBlog").innerHTML=erreur
        })
    }

    /** Get Titre de l'application */
    GetTitre(){
        return "Blogs"
    }
    /** Get Img Src de l'application */
    GetImgSrc(){
        return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5vbmxpbmV3ZWJmb250cy5jb20vaWNvbiA8L21ldGFkYXRhPg0KPGc+PHBhdGggZD0iTTk4My45LDQyMC40YzYuMS0xMi4yLDYuMS0zMC42LDAtNDIuOUw5NDEsMzM0LjZjLTYuMS02LjEtMTIuMi02LjEtMjQuNS02LjFjLTYuMSwwLTE4LjQsMC0yNC41LDYuMUw1NjEuMyw2NTkuMnYyNC41Vjc0NWg5OEw5ODMuOSw0MjAuNHogTTE5My44LDE5My43aDYxMi41VjI1NUgxOTMuOFYxOTMuN0wxOTMuOCwxOTMuN3ogTTE5My44LDM3Ny41aDU2OS42bDQyLjktNDIuOXYtMTguNEgxOTMuOFYzNzcuNXogTTE5My44LDY4My43SDUwMFY3NDVIMTkzLjhWNjgzLjdMMTkzLjgsNjgzLjd6IE0xOTMuOCw1MDBoNDQ3LjFsNjEuMi02MS4zSDE5My44VjUwMHogTTkyOC43LDU2MS4ydjI0NWMwLDY3LjQtNTUuMSwxMjIuNS0xMjIuNSwxMjIuNUgxOTMuOGMtNjcuNCwwLTEyMi41LTU1LjEtMTIyLjUtMTIyLjVWMTkzLjdjMC02Ny40LDU1LjEtMTIyLjUsMTIyLjUtMTIyLjVoNjEyLjVjNjcuNCwwLDEyMi41LDU1LjEsMTIyLjUsMTIyLjV2NzMuNWMxOC40LDAsMzYuOCwxMi4yLDU1LjEsMjQuNWw2LjEsNi4xVjE5My44Qzk5MCw4OS42LDkxMC40LDEwLDgwNi4zLDEwSDE5My44Qzg5LjYsMTAsMTAsODkuNiwxMCwxOTMuOHY2MTIuNUMxMCw5MTAuNCw4OS42LDk5MCwxOTMuOCw5OTBoNjEyLjVDOTEwLjQsOTkwLDk5MCw5MTAuNCw5OTAsODA2LjNWNTAwTDkyOC43LDU2MS4yeiBNMTkzLjgsNjIyLjVoMzI0LjZsNi4xLTYuMWw1NS4xLTU1LjFIMTkzLjhWNjIyLjV6Ii8+PC9nPg0KPC9zdmc+"
    }
    /** Get Css de l'application */
    GetCss(){
        return /*html*/`
        <style>
            .DivContent{
                padding: 1px;
                margin: 20px auto 10px auto;
                width: 96%;
                margin-left: auto;
                margin-right: auto;
            }
            #Titre{
                margin: 1% 1% 4% 1%;
                font-size: var(--CoreX-Titrefont-size);
                color: var(--CoreX-color);
            }
            .Text{font-size: var(--CoreX-font-size);}
            .WidthInfoText{width:25%;}
            /* Box d'un post dans la liste des post du blog */
            .BoxElementBlogTitre{
                width: 100%;
                padding: 1%;
                box-sizing: border-box;
                border-radius: 15px;
                margin: 4px;
            }
            .BoxElementBlog{
                cursor: pointer;
                width: 100%;
                padding: 1%;
                box-sizing: border-box;
                border-radius: 15px;
                margin: 4px;
            }
            .BoxElementBlog:hover{
                background-color: #F8F8F8;
            }
            .BoxElementUser{
                font-size: var(--CoreX-font-size);
                cursor: pointer;
                width: 100%;
                padding: 1%;
                box-sizing: border-box;
                border-radius: 15px;
                margin: 4px;
            }
            .BoxElementUser:hover{
                background-color: #F8F8F8;
            }
            /* Texte dans un titre box */
            .TextBoxTitre{
                font-size: calc(var(--CoreX-font-size)*1.1);
                font-family: "nyt-cheltenham", georgia, "times new roman", times, serif;
                color: black;
            }
            /* Button */
            .Button{
                margin: 0%;
                padding: 1vh 2vh 1vh 2vh;
                cursor: pointer;
                border: 1px solid var(--CoreX-color);
                border-radius: 20px;
                text-align: center;
                display: inline-block;
                font-size: var(--CoreX-font-size);
                box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7);
                color: rgb(44,1,21);
                background: white;
                outline: none;
            }
            .Button:hover{
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7);
            }

            @media only screen and (min-device-width: 375px) and (max-device-width: 667px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait),
            only screen and (min-device-width: 414px) and (max-device-width: 736px) and (-webkit-min-device-pixel-ratio: 3) and (orientation: portrait),
            screen and (max-width: 700px)
            {
                #Titre{font-size: var(--CoreX-TitreIphone-font-size);}
                .Text{font-size: var(--CoreX-Iphone-font-size);}
                .WidthInfoText{width:50%;}
                .TextBoxTitre{font-size: calc(var(--CoreX-Iphone-font-size)*1.1);}
                .BoxElementUser{font-size: var(--CoreX-Iphone-font-size);}
                .Button{font-size: var(--CoreX-Iphone-font-size); border-radius: 40px;}
            }
            @media screen and (min-width: 1200px)
            {
                .DivContent{width: 1100px;}
                #Titre{font-size: var(--CoreX-TitreMax-font-size);}
                .Text{font-size: var(--CoreX-Max-font-size);}
                .TextBoxTitre{font-size: calc(var(--CoreX-Max-font-size)*1.1);}
                .BoxElementUser{font-size: var(--CoreX-Max-font-size);}
                .Button{font-size: var(--CoreX-Max-font-size); border-radius: 40px;}
            }
        </style>`
    }
}

// Creation de l'application 1
let AdminBlogApp = new AdminBlog(GlobalCoreXGetAppContentId())

// Ajout de l'application 1
GlobalCoreXAddApp(AdminBlogApp.GetTitre(), AdminBlogApp.GetImgSrc(),AdminBlogApp.Start.bind(AdminBlogApp))