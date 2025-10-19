const express = require('express');
const app = express();
const fs = require('fs')
var https = require('https');
const socket = require('socket.io');
const nms = require('./live/media_server')
const multer = require('multer');





var nodemailer = require('nodemailer');
var NodeMediaServer = require('node-media-server');
const cors = require('cors');
const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
let jsonFile = require('jsonfile');
var dateFormat = require("dateformat");
const { randomUUID, randomInt } = require('crypto');
dotenv.config({ path: './.env' })
app.use(bodyParser.json());
const db = require('./database/index');
const { LOADIPHLPAPI } = require('dns');
const urlencoded = bodyParser.urlencoded({ extended: false })
    //error
cors.bind
app.use(function(req, res, next) {
    console.log(req.headers.origin);
    console.log(req.headers.referer);
    // if (req.headers.origin == 'http://localhost:4200' || req.headers.referer == 'http://localhost:4200/') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin , X-Requested-With, Content-Type, Accept,x-username, x-email, x-token');
    next();
    // } else {
    //     return res.sendStatus(401)
    // }
})
app.use('/api/login', require('./login/index'))
nms.run();
app.use(function(req, res, next) {
    console.log(req.headers.authorization);
    if (req.headers.authorization != '') {
        next()
    }
})
const serves = app.listen(3010, () => {})
const upload = multer({
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB (adjust as needed)
    },
});

function keepalive() {

    db.query('SELECT 1 + 1 AS solution', (err, result) => {
        if (!err) {
            console.log(result);
        } else {
            console.log(err);
        }
    })

}
setInterval(keepalive, 45000);
app.use('/api/teacher/notification', require('./ntifcation/index'))
app.use('/api/forgot-password', require('./login/forgot-password'))
    //student
app.use('/api/student/video/poseter', require('./student/video_poster'))
app.use('/api/student/photo', require('./student/photo'))
app.use('/api/student/Signature', require('./student/Signature'))
app.use('/api/student/notes/pdf', require('./student/notes_pdf'))
app.use('/api/student/', require('./student/index'))
    // Error In the module
    // app.use('/api/photo/upload', require('./ai_recognaition/upload_and_recognation'))
    // app.use('/api/photo/photo', require('./ai_recognaition/photo'))
    // app.use('/api/photo/', require('./ai_recognaition/index'))
    // login 
app.use('/api/teacher/notification', require('./ntifcation/index'))
app.use('/api/teacher/upload_video_thumnail', require('./teacher/upload_video_thumnail'))
app.use('/api/teacher/upload_video_video', require('./teacher/upload_video_video'))
app.use('/api/teacher/notes', require('./teacher/notes'))

app.use('/api/teacher/playvideo/poster', require('./teacher/poster'))
app.use('/api/teacher/playvideo', require('./teacher/playvideo'))

app.use('/api/teacher', require('./teacher/fetch_video'))
app.use('/api/bancheck', require('./live/checklist'))
app.use('/vote', require('./vote/index'))
require('./corn/video_processor');

function addjson(data) {
    const dates = new Date();
    var json = { date: dateFormat(dates, "dd.mm.yyyy"), maindata: data }
    jsonFile.writeFile('json/newarivals.json', json);

}


require('events').EventEmitter.defaultMaxListeners = Infinity;
console.log(require('events').EventEmitter.defaultMaxListeners);
const io = require("socket.io");
const { Socket } = require('dgram');
var sockets = socket(serves, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],

    }
})

sockets.on('connection', (socket) => {
    socket.on('save-chat', (data) => {

    })
    socket.on('chat-details', (data) => {



        console.log('-------------------------');
        console.log('-------------------------');
        console.log('-------------------------');
        console.log(data.room);
        console.log('-------------------------');
        console.log('-------------------------');
        console.log('-------------------------');

        db.query('SELECT `message`, `user` FROM `chats` WHERE `room` = ?', [data.room], (err, result) => {
            if (!err) {
                sockets.to(socket.id).emit("preveious chat", result);
            } else {}
        })
    })
    socket.on('join', (data) => {
        socket.join(data.room)
        socket.broadcast.to(data.room).emit('New User Joined', { user: data.user, message: 'Joined the chat' })
        console.log(data.user + ' joined');
    })
    socket.on('banneds', (data) => {
        console.log(data);
        sockets.to(data.socket_id).emit('banned', { user: data.banuser, message: 'You are banned From the chat by the teacher' })
        socket.emit('banned', data.banuser); //userName is unique
        db.query(' INSERT INTO `chat_ban`(`username`, `message`, `room`,`socket_id`) VALUES (?,?,?,?)', [data.banuser, data.message, data.room, socket.id], (err, result) => {
            if (!err) {} else {
                console.log(err);
            }
        })

    })

    socket.on('Message', (data) => {
        sockets.in(data.room).emit('new message', { user: data.user, message: data.message, id: socket.id });
        db.query('INSERT INTO `chats`( `message`, `user`, `room`,`socket_id`) VALUES (?,?,?,?)', [data.message, data.user, data.room, socket.id], (err, result) => {
            console.log(err);
        })
    })

    sockets.on('disconnect', function(data) {
        socket.broadcast.to(data.room).emit('New User Joined', { user: data.user, message: `${data.user} Left the Chat` })
    });
    socket.on("disconnecting", (data) => {
        socket.broadcast.to(data.room).emit('New User Joined', { user: data.user, message: `${data.user} Left the Chat` })
    });
})