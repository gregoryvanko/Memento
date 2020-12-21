class Post{
    constructor(BlogId, DivApp, ClickOnBlog, CanEdit){
        this._BlogId = BlogId
        this._DivApp = DivApp
        this._DiVPost = CoreXBuild.Div("DivPost", "", "")
        this._ClickOnBlog = ClickOnBlog
        this._CanEdit = CanEdit
        this._PostData = new Object()
        this._PostData.Data = null
        this._PostData.Picture = new Array()
        this._InitiContent =""
        this._ElementSelected = null
        this._PreviousElementSelected = null
        
        document.execCommand("defaultParagraphSeparator", false, "br")
    }
    /** Progressbar des blogs */
    UpdateProgressBar(event){
        let progression = Math.round(((event.loaded / event.total) * 100))
        document.getElementById("progressBarPost").value = progression
    }
    /** Demande d'affichage dun Post */
    ShowPost(Id, EditMode){
        // On supprime toutes les ActionButton et on ajout les nouvelles actions
        GlobalClearActionList()
        GlobalAddActionInList("Go to Blog", this.GoToBlog.bind(this))
        // On vide l'app
        this._DivApp.innerHTML=""
        // on construit la Div qui va revecoir le waiting text
        let DivWaiting = CoreXBuild.DivFlexColumn("DivWaiting")
        this._DivApp.appendChild(DivWaiting)
        // on construit le texte d'attente des Blog
        DivWaiting.appendChild(CoreXBuild.DivTexte("Wainting for Post data...","","Text","margin-top: 30vh;"))
        // On ajoute la progress bar
        DivWaiting.appendChild(CoreXBuild.ProgressBar("progressBarPost","ProgressBar",""))
        // on construit le texte du message de'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorShowPost","Text","color:red; text-align: center; margin-top: 30vh;")
        this._DivApp.appendChild(DivErrorTexte)
        // On appel l'API
        GlobalCallApiPromise("GetPostData", Id, "", this.UpdateProgressBar.bind(this)).then((reponse)=>{
            // Timeout de 100 milisec entre la fin de la progressbar et le close window
            let me = this
            setTimeout(function() {
                me._PostData = reponse
                me.SetVuePost(EditMode)
            }, 100)
        },(erreur)=>{
            document.getElementById("DivWaiting").parentNode.removeChild(document.getElementById("DivWaiting"))
            let ErrorTxt = document.getElementById("ErrorShowPost")
            ErrorTxt.innerHTML=erreur
        })
    }
    /** Set Vue Post */
    SetVuePost(EditMode){
        // On supprime toutes les ActionButton et on ajout les nouvelles actions
        this.CommandeButtonPostVue(EditMode)
        // Si le user peut editer le blog alors on affiche le bouton action
        if(this._CanEdit){
            // On affiche constamment le button action si on est en edit mode
            if (EditMode) {
                GlobalDisplayAction("On")
            } else {
                GlobalDisplayAction("Toggle")
            }
        } else {
            GlobalDisplayAction("Off")
        }

        // On vide l'app
        this._DivApp.innerHTML=""
        this._InitiContent =""
        this._ElementSelected = null
        this._PreviousElementSelected = null
        // On crée une page pour le post
        let DivPagePost = CoreXBuild.Div("", "DivPostPage", "")
        // On vide le contenu du DiVPost
        this._DiVPost.innerHTML=""
        //this._DivApp.appendChild(this._DiVPost)
        this._DivApp.appendChild(DivPagePost)
        DivPagePost.appendChild(this._DiVPost)
        // Ajout du titre
        let TitrePost = CoreXBuild.DivTexte(this._PostData.Data.Titre, "Titre","DivTitreBlogPost", "white-space: pre;")
        if(EditMode){
            TitrePost.setAttribute("contenteditable", "True")
            TitrePost.setAttribute("data-type", "TitrePost")
            TitrePost.addEventListener("click", this.SelectElement.bind(this))
            TitrePost.addEventListener("keydown", this.Keydown.bind(this))
            TitrePost.addEventListener("mouseover", this.Mouseover.bind(this))
            TitrePost.addEventListener("mouseout", this.Mouseout.bind(this))
        }
        this._DiVPost.appendChild(TitrePost)
        this._PostData.Data.Content.forEach(element => {
            switch (element.Type) {
                case "PostImg":
                    this._PostData.Picture.forEach(picture => {
                        if (picture._id == element.Value) {
                            this._DiVPost.appendChild(this.BuildImgContent(element.Value,picture.Image ,EditMode))
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
        // Ajout de la date de creation du blog
        let TxtDate = CoreXBuild.DivTexte("Creation date: " + CoreXBuild.GetDateString(this._PostData.Data.CreationDate),"", "TextBoxSub","text-align: right; padding:1%;")
        DivPagePost.appendChild(TxtDate)
        // Ajout d'un bouton Go to Blog
        let DivButton = CoreXBuild.DivFlexColumn("ListOfPostButton")
        let ButtonGoToBlog = CoreXBuild.Button("Go To Blog",this.GoToBlog.bind(this),"Button")
        ButtonGoToBlog.classList.add("NoPrint")
        DivButton.appendChild(ButtonGoToBlog)
        this._DivApp.appendChild(DivButton)
        // on ajoute un espace vide en fin de page
        let EmptySpace = CoreXBuild.Div("","","height:10vh;")
        EmptySpace.classList.add("NoPrint")
        this._DivApp.appendChild(EmptySpace)
    }
    /** New Post */
    NewPost(){
        // On supprime toutes les ActionButton et on ajout les nouvelles actions
        GlobalClearActionList()
        GlobalAddActionInList("Go to Blog", this.GoToBlog.bind(this))
        // On vide l'app
        this._DivApp.innerHTML=""
        // on construit la Div qui va revecoir le waiting text
        let DivWaiting = CoreXBuild.DivFlexColumn("DivWaiting")
        this._DivApp.appendChild(DivWaiting)
        // on construit le texte d'attente des Blog
        DivWaiting.appendChild(CoreXBuild.DivTexte("Wainting for New Post...","","Text","margin-top: 30vh;"))
        // On ajoute la progress bar
        DivWaiting.appendChild(CoreXBuild.ProgressBar("progressBarPost","ProgressBar",""))
        // on construit le texte du message de'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorNewPost","Text","color:red; text-align: center; margin-top: 30vh;")
        this._DivApp.appendChild(DivErrorTexte)
        // On appel l'API
        GlobalCallApiPromise("NewPost", this._BlogId, "", this.UpdateProgressBar.bind(this)).then((reponse)=>{
            // Timeout de 100 milisec entre la fin de la progressbar et le close window
            let me = this
            setTimeout(function() {
                me._PostData = reponse
                me.SetVuePost(true)
            }, 100)
        },(erreur)=>{
            document.getElementById("DivWaiting").parentNode.removeChild(document.getElementById("DivWaiting"))
            let ErrorTxt = document.getElementById("ErrorNewPost")
            ErrorTxt.innerHTML=erreur
        })
    }
    /** Delete Post */
    DeletePost(){
        if (confirm('Are you sure you want to Dete this Blog?')){
            // On supprime toutes les ActionButton et on ajout les nouvelles actions
            GlobalClearActionList()
            GlobalAddActionInList("Go to Blog", this.GoToBlog.bind(this))
            // On vide l'app
            this._DivApp.innerHTML=""
            // on construit le texte d'attente de la creation du nouveau blog
            let DivWaitingTexte = CoreXBuild.DivTexte("Delete Post in progress...","InfoTxt","Text", "text-align:center; margin-top: 30vh;")
            this._DivApp.appendChild(DivWaitingTexte)
            // on construit le div du message de'erreur
            let DivErrorTexte = CoreXBuild.DivTexte("","ErrorTxt","Text","color:red; text-align: center;")
            this._DivApp.appendChild(DivErrorTexte)
            // On appel l'API
            let Data = new Object()
            Data.PostId = this._PostData.Data._id
            Data.PostTitre =this._PostData.Data.Titre
            GlobalCallApiPromise("DeletePost", Data).then((reponse)=>{
                this.GoToBlog()
            },(erreur)=>{
                let InfoTxt = document.getElementById("InfoTxt")
                InfoTxt.innerHTML=""
                let ErrorTxt = document.getElementById("ErrorTxt")
                ErrorTxt.innerHTML=erreur
            })
        }
    }
    /** Go To Blog */
    GoToBlog(){
        // Modification de l'affichage du button action
        GlobalDisplayAction("Toggle")
        // Enregistrement d'un texte si on etait en mode edit
        if(this._ElementSelected != null){
            if(this._ElementSelected.dataset.type != "PostImg"){
                this.SaveTxtElement(this._ElementSelected)
            }
        }
        // Affichage du blog et de la liste des post 
        this._ClickOnBlog()
    }

    /** Selection d'un element du blog */
    SelectElement(event) {
        let element = event.target
        // si l'element selectionne est le meme que l'element precedent
        if(this._PreviousElementSelected == element){
            if(element.dataset.type == "PostImg"){
                // Update a new picture
                let ImageId = element.id
                let Data = new Object()
                Data.Id = ImageId
                Data.PostTitre =this._PostData.Data.Titre
                let uploadimage = new UploadImage(ImageId, "UpdatePostPicture", Data, this.CallBackImgUpdate.bind(this))
                uploadimage.Start()
            }
        } else {
            // sil il existe un element precedement selectionné, il faut le sauver
            if(this._PreviousElementSelected != null){
                // on supprime le bord rouge de l'element precedent
                this._PreviousElementSelected.style.borderColor= "transparent"
                // si l'element n'est pas une image
                if(this._PreviousElementSelected.dataset.type != "PostImg"){
                    // si l'element acteuel est un image
                    if (element.dataset.type == "PostImg"){
                        // on supprime les selections
                        if (window.getSelection) {window.getSelection().removeAllRanges()}
                        else if (document.selection) {document.selection.empty()}
                    }
                    this.SaveTxtElement(this._PreviousElementSelected)
                }
            }
            // border color de l'élement selectionné en rouge
            element.style.borderColor= "red"
            this._ElementSelected = element
            this._PreviousElementSelected = this._ElementSelected
            // Si l'element selectionne est une image
            if(element.dataset.type == "PostImg"){
                this._InitiContent = null
                this.CommandeButtonElementSelected()
            } else {
                // Copie de la valeur initial de l'element
                this._InitiContent = this._ElementSelected.innerHTML
                // Ajout des commandes lorsque l'on selecte un element
                if(this._ElementSelected.dataset.type == "TitrePost"){
                    this.CommandeButtonTitreSelected()
                } else {
                    this.CommandeButtonElementSelected()
                }
                // Select all text if standard text
                if((this._ElementSelected.dataset.type == "TitrePost") && (this._ElementSelected.innerHTML == "New Post")){
                    document.execCommand('selectAll',false,null)
                }
                if((this._ElementSelected.dataset.type == "PostTitre1") && (this._ElementSelected.innerHTML == "New Titre")){
                    document.execCommand('selectAll',false,null)
                }
                if((this._ElementSelected.dataset.type == "PostText") && (this._ElementSelected.innerHTML == "New Text")){
                    document.execCommand('selectAll',false,null)
                }
                if((this._ElementSelected.dataset.type == "PostCode") && (this._ElementSelected.innerHTML == "New Code")){
                    document.execCommand('selectAll',false,null)
                }
                if((this._ElementSelected.dataset.type == "PostVideoLink") && (this._ElementSelected.innerHTML == "name.mp4")){
                    document.execCommand('selectAll',false,null)
                }
                if((this._ElementSelected.dataset.type == "PostMapLink") && (this._ElementSelected.innerHTML == "src link")){
                    document.execCommand('selectAll',false,null)
                }
            }
        }
    }
    /**
     * Fonction exécutée en callback de la fonction qui change une image. On enregistre la nouvelle image dans la variable this._PostData.Picture
     * @param {Image Base64} Img La nouvelle image sous forme Base64
     * @param {string} Id Id de l'élément image
     */
    CallBackImgUpdate(Img, Id){
        this._PostData.Picture.forEach(picture => {
            if (picture._id == Id) {
                picture.Image = Img
            }
        })
    }
    /** Save Txt Data */
    SaveTxtElement(element){
        // suppression de la balise finale <br> si elle existe
        let Txt = element.innerHTML
        if(Txt.endsWith("<br>")){
            Txt = Txt.substring(0, Txt.length - 4)
            element.innerHTML = Txt
        }
        // si le texte est different de sa valeur initiale
        if(Txt != this._InitiContent){
            if (element.dataset.type == "TitrePost"){
                if (Txt == "") {
                    element.innerHTML = "New Post"
                    Txt = "New Post"
                }
                this.UpdateTitre(Txt)
            }
            if (element.dataset.type == "PostTitre1"){
                if (Txt == "") {element.innerHTML = "New Titre"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostText"){
                if (Txt == "") {element.innerHTML = "New Text"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostCode"){
                if (Txt == "") {element.innerHTML = "New Code"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostVideoLink"){
                if (Txt == "") {element.innerHTML = "name.mp4"}
                this.UpdateContent()
            }
            if (element.dataset.type == "PostMapLink"){
                if (Txt == "") {element.innerHTML = "src link"}
                this.UpdateContent()
            }
        }
        this._ElementSelected = null
        this._PreviousElementSelected = null
    }
    /** Keydown */
    Keydown(event){
        let element = event.target
        if (event.keyCode == 13){
            if (event.shiftKey){
                this.SaveTxtElement(element)
                // on supprime le bord rouge de l'element precedent
                element.style.borderColor= "transparent"
                // on supprime les selections
                if (window.getSelection) {window.getSelection().removeAllRanges()}
                else if (document.selection) {document.selection.empty()}
                // On change les commandes
                this.CommandeButtonNoElementSelected()
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
                    this.SaveTxtElement(element)
                    // on supprime le bord rouge de l'element precedent
                    element.style.borderColor= "transparent"
                    // on supprime les selections
                    if (window.getSelection) {window.getSelection().removeAllRanges()}
                    else if (document.selection) {document.selection.empty()}
                    // On change les commandes
                    this.CommandeButtonNoElementSelected()
                }
                return false
            }
        }
    }
    /** Mouseover */
    Mouseover(event){
        let element = event.target
        if((this._ElementSelected != element)&&(this._PreviousElementSelected != element)){
            element.style.borderColor= "var(--CoreX-color)"
        }
    }
    /** Mouseout */
    Mouseout(event){
        let element = event.target
        if((this._ElementSelected != element)&&(this._PreviousElementSelected != element)){
            element.style.borderColor= "transparent"
        }
    }
    /** Event on paste */
    Paste(event){
        event.preventDefault()
        var text = (event.originalEvent || event).clipboardData.getData('text/plain')
        text = text.replace(/(\r\n|\n|\r)/gm,"<br>")
        text = text.replace(/\s+/g," ")
        text = text.replace("<br> ","<br>")
        text = text.trim()
        document.execCommand("insertHTML", false, text);
    }

    /** Set Commande Button Post */
    CommandeButtonPostVue(EditMode){
        GlobalClearActionList()
        if(EditMode){
            GlobalAddActionInList("Stop Editing Post", this.SetVuePost.bind(this,false))
            GlobalAddActionInList("Add Titre1", this.AddTitre1.bind(this))
            GlobalAddActionInList("Add Text", this.AddText.bind(this))
            GlobalAddActionInList("Add Code", this.AddCode.bind(this))
            GlobalAddActionInList("Add Picture", this.AddPicture.bind(this))
            GlobalAddActionInList("Add VideoLink", this.AddVideoLink.bind(this))
            GlobalAddActionInList("Add MapLink", this.AddMapLink.bind(this))
        } else {
            GlobalAddActionInList("Refresh", this.ShowPost.bind(this,this._PostData.Data._id, EditMode))
            GlobalAddActionInList("Go to Blog", this.GoToBlog.bind(this))
            GlobalAddActionInList("Edit Post", this.SetVuePost.bind(this, true))
            GlobalAddActionInList("Delete Post", this.DeletePost.bind(this))
        }
    }
    /** Set Commande Button when editing Titre Post */
    CommandeButtonTitreSelected(){
        GlobalClearActionList()
        GlobalAddActionInList("Stop Editing Post", this.SetVuePost.bind(this,false))
        GlobalAddActionInList("Add Titre1", this.AddTitre1.bind(this))
        GlobalAddActionInList("Add Text", this.AddText.bind(this))
        GlobalAddActionInList("Add Code", this.AddCode.bind(this))
        GlobalAddActionInList("Add Picture", this.AddPicture.bind(this))
        GlobalAddActionInList("Add VideoLink", this.AddVideoLink.bind(this))
        GlobalAddActionInList("Add MapLink", this.AddMapLink.bind(this))
    }
    /** Set Commande Button when element is selected */
    CommandeButtonElementSelected(){
        GlobalClearActionList()
        GlobalAddActionInList("Stop Editing Post", this.SetVuePost.bind(this,false))
        GlobalAddActionInList("Add Titre1", this.AddTitre1.bind(this))
        GlobalAddActionInList("Add Text", this.AddText.bind(this))
        GlobalAddActionInList("Add Code", this.AddCode.bind(this))
        GlobalAddActionInList("Add Picture", this.AddPicture.bind(this))
        GlobalAddActionInList("Add VideoLink", this.AddVideoLink.bind(this))
        GlobalAddActionInList("Add MapLink", this.AddMapLink.bind(this))
        GlobalAddActionInList("Delete Element", this.DeleteElement.bind(this))
    }
    /** Set Commande Button when no element is selected */
    CommandeButtonNoElementSelected(){
        GlobalClearActionList()
        GlobalAddActionInList("Stop Editing Post", this.SetVuePost.bind(this,false))
        GlobalAddActionInList("Add Titre1", this.AddTitre1.bind(this))
        GlobalAddActionInList("Add Text", this.AddText.bind(this))
        GlobalAddActionInList("Add Code", this.AddCode.bind(this))
        GlobalAddActionInList("Add Picture", this.AddPicture.bind(this))
        GlobalAddActionInList("Add VideoLink", this.AddVideoLink.bind(this))
        GlobalAddActionInList("Add MapLink", this.AddMapLink.bind(this))
    }

    /** CoreXBuild Text Content */
    BuildTextContent(Type, Value, EditMode){
        let Content = CoreXBuild.DivTexte(Value,"",Type)
        if(EditMode){
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", Type)
            Content.addEventListener("click", this.SelectElement.bind(this))
            Content.addEventListener("keydown", this.Keydown.bind(this))
            Content.addEventListener("mouseover", this.Mouseover.bind(this))
            Content.addEventListener("mouseout", this.Mouseout.bind(this))
            Content.addEventListener("paste", this.Paste.bind(this))
        }
        return Content
    }
    /** CoreXBuild image content and div*/
    BuildImgContent(Id, Value, EditMode){
        let DivImg = CoreXBuild.DivFlexColumn()
        DivImg.style.width= "90%"
        DivImg.style.marginLeft = "auto"
        DivImg.style.marginRight = "auto"
        DivImg.appendChild(this.BuildImg(Id,Value,EditMode))
        return DivImg
    }
    /** CoreXBuild image */
    BuildImg(Id, Value, EditMode){
        let Img = CoreXBuild.Image64(Value, Id, "ImgPost")
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
    /** Build vido link content */
    BuildVideoLinkContent(Value, EditMode){
        let Content = null
        if(EditMode){
            Content = CoreXBuild.DivTexte(Value,"","PostVideoLink")
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", "PostVideoLink")
            Content.addEventListener("click", this.SelectElement.bind(this))
            Content.addEventListener("keydown", this.Keydown.bind(this))
            Content.addEventListener("mouseover", this.Mouseover.bind(this))
            Content.addEventListener("mouseout", this.Mouseout.bind(this))
            Content.addEventListener("paste", this.Paste.bind(this))
        } else {
            // pour eviter que la video se lance automatiquement sur safari, il faut un timout de 500ms
            // en attenant on affiche un box de hauteur = 16:9 de la largeur disponible
            var ua = navigator.userAgent.toLowerCase()
            if (ua.indexOf('safari') != -1) { 
                if (ua.indexOf('chrome') > -1) {
                    // Chrome
                    Content = CoreXBuild.DivFlexColumn("")
                    Content.appendChild(CoreXBuild.Video(`/video/${Value}?token=${GlobalGetToken()}`,"","Video",""))
                } else {
                    // Safari
                    Content = CoreXBuild.DivFlexColumn("VideoBox")
                    Content.style.paddingBottom = "calc(0.55*70%)";
                    setTimeout(function() {
                        // Timout pour eviter un autostart de la video sur safari
                        let VideoBox = document.getElementById("VideoBox")
                        VideoBox.style.paddingBottom = 0;
                        VideoBox.appendChild(CoreXBuild.Video(`/video/${Value}?token=${GlobalGetToken()}`,"","Video",""))
                    }, 1000)
                }
            }
        }
        return Content
    }
    /** Build map link content */
    BuildMapLinkContent(Value, EditMode){
        let Content = null
        if(EditMode){
            Content = CoreXBuild.DivTexte(Value,"","PostMapLink")
            Content.setAttribute("contenteditable", "True")
            Content.setAttribute("data-Content", "Content")
            Content.setAttribute("data-type", "PostMapLink")
            Content.addEventListener("click", this.SelectElement.bind(this))
            Content.addEventListener("keydown", this.Keydown.bind(this))
            Content.addEventListener("mouseover", this.Mouseover.bind(this))
            Content.addEventListener("mouseout", this.Mouseout.bind(this))
            Content.addEventListener("paste", this.Paste.bind(this))
        } else {
            Content = CoreXBuild.DivFlexColumn("")
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
                    PostContent.Value = element.innerHTML
                    PostListOfContents.push(PostContent)
                    break;
            }
        })
        return PostListOfContents
    }
    /** Update du titre du blog */
    UpdateTitre(NewTitre){
        let Data = new Object()
        Data.PostId = this._PostData.Data._id
        Data.PostTitre =this._PostData.Data.Titre
        Data.Topic = "Titre"
        Data.Data = NewTitre
        // On appel l'API
        GlobalCallApiPromise("UpdatePost", Data).then((reponse)=>{
            this._PostData.Data.Titre = NewTitre
        },(erreur)=>{
            alert(erreur)
        })
    }
    /** Update du content du blog */
    UpdateContent(){
        let Data = new Object()
        Data.PostId = this._PostData.Data._id
        Data.PostTitre =this._PostData.Data.Titre
        Data.Topic = "Content"
        Data.Data = this.GetPostContent()
        //On appel l'API
        GlobalCallApiPromise("UpdatePost", Data).then((reponse)=>{
            this._PostData.Data.Content = Data.Data
        },(erreur)=>{
            alert(erreur)
        })
    }

    /** Add Titre1 */
    AddTitre1(){
        let NewElement = this.BuildTextContent("PostTitre1", "New Titre", true)
        if(this._PreviousElementSelected != null){
            let PreviousElement = null
            if(this._PreviousElementSelected.dataset.type == "PostImg"){
                PreviousElement = this._PreviousElementSelected.parentNode
            } else {
                PreviousElement = this._PreviousElementSelected
            }
            PreviousElement.parentNode.insertBefore(NewElement, PreviousElement.nextSibling)
        } else {
            this._DiVPost.appendChild(NewElement)
        }
        NewElement.focus()
        NewElement.click()
    }
    /** Add Text */
    AddText(){
        let NewElement = this.BuildTextContent("PostText", "New Text", true)
        if(this._PreviousElementSelected != null){
            let PreviousElement = null
            if(this._PreviousElementSelected.dataset.type == "PostImg"){
                PreviousElement = this._PreviousElementSelected.parentNode
            } else {
                PreviousElement = this._PreviousElementSelected
            }
            PreviousElement.parentNode.insertBefore(NewElement, PreviousElement.nextSibling)
        } else {
            this._DiVPost.appendChild(NewElement)
        }
        NewElement.focus()
        NewElement.click()
    }
    /** Add Code */
    AddCode(){
        let NewElement = this.BuildTextContent("PostCode", "New Code", true)
        if(this._PreviousElementSelected != null){
            let PreviousElement = null
            if(this._PreviousElementSelected.dataset.type == "PostImg"){
                PreviousElement = this._PreviousElementSelected.parentNode
            } else {
                PreviousElement = this._PreviousElementSelected
            }
            PreviousElement.parentNode.insertBefore(NewElement, PreviousElement.nextSibling)
        } else {
            this._DiVPost.appendChild(NewElement)
        }
        NewElement.focus()
        NewElement.click()
    }
    /** Add Picture */
    AddPicture(){
        let PreviousElement = null
        let DivImg = CoreXBuild.DivFlexColumn()
        if(this._PreviousElementSelected != null){
            if(this._PreviousElementSelected.dataset.type == "PostImg"){
                PreviousElement = this._PreviousElementSelected.parentNode
            } else {
                PreviousElement = this._PreviousElementSelected
                // on supprime les selections
                if (window.getSelection) {window.getSelection().removeAllRanges()}
                else if (document.selection) {document.selection.empty()}
            }
            PreviousElement.parentNode.insertBefore(DivImg, PreviousElement.nextSibling)
        } else {
            this._DiVPost.appendChild(DivImg)
        }
        let MyGetImageSrc = new GetImageSrc()
        MyGetImageSrc.Start().then((reponseSRC)=>{
            let Data = new Object()
            Data.BlogId = this._BlogId
            Data.PostId = this._PostData.Data._id
            Data.PostTitre = this._PostData.Data.Titre
            Data.Img = reponseSRC
            this.SendNewPicture(Data,DivImg)
        },(erreur)=>{
            alert("Error on loading file: " + erreur)
        })
    }
    /** Add video link to a video on the server */
    AddVideoLink(){
        let NewElement = this.BuildVideoLinkContent("name.mp4", true)
        if(this._PreviousElementSelected != null){
            let PreviousElement = null
            if(this._PreviousElementSelected.dataset.type == "PostImg"){
                PreviousElement = this._PreviousElementSelected.parentNode
            } else {
                PreviousElement = this._PreviousElementSelected
            }
            PreviousElement.parentNode.insertBefore(NewElement, PreviousElement.nextSibling)
        } else {
            this._DiVPost.appendChild(NewElement)
        }
        NewElement.focus()
        NewElement.click()
    }
    /** Add maps link */
    AddMapLink(){
        let NewElement = this.BuildMapLinkContent("src link", true)
        if(this._PreviousElementSelected != null){
            let PreviousElement = null
            if(this._PreviousElementSelected.dataset.type == "PostImg"){
                PreviousElement = this._PreviousElementSelected.parentNode
            } else {
                PreviousElement = this._PreviousElementSelected
            }
            PreviousElement.parentNode.insertBefore(NewElement, PreviousElement.nextSibling)
        } else {
            this._DiVPost.appendChild(NewElement)
        }
        NewElement.focus()
        NewElement.click()
    }
    /** Send New Picture */
    SendNewPicture(Data, DivImg){
        // Creation du div de contenu de la fenetre
        let DivContent = CoreXBuild.Div("DivContentSendImage")
        // Ajout d'un texte
        DivContent.appendChild(CoreXBuild.DivTexte("Send picture", "WindowTxt", "Text"))
        // Ajout de la progress bar
        DivContent.appendChild(CoreXBuild.ProgressBar("progressBarPost","","width: 100%;"))
        // on construit le texte du message de'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorSendImage","Text","color:red;")
        DivContent.appendChild(DivErrorTexte)
        // construction de la fenetre
        CoreXWindow.BuildWindow(DivContent)
        // On appel l'API
        GlobalCallApiPromise("AddPostPicture", Data, this.UpdateProgressBar.bind(this), "").then((reponse)=>{
            // Timeout de 100 milisec entre la fin de la progressbar et le close window
            setTimeout(function() {
                CoreXWindow.DeleteWindow()
            }, 100)
            // Creation de l'élément image
            let Img = this.BuildImg(reponse, Data.Img, true)
            DivImg.appendChild(Img)
            // sil il existe un element precedement selectionné, il faut enlever son contour rouge
            if(this._PreviousElementSelected != null){
                this._PreviousElementSelected.style.borderColor= "transparent"
            }
            // update du content
            this.UpdateContent()
            // ajout de l'image temporaire dans la liste
            let picture = new Object()
            picture._id = reponse
            picture.PostId = this._PostData.Data._id
            picture.Image = Data.Img
            if (this._PostData.Picture == null){
                this._PostData.Picture = [picture]
            } else {
                this._PostData.Picture.push(picture)
            }
            // border color de l'élement selectionné en rouge
            DivImg.firstChild.style.borderColor= "red"
            this._ElementSelected = DivImg.firstChild
            this._PreviousElementSelected = this._ElementSelected
        },(erreur)=>{
            document.getElementById('WindowTxt').style.display = "none"
            document.getElementById('progressBar').style.display = "none"
            document.getElementById("ErrorSendImage").innerHTML= "error send picture: " + erreur
        })
    }
    /** Delete Element */
    DeleteElement(){
        if (confirm('Are you sure you want to Dete this Element?')){
            let PreviousElement = null
            if(this._PreviousElementSelected != null){
                if(this._PreviousElementSelected.dataset.type == "PostImg"){
                    PreviousElement = this._PreviousElementSelected.parentNode
                    let ImgId = this._PreviousElementSelected.dataset.imgid
                    let Data = new Object()
                    Data.ImgId = ImgId
                    Data.PostTitre = this._PostData.Data.Titre
                    GlobalCallApiPromise("DeletePostPicture", Data, "", "").then((reponse)=>{
                        var index = null
                        this._PostData.Picture.forEach(picture => {
                            if (picture._id == ImgId) {
                                index = this._PostData.Picture.indexOf(picture)}
                        })
                        if (index > -1) {
                            this._PostData.Picture.splice(index, 1);
                        }
                        this._DiVPost.removeChild(PreviousElement)
                        this._ElementSelected = null
                        this._PreviousElementSelected = null
                        this.UpdateContent()
                        this.CommandeButtonNoElementSelected()
                    },(erreur)=>{
                        alert(erreur)
                    })
                } else {
                    PreviousElement = this._PreviousElementSelected
                    this._DiVPost.removeChild(PreviousElement)
                    this._ElementSelected = null
                    this._PreviousElementSelected = null
                    this.UpdateContent()
                    this.CommandeButtonNoElementSelected()
                }
            }
        }
    }
}