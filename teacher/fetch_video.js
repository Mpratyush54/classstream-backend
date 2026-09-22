const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');


const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');


const urlencoded = bodyParser.urlencoded({ extended: false })


// middle ware
app.use('/',
    (req, res, next) => {


        // Let CORS preflights through
        if (req.method === 'OPTIONS') return next();

        // email (req.body is undefined on GET/HEAD — guard against TypeError crash)
        const body = req.body || {};
        var usernames = String(body.username || '');
        var emails = String(body.email || '');
        var query_tokens = String(body.query_token || '');

        db.query('SELECT `username`,  `token`,  `email` FROM `loginlog` WHERE `token` = ?', [query_tokens], (err, result) => {
            if (!err) {

                if (result && result.length) {



                    // res.send({ result })
                    rec_username = result[0].username
                    rec_emails = result[0].email
                    rec_query_tokens = result[0].token


                    if (usernames == rec_username & emails == rec_emails && query_tokens == rec_query_tokens) {
                        next()
                    } else {
                        return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

                    }
                } else {
                    return res.status(403).json({ status: true, error: true, mes: "user is loged out" })
                }
            } else {
                return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

            }
        })
    })

app.post('/login-verify', (req, res) => {

    res.send({ status: true, error: false, allow_user: true })


});


// For table of videos
app.post('/videofetch', (req, res) => {


    db.query('SELECT * FROM `videos` where `process` ="1" && `video` =1&& `thumnail` =1 &&`username` =?', [req.body.username], (err, result) => {
        var process = result[0]
        if (!err) {

            db.query('SELECT * FROM `videos` where `process` ="0" && `video` =1&& `thumnail` =1 && `username` =?', [req.body.username], (err, result1) => {
                if (!err) {
                    res.status(200).json({ status: true, error: false, process: result, processed: result1 })
                } else {
                    console.log(err);
                }
            })


            // res.status(200).json({ status: true, error: false, mes: result })
        } else {

        }
    })



});


app.use('/upload-data', require('./upload_video_data'))
app.use('/data-check', require('./verify_data'))
app.use('/processvideo', require('./processvideo'))
app.use('/notes_fetch', require('./notes_fetch'))
app.use('/notes_manage', require('./notes_manage'))
app.use('/signup', require('./signup'))
app.use('/live/live-setup', require('./connetion_teacher'))
app.use('/chat', require('./connetion_teacher'))
app.use('/fetch-details', require('./student-details'))

module.exports = app