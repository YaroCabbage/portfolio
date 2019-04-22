'use strict';


const express = require("express");

const app = express();
const fs = require('fs');
const download = require('download');

var subdomain = require('express-subdomain');

var router = express.Router();


router.get('/', function (req, res) {


    res.sendFile(__dirname + "/walkie/index.html");


    //res.send('Welcome to our API!');
});
router.use('/', express.static(__dirname + "/walkie/"));


router.get('/users', function (req, res) {
    console.log('work');
    res.json([
        {name: "Brian"}
    ]);
});
var router_moor = express.Router();
//api specific routes
router_moor.get('/', function (req, res) {


    res.sendFile(__dirname + "/walkie/index.html");


    //res.send('Welcome to our API!');
});
router_moor.use('/', express.static(__dirname + "/walkie/"));

router_moor.get('/json', function (req, res) {
    console.log('work');
    res.json([
        {name: "Brian"}
    ]);
});
router_moor.get('/file/:patch', function (req, res) {
    //console.log('work');
    download('http://localhost:9056/file/:' + req.params['patch']).then(data => {
        fs.writeFileSync('dist/foo.jpg', data);
    });
    res.json([
        {name: req.params['patch']}
    ]);
});
router_moor.get('/send_f', function (req, res) {
    //console.log('work');
    download('http://178.70.129.7:9056/send_f').then(data => {
        fs.writeFileSync('time_capsule/music/audio.mp3', data);
        res.sendfile(__dirname + '/time_capsule/music/audio.mp3');
    });

});


var _moor = express.Router();
//api specific routes
_moor.get('/', function (req, res) {


    res.sendFile(__dirname + "/walkie/index.html");


    //res.send('Welcome to our API!');
});
//_moor.use('/', express.static(__dirname + "/walkie/"));

_moor.get('/json', function (req, res) {
    console.log('work');
    res.json([
        {name: "Brian"}
    ]);
});
_moor.get('/file/:patch', function (req, res) {
    //console.log('work');
    download('http://localhost:9056/file/:' + req.params['patch']).then(data => {
        fs.writeFileSync('dist/foo.jpg', data);
    });
    res.json([
        {name: req.params['patch']}
    ]);
});
_moor.get('/send_f', function (req, res) {
    //console.log('work');
    download('http://localhost:9056/send_f').then(data => {
        fs.writeFileSync('time_capsule/music/audio.mp3', data);
        res.sendfile(__dirname + '/time_capsule/music/audio.mp3');
    });

});


const radio_chain = express.Router();
radio_chain.get('/', function (req, res) {


    res.sendFile(__dirname + "/radio_chain/main.html");


    //res.send('Welcome to our API!');
});
radio_chain.use('/', express.static(__dirname + "/radio_chain/"));


//app.use(subdomain('api', router));
app.use(subdomain('app', router_moor));
//app.use(subdomain('test', test_module));
app.use(subdomain('rchain', radio_chain));
app.use('/app/', _moor);

app.use('/', express.static(__dirname + "/html/"));
const compression = require('compression');
app.use(compression());
module.exports = app;

//app.listen(80);