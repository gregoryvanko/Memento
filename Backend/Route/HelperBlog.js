const LogError = require("@gregvanko/nanox").NanoXLogError
const ModelBlog = require("../MongooseModel/Model_Blog")

async function GetBlogInfo (Parametres, res, user = null){
    let Reponse = []

    const query = {$or:[{Public: true} , {UserId:  user._id.toString()}]}
    const projection = {Titre:1, Image:1} 

    ModelBlog.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetBlogInfo db eroor: ${err}`, user)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
    }).limit(1).skip(Parametres).sort({CreationDate: -1})
}

module.exports.GetBlogInfo = GetBlogInfo