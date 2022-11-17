class AdminAllBlog {
    constructor(){
        this._DivApp = NanoXGetDivApp()

        this._ListBlogConteneur = NanoXBuild.DivFlexColumn("AdminBlogConteneur", null, "width: 99%; max-width: 60rem; margin-top: 3rem;")
        this._WaitingBlogText = NanoXBuild.DivText("Loading blogs...", "waitingblog", "TextSmall", "margin-bottom: 2rem;")
    }

    Initiation(){
        // Clear view
        this._DivApp.innerHTML=""

        // Conteneur
        this._DivApp.appendChild(this._ListBlogConteneur)
        // Waiting Blog text
        this._DivApp.appendChild(this._WaitingBlogText)

        // Get all blgos one by one
        this.GetAllBlog()

        // Log serveur load module Blog
        NanoXApiPostLog("Load module Admin All Blog")
    }

    GetAllBlog(){
         // Get blog data
         NanoXApiGet("/blog/Adminbloginfo").then((reponse)=>{
            // Render liste of blog
            this.RenderBlogInfo(reponse)
            // remove waiting blog text
            this._WaitingBlogText.parentNode.removeChild(this._WaitingBlogText)
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    RenderBlogInfo(AllBlog){
        if(AllBlog.length == 0){
            this._ListBlogConteneur.appendChild(NanoXBuild.DivText("There is no Post", "", "Text", ""))
        } else {
            // Ajout d'une ligne
            this._ListBlogConteneur.appendChild(NanoXBuild.Line())
            // Ajout de tous les post
            AllBlog.forEach(element => {
                // Creation du div du post
                let BoxElement = NanoXBuild.DivFlexRowSpaceEvenly("","BoxElementPost")
                BoxElement.setAttribute("data-id", element._id)
                this._ListBlogConteneur.appendChild(BoxElement)
                // Titre du Post
                BoxElement.appendChild(NanoXBuild.DivText(element.Titre,"","Text TextBoxTitre", "width: 33rem"))
                // Public
                if (!element.Public){
                    BoxElement.appendChild(NanoXBuild.DivText("Public","","Text TextBoxTitre", "width: 5rem; text-align: center;"))
                } else {
                    BoxElement.appendChild(NanoXBuild.DivText("Private","","Text TextBoxTitre", "width: 5rem; text-align: center;"))
                }
                // UserId
                BoxElement.appendChild(NanoXBuild.DivText(element.UserId,"","Text TextBoxTitre", "width: 20rem; text-align: center;"))
                // on click
                BoxElement.addEventListener("click", this.ClickOnBlog.bind(this, element._id, element.Titre, element.Public, element.UserId))
                // Ajout d'une ligne
                this._ListBlogConteneur.appendChild(NanoXBuild.Line())
            })
            // Ajout d'un espace
            this._ListBlogConteneur.appendChild(NanoXBuild.Div("","","margin-bottom: 2rem;"))
        }
    }

    ClickOnBlog(BlogId, Titre, Public, UserId){
        alert(`${BlogId} ${Titre} ${Public} ${UserId}`)
    }
}

// Creation de l'application
let MyAdminAllBlog = new AdminAllBlog()
// Ajout de l'application
NanoXAddModule("All Blog", IconCommon.AdminAllBlogIcon(), MyAdminAllBlog.Initiation.bind(MyAdminAllBlog), false, true)