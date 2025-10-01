const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");

const fs = require('fs');
const path = require('path');
const base64Img = require('base64-img');

let jsonFile = require('jsonfile');

const db = require('../database/index')


// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');



app.use(
    (req, res, next) => {

        // email
        var usernames = String(req.body.student_username);
        var emails = String(req.body.student_email);
        var query_tokens = String(req.body.student_query_token);

        db.query('SELECT `username`,  `token`,  `email` FROM `loginlog` WHERE `token` = ?', [query_tokens], (err, result) => {
            if (!err) {

                if (!result[0] == []) {
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
                    res.send({ status: true, error: true, mes: "Something went wrong" })
                }
            } else {
                return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

            }
        })
    }
)

const urlencoded = bodyParser.urlencoded({ extended: false })





app.use('/upload-pending', require('./pending_upload'))


module.exports = app
