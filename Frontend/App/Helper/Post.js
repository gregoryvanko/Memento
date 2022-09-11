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

        this._IdButtonDeleElement = "IdButtonDeleElement"
        this._PreviousElementSelected = null

        this._DiVPostContent = null
        this._DefTitre1 = "New Titre"
        this._DefText = "New Text"
        this._DefCode = "New Code"
        this._DefVideo = "name.mp4"
        this._DefMap = "src link"
        
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

    AddDeletePostButton(){
        NanoXAddMenuButtonSettings("IdDeletePostButton", "Delete Post", IconCommon.DeleteBlog(), this.DeletePost.bind(this))
    }

    AddStopEditButton(){
        NanoXAddMenuButtonSettings("IdStopEditPostButton", "Stop Editing", IconCommon.StopEditBlog(), this.StopEdit.bind(this))
    }

    StopEdit(){
        this.RenderPostData(false)
        NanoXApiPostLog("Stop Edit Post : " + this._PostData.Data.Titre)
    }

    DeletePost(){
        if (confirm(`Do you want to Delete the post: ${this._PostData.Data.Titre}?`)){
            NanoXApiDelete("/post/" + this._PostData.Data._id).then((reponse)=>{
                this.ReloadBlogView()
            },(erreur)=>{
                this._DivApp.innerHTML=erreur
            })
        }
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
            this.AddDeletePostButton()
            this.AddEditMenuBar()
            NanoXApiPostLog("Edit Post : " + this._PostData.Data.Titre)
        } else {
            this.AddEditButton()
        }
        // Content
        let DiVPost = NanoXBuild.Div("", "DivPost", "")
        this._DivApp.appendChild(DiVPost)
        this._DiVPostContent = NanoXBuild.Div()
        DiVPost.appendChild(this._DiVPostContent )
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
        this._DiVPostContent.appendChild(TitrePost)
        this._PostData.Data.Content.forEach(element => {
            switch (element.Type) {
                case "PostImg":
                    this._PostData.Picture.forEach(picture => {
                        if (picture._id == element.Value) {
                            this._DiVPostContent.appendChild(this.BuildImgContent(element.Value,picture.Image, EditMode))
                        }
                    })
                    break
                case "PostVideoLink":
                    this._DiVPostContent.appendChild(this.BuildVideoLinkContent(element.Value,EditMode))
                    break
                case "PostMapLink":
                    this._DiVPostContent.appendChild(this.BuildMapLinkContent(element.Value, EditMode))
                    break
                default:
                    this._DiVPostContent.appendChild(this.BuildTextContent(element.Type, element.Value, EditMode))
                    break
            }
        })
        // Ajout de la date de creation du blog
        let TxtDate = NanoXBuild.DivText("Creation date: " + NanoXBuild.GetDateString(this._PostData.Data.CreationDate),"", "TextSmall TextBoxSub","text-align: right; padding:1rem;")
        DiVPost.appendChild(TxtDate)
        // on ajoute un espace vide en fin de page
        let EmptySpace = NanoXBuild.Div("","","height:5rem;")
        EmptySpace.classList.add("NoPrint")
        this._DivApp.appendChild(EmptySpace)
    }

    BuildImgContentFlex(){
        let DivImg = NanoXBuild.DivFlexColumn()
        DivImg.style.width= "90%"
        DivImg.style.marginLeft = "auto"
        DivImg.style.marginRight = "auto"
        return DivImg
    }

    /** image content and div*/
    BuildImgContent(Id, Value, EditMode){
        let DivImg = this.BuildImgContentFlex()
        DivImg.appendChild(this.BuildImg(Id,Value,EditMode))
        return DivImg
    }
    BuildImg(Id, Value, EditMode = false){
        let Img = NanoXBuild.Image64(Value, Id, "ImgPost")
        Img.setAttribute("data-Content", "Content")
        Img.setAttribute("data-type", "PostImg")
        Img.setAttribute("data-imgid", Id)
        if(EditMode){
            Img.setAttribute("contenteditable", "True")
            Img.addEventListener("click", this.SelectElement.bind(this))
            Img.addEventListener("mouseover", this.Mouseover.bind(this))
            Img.addEventListener("mouseout", this.Mouseout.bind(this))
            Img.addEventListener("focusout", this.ImageFocusOut.bind(this))
        }
        return Img
    }
    /** Build vido link content */
    BuildVideoLinkContent(Value, EditMode = false){
        let Content = null
        if(EditMode){
            Content = NanoXBuild.DivText(Value,"","Text PostVideoLink")
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", "PostVideoLink")
            Content.addEventListener("click", this.SelectElement.bind(this))
            Content.addEventListener("keydown", this.Keydown.bind(this))
            Content.addEventListener("mouseover", this.Mouseover.bind(this))
            Content.addEventListener("mouseout", this.Mouseout.bind(this))
            Content.addEventListener("paste", this.Paste.bind(this))
            Content.addEventListener("focusout", this.ElementFocusOut.bind(this))
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
            Content = NanoXBuild.DivText(Value,"","Text PostMapLink")
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", "PostMapLink")
            Content.addEventListener("click", this.SelectElement.bind(this))
            Content.addEventListener("keydown", this.Keydown.bind(this))
            Content.addEventListener("mouseover", this.Mouseover.bind(this))
            Content.addEventListener("mouseout", this.Mouseout.bind(this))
            Content.addEventListener("paste", this.Paste.bind(this))
            Content.addEventListener("focusout", this.ElementFocusOut.bind(this))
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
        element.style.borderColor= "red"
        this._IsPostModified = true

        // On efface le contour de l'element précident si il existe
        if ((this._PreviousElementSelected) && (this._PreviousElementSelected != element)){
            this._PreviousElementSelected.style.borderColor= "transparent"
        }

        if (element.dataset.type == "PostImg"){
            if (this._PreviousElementSelected == element){
                const ImgId = element.dataset.imgid
                let Data = {BlogId: this._BlogId, PostId: this._PostData.Data._id, ImageID: ImgId, DeleteImg: false}
                let uploadimage = new UploadImage(element, "/Post/Image/", Data, this.CallBackModifyImage.bind(this))
                uploadimage.Start()
            } else {
                this._PreviousElementSelected = element
            }
        } else {
            this._PreviousElementSelected = element
            this._InitiContent = element.innerHTML
            if((element.dataset.type == "TitrePost") && (element.innerText == "New Post")){
                document.execCommand('selectAll',false,null)
            }
            if((element.dataset.type == "PostTitre1") && (element.innerText == this._DefTitre1)){
                document.execCommand('selectAll',false,null)
            }
            if((element.dataset.type == "PostText") && (element.innerText == this._DefText)){
                document.execCommand('selectAll',false,null)
            }
            if((element.dataset.type == "PostCode") && (element.innerText == this._DefCode)){
                document.execCommand('selectAll',false,null)
            }
            if((element.dataset.type == "PostVideoLink") && (element.innerText == this._DefVideo)){
                document.execCommand('selectAll',false,null)
            }
            if((element.dataset.type == "PostMapLink") && (element.innerText == this._DefMap)){
                document.execCommand('selectAll',false,null)
            }
        }

        // Si l'element n'est pas le titre on affiche le boutton delete element
        if(document.getElementById(this._IdButtonDeleElement)){
            if (element.dataset.type == "TitrePost"){
                document.getElementById(this._IdButtonDeleElement).style.display = "none"
            } else {
                document.getElementById(this._IdButtonDeleElement).style.display = "block"
            }
        }

        
    }

    CallBackModifyImage(Img, ContentImage, Id){
        this._PostData.Picture.forEach(picture => {
            if (picture._id == Id) {
                picture.Image = Img
            }
        })
        ContentImage.src = Img
        this._IsPostModified = false
        this._PreviousElementSelected = null
        // on cache le boutton delete
        if(document.getElementById(this._IdButtonDeleElement)){
            document.getElementById(this._IdButtonDeleElement).style.display = "none"
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
                if (Txt == "") {element.innerText = this._DefTitre1}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostText"){
                if (Txt == "") {element.innerText = this._DefText}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostCode"){
                if (Txt == "") {element.innerText = this._DefCode}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostVideoLink"){
                if (Txt == "") {element.innerText = this._DefVideo}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostMapLink"){
                if (Txt == "") {element.innerText = this._DefMap}
                this.UpdateContent()
            }
        }
        window.getSelection().removeAllRanges()
        this._IsPostModified = false
        // Si l'élément suivant n'est pas un element à modifier,on annule le previous element
        let NextElement = event.relatedTarget
        if (NextElement == null){
            this._PreviousElementSelected = null
            // on cache le boutton delete
            if(document.getElementById(this._IdButtonDeleElement)){
                document.getElementById(this._IdButtonDeleElement).style.display = "none"
            }
        }
    }

    ImageFocusOut(event){
        let element = event.target
        element.style.borderColor= "transparent"
        this._IsPostModified = false
        // Si l'élément suivant n'est pas un element à modifier,on annule le previous element
        let NextElement = event.relatedTarget
        if (NextElement == null){
            this._PreviousElementSelected = null
            // on cache le boutton delete
            if(document.getElementById(this._IdButtonDeleElement)){
                document.getElementById(this._IdButtonDeleElement).style.display = "none"
            }
        }
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

    AddEditMenuBar(){
        let Content = (this.MobileCheck()) ? NanoXBuild.DivFlexRowSpaceAround("EditMenuBar", "EditMenuBar EditMenuBarMobile") : NanoXBuild.DivFlexColumn("EditMenuBar", "EditMenuBar EditMenuBarNormal")
        this._DivApp.appendChild(Content)
        Content.appendChild(this.BuidlButtonEditMenuBar("Titre1", IconPost.Titre1(), this.OnClickAddTritre1.bind(this)))
        Content.appendChild(this.BuidlButtonEditMenuBar("Text", IconPost.Text(), this.OnClickAddText.bind(this)))
        Content.appendChild(this.BuidlButtonEditMenuBar("Code", IconPost.Code(), this.OnClickAddCode.bind(this)))
        Content.appendChild(this.BuidlButtonEditMenuBar("Picture", IconPost.Picture(), this.OnClickAddPicture.bind(this)))
        Content.appendChild(this.BuidlButtonEditMenuBar("Video", IconPost.Video(), this.OnClickAddVideoLink.bind(this)))
        Content.appendChild(this.BuidlButtonEditMenuBar("Map", IconPost.Map(), this.OnClickAddMapLink.bind(this)))
        Content.appendChild(this.BuidlButtonEditMenuBar("Delete", IconPost.DeletePost(), this.OnClickDelete.bind(this), this._IdButtonDeleElement))
        // on cache le boutton delete
        if(document.getElementById(this._IdButtonDeleElement)){
            document.getElementById(this._IdButtonDeleElement).style.display = "none"
        }
    }

    BuidlButtonEditMenuBar(title = null, svg = null, OnClick = null, id=null ){
        let element = document.createElement("button")
        element.setAttribute("Class", "ButtonEditMenuBar")
        element.title= title
        element.innerHTML = svg
        element.onclick = OnClick
        if (id != null){element.id = id}
        return element
    }

    OnClickAddTritre1(){
        this.AddContent("PostTitre1", this._DefTitre1)
    }
    OnClickAddText(){
        this.AddContent("PostText", this._DefText)
    }
    OnClickAddCode(){
        this.AddContent("PostCode", this._DefCode)
    }
    OnClickAddPicture(){
        this.AddContent("PostImg", null)
    }
    OnClickAddVideoLink(){
        this.AddContent("PostVideoLink", this._DefVideo)
    }
    OnClickAddMapLink(){
        this.AddContent("PostMapLink", this._DefMap)
    }
    OnClickDelete(){
        if(this._PreviousElementSelected != null){
            if (confirm(`Do you want to Delete this Element ${this._PreviousElementSelected.dataset.type} ?`)){
                let PreviousElement = null
                if(this._PreviousElementSelected.dataset.type == "PostImg"){
                    PreviousElement = this._PreviousElementSelected.parentNode
                    const ImgId = this._PreviousElementSelected.dataset.imgid
                    let Data = {BlogId: this._BlogId, PostId: this._PostData.Data._id, ImageID: ImgId, DeleteImg: true}
                    NanoXApiPost("/Post/Image/", Data).then((reponse)=>{
                        var index = null
                        this._PostData.Picture.forEach(picture => {
                            if (picture._id == ImgId) {
                                index = this._PostData.Picture.indexOf(picture)}
                        })
                        if (index > -1) {
                            this._PostData.Picture.splice(index, 1);
                        }
                        this._IsPostModified = false
                    },(erreur)=>{
                        this._DivApp.innerHTML=erreur
                    })
                } else {
                    PreviousElement = this._PreviousElementSelected
                }
                this._DiVPostContent.removeChild(PreviousElement)
                this._PreviousElementSelected = null
                this.UpdateContent()
                // on cache le boutton delete
                if(document.getElementById(this._IdButtonDeleElement)){
                    document.getElementById(this._IdButtonDeleElement).style.display = "none"
                }
            }
        } else {
            alert("Select element!")
        }
        
    }

    AddContent(Type, Value){
        let NewElement = null
        switch (Type) {
            case "PostImg":
                NewElement = this.AddImage()
                break
            case "PostVideoLink":
                NewElement = this.BuildVideoLinkContent(Value, true)
                break
            case "PostMapLink":
                NewElement = this.BuildMapLinkContent(Value, true)
                break
            default:
                NewElement = this.BuildTextContent(Type, Value, true)
                break
        }
        if(this._PreviousElementSelected != null){
            let PreviousElement = null
            if(this._PreviousElementSelected.dataset.type == "PostImg"){
                PreviousElement = this._PreviousElementSelected.parentNode
            } else {
                PreviousElement = this._PreviousElementSelected
            }
            PreviousElement.parentNode.insertBefore(NewElement, PreviousElement.nextSibling)
        } else {
            this._DiVPostContent.appendChild(NewElement)
        }
        NewElement.focus()
        NewElement.click()
    }

    AddImage(){
        let Content = this.BuildImgContentFlex()
        let Data = {BlogId: this._BlogId, PostId: this._PostData.Data._id, ImageID: null, DeleteImg: false}
        let uploadimage = new UploadImage(Content, "/Post/Image/", Data, this.CallBackAddImage.bind(this))
        uploadimage.Start()
        return Content
    }

    CallBackAddImage(Img, ContentImage, Id){
        if (Img != null){
            let NewElement = this.BuildImg(Id, Img, true)
            ContentImage.appendChild(NewElement)
            NewElement.focus()
            NewElement.click()
            // ajout de l'image temporaire dans la liste
            let picture = {_id: Id, BlogId: this._BlogId, PostId: this._PostData.Data._id,Image:Img}
            if (this._PostData.Picture == null){
                this._PostData.Picture = [picture]
            } else {
                this._PostData.Picture.push(picture)
            }
        }
        this.UpdateContent()
    }

    MobileCheck() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }
}