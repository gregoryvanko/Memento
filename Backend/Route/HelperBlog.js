const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
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
    }).limit(1).skip(Parametres).sort({CreationDate: 1})
}

async function IsUserAllowToAddBlog(User, res){
    if (User.Admin){
        res.status(200).send(true)
    } else {
        res.status(200).send(false)
    }
}

async function AddNewBlog(User, res){
    let MementoImages = require('../Images.js').MementoImages

    let NewBlogData = new Object()
    NewBlogData.Titre = "New Blog"
    NewBlogData.CreationDate = new Date()
    NewBlogData.UserId = User._id
    NewBlogData.Public = true
    NewBlogData.Image = MementoImages.NoImage()
    
    let NewBlog = new ModelBlog({Titre: NewBlogData.Titre, CreationDate: NewBlogData.CreationDate,UserId: NewBlogData.UserId, Public: NewBlogData.Public, Image: NewBlogData.Image})
    NewBlog.save((err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            NewBlog._id = result.id
            NewBlogData.CanEdit = true
            res.json(NewBlogData)
            LogInfo("New Blog created",User)
        }
    })
}

module.exports.GetBlogInfo = GetBlogInfo
module.exports.IsUserAllowToAddBlog = IsUserAllowToAddBlog
module.exports.AddNewBlog = AddNewBlog