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
        // Waiting Blog text
        ParentDiv.appendChild(this._WaitingFilText)
    }

    GetFilOfPost(){
        // Get File of Psot
        NanoXApiGet("/post/lastposts/" + this._BlockNumberOfPostToLoad).then((reponse)=>{
            console.log(reponse)
            if(reponse.length == 0){
                if (document.getElementById("waitingfil")){
                    this._WaitingFilText.parentNode.removeChild(this._WaitingFilText)
                }
                this._ListFilConteneur.appendChild(NanoXBuild.DivText("All posts are loaded", "nopost", "TextSmall", "margin-bottom: 2rem;"))
            } else {
                // ToDo
            }
        },(erreur)=>{
            this._DivApp.innerHTML=erreur
        })
    }
}