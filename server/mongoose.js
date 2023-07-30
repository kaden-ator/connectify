require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({                                        // create user mongoose schema

    display_name: String,
    username: String,
    pass: String,
    access_key: String

});
const User = mongoose.model("User", userSchema);                                // make song model with schema

mongoose.connect('mongodb+srv://' +
    process.env.USERNAME +
    ':' +
    process.env.PASSWORD +
    '@connectifydb.tjeylyr.mongodb.net/USERS?retryWrites=true&w=majority'
);  

function create_user(email, username, pass){

    return new User
    ({
        email:   email,
        username:   username,
        pass:   pass,
        access_key: ""
    });

}

async function add_user(user){

    try{ user.save(); }
    catch(err){ console.log(err.message); }

}

module.exports = {create_user, add_user};