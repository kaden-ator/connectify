require('dotenv').config();
const mongoose = require('mongoose');

// hold group as an object containing the name, port, owner, and members of group
const groupSchema = new mongoose.Schema({

    group_name: String,
    spotify_port: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]

});

// create user mongoose schema
const userSchema = new mongoose.Schema({                                        

    email: String,
    username: String,
    lowercase_username: String,
    password: String,
    access_key: String,
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }]

});         

const User = mongoose.model("User", userSchema); 
const Group = mongoose.model("Group", groupSchema); 

mongoose.connect('mongodb+srv://' +
    process.env.USERNAME +
    ':' +
    process.env.PASSWORD +
    '@connectifydb.tjeylyr.mongodb.net/user_data?retryWrites=true&w=majority'
);  

// create user schema in mongoose
function create_user(email, username, password, access_key){
    
    return new User
    ({
        email:   email.toLowerCase(),
        username:   username,
        lowercase_username: username.toLowerCase(),
        password:   password,
        access_key: access_key
    });

}

// add user to DB
async function add_user(user){

    // .save adds user to db
    try{ user.save(); }
    catch(err){ console.log(err.message); }

}

// check that email is already in DB (not case sensitive)
async function email_exists(email){

    // will return true when findOne does not return null
    if( await User.findOne({ email: email }) != null ){ return true; } 
    else{ return false; }

}

// check if username in DB (not case sensitive)
async function username_exists(username){

    if( await User.findOne({ lowercase_username: username }) != null ){ return true; }
    else{ return false; }

}

// clear db [ REMOVE UPON COMPLETION ]
async function clear_db(){ for( user of await User.find({}) ){ await User.deleteOne({ _id: user._id }); } }

module.exports = {create_user, add_user, email_exists, username_exists, clear_db};