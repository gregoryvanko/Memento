const Mongoose = require("@gregvanko/nanox").Mongoose

let BlogSchema = new Mongoose.Schema(
    {
        Titre: String,
        CreationDate: Date,
        Public: Boolean,
        Image: String,
        UserId: String
    },
    { collection:'Blog'}
);

module.exports = Mongoose.model('Blog', BlogSchema)