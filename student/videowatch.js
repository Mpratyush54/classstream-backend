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
app.post('/', (req, res) => {
    console.log("her here");
    const username = req.body.student_username
    const time = req.body.time
    const id = req.body.id


    db.query('INSERT INTO `videowatch`( `username`, `videoid`, `watch_time`) VALUES ([value-2],[value-3],[value-4])', (err, result) => {
        var process = result[0]
        if (!err) {




        } else {
            console.log(err);
        }
    })

})




module.exports = app