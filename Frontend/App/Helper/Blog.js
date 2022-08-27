class HelperBlog {
    constructor(LoadStartView){
        this._LoadStartView = LoadStartView

        this._DivApp = NanoXGetDivApp()
        this._BlogNumberToLoad = 0
        this._IsStopLoadingListBlog = false
        this._IsAnyBlogLoaded = false
        this._BlogData = {_id:null, Titre:null, Image:null, Public:true, CanEdit:false, ListOfPost:[] }

        this._ListBlogConteneur = NanoXBuild.DivFlexColumn("BlogConteneur", null, "width: 100%;")
        this._WaitingBlogText = NanoXBuild.DivText("Loading blogs...", "waitingblog", "TextSmall", "margin-bottom: 2rem;")
    }

    Initiation(){
        this._BlogNumberToLoad = 0
        this._IsStopLoadingListBlog = false
        this._IsAnyBlogLoaded = false
        this._ListBlogConteneur.innerHTML=""
        this._BlogData = {_id:null, Titre:null, Image:null, Public:true, CanEdit:false, ListOfPost:[] }
    }

    SetBlogContener(ParentDiv){
        // Contener for blogs
        ParentDiv.appendChild(this._ListBlogConteneur)
        // Waiting Blog text
        ParentDiv.appendChild(this._WaitingBlogText)
        // Get blog create permission
        NanoXApiGet("/blog/allowaddblog/").then((reponse)=>{
            if (reponse == true){
                this.AllowAddBlog()
            }
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    GetBlog(){
        // Get blog data
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
        this._BlogData._id = Id
        this._BlogData.Titre = Titre
        this._BlogData.Image = Image

        this._IsStopLoadingListBlog = true
        this.SetLightview()
        this.AddBackButton()
        this.RenderBlogData(false)
        // Log serveur load Blog
        NanoXApiPostLog("View Blog : " + Titre)
    }

    SetLightview(){
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // clear menu button right
        NanoXClearMenuButtonRight()
        // clear menu button setttings
        NanoXClearMenuButtonSettings()
        // Menu bar Translucide
        NanoXSetMenuBarTranslucide(true)
        // Show name in menu bar
        NanoXShowNameInMenuBar(false)
    }

    AddBackButton(){
        // Add button back to liste of blog
        NanoXAddMenuButtonLeft("IdBackButton", "Back", IconCommon.Back(), this._LoadStartView )
    }

    RenderBlogData(EditMode=false){
        // Clear view
        this._DivApp.innerHTML=""
        this.SetLightview()
        this.AddBackButton()
        // creation de la classe HelperPost
        this._HelperPost = new HelperPost(this._BlogData._id, this._BlogData.Titre, this._BlogData.Image, this.ClickOnBlog.bind(this))
        // Add Button stop edit mode
        if (EditMode){
            // Add Stop editing button
            NanoXAddMenuButtonSettings("IdStopEditBlogButton", "Stop Editing", IconCommon.StopEditBlog(), this.RenderBlogData.bind(this, false))
        } else {
            // Get blog edit permission
            NanoXApiGet("/blog/alloweditblog/" + this._BlogData._id).then((reponse)=>{
                if (reponse == true){
                    // Add Add Post button
                    NanoXAddMenuButtonSettings("IdAddPostButton", "Add Post", IconCommon.AddBlog(), this.ClickOnAddPost.bind(this))
                    // Add Edit Blog Button
                    NanoXAddMenuButtonSettings("IdEditBlogButton", "Edit Blog", IconCommon.EditBlog(), this.RenderBlogData.bind(this, true))
                }
            },(erreur)=>{
                this._DivApp.innerHTML=erreur
            })
        }

        // Titre
        let Titre = NanoXBuild.DivText(this._BlogData.Titre, "Titre", "DivTitreBlogPost", "white-space: normal;")
        Titre.setAttribute("data-type", "BlogTitre")
        this._DivApp.appendChild(Titre)
        // Image
        let DivImgBlog = NanoXBuild.DivFlexColumn()
        this._DivApp.appendChild(DivImgBlog)
        let ImgBlog = NanoXBuild.Image64(this._BlogData.Image,"ImgBlog", "ImgBlog")
        DivImgBlog.appendChild(ImgBlog)
        // liste of post Posts
        if (EditMode == false){this._HelperPost.SetListOfPostContener(this._DivApp)}

        if (EditMode){
            // on ajoute un espace vide
            this._DivApp.appendChild(NanoXBuild.Div("","","height:1rem;"))
            // Ajout du sous titre Parametres
            this._DivApp.appendChild(NanoXBuild.DivText("Settings", "", "SousTitre","width: 99%; max-width: 1000px; margin: 0.5rem 0px;"))
            // Blog Public
            let DivPublicSection = NanoXBuild.DivFlexRowStart("", "", "width: 99%; max-width: 1000px;")
            DivPublicSection.appendChild(NanoXBuild.DivText("Public Blog :", "", "Text", "margin-right: 1rem;"))
            // Add button Yes/No
            let TooglePublic= NanoXBuild.ToggleSwitch({Id:"TooglePublic", Checked: this._BlogData.Public, OnChange: this.UpdatePublicBlog.bind(this), HeightRem: 1.5})
            DivPublicSection.appendChild(TooglePublic)
            this._DivApp.appendChild(DivPublicSection)

            // Add Delete blog button
            this._DivApp.appendChild(NanoXBuild.Button("Delete Blogs",this.ClickOnDeleteBlog.bind(this),"DeleteBlogButton", "Button Text"))
        }
    }

    AllowAddBlog(){
        if (! this._IsStopLoadingListBlog){
            NanoXAddMenuButtonSettings("IdAddBlogButton", "New Blog", IconCommon.AddBlog(), this.ClickOnAddBlog.bind(this))
        }
    }

    ClickOnAddBlog(){
        // Get new blog data
        NanoXApiGet("/blog/AddNewBlog/").then((reponse)=>{
            this.SetLightview()
            this.AddBackButton()
            this._HelperPost = new HelperPost(reponse._id, reponse.Titre, reponse.Image, this.ClickOnBlog.bind(this))
            this._BlogData = reponse
            this.RenderBlogData(true)
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    ClickOnDeleteBlog(){
        if (confirm(`Are you sure you want to Delete the Blog: ${this._BlogData.Titre}?`)){
            // delete blog data
            NanoXApiDelete("/blog/" + this._BlogData._id).then((reponse)=>{
                this._LoadStartView()
            },(erreur)=>{
                this._DivApp.innerHTML=erreur
            })
        }
    }

    ClickOnAddPost(){
        this._HelperPost.AddPost()
    }

    UpdatePublicBlog(event){
        const Checked = event.target.checked
        console.log("UpdatePublicBlog " + Checked) // ToDo
    }

}