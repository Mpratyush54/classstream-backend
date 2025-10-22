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


async function getusername(username, email) {

}

app.post('/', async(req, res) => {
    var username = String(req.body.student_username);
    var email = String(req.body.student_email);


    const [userRows] = await new Promise((resolve, reject) => {
        db.query(
            "SELECT username, role, class FROM login WHERE username=? OR email=? LIMIT 1", [username, email],
            (err, rows) => (err ? reject(err) : resolve(rows))

        );

    });
    console.log("Data", userRows.class)
    db.query('SELECT * FROM `videos` where `process` = 1 && `video` =1 && `thumnail` =1 && `class` = ?', [userRows.class], (err, result) => {
        var process = result[0]
        console.log(result);

        if (!err) {

            res.status(200).json({ status: true, error: false, process: result })



        } else {
            console.log(err);

        }
    })


})



module.exports = app