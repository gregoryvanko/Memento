const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

const GetAllPostOfBlog = require("./HelperPost").GetAllPostOfBlog

router.get("/allpostofBlog/:BlogId", AuthBasic, (req, res) => {
    GetAllPostOfBlog(req.params.BlogId, res, req.user)
})

module.exports = router