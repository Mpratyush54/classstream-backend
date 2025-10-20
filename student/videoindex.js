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


    db.query('SELECT * FROM `videos` where `process` ="1" & `video` =1& `thumnail` =1 ', (err, result) => {
        var process = result[0]
        if (!err) {

            res.status(200).json({ status: true, error: false, process: result })



        } else {}
    })


})



module.exports = app