const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const jwt = require('jsonwebtoken')

let jsonFile = require('jsonfile');

const fs = require('fs')
const dotenv = require('dotenv');
dotenv.config({ path: './.env' })
const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');


const crypto = require("crypto");
const { log } = require('console');



const urlencoded = bodyParser.urlencoded({ extended: false })


app.post('/new', (req, res) => {

    var usernames = String(req.body.username);
    var emails = String(req.body.email);
    var query_tokens = String(req.body.query_token);
    var Class = String(req.body.class);
    var Title = String(req.body.title);

    let id = Math.floor(Math.random() * (100000000 - 9999999)) + 1000000;

    const sign_token = { email: emails, username: usernames, class: Class, query_token: query_tokens }
    const atoken =
        crypto.createHash('sha256').update(JSON.stringify(jwt.sign(sign_token, process.env.crypto))).digest('hex')

    db.query('INSERT INTO `live_current`(`id`, `hash_code`, `username`, `class`, `connnction_status`, `Title`) VALUES (?,?,?,?,?,?)', [id, atoken, usernames, Class, 'False', Title], (err, result1) => {
            if (!err) {


                res.send({ status: true, error: false, acess_token: atoken, id: id })
            } else {
                if (err.code == "ER_DUP_ENTRY") {
                    db.query('UPDATE `live_current` SET `id`=?,`hash_code`=?,`class`=?,`connnction_status`=?,`Title`=? WHERE `username`= ?', [id, atoken, Class, 'False', Title, usernames], (err, result) => {
                        if (!err) {
                            res.send({ status: true, error: false, acess_token: atoken, id: id })


                        } else {
                            res.send({ status: true, error: true })

                        }
                    })

                } else {
                    res.send({ status: true, error: true, mes: "Something went wrong", errors: err })
                }
            }
        })
        // 
})


app.post('/details', (req, res) => {


    var id = String(req.body.id);

    console.log(id);


    db.query('SELECT * FROM `live_current` WHERE `id` = ?', [id], (err, result) => {
            if (!err) {
                console.log(result);
                if (result == [] || result.length == 0) {
                    res.send({ status: true, error: true, mes: "Invalid details" })

                } else {
                    const row = result[0];
                    if (row.connnction_status == true || row.connnction_status == 'true' || row.connnction_status == 1 || row.connnction_status == '1') {
                        db.query('SELECT `name` FROM `login` WHERE `username` = ?  Limit 1', [row.username], (err, result2) => {
                            if (!err) {
                                const teacherName = (result2 && result2[0] && result2[0].name) || row.username;
                                res.send({ status: true, error: false, data: {name:teacherName, Title: row.Title, class: row.class, stream_url: 'rtmp://192.168.1.8/live', stream_key: row.hash_code, hls_url: `/media/hls/${row.hash_code}.m3u8`, live: true } })

                            } else {
                
                                res.send({ status: true, error: true, mes: "Something went wrong", errors: err })
                
                            }
                        })




                    } else {
                        console.log({ Title: row.Title, class: row.class, stream_key: row.hash_code });
                        res.send({ status: true, error: true, mes: "User Not Live yet", live: false, data: { Title: row.Title, class: row.class, stream_url: 'rtmp://schooll.tk/live', stream_key: row.hash_code, hls_url: `/media/hls/${row.hash_code}.m3u8` } })

                    }
                }
            } else {

                res.send({ status: true, error: true, mes: "Something went wrong", errors: err })

            }
        })
        // 
})


module.exports = app