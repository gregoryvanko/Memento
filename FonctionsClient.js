class FonctionClient{
    constructor(){}

    /** API GetAllBlog */
    static ApiGetAllBlog(Data, Res, UserId){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction GetAllBlog")
        let me = this
        const Querry = {$or:[{[this._MongoBlogUserId]:UserId},{[this._MongoBlogPublic]:true}]}
        const Projection = { projection:{}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoBlogCollection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "No Blog in BD", Data: null})
            } else {
                Res.json({Error: false, ErrorMsg: "Blog in DB", Data: reponse})
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiGetAllBlog DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiGetAllBlog DB Error", Data: ""})
        })
    }
    /** API GetBlogData */
    static ApiGetBlogData(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction GetBlogData")
        let me = this
        let MongoObjectId = require('@gregvanko/corex').MongoObjectId
        // Query Mongodb
        const Querry = {'_id': new MongoObjectId(Data)}
        const Projection = { projection:{}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoBlogCollection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "No Blog data for this Blog Id", Data: null})
            } else {
                let ReponseData = reponse[0]
                ReponseData.ListOfPost = []
                const QuerryP = {[this._MongoPostBlogId]: Data}
                const ProjectionP = { projection:{_id: 1, [this._MongoPostTitre]: 1, [this._MongoPostCreationDate]: 1}}
                const Sort = {[this._MongoPostCreationDate]: -1}
                this._Mongo.FindSortPromise(QuerryP, ProjectionP, Sort, this._MongoPostCollection).then((reponse)=>{
                    ReponseData.ListOfPost = reponse
                    Res.json({Error: false, ErrorMsg: "Blog data in DB", Data: ReponseData})
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiGetBlogData DB error : " + erreur)
                    Res.json({Error: true, ErrorMsg: "ApiGetBlogData DB Error", Data: ""})
                })
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiGetBlogData DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiGetBlogData DB Error", Data: ""})
        })
    }
    /** API AddNewBlog */
    static ApiAddNewBlog(Data, Res, UserId){
        let me = this
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction AddNewBlog")
        let MementoImages = require('./Images.js').MementoImages
        // Creation du nouveau blog
        let NewBlog = new Object()
        NewBlog.Titre = "New Blog"
        NewBlog.CreationDate = new Date()
        NewBlog.UserId = UserId
        NewBlog.Public = true
        NewBlog.Image = MementoImages.NoImage()
        NewBlog.ListOfPost = []
        // Data du blog to DB
        let DataBlogToMongo = { [this._MongoBlogTitre]: NewBlog.Titre, [this._MongoBlogCreationDate]: NewBlog.CreationDate, [this._MongoBlogUserId]: NewBlog.UserId, [this._MongoBlogPublic]: NewBlog.Public, [this._MongoBlogImage]: NewBlog.Image}
        // Insert in Moango
        this._Mongo.InsertOnePromise(DataBlogToMongo, this._MongoBlogCollection).then((reponse)=>{
            NewBlog._id = reponse.insertedId.toString()
            // Creation du nouveau post de ce blog
            let NewPost = FonctionClient.NewPostData(NewBlog._id)
            // Data du blog to DB
            let DataPostToMongo = { [this._MongoPostTitre]: NewPost.Titre, [this._MongoPostBlogId]: NewPost.BlogId, [this._MongoPostCreationDate]: NewPost.CreationDate, [this._MongoPostContent]: NewPost.Content}
            // Insert in Moango
            this._Mongo.InsertOnePromise(DataPostToMongo, this._MongoPostCollection).then((reponse)=>{
                NewPost._id = reponse.insertedId
                // Ajout du post a la liste des post du blog
                NewBlog.ListOfPost.push(NewPost)
                Res.json({Error: false, ErrorMsg: "New Blog created", Data: NewBlog})
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiAddNewBlog Post DB error : " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiAddNewBlog Post DB error", Data: null})
            })

        },(erreur)=>{
            me._MyApp.LogAppliError("ApiAddNewBlog Blog DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiAddNewBlog Blog DB error", Data: null})
        })
    }
    /** API Update topic d'un blog */
    static ApiUpdateBlog(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction UpdateBlog")
        let readytosave = false
        // Preparation des data pour la DB
        let DataToDb = new Object()
        if (Data.Topic == "Titre"){
            readytosave = true
            DataToDb[this._MongoBlogTitre]= Data.Data
        }
        if (Data.Topic == "Image"){
            readytosave = true
            DataToDb[this._MongoBlogImage]= Data.Data
        }
        if (Data.Topic == "Public"){
            readytosave = true
            DataToDb[this._MongoBlogPublic]= Data.Data
        }
        // update du blog
        if (readytosave) {
            let me = this
            this._Mongo.UpdateByIdPromise(Data.BlogId, DataToDb, this._MongoBlogCollection).then((reponse)=>{
                if (reponse.matchedCount == 0){
                    me._MyApp.LogAppliError("ApiUpdateBlog BlogId not found")
                    Res.json({Error: true, ErrorMsg: "ApiUpdateBlog BlogId not found", Data: null})
                } else {
                    Res.json({Error: false, ErrorMsg: "Blog Updated", Data: Data.Data})
                }
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiUpdateBlog DB error : " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiUpdateBlog Blog DB error", Data: null})
            })
        }
        else {
            this._MyApp.LogAppliError("ApiUpdateBlog Topic not defined : " + Data.Topic)
            Res.json({Error: true, ErrorMsg: "ApiUpdateBlog topic error : " + Data.Topic, Data: null})
        }
    }
    /** API Delete Blog */
    static ApiDeleteBlog(Data, Res){
        let me = this
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction DeleteBlog")
        // Delete du blog
        this._Mongo.DeleteByIdPromise(Data, this._MongoBlogCollection).then((reponse)=>{
            // Delete des post
            let Query = { [this._MongoPostBlogId]: Data }
            this._Mongo.DeleteByQueryPromise(Query, this._MongoPostCollection).then((reponse)=>{
                // delete des Pictures
                let Query = { [this._MongoPictureBlogId]: Data }
                this._Mongo.DeleteByQueryPromise(Query, this._MongoPictureCollection).then((reponse)=>{
                    Res.json({Error: false, ErrorMsg: "Blog Deleted", Data: null})
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiDeleteBlog DB Picture error : " + erreur)
                    Res.json({Error: true, ErrorMsg: "ApiDeleteBlog DB Picture error", Data: null})
                })
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiDeleteBlog DB post error : " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiDeleteBlog DB post error", Data: null})
            })
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiDeleteBlog DB Blog error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiDeleteBlog DB Blog error", Data: null})
        })
    }

    /** API GetPostData */
    static ApiGetPostData(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction GetPostData")
        let me = this
        let MongoObjectId = require('@gregvanko/corex').MongoObjectId
        // Query Mongodb
        const Querry = {'_id': new MongoObjectId(Data)}
        const Projection = { projection:{}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoPostCollection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "No Post data for this Post Id", Data: null})
            } else {
                let ReponseData = new Object()
                ReponseData.Data = reponse[0]
                const QuerryPicture = {[this._MongoPicturePostId]: Data}
                const ProjectionPicture = { projection:{}}
                this._Mongo.FindPromise(QuerryPicture, ProjectionPicture, this._MongoPictureCollection).then((reponsePicture)=>{
                    ReponseData.Picture = reponsePicture
                    Res.json({Error: false, ErrorMsg: "Post data", Data: ReponseData})
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiGetPostData DB Picture error : " + erreur)
                    Res.json({Error: true, ErrorMsg: "ApiGetPostData DB Picture Error", Data: ""})
                })
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiGetPostData DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiGetPostData DB Error", Data: ""})
        })
    }
    /** API UpdatePost */
    static ApiUpdatePost(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction UpdatePost")
        let readytosave = false
        // Preparation des data pour la DB
        let DataToDb = new Object()
        if (Data.Topic == "Titre"){
            readytosave = true
            DataToDb[this._MongoPostTitre]= Data.Data
        }
        if (Data.Topic == "Content"){
            readytosave = true
            DataToDb[this._MongoPostContent]= Data.Data
        }
        // update du blog
        if (readytosave) {
            let me = this
            this._Mongo.UpdateByIdPromise(Data.PostId, DataToDb, this._MongoPostCollection).then((reponse)=>{
                if (reponse.matchedCount == 0){
                    me._MyApp.LogAppliError("ApiUpdatePost PostId not found")
                    Res.json({Error: true, ErrorMsg: "ApiUpdatePost PostId not found", Data: null})
                } else {
                    Res.json({Error: false, ErrorMsg: "Post Updated", Data: null})
                }
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiUpdatePost DB error : " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiUpdatePost Post DB error", Data: null})
            })
        }
        else {
            this._MyApp.LogAppliError("ApiUpdatePost Topic not defined : " + Data.Topic)
            Res.json({Error: true, ErrorMsg: "ApiUpdatePost topic error : " + Data.Topic, Data: null})
        }
    }
    /** New Post */
    static ApiNewPost(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction NewPost")
        let me = this
        let NewPost = FonctionClient.NewPostData(Data)
        // Data du blog to DB
        let DataPostToMongo = { [this._MongoPostTitre]: NewPost.Titre, [this._MongoPostBlogId]: NewPost.BlogId, [this._MongoPostCreationDate]: NewPost.CreationDate, [this._MongoPostContent]: NewPost.Content}
        // Insert in Moango
        this._Mongo.InsertOnePromise(DataPostToMongo, this._MongoPostCollection).then((reponse)=>{
            NewPost._id = reponse.insertedId
            let ReponseData = new Object()
            ReponseData.Data = NewPost
            ReponseData.Picture = null
            Res.json({Error: false, ErrorMsg: "New Post created", Data: ReponseData})
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiNewPost DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiNewPost DB error", Data: null})
        })
    }
    /** Delete Post */
    static ApiDeletePost(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction DeletePost")
        let me = this
        // delete du Post
        this._Mongo.DeleteByIdPromise(Data, this._MongoPostCollection).then((reponse)=>{
            // delete des Pictures
            let Query = { [this._MongoPicturePostId]: Data }
            this._Mongo.DeleteByQueryPromise(Query, this._MongoPictureCollection).then((reponse)=>{
                Res.json({Error: false, ErrorMsg: "Post Deleted", Data: null})
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiDeletePost DB Picture error : " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiDeletePost DB Picture error", Data: null})
            })
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiDeletePost DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiDeletePost DB error", Data: null})
        })
    }
    /** Creation d'un post */
    static NewPostData(BlogId){
        let NewPost = new Object()
        NewPost.Titre = "New Post"
        NewPost.BlogId = BlogId
        NewPost.CreationDate = new Date()
        NewPost.Content=[]
        // Ajout du contenu du pst
        let PostContent1 = new Object()
        PostContent1.Type = "PostTitre1"
        PostContent1.Value = "New Titre"
        NewPost.Content.push(PostContent1)
        let PostContent2 = new Object()
        PostContent2.Type = "PostText"
        PostContent2.Value = "New Text"
        NewPost.Content.push(PostContent2)
        return NewPost
    }
    /** Add New Picture in Post */
    static ApiAddPostPicture(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction ApiAddPostPicture")
        let me = this
        // Data de la nouvelle image en DB
        let DataPictureToMongo = { [this._MongoPictureBlogId]: Data.BlogId, [this._MongoPicturePostId]: Data.PostId, [this._MongoPictureData]: Data.Img}
        // Insert in Moango
        this._Mongo.InsertOnePromise(DataPictureToMongo, this._MongoPictureCollection).then((reponse)=>{
            Res.json({Error: false, ErrorMsg: "New Picture created", Data: reponse.insertedId})
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiAddPostPicture DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiAddPostPicture DB error", Data: null})
        })
    }
    /** Delete Post Picture */
    static ApiDeletePostPicture(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction ApiAddPostPicture")
        let me = this
        // delete du Post
        this._Mongo.DeleteByIdPromise(Data, this._MongoPictureCollection).then((reponse)=>{
            Res.json({Error: false, ErrorMsg: "Post Deleted", Data: null})
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiDeletePost DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiDeletePost DB error", Data: null})
        })
    }
    /** Update Post Picture */
    static ApiUpdatePostPicture(Data, Res){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API User avec la fonction UpdatePostPicture")
        let DataToDb = new Object()
        DataToDb[this._MongoPictureData]= Data.Data
        let me = this
        this._Mongo.UpdateByIdPromise(Data.Id, DataToDb, this._MongoPictureCollection).then((reponse)=>{
            if (reponse.matchedCount == 0){
                me._MyApp.LogAppliError("ApiUpdatePostPicture Picture Id not found")
                Res.json({Error: true, ErrorMsg: "ApiUpdatePostPicture Picture Id not found", Data: null})
            } else {
                Res.json({Error: false, ErrorMsg: "Post Picture Updated", Data: Data.Data})
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiUpdatePostPicture DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiUpdatePostPicture DB error", Data: null})
        })
    }

}

module.exports.FonctionClient = FonctionClient