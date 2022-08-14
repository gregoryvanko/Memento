const Mongoose = require("@gregvanko/nanox").Mongoose

let PostSchema = new Mongoose.Schema(
    {
        Titre: String,
        BlogId: String,
        CreationDate: Date,
        Content: Array
    },
    { collection:'Post'}
);

module.exports = Mongoose.model('Post', PostSchema)