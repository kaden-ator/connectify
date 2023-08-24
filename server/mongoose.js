require('dotenv').config();

const mongoose = require('mongoose');

// connect to DB to complete commands
mongoose.connect('mongodb+srv://' +
    process.env.USERNAME +
    ':' +
    process.env.PASSWORD +
    '@connectifydb.tjeylyr.mongodb.net/connectify_db?retryWrites=true&w=majority'
);

/**************************************************************************************************************/
/*                                           USER SCHEMA FUNCTIONS                                           */
/**************************************************************************************************************/

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

const User = mongoose.model('User', userSchema);

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

// get all groups belonging to a given user. If no groups, return empty list
async function get_users_groups(username){

    user = await User.findOne({ lowercase_username: username });

    // if user not found, return null to flag error
    if(user == null){ return null; }

    groups = []

    // fill groups list
    for(group of user.groups){ groups.append( await Group.findById(group) ); }

    return groups;
}

// clear db [ REMOVE UPON COMPLETION ]
async function clear_db(){ for( user of await User.find({}) ){ await User.deleteOne({ _id: user._id }); } }


/**************************************************************************************************************/
/*                                           GROUP SCHEMA FUNCTIONS                                           */
/**************************************************************************************************************/

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

const Group = mongoose.model('Group', groupSchema);

async function create_group(name, owner_id){

    const owner = await User.findById(owner_id);

    return new Group({
        group_name: name,
        spotify_port: owner.access_key,
        owner: owner_id,
        members: [owner_id]
    });
}

async function add_group(group){

    try{ await group.save(); }
    catch(err){ console.error(err); }

}

async function join_group(user_id, group_id){

    // add user to list of members in group
    await Group.update(
        { _id: group_id },
        { $push: { members: user_id } }
    );

}

module.exports = { create_user, add_user, email_exists, username_exists, get_users_groups, clear_db, create_group, add_group, join_group }