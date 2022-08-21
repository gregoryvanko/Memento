const LogError = require("@gregvanko/nanox").NanoXLogError
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
            LogError(`GetAllPostOfBlog db eroor: ${err}`, user)
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
                        LogError(`GetAllPostOfBlog db eroor: ${err}`, user)
                    } else {
                        ReponseData.Picture = resultpicture
                        res.status(200).send(ReponseData)
                    }
                })
            }
        }
    })
}

module.exports.GetAllPostOfBlog = GetAllPostOfBlog
module.exports.GetPostData = GetPostData