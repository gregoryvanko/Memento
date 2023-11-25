class HelperFilPost{
    constructor(LoadFilOfPostView){
        this._LoadFilOfPostView = LoadFilOfPostView

        this._DivApp = NanoXGetDivApp()
        this._BlockNumberOfPostToLoad = 0
        this._ListFilConteneur = NanoXBuild.DivFlexColumn("FilConteneur", null, "width: 100%; margin-top: 3rem;")
        this._WaitingFilText = NanoXBuild.DivText("Loading Posts...", "waitingfil", "TextSmall", "margin-bottom: 2rem;")

        // creation de la classe HelperPost
        this._HelperPost = new HelperPost(null, null, null, null, null, false, this._LoadFilOfPostView.bind(this))

        let me = this
        this._Observer = new IntersectionObserver((entries)=>{
            entries.forEach(function (obersable){
                if (obersable.intersectionRatio > 0.5){
                    me._BlockNumberOfPostToLoad ++
                    me.GetFilOfPost()
                    me._Observer.unobserve(obersable.target)
                }
            })
        }, {threshold: [1]})

    }

    Initiation(){
        this._BlockNumberOfPostToLoad = 0
        this._ListFilConteneur.innerHTML=""
    }

    SetContener(ParentDiv){
        // Contener for fil of post
        ParentDiv.appendChild(this._ListFilConteneur)
        // Titre de la page
        this._ListFilConteneur.appendChild(NanoXBuild.DivText("All News", "TitreFilPost", "TitreFil", ""))
        // Add Line
        this._ListFilConteneur.appendChild(this.RenderLine())
        // Waiting Blog text
        ParentDiv.appendChild(this._WaitingFilText)
    }

    GetFilOfPost(){
        // Get File of Psot
        NanoXApiGet("/post/lastposts/" + this._BlockNumberOfPostToLoad).then((reponse)=>{
            let TriggerPoint = reponse.length-1
            let Currentpoint = 0
            if(reponse.length < 10){
                // Add posts without next
                reponse.forEach(Post => {
                    // Add Past
                    this._ListFilConteneur.appendChild(this.RenderPosts(Post))
                    // Add Line
                    this._ListFilConteneur.appendChild(this.RenderLine())
                });
                if (document.getElementById("waitingfil")){
                    this._WaitingFilText.parentNode.removeChild(this._WaitingFilText)
                }
                this._ListFilConteneur.appendChild(NanoXBuild.DivText("All posts are loaded", "nopost", "TextSmall", "margin-bottom: 2rem;"))
            } else {
                // Add posts with next
                reponse.forEach(Post => {
                    // Add post
                    let TempPsot = this.RenderPosts(Post)
                    this._ListFilConteneur.appendChild(TempPsot)
                    // Add Line
                    this._ListFilConteneur.appendChild(this.RenderLine())
                    // si l'element est l'element TriggerPoint
                    if (Currentpoint == TriggerPoint){
                        // ajouter le listener pour declancher le GetPosts
                        this._Observer.observe(TempPsot)
                    }
                    // Increment Currentpoint
                    Currentpoint ++
                });
            }
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }

    RenderLine(){
        let line = NanoXBuild.Line("98%", "2px", "grey")
        line.style.maxWidth = "900px"
        line.style.marginTop = "1rem"
        line.style.marginBottom = "1rem"
        return line
    }

    RenderPosts(PostData){
        // Conteneur
        let postcontainer = NanoXBuild.DivFlexColumn("", "ContenerPostFil", "")
        // Add click event
        postcontainer.addEventListener("click", this.ClickOnPost.bind(this, PostData._id, PostData.Titre))
        // Titre du post
        let TitrePost = NanoXBuild.DivText(PostData.Titre, "", "ContenerPostFilTitrePost", "")
        postcontainer.appendChild(TitrePost)
        // Titre du blog
        let TitreBlog = NanoXBuild.DivText(PostData.BlogTitre, "", "ContenerPostFilTitreBlog", "")
        postcontainer.appendChild(TitreBlog)
        return postcontainer
    }

    ClickOnPost(PostID, PostTitre){
        // Get post data
        this._HelperPost.GetPostData(PostID)
        // Log serveur load Blog
        NanoXApiPostLog("View Post : " + PostTitre)
    }
}