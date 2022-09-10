const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

const GetAllPostOfBlog = require("./HelperPost").GetAllPostOfBlog
const GetPostData = require("./HelperPost").GetPostData
const AddNewPost = require("./HelperPost").AddNewPost
const ModifyPost = require("./HelperPost").ModifyPost
const ImageFactory = require("./HelperPost").ImageFactory

router.get("/allpostofBlog/:BlogId", AuthBasic, (req, res) => {
    GetAllPostOfBlog(req.params.BlogId, res, req.user)
})

router.get("/AddNewpost/:BlogId", AuthBasic, (req, res) => {
    AddNewPost(req.params.BlogId, res, req.user)
})

router.get("/:PostId", AuthBasic, (req, res) => {
    GetPostData(req.params.PostId, res, req.user)
})


router.post("/UpdatePost", AuthBasic, (req, res) => {
    ModifyPost(req.body, res, req.user)
})

router.post("/Image", AuthBasic, (req, res) => {
    ImageFactory(req.body, res, req.user)
})

module.exports = router