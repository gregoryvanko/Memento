const LogError = require("@gregvanko/nanox").NanoXLogError
const ModelPost = require("../MongooseModel/Model_Post")

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

module.exports.GetAllPostOfBlog = GetAllPostOfBlog