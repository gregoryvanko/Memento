class HelperBlog {
    constructor(LoadStartView){
        this._LoadStartView = LoadStartView

        this._DivApp = NanoXGetDivApp()
        this._BlogNumberToLoad = 0
        this._IsStopLoadingListBlog = false
        this._IsAnyBlogLoaded = false
        this._BlogData = {_id:null, Titre:null, Image:null, Public:true, CanEdit:false, ListOfPost:[] }

        this._ListBlogConteneur = NanoXBuild.DivFlexColumn("BlogConteneur", null, "width: 100%; margin-top: 3rem;")
        this._WaitingBlogText = NanoXBuild.DivText("Loading blogs...", "waitingblog", "TextSmall", "margin-bottom: 2rem;")

        this._InitiContent =""
        this._IsBlogModified = false
        this._HelperPost  = null
    }

    Initiation(){
        this._BlogNumberToLoad = 0
        this._IsStopLoadingListBlog = false
        this._IsAnyBlogLoaded = false
        this._ListBlogConteneur.innerHTML=""
        this._BlogData = {_id:null, Titre:null, Image:null, Public:true, CanEdit:false, ListOfPost:[] }
        this._InitiContent =""
        this._IsBlogModified = false
        this._HelperPost  = null
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
            CarteBlog.addEventListener("click", this.ClickOnBlog.bind(this, Data._id, Data.Titre, Data.Image, Data.Public))
            this._ListBlogConteneur.appendChild(CarteBlog)
            // Content de la carte du blog
            let BlogContent = NanoXBuild.DivFlexRowStart("", "", "flex-wrap: nowrap; width: 100%;")
            CarteBlog.appendChild(BlogContent)
            // Image du blog
            let DivImg = NanoXBuild.Div("", "", "width: 30%;")
            BlogContent.appendChild(DivImg)
            let DivImgFlex = NanoXBuild.DivFlexColumn("", "", "height: 5rem;")
            DivImg.appendChild(DivImgFlex)
            let ImgBlog = NanoXBuild.Image64(Data.Image,"","CarteBlogImg")
            DivImgFlex.appendChild(ImgBlog)
            // Titre du blog
            let Titre = NanoXBuild.DivText(Data.Titre,"","Text", "margin-left: 0.5rem; overflow-wrap: break-word; width: 60%;")
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

    ClickOnBlog(Id, Titre, Image, Public){
        this._BlogData._id = Id
        this._BlogData.Titre = Titre
        this._BlogData.Image = Image
        this._BlogData.Public = Public

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

    StopEdit(){
        this.RenderBlogData(false)
        NanoXApiPostLog("Stop Edit Blog : " + this._BlogData.Titre)
    }

    RenderBlogData(EditMode=false){
        // Clear view
        this._DivApp.innerHTML=""
        this.SetLightview()
        this.AddBackButton()
        // creation de la classe HelperPost
        this._HelperPost = new HelperPost(this._BlogData._id, this._BlogData.Titre, this._BlogData.Image, this._BlogData.Public, this.ClickOnBlog.bind(this))
        // Add Button stop edit mode
        if (EditMode){
            // Add Stop editing button
            NanoXAddMenuButtonSettings("IdStopEditBlogButton", "Stop Editing", IconCommon.StopEditBlog(), this.StopEdit.bind(this))
            NanoXApiPostLog("Edit Blog : " + this._BlogData.Titre)
            this._HelperPost.CanEdit = true
        } else {
            // Get blog edit permission
            NanoXApiGet("/blog/alloweditblog/" + this._BlogData._id).then((reponse)=>{
                if (reponse == true){
                    // Add Add Post button
                    NanoXAddMenuButtonSettings("IdAddPostButton", "Add Post", IconCommon.AddBlog(), this.ClickOnAddPost.bind(this))
                    // Add Edit Blog Button
                    NanoXAddMenuButtonSettings("IdEditBlogButton", "Edit Blog", IconCommon.EditBlog(), this.RenderBlogData.bind(this, true))
                    // Sst hleper post
                    this._HelperPost.CanEdit = true
                } else {
                    this._HelperPost.CanEdit = false
                }
            },(erreur)=>{
                this._DivApp.innerHTML=erreur
            })
        }

        // Titre
        let Titre = NanoXBuild.DivText(this._BlogData.Titre, "Titre", "DivTitreBlogPost", "white-space: normal;")
        Titre.setAttribute("data-type", "BlogTitre")
        this._DivApp.appendChild(Titre)
        if(EditMode){
            Titre.setAttribute("contenteditable", "True")
            Titre.addEventListener("click", this.SelectText.bind(this))
            Titre.addEventListener("keydown", this.Keydown.bind(this))
            Titre.addEventListener("focusout", this.ElementFocusOut.bind(this))
            Titre.addEventListener("mouseover", this.Mouseover.bind(this))
            Titre.addEventListener("mouseout", this.Mouseout.bind(this))
        }

        // Image
        let DivImgBlog = NanoXBuild.DivFlexColumn()
        this._DivApp.appendChild(DivImgBlog)
        let ImgBlog = NanoXBuild.Image64(this._BlogData.Image,"ImgBlog", "ImgBlog")
        DivImgBlog.appendChild(ImgBlog)
        if(EditMode){
            ImgBlog.classList.add("ImgBlogEditable")
            ImgBlog.addEventListener("click", this.SelectImg.bind(this))
            ImgBlog.addEventListener("mouseover", this.Mouseover.bind(this))
            ImgBlog.addEventListener("mouseout", this.Mouseout.bind(this))
        }

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

    /** Update du titre du blog */
    UpdateTitre(NewTitre){
        let Data = new Object()
        Data.BlogId = this._BlogData._id
        Data.Topic = "Titre"
        Data.Data = NewTitre
        NanoXApiPost("/blog/UpdateBlog/", Data).then((reponse)=>{
            this._BlogData.Titre = reponse
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    UpdatePublicBlog(event){
        const Checked = event.target.checked
        let Data = new Object()
        Data.BlogId = this._BlogData._id
        Data.Topic = "Public"
        Data.Data = Checked
        NanoXApiPost("/blog/UpdateBlog/", Data).then((reponse)=>{
            this._BlogData.Public = reponse
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    /** Selection du titre du blog */
    SelectText(event) {
        let element = event.target
        this._InitiContent = element.innerHTML
        if((element.dataset.type == "BlogTitre") && (element.innerHTML == "New Blog")){
            document.execCommand('selectAll',false,null)
        }
        element.style.borderColor= "red"
        this._IsBlogModified = true
    }

    /** Selection de l'image du blog */
    SelectImg(event){
        let element = event.target
        let ImageId = element.id
        let Data = new Object()
        Data.Topic = "Image"
        Data.BlogId = this._BlogData._id
        element.style.borderColor= "red"
        this._IsBlogModified = true
        let uploadimage = new UploadImage(ImageId, "/blog/UpdateBlog/", Data, this.CallBackImgUpdate.bind(this))
        uploadimage.Start()
    }

    /**
     * Fonction exécutée en callback de la fonction qui change l'image d'un blog
     * @param {Image Base64} Img La nouvelle image sous forme Base64
     * @param {string} Id Id de l'élément image
     */
    CallBackImgUpdate(Img, Id){
        if (Img != null){
            document.getElementById(Id).src = Img
            this._BlogData.Image = Img
        }
        this._IsBlogModified = false
        document.getElementById(Id).style.borderColor = "transparent"
    }

    /** Focus out of element */
    ElementFocusOut(event){
        let element = event.target
        element.style.borderColor= "transparent"
        let Txt = element.innerHTML
        if(Txt.endsWith("<br>")){
            Txt = Txt.substring(0, Txt.length - 4);
            element.innerHTML = Txt
        }
        if(Txt != this._InitiContent){
            if (Txt == "") {element.innerHTML = "New Blog"}
            this.UpdateTitre(Txt)
        }
        window.getSelection().removeAllRanges()
        this._IsBlogModified = false
    }
    /** Keydown */
    Keydown(event){
        let element = event.target
        if (event.keyCode == 13){
            event.preventDefault()
            element.blur()
            return false
        }
    }
    /** Mouseover */
    Mouseover(event){
        if (! this._IsBlogModified){
            let element = event.target
            element.style.borderColor= "var(--NanoX-appcolor)"
        }
    }
    /** Mouseout */
    Mouseout(event){
        if (! this._IsBlogModified){
            let element = event.target
            element.style.borderColor= "transparent"
        }
    }
}