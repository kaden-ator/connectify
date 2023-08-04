require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./User');

mongoose.connect('mongodb+srv://' +
    process.env.USERNAME +
    ':' +
    process.env.PASSWORD +
    '@connectifydb.tjeylyr.mongodb.net/group_data?retryWrites=true&w=majority'
);

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

async function create_group(name, owner_id){

    const owner = await User.find_user_by_id(owner_id).toObject();

    return new Group({
        group_name: name,
        spotify_port: owner.access_key,
        owner: owner_id,
        members: [owner_id]
    });
}

module.exports = { create_group }; 