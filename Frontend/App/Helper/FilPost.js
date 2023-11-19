class HelperFilPost{
    constructor(LoadFilOfPostView){
        this._LoadFilOfPostView = LoadFilOfPostView

        this._DivApp = NanoXGetDivApp()
        this._BlockNumberOfPostToLoad = 0
        this._ListFilConteneur = NanoXBuild.DivFlexColumn("FilConteneur", null, "width: 100%; margin-top: 3rem;")
        this._WaitingFilText = NanoXBuild.DivText("Loading Posts...", "waitingfil", "TextSmall", "margin-bottom: 2rem;")

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
            if(reponse.length == 0){
                if (document.getElementById("waitingfil")){
                    this._WaitingFilText.parentNode.removeChild(this._WaitingFilText)
                }
                this._ListFilConteneur.appendChild(NanoXBuild.DivText("All posts are loaded", "nopost", "TextSmall", "margin-bottom: 2rem;"))
            } else {
                // Add posts
                reponse.forEach(Post => {
                    this._ListFilConteneur.appendChild(this.RenderPosts(Post))
                    // Add Line
                    this._ListFilConteneur.appendChild(this.RenderLine())
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
        postcontainer.addEventListener("click", this.ClickOnPost.bind(this, PostData._id))
        // Titre du post
        let TitrePost = NanoXBuild.DivText(PostData.Titre, "", "ContenerPostFilTitrePost", "")
        postcontainer.appendChild(TitrePost)
        // Titre du blog
        let TitreBlog = NanoXBuild.DivText(PostData.BlogTitre, "", "ContenerPostFilTitreBlog", "")
        postcontainer.appendChild(TitreBlog)
        return postcontainer
    }

    ClickOnPost(PostID){
        alert(PostID)
        // ToDo
    }
}