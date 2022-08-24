const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

const GetBlogInfo = require("./HelperBlog").GetBlogInfo
const IsUserAllowToAddBlog = require("./HelperBlog").IsUserAllowToAddBlog
const AddNewBlog = require("./HelperBlog").AddNewBlog

/**
 * Get Blog information by
 */
router.get("/bloginfo/:BlogNumber", AuthBasic, (req, res) => {
    GetBlogInfo(req.params.BlogNumber, res, req.user)
})

/**
 * is user allowed to add new blog
 */
router.get("/allowaddblog", AuthBasic, (req, res) => {
    IsUserAllowToAddBlog(req.user, res)
})

/**
 * Add new blog
 */
 router.get("/AddNewBlog", AuthBasic, (req, res) => {
    AddNewBlog(req.user, res)
})

module.exports = router