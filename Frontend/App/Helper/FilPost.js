class HelperFilPost{
    constructor(LoadFilOfPostView){
        this._LoadFilOfPostView = LoadFilOfPostView

        this._DivApp = NanoXGetDivApp()
        this._BlockNumberOfPostToLoad = 0
        this._ListFilConteneur = NanoXBuild.DivFlexColumn("FilConteneur", null, "width: 100%; margin-top: 3rem;")
        this._WaitingBlogText = NanoXBuild.DivText("Loading Posts...", "waitingblog", "TextSmall", "margin-bottom: 2rem;")

    }

    Initiation(){
        this._BlockNumberOfPostToLoad = 0
        this._ListFilConteneur.innerHTML=""
    }

    SetContener(ParentDiv){
        // Contener for fil of post
        ParentDiv.appendChild(this._ListFilConteneur)
        // Waiting Blog text
        ParentDiv.appendChild(this._WaitingBlogText)
    }
}