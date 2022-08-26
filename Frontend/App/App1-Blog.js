class MementoBlog {
    constructor(){
        this._DivApp = NanoXGetDivApp()
        this.HelperBlog = new HelperBlog(this.LoadStartView.bind(this))
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

        // Initiation HelperBlog
        this.HelperBlog.Initiation()

        // Titre de l'application
        this._DivApp.appendChild(NanoXBuild.DivText("All Blogs", "Titre", "Titre", "margin-top:3rem;"))

        // Contener for blogs
        this.HelperBlog.SetBlogContener(this._DivApp)

        // Get all blgos one by one
        this.HelperBlog.GetBlog()

        // Log serveur load module Blog
        NanoXApiPostLog("Load module Blog")

    }

    BuildMenuButton(){
        // Menu bar Translucide
        NanoXSetMenuBarTranslucide(true)
        // clear menu button left
        NanoXClearMenuButtonLeft()
        // clear menu button right
        NanoXClearMenuButtonRight()
        // clear menu button setttings
        NanoXClearMenuButtonSettings()
        // Show name in menu bar
        NanoXShowNameInMenuBar(true)
    }
}

// Creation de l'application
let MyMementoBlog = new MementoBlog()
// Ajout de l'application
NanoXAddModule("Blog", null, MyMementoBlog.Initiation.bind(MyMementoBlog), true)