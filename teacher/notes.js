const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');

const fs = require('fs')

const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');





const urlencoded = bodyParser.urlencoded({ extended: false })




app.post('/', urlencoded, [


    // name
    check('Chapter_Name', "Chapter Name is required").exists({ checkFalsy: true }),
    check('Chapter_No', "Chapter No is required").exists({ checkFalsy: true }),
    // check('Manually', "You have not selected what you are trying to upload").exists({ checkFalsy: true }),
    check('Title', "Title is required").exists({ checkFalsy: true }),
    check('Class', "Class is required").exists({ checkFalsy: true }),
    check('subject', "Subject is required").exists({ checkFalsy: true }),


], (req, res) => {
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
                    const errors = validationResult(req)
                    if (!errors.isEmpty()) {


                        return res.status(422).json({ status: true, error: true, fields: errors.array(), req: req.body }

                        )

                    }
                    const Manually = req.body.Manually
                        // return req.body.class

                    if (Manually == false) {
                        if (req.body.text) {
                            const Chapter_Name = req.body.Chapter_Name
                            const Chapter_No = req.body.Chapter_No
                            const Title = req.body.Title
                            const Class = req.body.Class
                            const subject = req.body.subject
                            const text = req.body.text

                            const jsontoken = Math.floor(Math.random() * 10000000000) + 1

                            const username = req.body.username


                            db.query('INSERT INTO `notes`(`id`,`title`, `class`, `chapterno`, `ChapterName`, `username`, `type`, `notes`, `url`,  `subject`) VALUES (?,?,?,?,?,?,?,?,?,?)', [jsontoken, Title, Class, Chapter_No, Chapter_Name, username, Manually, text, 'none', subject], (err, result1) => {
                                if (!err) {

                                    res.send({ status: true, error: false, id: jsontoken })
                                } else {
                                    console.log(err);

                                    res.send({ status: true, error: true, mes: "Something went wrong", errors: err })

                                }
                            })
                        } else {
                            let eroror = {
                                "msg": "Type something",
                                "param": "text",
                                "location": "body"
                            }
                            return res.status(422).json({ status: true, error: true, fields: eroror })

                        }



                    } else if (Manually == false) {

                        res.send({ status: true, error: true, mes: 'Someting went Wrong' })

                    } else {

                    }
                } else {
                    return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

                }
            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", error: err })
            }
        } else {
            return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

        }
    })

})



const multer = require('multer');
const { randomUUID } = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './aseets/pdf')
    },
    filename: (req, file, callback) => {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);


        callback(null, `${req.body.jsontoken}${ext}`)




    }
})
var upload = multer({ storage: storage })

app.post('/file', upload.single('file'), (req, res) => {

    // email
    var usernames = String(req.body.username);
    var emails = String(req.body.email);
    var query_tokens = String(req.body.query_token);

    db.query('SELECT `username`,  `token`,  `email` FROM `loginlog` WHERE `token` = ?', [query_tokens], (err, result) => {
        console.log(result);
        if (!err) {
            if (!result[0] == []) {


                // res.send({ result })
                rec_username = result[0].username
                rec_emails = result[0].email
                rec_query_tokens = result[0].token


                if (usernames == rec_username & emails == rec_emails && query_tokens == rec_query_tokens) {
                    const errors = validationResult(req)
                    if (!errors.isEmpty()) {


                        return res.status(422).json({ status: true, error: true, fields: errors.array(), req: req.body }

                        )

                    }
                    const Manually = req.body.Manually

                    // return req.body.class
                    if (Manually == 'true') {

                        const Chapter_Name = req.body.Chapter_Name
                        const Chapter_No = req.body.Chapter_No
                        const Title = req.body.Title
                        const Class = req.body.Class
                        const subject = req.body.subject
                        const jsontoken = req.body.jsontoken


                        const username = req.body.username
                        db.query('INSERT INTO `notes`(`id`, `title`, `class`, `chapterno`, `ChapterName`, `username`, `type`, `notes`, `url`,  `subject`) VALUES (?,?,?,?,?,?,?,?,?,?)', [jsontoken, Title, Class, Chapter_No, Chapter_Name, username, Manually, 'none', jsontoken, subject], (err, result1) => {
                            if (!err) {

                                res.send({ status: true, error: false, id: jsontoken })
                            } else {
                                res.send({ status: true, error: true, mes: "Something went wrong", errors: err })

                            }
                        })




                    } else if (Manually == true) {

                        res.send({ status: true, error: true, mes: 'Someting went Wrong' })

                    } else {

                    }
                } else {
                    return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

                }
            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", errors: err })
            }
        } else {
            return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

        }
    })
})



module.exports = app