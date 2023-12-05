const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// to contact server.js
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your allowed origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.post('/name-pass-checker', (req, res) => {

    const usersList = req.body.users;
    const attempt = req.body.attempt;

    var attemptValid = false
    
    for (let i = 0; i < usersList.length; i++) {

        if( (attempt.username === usersList[i].lowercase_username) && (attempt.password === usersList[i].password)) {
            attemptValid = true;
            break;

        }
    }
    res.json( {attemptValid} );
});

app.listen(8888, () => { console.log("Listening on port 8888"); } );