require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({                                        // create user mongoose schema

    email: String,
    username: String,
    password: String,
    access_key: String

});
const User = mongoose.model("User", userSchema);                                // make song model with schema

mongoose.connect('mongodb+srv://' +
    process.env.USERNAME +
    ':' +
    process.env.PASSWORD +
    '@connectifydb.tjeylyr.mongodb.net/user_data?retryWrites=true&w=majority'
);  

function create_user(email, username, password, access_key){
    
    return new User
    ({
        email:   email.toLowerCase(),
        username:   username,
        password:   password,
        access_key: access_key
    });

}

async function add_user(user){

    try{ user.save(); }
    catch(err){ console.log(err.message); }

}

async function email_exists(email){

    if( await User.findOne({ email: email }) != null ){ return true; } 
    else{ return false; }

}

async function username_exists(username){

    if( await User.findOne({ username: username }) != null ){ return true; }
    else{ return false; }

}

module.exports = {create_user, add_user, email_exists, username_exists};