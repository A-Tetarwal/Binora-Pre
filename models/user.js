const mongoose = require('mongoose');
const { type } = require('os');

mongoose.connect(`mongodb://127.0.0.1:27017/BinoraPre`);

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    profilepic: {
        type: String,
        default: 'default.jpg'
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
})

console.log('mongodb connected');
module.exports = mongoose.model('user', userSchema);