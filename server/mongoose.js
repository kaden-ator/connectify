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
    refresh_key: String,
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]

});     

const User = mongoose.model('User', userSchema);

// create user schema in mongoose
function create_user(email, username, password, access_key, refresh_key){
    
    return new User({
        email:   email.toLowerCase(),
        username:   username,
        lowercase_username: username.toLowerCase(),
        password:   password,
        access_key: access_key,
        refresh_key: refresh_key,
        groups: []
    });

}

// add user to DB
async function add_user(user){

    // .save adds user to db
    try{ user.save(); }
    catch(err){ console.log(err.message); }

}

// get user given name
async function get_user_by_name(name){

    try{ return await User.findOne({ lowercase_username: name }); }
    catch(err){ console.log(err.message); }

    return null;

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
    for(group of user.groups){ groups.push( await Group.findById(group) ); }

    return groups;
}

// update access_token in database
async function update_access_token(user_id, new_token){ 

    try{
        await User.findByIdAndUpdate(
            user_id,
            { $set: { access_key: new_token } },
            { new: true }
        );
    } 
    catch (err){ console.error('Error updating user:', err); }
    
}

// contact microservice to validate current login attempt
async function validate_attempt(attempt){

    try{

        // get all users from the DB
        const users = await User.find({});

        try{

            const res = await fetch('http://localhost:8888/name-pass-checker', {
    
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users, attempt })
    
            });

            try{ const data = await res.json(); return data.attemptValid; }
            catch(err){ console.error('Error:', err) }
        }
        catch(err){ console.error('Error during fetch:', err); }

    }
    catch(err){ console.error('Error fetching users:', err); }

    return false; 

}

/**************************************************************************************************************/
/*                                           GROUP SCHEMA FUNCTIONS                                           */
/**************************************************************************************************************/

// hold group as an object containing the name, port, owner, and members of group
const groupSchema = new mongoose.Schema({

    group_name: String,
    spotify_port: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

});

const Group = mongoose.model('Group', groupSchema);

// create a new group in database with the given user as
// the owner, add group to users groups
async function create_group(name, owner_id){

    const owner = await User.findById(owner_id);

    const group = new Group({
        group_name: name,
        spotify_port: owner.access_key,
        owner: owner_id,
        members: [owner_id]
    });

    await User.updateOne({_id: owner._id}, { $push: { groups: group._id } });

    return group;
}

// add group to DB
async function add_group(group){

    try{ await group.save(); }
    catch(err){ console.error(err); }

}

// allow user to join group
async function join_group(user_id, group_id){

    await User.updateOne({_id: user_id}, { $push: { groups: group_id } });

    // add user to list of members in group
    await Group.updateOne(
        { _id: group_id },
        { $push: { members: user_id } }
    );

}

// remove user from group
async function leave_group(user_id, group_id){

    await User.updateOne({_id: user_id}, { $pull: { groups: group_id } });

    await Group.updateOne(
        { _id: group_id },
        { $pull: { members: user_id } }
    );

}

// get the owner of the group
async function get_owner(group_id){

    const group = (await Group.findById(group_id));
    const owner = await User.findById(group.owner);

    return owner;

}

module.exports = { create_user, add_user, get_user_by_name, email_exists, username_exists, get_users_groups, update_access_token, validate_attempt, create_group, add_group, join_group, leave_group, get_owner }