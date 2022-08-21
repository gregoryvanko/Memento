class HelperBlog {
    constructor(LoadStartView){
        this._LoadStartView = LoadStartView

        this._DivApp = NanoXGetDivApp()
        this._BlogNumberToLoad = 0
        this._IsStopLoadingListBlog = false
        this._IsAnyBlogLoaded = false

        this._ListBlogConteneur = NanoXBuild.DivFlexColumn("BlogConteneur", null, "width: 100%;")
        this._WaitingBlogText = NanoXBuild.DivText("Loading blogs...", "waitingblog", "TextSmall", "margin-bottom: 2rem;")
    }

    Initiation(){
        this._BlogNumberToLoad = 0
        this._IsStopLoadingListBlog = false
        this._IsAnyBlogLoaded = false
        this._ListBlogConteneur.innerHTML=""
    }

    SetBlogContener(ParentDiv){
        // Contener for blogs
        ParentDiv.appendChild(this._ListBlogConteneur)
        // Waiting Blog text
        ParentDiv.appendChild(this._WaitingBlogText)
    }

    GetBlog(){
        NanoXApiGet("/blog/bloginfo/" + this._BlogNumberToLoad).then((reponse)=>{
            if (! this._IsStopLoadingListBlog){
                this.RenderBlogCarteInfo(reponse)
            }
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    RenderBlogCarteInfo(DataArray){
        if (DataArray.length == 1){
            let Data = DataArray[0]
            this._IsAnyBlogLoaded = true
            // Get next blog
            this._BlogNumberToLoad ++
            this.GetBlog()

            // render this blog
            // Contour de la carte du blog
            let CarteBlog = NanoXBuild.Div("", "CarteBlog")
            CarteBlog.setAttribute("data-id", Data._id)
            CarteBlog.addEventListener("click", this.ClickOnBlog.bind(this, Data._id, Data.Titre, Data.Image))
            this._ListBlogConteneur.appendChild(CarteBlog)
            // Content de la carte du blog
            let BlogContent = NanoXBuild.DivFlexRowStart("")
            CarteBlog.appendChild(BlogContent)
            // Image du blog
            let DivImg = NanoXBuild.Div("", "", "")
            BlogContent.appendChild(DivImg)
            let DivImgFlex = NanoXBuild.DivFlexColumn()
            DivImg.appendChild(DivImgFlex)
            let ImgBlog = NanoXBuild.Image64(Data.Image,"","CarteBlogImg")
            DivImgFlex.appendChild(ImgBlog)
            // Titre du blog
            let Titre = NanoXBuild.DivText(Data.Titre,"","Text", "margin-left: 1rem;")
            BlogContent.appendChild(Titre)

        } else {
            if (document.getElementById("waitingblog")){
                this._WaitingBlogText.parentNode.removeChild(this._WaitingBlogText)
            }
            if (this._IsAnyBlogLoaded){
                this._ListBlogConteneur.appendChild(NanoXBuild.DivText("All blogs are loaded", "noblog", "TextSmall", "margin-bottom: 2rem;"))
            } else {
                this._ListBlogConteneur.appendChild(NanoXBuild.DivText("There is no blog", "noblog", "Text", "margin-bottom: 2rem;"))
            }
        }
    }

    ClickOnBlog(Id, Titre, Image){
        this._IsStopLoadingListBlog = true
        this.SetLightview()
        this.AddButton()
        this.HelperPost = new HelperPost(Id, Titre, Image, this.ClickOnBlog.bind(this))
        this.RenderBlogData(false, Titre, Image)
        // Log serveur load Blog
        NanoXApiPostLog("View Blog : " + Titre)
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
        NanoXAddMenuButtonLeft("IdBackButton", "Back", IconCommon.Back(), this._LoadStartView )
    }

    RenderBlogData(EditMode=false, BlogTitre= "New Blog", BlogImage = null){
        // Clear view
        this._DivApp.innerHTML=""
        // Titre
        let Titre = NanoXBuild.DivText(BlogTitre, "Titre", "DivTitreBlogPost", "white-space: normal;")
        Titre.setAttribute("data-type", "BlogTitre")
        this._DivApp.appendChild(Titre)
        // Image
        let DivImgBlog = NanoXBuild.DivFlexColumn()
        this._DivApp.appendChild(DivImgBlog)
        let ImgBlog = NanoXBuild.Image64(BlogImage,"ImgBlog", "ImgBlog")
        DivImgBlog.appendChild(ImgBlog)
        // Posts
        this.HelperPost.SetListOfPostContener(this._DivApp)
    }
}