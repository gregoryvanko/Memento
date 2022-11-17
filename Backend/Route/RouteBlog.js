const router = require("@gregvanko/nanox").Express.Router()
const AuthBasic = require("@gregvanko/nanox").NanoXAuthBasic
const AuthAdmin = require("@gregvanko/nanox").NanoXAuthAdmin
const LogStatApi = require("@gregvanko/nanox").NanoXLogStatApi

const GetBlogInfo = require("./HelperBlog").GetBlogInfo
const IsUserAllowToAddBlog = require("./HelperBlog").IsUserAllowToAddBlog
const IsUserAllowToEditBlog = require("./HelperBlog").IsUserAllowToEditBlog
const AddNewBlog = require("./HelperBlog").AddNewBlog
const DeleteBlog = require("./HelperBlog").DeleteBlog
const ModifyBlog = require("./HelperBlog").ModifyBlog
const GetAdminBlogInfo = require("./HelperBlog").GetAdminBlogInfo

/**
 * Get Blog information by
 */
router.get("/bloginfo/:BlogNumber", AuthBasic, (req, res) => {
    GetBlogInfo(req.params.BlogNumber, res, req.user)
    LogStatApi("blog/bloginfo", "get", req.user)
})

/**
 * is user allowed to add new blog
 */
router.get("/allowaddblog", AuthBasic, (req, res) => {
    IsUserAllowToAddBlog(res, req.user)
    LogStatApi("blog/allowaddblog", "get", req.user)
})

/**
 * is user allowed to edit blog
 */
 router.get("/alloweditblog/:BlogId", AuthBasic, (req, res) => {
    IsUserAllowToEditBlog(req.params.BlogId, res, req.user)
    LogStatApi("blog/alloweditblog", "get", req.user)
})

/**
 * Add new blog
 */
 router.get("/AddNewBlog", AuthBasic, (req, res) => {
    AddNewBlog(res, req.user)
    LogStatApi("blog/addnewblog", "get", req.user)
})

/**
 * Delete Blog
 */
router.delete("/:BlogId", AuthBasic, (req, res) => {
    DeleteBlog(req.params.BlogId, res, req.user)
    LogStatApi("blog", "delete", req.user)
})

/**
 * Modify Blog Data
 */
router.post("/UpdateBlog", AuthBasic, (req, res) => {
    ModifyBlog(req.body, res, req.user)
    LogStatApi("blog/updateblog", "post", req.user)
})

/**
 * Get Admon Blog information
 */
 router.get("/Adminbloginfo", AuthAdmin, (req, res) => {
    GetAdminBlogInfo(res, req.user)
    LogStatApi("blog/adminbloginfo", "get", req.user)
})

module.exports = router