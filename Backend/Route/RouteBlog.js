const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

const GetBlogInfo = require("./HelperBlog").GetBlogInfo

router.get("/bloginfo/:BlogNumber", AuthBasic, (req, res) => {
    GetBlogInfo(req.params.BlogNumber, res, req.user)
})

module.exports = router