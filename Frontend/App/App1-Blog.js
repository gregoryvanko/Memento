class MementoBlog {
    constructor(){
        this._DivApp = NanoXGetDivApp()

        this._BlogNumber = 0
        this._IsBlogLoaded = false
    }

    Initiation(){
        // Load Start view
        this.LoadStartView()
    }

    LoadStartView(){
        // Clear view
        this._DivApp.innerHTML=""

        // Build Menu Button
        this.BuildMenuButton()

        // Init variable
        this._BlogNumber = 0
        this._IsBlogLoaded = false

        // Titre de l'application
        this._DivApp.appendChild(NanoXBuild.DivText("All Blogs", "Titre", "Titre", "margin-top:1rem;"))

        // Contener for blogs
        let BlogConteneur = NanoXBuild.DivFlexColumn("BlogConteneur", null, "width: 100%;")
        this._DivApp.appendChild(BlogConteneur)

        // Waiting text
        this._DivApp.appendChild(NanoXBuild.DivText("waiting of blogs...", "waitingblog", "Text", "margin-bottom: 2rem;"))

        // Get all blgos one by one
        this.GetBlog()

        // Log serveur load view Blog
        NanoXApiPostLog("User Load module Blog")

    }

    BuildMenuButton(){
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // clear menu button right
        NanoXClearMenuButtonRight()
        // Show name in menu bar
        NanoXShowNameInMenuBar(true)
    }

    BuildEmptySpace(){
        let divempty = document.createElement('div')
        divempty.style.height = "2rem"
        return divempty
    }

    GetBlog(){
        NanoXApiGet("/blog/bloginfo/" + this._BlogNumber).then((reponse)=>{
            this.RenderBlog(reponse)
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    RenderBlog(DataArray){
        if (DataArray.length == 1){
            let Data = DataArray[0]
            this._IsBlogLoaded = true
            this._BlogNumber ++
            this.GetBlog()

            // render this blog
            // Contour de la carte du blog
            let BlogConteneur = document.getElementById("BlogConteneur")
            let CarteBlog = NanoXBuild.Div("", "CarteBlog")
            CarteBlog.setAttribute("data-id", Data._id)
            CarteBlog.addEventListener("click", this.ClickOnBlog.bind(this,Data._id))
            BlogConteneur.appendChild(CarteBlog)
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
                this._DivApp.removeChild(document.getElementById("waitingblog"))
            }
            if (! this._IsBlogLoaded){
                this._DivApp.appendChild(NanoXBuild.DivText("There is no blog", "noblog", "Text", "margin-bottom: 2rem;"))
            }
        }
    }

    ClickOnBlog(Id){
        alert(Id)
    }
}

// Creation de l'application
let MyMementoBlog = new MementoBlog()
// Ajout de l'application
NanoXAddModule("Blog", null, MyMementoBlog.Initiation.bind(MyMementoBlog), true)