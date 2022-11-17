const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic
const LogStatApi = require("@gregvanko/nanox").NanoXLogStatApi

const GetAllPostOfBlog = require("./HelperPost").GetAllPostOfBlog
const GetPostData = require("./HelperPost").GetPostData
const AddNewPost = require("./HelperPost").AddNewPost
const ModifyPost = require("./HelperPost").ModifyPost
const ImageFactory = require("./HelperPost").ImageFactory
const DeletePost = require("./HelperPost").DeletePost

router.get("/allpostofBlog/:BlogId", AuthBasic, (req, res) => {
    GetAllPostOfBlog(req.params.BlogId, res, req.user)
    LogStatApi("post/allpostofblog", "get", req.user)
})

router.get("/AddNewpost/:BlogId", AuthBasic, (req, res) => {
    AddNewPost(req.params.BlogId, res, req.user)
    LogStatApi("post/addnewpost", "get", req.user)
})

router.get("/:PostId", AuthBasic, (req, res) => {
    GetPostData(req.params.PostId, res, req.user)
    LogStatApi("post", "get", req.user)
})  

router.delete("/:PostId", AuthBasic, (req, res) => {
    DeletePost(req.params.PostId, res, req.user)
    LogStatApi("post", "delete", req.user)
})


router.post("/UpdatePost", AuthBasic, (req, res) => {
    ModifyPost(req.body, res, req.user)
    LogStatApi("post/updatepost", "post", req.user)
})

router.post("/Image", AuthBasic, (req, res) => {
    ImageFactory(req.body, res, req.user)
    LogStatApi("post/image", "post", req.user)
})

module.exports = router