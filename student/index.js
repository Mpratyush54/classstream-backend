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



app.use(
    (req, res, next) => {

        // Let CORS preflights through
        if (req.method === 'OPTIONS') return next();

        // email (req.body is undefined on GET/HEAD — guard against TypeError crash)
        const body = req.body || {};
        var usernames = String(body.student_username || '');
        var emails = String(body.student_email || '');
        var query_tokens = String(body.student_query_token || '');

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
    }
)
app.use('/videofetch', require('./videoindex.js'))
app.use('/videowatch', require('./videowatch'))
app.use('/notes', require('./notes'))
app.use('/settings', require('./setings'))
app.use('/live', require('./live'))
app.use('/add-student', require('./add-student'))
app.use('/photo', require('./photo'))


app.post('/verify', (req, res) => {

    res.send({ status: true, error: false, mes: "User Is Loged In" })

})


module.exports = app
