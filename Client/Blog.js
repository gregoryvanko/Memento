class Blog{
    constructor(DivApp, Start){
        this._DivApp = DivApp
        this._Start = Start
        this._InitiContent =""
        this._CurrentBlogId =""
        this._BlogData = null
    }

    /** Progressbar des blogs */
    UpdateProgressBar(event){
        let progression = Math.round(((event.loaded / event.total) * 100))
        document.getElementById("progressBarBlog").value = progression
    }

    /** Demande au serveur tous les blog */
    GetAllBlog(){
        // On supprime toutes les ActionButton et on ajout les nouvelles actions
        GlobalClearActionList()
        GlobalAddActionInList("List of Blogs", this._Start) 
        GlobalAddActionInList("Create new Blog", this.AddNewBlog.bind(this)) 
        // Sous titre de l'application
        let DivSoutitre = CoreXBuild.DivTexte("List of blogs","","SousTitre")
        this._DivApp.appendChild(DivSoutitre)
        // on construit la Div qui va revecoir les differents blog
        let DivListOfBlog = CoreXBuild.DivFlexRowAr("ListOfBlog")
        this._DivApp.appendChild(DivListOfBlog)
        // on construit le texte du message d'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorGetAllBlogTxt","Text","color:red; text-align: center;")
        this._DivApp.appendChild(DivErrorTexte)
        // on construit la Div qui va revecoir le waiting text
        let DivWaiting = CoreXBuild.DivFlexColumn("DivWaiting")
        this._DivApp.appendChild(DivWaiting)
        // on construit le texte d'attente des Blog
        DivWaiting.appendChild(CoreXBuild.DivTexte("Wainting for all blogs...","","Text","margin-top: 10vh;"))
        // On ajoute la progress bar
        DivWaiting.appendChild(CoreXBuild.ProgressBar("progressBarBlog","ProgressBar",""))
        // On appel l'API
        GlobalCallApiPromise("GetAllBlog", "", "", this.UpdateProgressBar.bind(this)).then((reponse)=>{
            // Timeout de 100 milisec entre la fin de la progressbar et le close window
            let me = this
            setTimeout(function() {
                me.BuildListOfAllBlog(reponse)
            }, 100)
        },(erreur)=>{
            document.getElementById("DivWaiting").parentNode.removeChild(document.getElementById("DivWaiting"))
            let ErrorTxt = document.getElementById("ErrorGetAllBlogTxt")
            ErrorTxt.innerHTML=erreur
        })
    }
    
    // /** Construit la liste de blogs */
    BuildListOfAllBlog(Blogs){
        // on vide le waiting div
        document.getElementById("DivWaiting").parentNode.removeChild(document.getElementById("DivWaiting"))
        // On vide l'element ListOfBlog 
        let DivListOfBlog = document.getElementById("ListOfBlog")
        DivListOfBlog.innerHTML=""
        if (Blogs == null) {
            let DivReponseTexte = CoreXBuild.DivTexte("There is no Blog","","Text")
            DivListOfBlog.appendChild(DivReponseTexte)
            // Ajout d'un bouton Add Blog
            let DivButton = CoreXBuild.DivFlexColumn("ListOfButton")
            let ButtonAddBlog = CoreXBuild.Button("Create new Blog",this.AddNewBlog.bind(this),"Button")
            DivButton.appendChild(ButtonAddBlog)
            this._DivApp.appendChild(DivButton)
        } else {
            Blogs.forEach(element => {
                // Contour de la carte du blog
                let CarteBlog = CoreXBuild.Div("", "CarteBlog")
                CarteBlog.setAttribute("data-id", element._id)
                CarteBlog.addEventListener("click", this.ClickOnBlog.bind(this,element._id))
                DivListOfBlog.appendChild(CarteBlog)
                // Content de la carte du blog
                let BlogContent = CoreXBuild.DivFlexRowStart("BlogContent")
                CarteBlog.appendChild(BlogContent)
                // Image du blog
                let DivImg = CoreXBuild.Div("", "", "width:30%;")
                BlogContent.appendChild(DivImg)
                let DivImgFlex = CoreXBuild.DivFlexColumn()
                DivImg.appendChild(DivImgFlex)
                let ImgBlog = CoreXBuild.Image64(element.Image,"","CarteBlogImg")
                DivImgFlex.appendChild(ImgBlog)
                // Titre du blog
                let Titre = CoreXBuild.DivTexte(element.Titre,"","Text", "width:66%; margin:1%;")
                BlogContent.appendChild(Titre)
            })
        }
    }
    /** Creation d'un nouveau blog */
    AddNewBlog(){
        // On supprime toutes les ActionButton et on ajout les nouvelles actions
        GlobalClearActionList()
        GlobalAddActionInList("List of Blogs", this._Start) 
        // On vide l'app
        this._DivApp.innerHTML=""
        // on construit le texte d'attente de la creation du nouveau blog
        let DivWaitingTexte = CoreXBuild.DivTexte("Waiting for creation of new blog...","InfoTxt","Text", "text-align:center; margin-top: 30vh;")
        this._DivApp.appendChild(DivWaitingTexte)
        // On ajoute la progress bar
        this._DivApp.appendChild(CoreXBuild.ProgressBar("progressBarBlog","ProgressBar", ""))
        // on construit le div du message de'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorTxt","Text","color:red; text-align: center;")
        this._DivApp.appendChild(DivErrorTexte)

        // Creation du nouveau blog sur le serveur
        GlobalCallApiPromise("AddNewBlog", "", "", this.UpdateProgressBar.bind(this)).then((reponse)=>{
            // Timeout de 100 milisec entre la fin de la progressbar et le close window
            let me = this
            setTimeout(function() {
                me._BlogData = reponse
                me.SetVueBlog(true)
            }, 100)
        },(erreur)=>{
            let InfoTxt = document.getElementById("InfoTxt")
            InfoTxt.innerHTML=""
            let ErrorTxt = document.getElementById("ErrorTxt")
            ErrorTxt.innerHTML=erreur
        })
    }
    /** Afficher la vue du nouveau blog */
    SetVueBlog(EditMode){
        // On supprime toutes les ActionButton et on ajout les nouvelles actions
        GlobalClearActionList()
        GlobalAddActionInList("List of Blogs", this._Start) 

        // Si le user peut editer le blog alors on affiche le bouton action
        if(this._BlogData.CanEdit){
            GlobalDisplayAction("Toggle")
        } else {
            GlobalDisplayAction("Off")
        }

        if(EditMode){
            GlobalAddActionInList("Stop Editing Blog",this.SetVueBlog.bind(this, false))
        } else {
            GlobalAddActionInList("Edit Blog", this.SetVueBlog.bind(this, true))
        }
        GlobalAddActionInList("Add new Post", this.AddPost.bind(this))
        GlobalAddActionInList("Delete Blog", this.DeleteBlog.bind(this))
        // On enregistre l'id du blog affiché
        this._CurrentBlogId = this._BlogData._id
        // On vide l'app
        this._DivApp.innerHTML=""
        // Ajout du titre
        let Titre = CoreXBuild.DivTexte(this._BlogData.Titre, "Titre", "DivTitreBlogPost", "white-space: pre;")
        Titre.setAttribute("data-type", "BlogTitre")
        if(EditMode){
            Titre.setAttribute("contenteditable", "True")
            Titre.addEventListener("click", this.SelectText.bind(this))
            Titre.addEventListener("keydown", this.Keydown.bind(this))
            Titre.addEventListener("focusout", this.ElementFocusOut.bind(this))
            Titre.addEventListener("mouseover", this.Mouseover.bind(this))
            Titre.addEventListener("mouseout", this.Mouseout.bind(this))
        }
        this._DivApp.appendChild(Titre)
        // Ajout du div Image Blog
        let DivImgBlog = CoreXBuild.DivFlexColumn()
        let ImgBlog = CoreXBuild.Image64(this._BlogData.Image,"ImgBlog", "ImgBlog")
        if(EditMode){
            ImgBlog.classList.add("ImgBlogEditable")
            ImgBlog.addEventListener("click", this.SelectImg.bind(this))
        }
        DivImgBlog.appendChild(ImgBlog)
        this._DivApp.appendChild(DivImgBlog)
        if (EditMode){
            // on ajoute un espace vide
            this._DivApp.appendChild(CoreXBuild.Div("","","height:2vh;"))
            // Ajout du sous titre Parametres
            this._DivApp.appendChild(CoreXBuild.DivTexte("Settings", "", "SousTitre"))
            // Blog Public
            let DivPublicSection = CoreXBuild.DivFlexRowStart()
            DivPublicSection.appendChild(CoreXBuild.DivTexte("Public Blog :", "", "Text"))
            // Add button Yes/No
            let TooglePublic= CoreXBuild.ToggleSwitch("TooglePublic", this._BlogData.Public, 30)
            let me = this
            TooglePublic.addEventListener('change', (event) => {
                if (event.target.checked) {
                    me.UpdatePublicBlog(true)
                } else {
                    me.UpdatePublicBlog(false)
                }
            })
            DivPublicSection.appendChild(TooglePublic)
            this._DivApp.appendChild(DivPublicSection)
            // Ajout du sous titre List of Post
            this._DivApp.appendChild(CoreXBuild.DivTexte("List of Post", "", "SousTitre"))
        }
        // Ajout des Post de ce blog
        let DivContentListOfPost = CoreXBuild.Div("","DivContentListOfPost")
        let DivListOfPost = CoreXBuild.DivFlexColumn("DivListOfPost")
        DivContentListOfPost.appendChild(DivListOfPost)
        this._DivApp.appendChild(DivContentListOfPost)
        // Ajout d'un espace
        DivListOfPost.appendChild(CoreXBuild.Div("","","margin-bottom: 2%;"))
        if(this._BlogData.ListOfPost.length == 0){
            let DivNoBlogTexte = CoreXBuild.DivTexte("There is no Post","","Text")
            DivListOfPost.appendChild(DivNoBlogTexte)
            // Ajout d'un bouton Add Blog
            let DivButton = CoreXBuild.DivFlexColumn("ListOfButton")
            let ButtonAddPost = CoreXBuild.Button("Add New Post",this.AddPost.bind(this),"Button")
            DivButton.appendChild(ButtonAddPost)
            DivListOfPost.appendChild(DivButton)
        } else {
            // Ajout d'une ligne
            DivListOfPost.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            // Ajout de tous les post
            this._BlogData.ListOfPost.forEach(element => {
                // Creation du div du post
                let BoxElementPost = CoreXBuild.Div("","BoxElementPost")
                BoxElementPost.setAttribute("data-id", element._id)
                DivListOfPost.appendChild(BoxElementPost)
                // Ajout du titre du Post
                BoxElementPost.appendChild(CoreXBuild.DivTexte(element.Titre,"","TextBoxTitre"))
                // Ajout du titre du Post
                BoxElementPost.appendChild(CoreXBuild.DivTexte(CoreXBuild.GetDateString(element.CreationDate),"","TextBoxSub","text-align: right;"))
                BoxElementPost.addEventListener("click", this.ClickOnPost.bind(this, element._id, EditMode))
                // Ajout d'une ligne
                DivListOfPost.appendChild(CoreXBuild.Line("100%", "Opacity:0.5;"))
            })
        }
        // Ajout d'un bouton Go to Blog
        let DivButton = CoreXBuild.DivFlexColumn("ListOfBlogtButton")
        let ButtonGoToBlog = CoreXBuild.Button("Go To All Blogs",this._Start.bind(this),"Button")
        ButtonGoToBlog.classList.add("NoPrint")
        DivButton.appendChild(ButtonGoToBlog)
        this._DivApp.appendChild(DivButton)
        // on ajoute un espace vide en fin de page
        this._DivApp.appendChild(CoreXBuild.Div("","","height:10vh;"))
    }
    /** Delete du blog */
    DeleteBlog(){
        if (confirm('Are you sure you want to Dete this Blog?')){
            // On supprime toutes les ActionButton et on ajout les nouvelles actions
            GlobalClearActionList()
            GlobalAddActionInList("List of Blogs", this._Start) 
            // On vide l'app
            this._DivApp.innerHTML=""
            // on construit le texte d'attente de la creation du nouveau blog
            let DivWaitingTexte = CoreXBuild.DivTexte("Delete Blog in progress...","InfoTxt","Text", "text-align:center; margin-top: 30vh;")
            this._DivApp.appendChild(DivWaitingTexte)
            // on construit le div du message de'erreur
            let DivErrorTexte = CoreXBuild.DivTexte("","ErrorTxt","Text","color:red; text-align: center;")
            this._DivApp.appendChild(DivErrorTexte)
            // On appel l'API
            let Data = new Object()
            Data.BlogId = this._CurrentBlogId
            Data.BlogTitre = this._BlogData.Titre
            GlobalCallApiPromise("DeleteBlog", Data).then((reponse)=>{
                this._Start()
            },(erreur)=>{
                let InfoTxt = document.getElementById("InfoTxt")
                InfoTxt.innerHTML=""
                let ErrorTxt = document.getElementById("ErrorTxt")
                ErrorTxt.innerHTML=erreur
            })
        }
    }
    /** Ajouter un post au blog */
    AddPost(){
        let MyPost = new Post(this._CurrentBlogId, this._DivApp, this.ClickOnBlog.bind(this, this._CurrentBlogId))
        MyPost.NewPost()
    }

    // /** Click sur un Blog */
    ClickOnBlog(Id){
        // On supprime toutes les ActionButton et on ajout les nouvelles actions
        GlobalClearActionList()
        GlobalAddActionInList("List of Blogs", this._Start) 
        // On vide l'app
        this._DivApp.innerHTML=""
        // on construit le texte d'attente de la creation du nouveau blog
        let DivWaitingTexte = CoreXBuild.DivTexte("Waiting blog Data...","InfoTxt","Text", "text-align:center; margin-top: 30vh;")
        this._DivApp.appendChild(DivWaitingTexte)
        // On ajoute la progress bar
        this._DivApp.appendChild(CoreXBuild.ProgressBar("progressBarBlog","ProgressBar",""))
        // on construit le div du message de'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorTxt","Text","color:red; text-align: center;")
        this._DivApp.appendChild(DivErrorTexte)
        // On appel l'API
        GlobalCallApiPromise("GetBlogData", Id, "", this.UpdateProgressBar.bind(this)).then((reponse)=>{
            // Timeout de 100 milisec entre la fin de la progressbar et le close window
            let me = this
            setTimeout(function() {
                me._BlogData = reponse
                me.SetVueBlog(false)
            }, 100)
        },(erreur)=>{
            let InfoTxt = document.getElementById("InfoTxt")
            InfoTxt.innerHTML=""
            let ErrorTxt = document.getElementById("ErrorTxt")
            ErrorTxt.innerHTML=erreur
        })
    }
    /** Click sur un post */
    ClickOnPost(Id, EditMode){
        let MyPost = new Post(this._CurrentBlogId, this._DivApp, this.ClickOnBlog.bind(this, this._CurrentBlogId))
        MyPost.ShowPost(Id, EditMode)
    }
    /** Selection du titre du blog */
    SelectText(event) {
        let element = event.target
        this._InitiContent = element.innerHTML
        if((element.dataset.type == "BlogTitre") && (element.innerHTML == "New Blog")){
            document.execCommand('selectAll',false,null)
        }
        element.style.borderColor= "red"
    }
    /** Selection de l'image du blog */
    SelectImg(event){
        let element = event.target
        let ImageId = element.id
        let Data = new Object()
        Data.Topic = "Image"
        Data.BlogId = this._CurrentBlogId
        Data.BlogTitre = this._BlogData.Titre
        let uploadimage = new UploadImage(ImageId, "UpdateBlog", Data, this.CallBackImgUpdate.bind(this))
        uploadimage.Start()
    }
    /**
     * Fonction exécutée en callback de la fonction qui change l'image d'un blog
     * @param {Image Base64} Img La nouvelle image sous forme Base64
     * @param {string} Id Id de l'élément image
     */
    CallBackImgUpdate(Img, Id){
        this._BlogData.Image = Img
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
        let element = event.target
        element.style.borderColor= "var(--CoreX-color)"
    }
    /** Mouseout */
    Mouseout(event){
        let element = event.target
        element.style.borderColor= "transparent"
    }

    /** Update du titre du blog */
    UpdateTitre(NewTitre){
        let Data = new Object()
        Data.BlogId = this._CurrentBlogId
        Data.BlogTitre = this._BlogData.Titre
        Data.Topic = "Titre"
        Data.Data = NewTitre
        // On appel l'API
        GlobalCallApiPromise("UpdateBlog", Data).then((reponse)=>{
            this._BlogData.Titre = reponse
        },(erreur)=>{
            alert(erreur)
        })
    }
    /** Update la valeur Public du Blog */
    UpdatePublicBlog(Valeur){
        let Data = new Object()
        Data.BlogId = this._CurrentBlogId
        Data.BlogTitre = this._BlogData.Titre
        Data.Topic = "Public"
        Data.Data = Valeur
        // On appel l'API
        GlobalCallApiPromise("UpdateBlog", Data).then((reponse)=>{
            this._BlogData.Public = reponse
        },(erreur)=>{
            alert(erreur)
        })
    }
}