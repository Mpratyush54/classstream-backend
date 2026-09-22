const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');

const fs = require('fs')

const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult, header } = require('express-validator');



app.post('/index', (req, res) => {
    var lass = req.body.student_class
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!')
console.log(lass)
    db.query('SELECT * FROM `live_current` WHERE `class` = ? && `connnction_status` =?', [lass ,'true'], (err, result) => {
        if (!err) {
            console.log(result);
            if (result == [] || result.length == 0) {
                res.send({ status: true, error: true, mes: "Invalid details" })

            } else {

                    res.send({ status: true, error: false, stream_url: 'rtmp://schooll.tk/live', data: result})

              




   
                
            }
        } else {

            res.send({ status: true, error: true, mes: "Something went wrong", errors: err })

        }
    })

    })
    app.post('/index_main', (req, res) => {
        var id = req.body.id

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
                                res.send({ status: true, error: false, live: true, data: {name:teacherName, Title: row.Title, class: row.class, stream_url: 'rtmp://schooll.tk/live', stream_key: row.hash_code, hls_url: `/media/hls/${row.hash_code}.m3u8` } })

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
    
        })
    // db.query('SELECT  `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`,  `notes`,  `date`, `subject` FROM `notes` WHERE `type` LIKE 0 && `class` LIKE ? &', [Class], (err, result) => {
    //     var process = result
    //     if (!err) {


//         res.status(200).json({ status: true, error: false, })

//     } else {
//         console.log(err);
//     }
// })





module.exports = app