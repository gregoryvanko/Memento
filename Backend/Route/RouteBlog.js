const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic

const GetBlogInfo = require("./HelperBlog").GetBlogInfo
const IsUserAllowToAddBlog = require("./HelperBlog").IsUserAllowToAddBlog
const IsUserAllowToEditBlog = require("./HelperBlog").IsUserAllowToEditBlog
const AddNewBlog = require("./HelperBlog").AddNewBlog
const DeleteBlog = require("./HelperBlog").DeleteBlog
const ModifyBlog = require("./HelperBlog").ModifyBlog

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
    IsUserAllowToAddBlog(res, req.user)
})

/**
 * is user allowed to edit blog
 */
 router.get("/alloweditblog/:BlogId", AuthBasic, (req, res) => {
    IsUserAllowToEditBlog(req.params.BlogId, res, req.user)
})

/**
 * Add new blog
 */
 router.get("/AddNewBlog", AuthBasic, (req, res) => {
    AddNewBlog(res, req.user)
})

/**
 * Delete Blog
 */
router.delete("/:BlogId", AuthBasic, (req, res) => {
    DeleteBlog(req.params.BlogId, res, req.user)
})

/**
 * Modify Post Data
 */
router.post("/UpdateBlog", AuthBasic, (req, res) => {
    ModifyBlog(req.body, res, req.user)
})

module.exports = router