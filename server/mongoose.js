require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({                                        // create user mongoose schema

    em_add: String,
    username: String,
    pass: String,
    tokn: String

});
const User = mongoose.model("User", userSchema);                                // make song model with schema

mongoose.connect('mongodb+srv://' +
    process.env.USERNAME +
    ':' +
    process.env.PASSWORD +
    '@connectifydb.tjeylyr.mongodb.net/USERS?retryWrites=true&w=majority'
);  

function create_user(em_add, username, pass, tokn){

    console.log("em_add: " + em_add + "\n");
    console.log("username: " + username + "\n");
    console.log("pass: " + pass + "\n");
    console.log("tokn: " + tokn + "\n");

    return new User
    ({
        em_add:   em_add,
        username:   username,
        pass:   pass,
        tokn: tokn
    });

}

async function add_user(user){

    try{ user.save(); }
    catch(err){ console.log(err.message); }

}

module.exports = {create_user, add_user};