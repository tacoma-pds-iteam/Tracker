/******************************************
Filename: Server.js
Description: This file serves as the driver function for the Tracker Node Application. This file
handles all connections and disconnections from the application.All initializing packages and 
constants are created here and passed into the Server class.
*******************************************/
if(process.argv[2] == null) {
  console.log('Config file not included. Exiting...');
  return;
}
/* Package requirements */
const fs = require('fs');
const mysql = require('mysql');
const request = require('request');
const nodemailer = require('nodemailer');
const configs = JSON.parse(fs.readFileSync(process.argv[2])); //  grab config file; FORMAT: JSON

/* Set up connection to gmail account */
var transporter = nodemailer.createTransport({
  service: getParameter('em-service', 'gmail'),
  auth: {
    user: getParameter('em-user'),// email address
    pass: getParameter('em-pass')// email password
  }
});
const _database = getParameter('db-name');//db name
const PORT4 = parseInt(getParameter('port')); // open port for Tracker
const APPID4 = getParameter('appid');//registered Accela App ID
const APPSECRET4 = getParameter('appsecret');
const ENV4 = getParameter('env');// SUPP or PROD

/* MySQL Database connection startup */
if(!_database) {
  console.log('database parameter not found. Re-enter required parameters...')
  return;
}
const con4 = mysql.createConnection({ //create db connection
  host: getParameter('db-host', 'localhost'),
  user: getParameter('db-user', 'root'),
  password: getParameter('db-pass', 'password'),
  database: _database,
  multipleStatements: true
});
con4.connect((err) => {
  if(err){
    console.log(PORT4 + ':' +'Error connecting to Database. Error: ' + err);
    return;
  }
  console.log(PORT4 + ':' +`Connection to ${_database} database established`);
});

/* Server Node application startup */
var server4 = require('diet'); // node package to run multiple node instances on same server
var app4 = server4();
/******************************************
  server listener on designated port
*******************************************/
app4.listen(getParameter("url"), function() { //start listening for connections
    console.log(PORT4 + ':' +'listening on port %s..', PORT4);
    console.log(PORT4 + ':' +'directory: ' + __dirname);
});
/* initialize server functionality for sockets and custom classes */
var static = require('diet-static')({path: app4.path + '\\client\\static\\'}); //package to grab static files to client as one folder
app4.footer(static); // set static files to server
var io4 = require('socket.io').listen(app4.server, {wsEngine: 'ws'}); // initialize socket connections
var currentUsers4 = 0;
var _TOKEN4 = '';
var init = require('./server/classes'); // grab all classes
let s = new init.Server(io4, configs);// <<-- server startup here
logoutAll(con4); // make sure all users in DB are marked 'logged out'
getUserFullNames(con4); // get list of users and names

/* Serve main index file */
app4.get('/', (res) => {
    res.sendFile(__dirname + '/client/index.html');
});
/* Socket io server handler set up */
io4.on('connection', function(socket) { //user connected to tracker
    currentUsers4++; //increment user counter
    console.log(`${currentUsers4} user(s) connected! (ip: ${socket.request.connection.remoteAddress})`);
    require('./server/handlers')(io4, socket, s, con4, init, transporter, configs); // establish handlers for each client

    socket.on('disconnect', function(d) { // disconnect handler
      console.log("user disconnected! Bye Bye!");
      logout(con4, io4.sockets, socket.request.connection.remoteAddress); // logout from DB
      currentUsers4--; //decrement counter
    });
});
/* function sends a SQL command to users table that sets logged in flag to N for all users */
function logoutAll(con){
      con.query(`UPDATE users SET user_logged_in = "N", user_ip = NULL`, (err, rows) => {
        if(err) 
          console.log('Failed to logout all users: ' + err); //fail
        else  
          console.log('All users logged out successfully'); //success
      });
}
/* function sends SQL command to logout specific user from a specific ip address **WARNING this may break if signed into 2 devices***/
function logout(con, sockets, ip){
      con.query(`UPDATE users SET user_logged_in = "N", user_ip = NULL WHERE user_ip = "${ip}"`, (err, rows) => {
        if(err) 
          console.log(' Failed to logout :' + err); //fail
        else  {
           console.log('logged out'); //success
           sendAllLoggedIn(sockets, con); //send the updated user list to clients
        }
      });
}
/* function sends SQL command to find all the users that are currently logged in */
function sendAllLoggedIn(sockets, db) {
      db.query(`SELECT * FROM users where user_logged_in = "Y"`, (err, rows) => {
        if(err) return -1; //user not found
        else {
          sockets.emit('logged-in-users',rows); // send to all clients
        }
      });
}
/* function sends SQL command to get the first and last name of all users. Used so clients dont need to individually ping the database to get names */
function getUserFullNames(con) {
      con.query(`SELECT username, user_first, user_last, user_email FROM users`, (err, rows) => {
        if(err || !rows.length) return -1;//user not found
        else {
          s.userList = rows; //set server var to result
        }
      });
  }

/* Function searches for value from configs global based on given key, returns default if not found */
function getParameter(key, def){
  if(typeof configs[key] != "undefined") return configs[key];
  return def;
}
