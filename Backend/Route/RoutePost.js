const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

const GetAllPostOfBlog = require("./HelperPost").GetAllPostOfBlog
const GetPostData = require("./HelperPost").GetPostData

router.get("/allpostofBlog/:BlogId", AuthBasic, (req, res) => {
    GetAllPostOfBlog(req.params.BlogId, res, req.user)
})

router.get("/:PostId", AuthBasic, (req, res) => {
    GetPostData(req.params.PostId, res, req.user)
})

module.exports = router