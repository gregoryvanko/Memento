class HelperPost{
    constructor(BlogId){
        this._BlogId = BlogId

        this._DivApp = NanoXGetDivApp()

        this._WaitingPostText = NanoXBuild.DivText("Loading Posts...", "WaitingPostText", "TextSmall", "margin-bottom: 2rem;")
        this._DivListOfPost = NanoXBuild.DivFlexColumn("DivListOfPost", "", "width: 99%; max-width: 60rem;")
    }

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
            console.log(Data)
        }
    }
}