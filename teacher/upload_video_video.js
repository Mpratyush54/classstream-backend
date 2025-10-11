const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
var getDimensions = require('get-video-dimensions');

let jsonFile = require('jsonfile');


const fs = require('fs')

const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');
const multer = require('multer');


const urlencoded = bodyParser.urlencoded({ extended: false })

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './temp')
    },
    filename: (req, file, callback) => {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        let filename = req.params.id.trim()
        let folderName = req.params.id.trim()
        try {
            if (!fs.existsSync('temp/' + folderName)) {
                fs.mkdirSync('temp/' + folderName)
            }
        } catch (err) {
            console.error(err)
        }

        callback(null, `${filename}/${filename}${ext}`)

    }
})



var upload = multer({ storage: storage })
app.post('/:id', upload.single('file'), (req, res, next) => {
    // email
    var usernames = String(req.body.username);
    var emails = String(req.body.email);
    var query_tokens = String(req.body.query_token);

    db.query('SELECT `username`,  `token`,  `email` FROM `loginlog` WHERE `token` = ?', [query_tokens], (err, result) => {
        if (!err) {

            if (!result[0] == []) {



                // res.send({ result })
                rec_username = result[0].username
                rec_emails = result[0].email
                rec_query_tokens = result[0].token


                if (usernames == rec_username & emails == rec_emails && query_tokens == rec_query_tokens) {






                    const file = req.file

                    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);

                    if (ext == '.mp4') {


                        if (!file) {
                            const error = new Error('Please upload file')

                            res.status(400).json({ status: true, error: true, mes: 'No video fonund' })
                        }

                        getDimensions('temp/' + req.params.id.trim() + '/' + req.params.id.trim() + '.mp4').then(function(dimensions) {


                            if (dimensions.width >= 1080 && dimensions.height >= 720) {
                                data = { status: true, error: false, mes: 'Video uploaded ' }

                                res.send(data)
                                console.log(data);
                            } else {



                                fs.unlinkSync('temp/' + req.params.id.trim() + '/' + req.params.id.trim() + '.mp4')
                                return res.send({ status: true, error: true, mes: 'Invalid video Quality' })


                            }

                        })

                    } else {
                        res.send({ status: true, error: true, mes: 'Invalid extension' })
                    }



                } else {
                    return res.status(403).json({ status: true, error: true, mes: "You are logged out" })

                }
            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", error: err })
            }
        } else {
            return res.status(403).json({ status: true, error: true, mes: "You are logged out" })

        }
    })






















































})

module.exports = app