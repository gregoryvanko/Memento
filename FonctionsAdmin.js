class FonctionAdmin{
    constructor(){}

    static ApiAdminGetAllBlog(Data, Res, UserId){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API Admin avec la fonction AdminGetAllBlog")
        let me = this
        const Querry = {}
        const Projection = { projection:{_id: 1, [this._MongoBlogTitre]: 1, [this._MongoBlogUserId]: 1, [this._MongoBlogPublic]: 1}}
        this._Mongo.FindPromise(Querry, Projection, this._MongoBlogCollection).then((reponse)=>{
            if(reponse.length == 0){
                Res.json({Error: false, ErrorMsg: "No Blog in BD", Data: null})
            } else {
                Res.json({Error: false, ErrorMsg: "Blog in DB", Data: reponse})
            }
        },(erreur)=>{
            me._MyApp.LogAppliError("ApiAdminGetAllBlog DB error : " + erreur)
            Res.json({Error: true, ErrorMsg: "ApiAdminGetAllBlog DB Error", Data: ""})
        })
    }

    static ApiAdminUpdateBlog(Data, Res, UserId){
        // Log du call de l'API
        this._MyApp.LogAppliInfo("Call API Admin avec la fonction AdminUpdateBlog")
        // Find FCT
        let FctFind = false
        let me = this
        // Delete blog
        if(Data.Fct == "DeleteBlog"){
            FctFind = true
            // Delete du blog
            this._Mongo.DeleteByIdPromise(Data.Id, this._MongoBlogCollection).then((reponse)=>{
                // Delete des post
                let Query = { [this._MongoPostBlogId]: Data.Id }
                this._Mongo.DeleteByQueryPromise(Query, this._MongoPostCollection).then((reponse)=>{
                    // delete des Pictures
                    let Query = { [this._MongoPictureBlogId]: Data.Id }
                    this._Mongo.DeleteByQueryPromise(Query, this._MongoPictureCollection).then((reponse)=>{
                        Res.json({Error: false, ErrorMsg: "Blog Deleted", Data: null})
                    },(erreur)=>{
                        me._MyApp.LogAppliError("ApiAdminUpdateBlog DB Picture error : " + erreur)
                        Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog DB Picture error", Data: null})
                    })
                },(erreur)=>{
                    me._MyApp.LogAppliError("ApiAdminUpdateBlog DB post error : " + erreur)
                    Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog DB post error", Data: null})
                })
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiAdminUpdateBlog DB Blog error : " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog DB Blog error", Data: null})
            })
        }
        // Update Public value
        if(Data.Fct == "UpdatePublicBlog"){
            FctFind = true
            let DataToDb = new Object()
            DataToDb[this._MongoBlogPublic]= Data.PublicValue
            let me = this
            this._Mongo.UpdateByIdPromise(Data.BlogId, DataToDb, this._MongoBlogCollection).then((reponse)=>{
                if (reponse.matchedCount == 0){
                    me._MyApp.LogAppliError("ApiAdminUpdateBlog BlogId not found in UpdatePublicBlog")
                    Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog BlogId not found in UpdatePublicBlog", Data: null})
                } else {
                    Res.json({Error: false, ErrorMsg: "Blog Updated", Data: Data.Data})
                }
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiAdminUpdateBlog DB error in UpdatePublicBlog: " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog Blog DB error in UpdatePublicBlog", Data: null})
            })
        }
        // Update Owner
        if(Data.Fct == "ChangeOwnerBlog"){
            FctFind = true
            let DataToDb = new Object()
            DataToDb[this._MongoBlogUserId]= Data.NewOwnerId
            let me = this
            this._Mongo.UpdateByIdPromise(Data.BlogId, DataToDb, this._MongoBlogCollection).then((reponse)=>{
                if (reponse.matchedCount == 0){
                    me._MyApp.LogAppliError("ApiAdminUpdateBlog BlogId not found in ChangeOwnerBlog")
                    Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog BlogId not found in ChangeOwnerBlog", Data: null})
                } else {
                    Res.json({Error: false, ErrorMsg: "Blog Updated", Data: Data.Data})
                }
            },(erreur)=>{
                me._MyApp.LogAppliError("ApiAdminUpdateBlog DB error in ChangeOwnerBlog: " + erreur)
                Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog Blog DB error in ChangeOwnerBlog", Data: null})
            })
        }

        // si la fonction n'est pas trouvee
        if(FctFind == false){
            me._MyApp.LogAppliError("ApiAdminUpdateBlog Fct not found: " + Data.Fct)
            Res.json({Error: true, ErrorMsg: "ApiAdminUpdateBlog Fct not found: " + Data.Fct, Data: null})
        }
    }
}

module.exports.FonctionAdmin = FonctionAdmin