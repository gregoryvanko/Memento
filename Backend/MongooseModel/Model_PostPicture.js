const Mongoose = require("@gregvanko/nanox").Mongoose

let PostPictureSchema = new Mongoose.Schema(
    {
        BlogId: String,
        PostId: String,
        Image: String,
    },
    { collection:'PostPicture'}
);

module.exports = Mongoose.model('PostPicture', PostPictureSchema)