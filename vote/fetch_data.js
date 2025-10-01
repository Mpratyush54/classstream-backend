const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const fs = require('fs')


let jsonFile = require('jsonfile');


const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');
const { log } = require('console');


const urlencoded = bodyParser.urlencoded({ extended: false })
app.post('/', urlencoded, (req, res) => {
    

    db.query('SELECT `Name`, `Photo`, `No_of_votes`, `Post`, `id` FROM `election_head_boy`  ',  (err, result1) => {
        if (!err) {
    
            return res.send({ status: true, error: false, mes: result1 })
        } else {
            return res.send({ status: true, error: true, mes: "Something went wrong" })
    
        }
    })
    
})



    app.post('/custom', urlencoded, (req, res) => {


        db.query('SELECT `Name`, `Photo`, `No_of_votes`, `Post`, `id` FROM `election_head_boy` where `Photo` = ?    ', [req.body.type], (err, result1) => {
            if (!err) {
                return res.send({ status: true, error: false, mes: result1 })
            } else {
                return res.send({ status: true, error: true, mes: "Something went wrong" })
        
            }
        })
        
    })

    

module.exports = app
