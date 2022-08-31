class HelperPost{
    constructor(BlogId = null, BlogTitre=null, BlogImage=null, BlogPublic=null, LoadBlogView = null, CanEdit = false){
        this._BlogId = BlogId
        this._BlogTitre = BlogTitre
        this._BlogImage = BlogImage
        this._BlogPublic = BlogPublic
        this._LoadBlogView = LoadBlogView
        this._CanEdit = CanEdit

        this._PostId = null
        this._PostData = {Data: null, Picture:[]}

        this._DivApp = NanoXGetDivApp()

        this._WaitingPostText = NanoXBuild.DivText("Loading Posts...", "WaitingPostText", "TextSmall", "margin-bottom: 2rem;")
        this._DivListOfPost = NanoXBuild.DivFlexColumn("DivListOfPost", "", "width: 99%; max-width: 60rem;")

        this._IsPostModified = false
        this._InitiContent = null
        
    }
    set CanEdit (value){this._CanEdit = value}


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
        this.GetPostData()
        // Log serveur load Blog
        NanoXApiPostLog("View Post : " + PostTitre)
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
        NanoXAddMenuButtonLeft("IdBackButton", "Back", IconCommon.Back(), this.ReloadBlogView.bind(this) )
    }

    AddEditButton(){
        if (this._CanEdit){
            // Add Edit post Button
            NanoXAddMenuButtonSettings("IdEditPostButton", "Edit Post", IconCommon.EditBlog(), this.RenderPostData.bind(this, true))
        }
    }

    AddStopEditButton(){
        NanoXAddMenuButtonSettings("IdStopEditPostButton", "Stop Editing", IconCommon.StopEditBlog(), this.StopEdit.bind(this))
    }

    StopEdit(){
        this.RenderPostData(false)
        NanoXApiPostLog("Stop Edit Post : " + this._PostData.Data.Titre)
    }

    ReloadBlogView(){
        this._LoadBlogView(this._BlogId, this._BlogTitre, this._BlogImage, this._BlogPublic)
    }

    GetPostData(){
        // Clear view
        this._DivApp.innerHTML=""
        // Set Button
        this.SetLightview()
        this.AddBackButton()
        this.AddEditButton()
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
            }, 200)
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    OnPostDownloadding(Pourcent){
        document.getElementById("ProgressRingLoadPost").setAttribute('progress', Pourcent);
    }

    RenderPostData(EditMode = false){
        // Clear view
        this._DivApp.innerHTML=""
        // Button
        this.SetLightview()
        this.AddBackButton()
        if (EditMode){
            this.AddStopEditButton()
            NanoXApiPostLog("Edit Post : " + this._PostData.Data.Titre)
            // ToDo add palette
        } else {
            this.AddEditButton()
        }
        // Content
        let DivPost = NanoXBuild.Div("", "DivPost", "")
        this._DivApp.appendChild(DivPost)
        // Ajout du titre
        let TitrePost = NanoXBuild.DivText(this._PostData.Data.Titre, "Titre","DivTitreBlogPost", "white-space: normal;")
        if(EditMode){
            TitrePost.setAttribute("contenteditable", "True")
            TitrePost.setAttribute("data-type", "TitrePost")
            TitrePost.addEventListener("click", this.SelectElement.bind(this))
            TitrePost.addEventListener("keydown", this.Keydown.bind(this))
            TitrePost.addEventListener("mouseover", this.Mouseover.bind(this))
            TitrePost.addEventListener("mouseout", this.Mouseout.bind(this))
            TitrePost.addEventListener("paste", this.Paste.bind(this))
            TitrePost.addEventListener("focusout", this.ElementFocusOut.bind(this))
        }
        DivPost.appendChild(TitrePost)
        this._PostData.Data.Content.forEach(element => {
            switch (element.Type) {
                case "PostImg":
                    this._PostData.Picture.forEach(picture => {
                        if (picture._id == element.Value) {
                            DivPost.appendChild(this.BuildImgContent(element.Value,picture.Image, EditMode))
                        }
                    })
                    break
                case "PostVideoLink":
                    DivPost.appendChild(this.BuildVideoLinkContent(element.Value,EditMode))
                    break
                case "PostMapLink":
                    DivPost.appendChild(this.BuildMapLinkContent(element.Value, EditMode))
                    break
                default:
                    DivPost.appendChild(this.BuildTextContent(element.Type, element.Value, EditMode))
                    break
            }
        })
        // Ajout de la date de creation du blog
        let TxtDate = NanoXBuild.DivText("Creation date: " + NanoXBuild.GetDateString(this._PostData.Data.CreationDate),"", "TextSmall TextBoxSub","text-align: right; padding:1rem;")
        DivPost.appendChild(TxtDate)
        // on ajoute un espace vide en fin de page
        let EmptySpace = NanoXBuild.Div("","","height:5rem;")
        EmptySpace.classList.add("NoPrint")
        this._DivApp.appendChild(EmptySpace)
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
            // Img.addEventListener("click", this.SelectElement.bind(this))
            // Img.addEventListener("mouseover", this.Mouseover.bind(this))
            // Img.addEventListener("mouseout", this.Mouseout.bind(this))
        }
        return Img
    }
    /** Build vido link content */
    BuildVideoLinkContent(Value, EditMode = false){
        let Content = null
        if(EditMode){
            Content = CoreXBuild.DivTexte(Value,"","PostVideoLink")
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", "PostVideoLink")
            // Content.addEventListener("click", this.SelectElement.bind(this))
            // Content.addEventListener("keydown", this.Keydown.bind(this))
            // Content.addEventListener("mouseover", this.Mouseover.bind(this))
            // Content.addEventListener("mouseout", this.Mouseout.bind(this))
            // Content.addEventListener("paste", this.Paste.bind(this))
        } else {
            // pour eviter que la video se lance automatiquement sur safari, il faut un timout de 500ms
            // en attenant on affiche un box de hauteur = 16:9 de la largeur disponible
            var ua = navigator.userAgent.toLowerCase()
            if (ua.indexOf('safari') != -1) { 
                if (ua.indexOf('chrome') > -1) {
                    // Chrome
                    Content = NanoXBuild.DivFlexColumn("")
                    Content.appendChild(NanoXBuild.Video(`/video/${Value}?token=${NanoXGetToken()}`,"","Video",""))
                } else {
                    // Safari
                    Content = NanoXBuild.DivFlexColumn("VideoBox")
                    Content.style.paddingBottom = "calc(0.55*70%)";
                    setTimeout(function() {
                        // Timout pour eviter un autostart de la video sur safari
                        let VideoBox = document.getElementById("VideoBox")
                        VideoBox.style.paddingBottom = 0;
                        VideoBox.appendChild(NanoXBuild.Video(`/video/${Value}?token=${NanoXGetToken()}`,"","Video",""))
                    }, 1000)
                }
            }
        }
        return Content
    }
    /** Build map link content */
    BuildMapLinkContent(Value, EditMode = false){
        let Content = null
        if(EditMode){
            Content = CoreXBuild.DivTexte(Value,"","PostMapLink")
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", "PostMapLink")
            // Content.addEventListener("click", this.SelectElement.bind(this))
            // Content.addEventListener("keydown", this.Keydown.bind(this))
            // Content.addEventListener("mouseover", this.Mouseover.bind(this))
            // Content.addEventListener("mouseout", this.Mouseout.bind(this))
            // Content.addEventListener("paste", this.Paste.bind(this))
        } else {
            Content = NanoXBuild.DivFlexColumn("")
            let div = document.createElement("div")
            div.setAttribute("Class", "Iframe")
            div.setAttribute("style", "overflow: hidden;")

            let iframe = document.createElement("IFRAME")
            iframe.setAttribute("src", Value)
            iframe.setAttribute("width", "100%")
            iframe.setAttribute("height", "100%")
            iframe.setAttribute("frameborder", "0")
            iframe.setAttribute("style", "border:0;")
            
            div.appendChild(iframe)
            Content.appendChild(div)
        }
        return Content
    }
    BuildTextContent(Type, Value, EditMode = false){
        // Si le contenu est en format HTML on le converti en text
        Value = Value.replaceAll("<br>", "\n")
        var temporalDivElement = document.createElement("div");
        temporalDivElement.innerHTML = Value;
        Value =  temporalDivElement.textContent || temporalDivElement.innerText;
        // Construction du contenu
        let Content = NanoXBuild.DivText(Value,"",Type)
        if(EditMode){
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", Type)
            Content.addEventListener("click", this.SelectElement.bind(this))
            Content.addEventListener("keydown", this.Keydown.bind(this))
            Content.addEventListener("mouseover", this.Mouseover.bind(this))
            Content.addEventListener("mouseout", this.Mouseout.bind(this))
            Content.addEventListener("paste", this.Paste.bind(this))
            Content.addEventListener("focusout", this.ElementFocusOut.bind(this))
        }
        return Content
    }

    AddPost(){
        // Get new blog data
        NanoXApiGet("/post/AddNewpost/" + this._BlogId).then((reponse)=>{
            debugger
            this.SetLightview()
            this.AddBackButton()
            this._PostData = reponse
            this.RenderPostData(true)
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    /** Selection du titre du blog */
    SelectElement(event) {
        let element = event.target
        this._InitiContent = element.innerHTML
        element.style.borderColor= "red"
        this._IsPostModified = true
        if((element.dataset.type == "TitrePost") && (element.innerText == "New Post")){
            document.execCommand('selectAll',false,null)
        }
        if((element.dataset.type == "PostTitre1") && (element.innerText == "New Titre")){
            document.execCommand('selectAll',false,null)
        }
        if((element.dataset.type == "PostText") && (element.innerText == "New Text")){
            document.execCommand('selectAll',false,null)
        }
        if((element.dataset.type == "PostCode") && (element.innerText == "New Code")){
            document.execCommand('selectAll',false,null)
        }
        if((element.dataset.type == "PostVideoLink") && (element.innerText == "name.mp4")){
            document.execCommand('selectAll',false,null)
        }
        if((element.dataset.type == "PostMapLink") && (element.innerText == "src link")){
            document.execCommand('selectAll',false,null)
        }
    }

    /** Keydown */
    Keydown(event){
        let element = event.target
        if (event.keyCode == 13){
            if (event.shiftKey){
                event.preventDefault()
                element.blur()
                return false
            } else {
                event.preventDefault()
                if((element.dataset.type == "PostText") || (element.dataset.type == "PostCode")){
                    var selection = window.getSelection(),
                    range = selection.getRangeAt(0),
                    br = document.createElement("br"),
                    textNode = document.createTextNode("\u00a0");
                    range.deleteContents();//required or not?
                    range.insertNode(br);
                    range.collapse(false);
                    range.insertNode(textNode);
                    range.selectNodeContents(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    element.blur()
                    return false
                }
            }
        }
    }

    /** Mouseover */
    Mouseover(event){
        if (! this._IsPostModified){
            let element = event.target
            element.style.borderColor= "var(--NanoX-appcolor)"
        }
    }

    /** Mouseout */
    Mouseout(event){
        if (! this._IsPostModified){
            let element = event.target
            element.style.borderColor= "transparent"
        }
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
            if (element.dataset.type == "TitrePost"){
                if (Txt == "") {element.innerText = "New Post"}
                this.UpdateTitre(element.innerText)
            }
            if (element.dataset.type == "PostTitre1"){
                if (Txt == "") {element.innerText = "New Titre"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostText"){
                if (Txt == "") {element.innerText = "New Text"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostCode"){
                if (Txt == "") {element.innerText = "New Code"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostVideoLink"){
                if (Txt == "") {element.innerText = "name.mp4"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostMapLink"){
                if (Txt == "") {element.innerText = "src link"}
                this.UpdateContent()
            }
        }
        window.getSelection().removeAllRanges()
        this._IsPostModified = false
    }

    /** Event on paste */
    Paste(event){
        event.preventDefault()
        var text = (event.originalEvent || event).clipboardData.getData('text/plain')
        text = text.replaceAll("<br>", "\n")
        //text = text.replace(/\s+/g," ")
        //text = text.replace("\n ","")
        text = text.trim()
        //document.execCommand("insertHTML", false, text);
        document.execCommand("insertText", false, text);
    }

    UpdateTitre(NewTitre){
        let Data = {PostId:this._PostData.Data._id, PostTitre:this._PostData.Data.Titre, Topic:"Titre", Data:NewTitre}
        // On appel l'API
        NanoXApiPost("/post/UpdatePost/", Data).then((reponse)=>{
            this._PostData.Data.Titre = NewTitre
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    UpdateContent(){
        let Data = {PostId:this._PostData.Data._id, PostTitre:this._PostData.Data.Titre, Topic:"Content", Data:this.GetPostContent()}
        //On appel l'API
        NanoXApiPost("/post/UpdatePost/", Data).then((reponse)=>{
            this._PostData.Data.Content = Data.Data
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    /** Get Post Content */
    GetPostContent(){
        var ElementsContent = document.querySelectorAll("*[data-Content='Content']")
        let PostListOfContents=[]
        ElementsContent.forEach(element => {
            let PostContent = new Object()
            switch (element.dataset.type) {
                case "PostImg":
                    PostContent.Type = element.dataset.type
                    PostContent.Value = element.dataset.imgid
                    PostListOfContents.push(PostContent)
                    break;
                default:
                    PostContent.Type = element.dataset.type
                    PostContent.Value = element.innerText
                    PostListOfContents.push(PostContent)
                    break;
            }
        })
        return PostListOfContents
    }
}