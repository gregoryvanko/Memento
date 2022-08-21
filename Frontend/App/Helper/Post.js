class HelperPost{
    constructor(BlogId = null, BlogTitre = null, BlogImage = null, LoadBlogView = null){
        this._BlogId = BlogId
        this._BlogTitre = BlogTitre
        this._BlogImage = BlogImage
        this._LoadBlogView = LoadBlogView
        this._PostId = null
        this._PostData = new Object()
        this._PostData.Data = null
        this._PostData.Picture = new Array()

        this._DivApp = NanoXGetDivApp()

        this._WaitingPostText = NanoXBuild.DivText("Loading Posts...", "WaitingPostText", "TextSmall", "margin-bottom: 2rem;")
        this._DivListOfPost = NanoXBuild.DivFlexColumn("DivListOfPost", "", "width: 99%; max-width: 60rem;")
        
    }

    SetListOfPostContener(ParentDiv){
        // Post Contener
        ParentDiv.appendChild(this._DivListOfPost)
        // Ajout d'un espace
        this._DivListOfPost.appendChild(NanoXBuild.Div("","","margin-bottom: 2rem;"))
        // Waiting text
        this._DivListOfPost.appendChild(this._WaitingPostText)
        // Get List Of All Post
        this.GetListOfAllPost()
    }

    GetListOfAllPost(){
        NanoXApiGet("/post/allpostofBlog/" + this._BlogId).then((reponse)=>{
            this.RenderListOfAllPost(reponse)
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    RenderListOfAllPost(Data){
        if (document.getElementById("WaitingPostText")){
            this._WaitingPostText.parentNode.removeChild(this._WaitingPostText)
        }
        if(Data.length == 0){
            this._DivListOfPost.appendChild(NanoXBuild.DivText("There is no Post", "", "Text", ""))
        } else {
            // Ajout d'une ligne
            this._DivListOfPost.appendChild(NanoXBuild.Line())
            // Ajout de tous les post
            Data.forEach(element => {
                // Creation du div du post
                let BoxElementPost = NanoXBuild.Div("","BoxElementPost")
                BoxElementPost.setAttribute("data-id", element._id)
                this._DivListOfPost.appendChild(BoxElementPost)
                // Ajout du titre du Post
                BoxElementPost.appendChild(NanoXBuild.DivText(element.Titre,"","Text TextBoxTitre"))
                // Ajout du titre du Post
                BoxElementPost.appendChild(NanoXBuild.DivText(NanoXBuild.GetDateString(element.CreationDate),"","TextSmall TextNote","text-align: right;"))
                BoxElementPost.addEventListener("click", this.ClickOnPostToOpen.bind(this, element._id, element.Titre))
                // Ajout d'une ligne
                this._DivListOfPost.appendChild(NanoXBuild.Line())
            })
            // Ajout d'un espace
            this._DivListOfPost.appendChild(NanoXBuild.Div("","","margin-bottom: 2rem;"))
        }
    }

    ClickOnPostToOpen(PostId, PostTitre){
        this._PostId = PostId
        this.SetLightview()
        this.AddButton()
        this.GetPostData()
        // Log serveur load Blog
        NanoXApiPostLog("View Post : " + PostTitre)
    }

    SetLightview(){
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // clear menu button right
        NanoXClearMenuButtonRight()
        // Menu bar Translucide
        NanoXSetMenuBarTranslucide(true)
        // Show name in menu bar
        NanoXShowNameInMenuBar(false)
    }

    AddButton(){
        // Add button back to liste of blog
        NanoXAddMenuButtonLeft("IdBackButton", "Back", IconCommon.Back(), this.ReloadBlogView.bind(this) )
    }

    ReloadBlogView(){
        this._LoadBlogView(this._BlogId, this._BlogTitre, this._BlogImage)
    }

    GetPostData(){
        // Clear view
        this._DivApp.innerHTML=""
        // on construit la Div qui va revecoir le waiting text
        let DivWaiting = NanoXBuild.DivFlexColumn("DivWaiting")
        this._DivApp.appendChild(DivWaiting)
        // on construit le texte d'attente des Blog
        DivWaiting.appendChild(NanoXBuild.DivText("Waiting for Post data...","","Text","margin-top: 30vh; margin-bottom: 3vh;"))
        // on construit le progress bar
        DivWaiting.appendChild(NanoXBuild.ProgressRing({Id:"ProgressRingLoadPost",FillColor:"WhiteSmoke", ProgressColor: "var(--NanoX-appcolor)", TextColor:"black", Radius:40}))
        // On appel l'API
        NanoXApiGet("/post/" + this._PostId, {}, this.OnPostDownloadding.bind(this)).then((reponse)=>{
            this._PostData = reponse
            let me = this
            setTimeout(function() {
                me.RenderPostData()
            }, 100)
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    OnPostDownloadding(Pourcent){
        document.getElementById("ProgressRingLoadPost").setAttribute('progress', Pourcent);
    }

    RenderPostData(){
        // Clear view
        this._DivApp.innerHTML=""
        let DivPost = NanoXBuild.Div("", "DivPost", "")
        // Page du post
        this._DivApp.appendChild(DivPost)
        // Ajout du titre
        let TitrePost = NanoXBuild.DivText(this._PostData.Data.Titre, "Titre","DivTitreBlogPost", "white-space: normal;")
        DivPost.appendChild(TitrePost)
        debugger
        this._PostData.Data.Content.forEach(element => {
            switch (element.Type) {
                case "PostImg":
                    this._PostData.Picture.forEach(picture => {
                        if (picture._id == element.Value) {
                            DivPost.appendChild(this.BuildImgContent(element.Value,picture.Image))
                        }
                    })
                    break
                case "PostVideoLink":
                    this._DiVPost.appendChild(this.BuildVideoLinkContent(element.Value, EditMode))
                    break
                case "PostMapLink":
                    this._DiVPost.appendChild(this.BuildMapLinkContent(element.Value, EditMode))
                    break
                default:
                    this._DiVPost.appendChild(this.BuildTextContent(element.Type, element.Value, EditMode))
                    break
            }
        })
    }

    /** image content and div*/
    BuildImgContent(Id, Value, EditMode){
        let DivImg = NanoXBuild.DivFlexColumn()
        DivImg.style.width= "90%"
        DivImg.style.marginLeft = "auto"
        DivImg.style.marginRight = "auto"
        DivImg.appendChild(this.BuildImg(Id,Value,EditMode))
        return DivImg
    }

    BuildImg(Id, Value, EditMode = false){
        let Img = NanoXBuild.Image64(Value, Id, "ImgPost")
        Img.setAttribute("data-Content", "Content")
        Img.setAttribute("data-type", "PostImg")
        Img.setAttribute("data-imgid", Id)
        if(EditMode){
            Img.classList.add("ImgPostEditable")
            Img.addEventListener("click", this.SelectElement.bind(this))
            Img.addEventListener("mouseover", this.Mouseover.bind(this))
            Img.addEventListener("mouseout", this.Mouseout.bind(this))
        }
        return Img
    }
}