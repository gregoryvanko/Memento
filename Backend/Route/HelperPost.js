const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const ModelPost = require("../MongooseModel/Model_Post")
const ModelPostPicture = require("../MongooseModel/Model_PostPicture")

async function GetAllPostOfBlog (Parametres, res, user = null){
    let Reponse = []

    const query = {BlogId : Parametres}
    const projection = {_id:1, Titre:1, CreationDate:1} 

    ModelPost.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetAllPostOfBlog db eroor: ${err}`, user)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
    }).sort({CreationDate: -1})
}

async function GetPostData (Parametres, res, user = null){
    const query = {_id : Parametres}
    const projection = {} 

    ModelPost.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetPostData db eroor: ${err}`, user)
        } else {
            if(result.length == 0){
                res.status(500).send("No Post data for this Post Id")
            } else {
                let ReponseData = new Object()
                ReponseData.Data = result[0]

                const QuerryPicture = {PostId: Parametres}
                const ProjectionPicture = {}

                ModelPostPicture.find(QuerryPicture, ProjectionPicture, (err, resultpicture) => {
                    if (err) {
                        res.status(500).send(err)
                        LogError(`GetPostData db eroor: ${err}`, user)
                    } else {
                        ReponseData.Picture = resultpicture
                        res.status(200).send(ReponseData)
                    }
                })
            }
        }
    })
}

async function AddNewPost(BlogId, res, User){
    let NewPost = new ModelPost({ Titre: "New Post", BlogId: BlogId, CreationDate: new Date(), Content: [{Type: "PostTitre1", Value : "New Titre"}, {Type: "PostText", Value : "New Text"}]})
    NewPost.save((err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`AddNewPost db eroor: ${err}`, User)
        } else {
            NewPost._id = result.id
            NewPost.CanEdit = true
            let ReponseData = {Data: NewPost, Picture : null}
            res.json(ReponseData)
            LogInfo("New Post created",User)
        }
    })
}

module.exports.GetAllPostOfBlog = GetAllPostOfBlog
module.exports.GetPostData = GetPostData
module.exports.AddNewPost = AddNewPost