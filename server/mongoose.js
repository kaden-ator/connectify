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
    }],
    suggestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Suggestion'
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

async function get_suggestions(group_id){

    const suggestion_ids = (await Group.findById(group_id)).suggestions;
    var suggestions = [];

    for(var suggestion_id of suggestion_ids){

        const suggestion = await Suggestion.findById(suggestion_id);

        const status = suggestion.status;
        const song_id = suggestion.song_id;
        const group = await Group.findById(suggestion.group);
        const user = await User.findById(suggestion.suggestion_user);

        suggestions.push({status: status, song_id: song_id, group: group, user: user});
    }

    return suggestions;

}

/**************************************************************************************************************/
/*                                      SUGGESTION SCHEMA FUNCTIONS                                           */
/**************************************************************************************************************/

// hold group as an object containing the name, port, owner, and members of group
const suggestionSchema = new mongoose.Schema({

    status: String,
    song_id: String,
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    suggestion_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

});

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

// create user schema in mongoose
function create_suggestion(song_id, group_id, user_id){
    
    return new Suggestion({
        status: 'pending',
        song_id: song_id,
        group: group_id,
        suggestion_user: user_id
    });

}

// add user to DB
async function add_suggestion(suggestion){

    try{ 
        // save suggestion to db for finding by id in future
        await suggestion.save(); 
        try{
            await Group.findByIdAndUpdate(
                suggestion.group,
                { $push: { suggestions: suggestion._id } },
                { new: true }
            );
        } 
        catch (err){ console.error('Error updating group:', err); }
    }
    catch(err){ console.log(err.message); }

}

module.exports = { create_user, add_user, get_user_by_name, email_exists, username_exists, get_users_groups, update_access_token, create_group, add_group, join_group, get_suggestions, create_suggestion, add_suggestion }