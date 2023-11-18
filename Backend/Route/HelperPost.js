const LogError = require("@gregvanko/nanox").NanoXLogError
const LogInfo = require("@gregvanko/nanox").NanoXLogInfo
const ModelPost = require("../MongooseModel/Model_Post")
const ModelBlog = require("../MongooseModel/Model_Blog")
const ModelPostPicture = require("../MongooseModel/Model_PostPicture")

async function GetAllPostOfBlog (Parametres, res, User = null){
    let Reponse = []

    const query = {BlogId : Parametres}
    const projection = {_id:1, Titre:1, CreationDate:1} 

    ModelPost.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetAllPostOfBlog db eroor: ${err}`, User)
        } else {
            if (result.length != 0){
                Reponse = result
            }
            res.status(200).send(Reponse)
        }
    }).sort({CreationDate: -1})
}

async function GetPostData (Parametres, res, User = null){
    const query = {_id : Parametres}
    const projection = {} 

    ModelPost.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetPostData db eroor: ${err}`, User)
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
                        LogError(`GetPostData db eroor: ${err}`, User)
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
            let ReponseData = {Data: NewPost, Picture : null}
            res.json(ReponseData)
            LogInfo("New Post created",User)
        }
    })
}

async function ModifyPost(Data, res, User){
    let readytosave = false
    // Preparation des data pour la DB
    let DataToDb = new Object()
    if (Data.Topic == "Titre"){
        readytosave = true
        DataToDb.Titre= Data.Data
    }
    if (Data.Topic == "Content"){
        readytosave = true
        DataToDb.Content= Data.Data
    }
    // update du blog
    if (readytosave) {
        ModelPost.findByIdAndUpdate(Data.PostId, DataToDb, (err, reponse) => {
            if (err) {
                res.status(500).send(err)
                LogError(`ModifyPost db eroor: ${err}`, User)
            } else {
                if (reponse.matchedCount == 0){
                    res.status(500).send(`ModifyPost PostId not found : ${Data.PostId}`)
                    LogError(`ModifyPost PostId not found : ${Data.PostId}`, User)
                } else {
                    res.status(200).send(Data.Data)
                    LogInfo(`Post updated : ${Data.Topic} is changed`,User)
                }
            }
        })
    }
    else {
        res.status(500).send(`ModifyPost Topic not defined : ${Data.Topic}`)
        LogError(`ModifyPost Topic not defined : ${Data.Topic}`, User)
    }
}

async function ImageFactory(Data, res, User){
    if (Data.ImageID == null){
        // on ajoute une image
        let ModelPicture = new ModelPostPicture({BlogId:Data.BlogId, PostId:Data.PostId, Image:Data.Data})
        ModelPicture.save((err, result) => {
            if (err) {
                res.status(500).send(err)
                LogError(`ImageFactory db eroor: ${err}`, User)
            } else {
                res.status(200).send(result.id)
                LogInfo(`Post updated : new image added`,User)
            }
        })
    } else {
        if (Data.DeleteImg){
            // on delete une image
            ModelPostPicture.findByIdAndDelete(Data.ImageID, (err1, result)=>{
                if (err1) {
                    res.status(500).send(err1)
                    LogError(`ImageFactory delete image :Blog db eroor: ${err1}`, User)
                } else {
                    res.status(200).send("OK")
                    LogInfo(`Post updated : Image deleted`,User)
                }
            })
            
        } else {
            let DataToDb = new Object()
            DataToDb.Image = Data.Data
            ModelPostPicture.findByIdAndUpdate(Data.ImageID, DataToDb, (err, reponse) => {
                if (err) {
                    res.status(500).send(err)
                    LogError(`ImageFactory update image db eroor: ${err}`, User)
                } else {
                    if (reponse.matchedCount == 0){
                        res.status(500).send(`ImageFactory update image id not found : ${Data.ImageID}`)
                        LogError(`ImageFactory update image id not found : ${Data.ImageID}`, User)
                    } else {
                        res.status(200).send(Data.ImageID)
                        LogInfo(`Post updated : Image updated`,User)
                    }
                }
            })            
        }
    }
}

async function DeletePost(PostID, res, User = null){
    // Delete des post
    ModelPost.findByIdAndDelete(PostID, (err1, result)=> {
        if (err1) {
            res.status(500).send(err1)
            LogError(`DeletePost:Post db eroor: ${err1}`, User)
        } else {
            // Delete des picture
            ModelPostPicture.deleteMany({PostId: PostID}, (err2, result)=>{
                if (err2) {
                    res.status(500).send(err2)
                    LogError(`DeletePost:Picture db eroor: ${err2}`, User)
                } else {
                    res.status(200).send("ok")
                    LogInfo("Post deleted",User)
                }
            })
        }
    })
}

async function GetBlockOfPostInfo(BlockNumberOfPostToLoad, res, User = null){
    let Reponse = []
    let ListeOfBlog = []

    const NumberOfItem = 3
    const cursor = NumberOfItem * BlockNumberOfPostToLoad

    const query = {$or:[{Public: true} , {UserId:  User._id.toString()}]}
    const projection = {_id:1, Titre:1} 

    // Chercher la liste des blog auquel a acces le user
    ModelBlog.find(query, projection, (err, result) => {
        if (err) {
            res.status(500).send(err)
            LogError(`GetBlockOfPostInfo Blogsearche db eroor: ${err}`, User)
        } else {
            if (result.length != 0){
                ListeOfBlog = result
                let ListeOfIdBlog = []
                ListeOfBlog.forEach(elementBlog => {
                    ListeOfIdBlog.push(elementBlog._id)
                });

                const queryPost = {'BlogId': { $in : ListeOfIdBlog}}
                const projectionPost = {_id:1, Titre:1, BlogId:1} 

                ModelPost.find(queryPost, projectionPost, (err, resultPost) => {
                    if (err) {
                        res.status(500).send(err)
                        LogError(`GetBlockOfPostInfo Postsearch db eroor: ${err}`, User)
                    } else {
                        if (resultPost.length != 0){
                            resultPost.forEach(elementPost => {
                                let PostData = new Object()
                                PostData._id = elementPost._id
                                PostData.Titre = elementPost.Titre
                                const blog = ListeOfBlog.find((element) => element._id == elementPost.BlogId)
                                PostData.BlogTitre = blog.Titre
                                Reponse.push(PostData)
                            });
                        }
                        res.status(200).send(Reponse)
                    }
                }).limit(NumberOfItem).skip(cursor).sort({CreationDate: -1})
            } else {
                res.status(200).send(Reponse)
            } 
        }
    })
}

module.exports.GetAllPostOfBlog = GetAllPostOfBlog
module.exports.GetPostData = GetPostData
module.exports.AddNewPost = AddNewPost
module.exports.ModifyPost = ModifyPost
module.exports.ImageFactory = ImageFactory
module.exports.DeletePost = DeletePost
module.exports.GetBlockOfPostInfo = GetBlockOfPostInfo