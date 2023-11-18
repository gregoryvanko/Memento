class MementoBlog {
    constructor(){
        this._DivApp = NanoXGetDivApp()
        this.HelperBlog = new HelperBlog(this.LoadStartBlogView.bind(this))
        this.HelperFilPost = new HelperFilPost(this.LoadFilOfPostView.bind(this))
    }

    Initiation(){
        // Load Start view
        //this.LoadStartBlogView()
        this.LoadFilOfPostView()
    }

    LoadFilOfPostView(){
        // Clear view
        this._DivApp.innerHTML=""

        // Build Menu Button
        this.BuildMenuButton()

        // Add button post view
        NanoXAddMenuButtonLeft("IdBlogButton", "Blog", IconCommon.BlogIcon(), this.LoadStartBlogView.bind(this) )

        // Initiation HelperFilPost
        this.HelperFilPost.Initiation()

        // Contener for fil of post
        this.HelperFilPost.SetContener(this._DivApp)

        // Get all post in fil of posts
        this.HelperFilPost.GetFilOfPost()

        // Log serveur load module Blog
        NanoXApiPostLog("Load module Fil of Posts")
    }

    LoadStartBlogView(){
        // Clear view
        this._DivApp.innerHTML=""

        // Build Menu Button
        this.BuildMenuButton()

        // Add button post view
        NanoXAddMenuButtonLeft("IdBlogButton", "Blog", IconCommon.ListeOfPost(), this.LoadFilOfPostView.bind(this) )

        // Initiation HelperBlog
        this.HelperBlog.Initiation()

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
        NanoXShowNameInMenuBar(false)
    }
}

// Creation de l'application
let MyMementoBlog = new MementoBlog()
// Ajout de l'application
NanoXAddModule("My Blog", IconCommon.BlogIcon(), MyMementoBlog.Initiation.bind(MyMementoBlog), true)