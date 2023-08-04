require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://' +
    process.env.USERNAME +
    ':' +
    process.env.PASSWORD +
    '@connectifydb.tjeylyr.mongodb.net/user_data?retryWrites=true&w=majority'
);

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

// create user schema in mongoose
function create_user(email, username, password, access_key){
    
    return new User({
        email:   email.toLowerCase(),
        username:   username,
        lowercase_username: username.toLowerCase(),
        password:   password,
        access_key: access_key,
        groups: []
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

async function find_user_by_id(user_id){

    try{ return await User.findById(user_id); }
    catch(err){ console.error(err); return null; }
    
}

// clear db [ REMOVE UPON COMPLETION ]
async function clear_db(){ for( user of await User.find({}) ){ await User.deleteOne({ _id: user._id }); } }

module.exports = { create_user, add_user, email_exists, username_exists, find_user_by_id, clear_db };