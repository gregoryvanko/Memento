const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const ModelBlog = require("../MongooseModel/Model_Blog")
const ModelPost = require("../MongooseModel/Model_Post")
const ModelPostPicture = require("../MongooseModel/Model_PostPicture")

async function GetBlogInfo (BlogNumber, res, User = null){
    let Reponse = []

    const query = {$or:[{Public: true} , {UserId:  User._id.toString()}]}
    const projection = {} 

    ModelBlog.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetBlogInfo db eroor: ${err}`, User)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
    }).limit(1).skip(BlogNumber).sort({CreationDate: 1})
}

async function IsUserAllowToAddBlog(res, User){
    if (User.Admin){
        res.status(200).send(true)
    } else {
        res.status(200).send(false)
    }
}

async function IsUserAllowToEditBlog(BlogId, res, User){
    let Reponse = null
    const projection = {UserId:1} 

    ModelBlog.findById(BlogId, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`IsUserAllowToEditBlog db eroor: ${err}`, User)
        } else {
            if (result.UserId == User._id){
                Reponse = true
            } else {
                Reponse = false
            }
            res.status(200).send(Reponse)
        }
    })
}

async function AddNewBlog(res, User){
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
            LogError(`AddNewBlog db eroor: ${err}`, User)
        } else {
            NewBlog._id = result.id
            NewBlogData.CanEdit = true
            res.json(NewBlogData)
            LogInfo("New Blog created",User)
        }
    })
}

async function DeleteBlog(BlogId, res, User){
    ModelBlog.findByIdAndDelete(BlogId, (err1, result)=>{
        if (err1) {
            res.status(500).send(err1)
            LogError(`DeleteBlog:Blog db eroor: ${err1}`, User)
        } else {
            // Delete des post
            ModelPost.deleteMany({BlogId: BlogId}, (err2, result)=> {
                if (err2) {
                    res.status(500).send(err2)
                    LogError(`DeleteBlog:Post db eroor: ${err2}`, User)
                } else {
                    // Delete des picture
                    ModelPostPicture.deleteMany({BlogId: BlogId}, (err3, result)=>{
                        if (err3) {
                            res.status(500).send(err3)
                            LogError(`DeleteBlog:Picture db eroor: ${err3}`, User)
                        } else {
                            res.status(200).send("ok")
                            LogInfo("Blog deleted",User)
                        }
                    })
                }
            })
        }
    })
}

async function ModifyBlog(Data, res, User){
    let readytosave = false
    // Preparation des data pour la DB
    let DataToDb = new Object()
    if (Data.Topic == "Titre"){
        readytosave = true
        DataToDb.Titre= Data.Data
    }
    if (Data.Topic == "Image"){
        readytosave = true
        DataToDb.Image= Data.Data
    }
    if (Data.Topic == "Public"){
        readytosave = true
        DataToDb.Public= Data.Data
    }
    // update du blog
    if (readytosave) {
        ModelBlog.findByIdAndUpdate(Data.BlogId, DataToDb, (err, reponse) => {
            if (err) {
                res.status(500).send(err)
                LogError(`ModifyBlog db eroor: ${err}`, User)
            } else {
                if (reponse.matchedCount == 0){
                    res.status(500).send(`ModifyBlog BlogId not found : ${Data.BlogId}`)
                    LogError(`ModifyBlog BlogId not found : ${Data.BlogId}`, User)
                } else {
                    if(Data.Topic == "Image"){
                        res.status(200).send("OK")
                    } else {
                        res.status(200).send(Data.Data)
                    }
                    LogInfo(`Blog updated : ${Data.Topic} is changed`,User)
                }
            }
        })
    }
    else {
        res.status(500).send(`ModifyBlog Topic not defined : ${Data.Topic}`)
        LogError(`ModifyBlog Topic not defined : ${Data.Topic}`, User)
    }


    
}

async function GetAdminBlogInfo(res, User){
    let Reponse = []

    const query = {}
    const projection = {Titre:1, Public:1, UserId:1} 

    ModelBlog.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetAdminBlogInfo db eroor: ${err}`, User)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
    }).sort({CreationDate: 1})
}

module.exports.GetBlogInfo = GetBlogInfo
module.exports.IsUserAllowToAddBlog = IsUserAllowToAddBlog
module.exports.IsUserAllowToEditBlog = IsUserAllowToEditBlog
module.exports.AddNewBlog = AddNewBlog
module.exports.DeleteBlog = DeleteBlog
module.exports.ModifyBlog = ModifyBlog
module.exports.GetAdminBlogInfo = GetAdminBlogInfo