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
    const errors = validationResult(req)
console.log(req.body)

// UPDATE `election_head_boy` SET `No_of_votes`= ? WHERE `id` = ?

 
    var id = String(req.body.id)

        // res.send({ jsontoken })
    db.query('SELECT`No_of_votes` FROM `election_head_boy` WHERE `id` = ?', [id], (err, result1) => {
        if (!err) {
votes= result1[0].No_of_votes+1
console.log(votes)
db.query('UPDATE `election_head_boy` SET `No_of_votes`= ? WHERE `id` = ?', [votes , id], (err, result1) => {
    if (!err) {
        res.send({ status: true, error: false })
    } else {
        res.send({ status: true, error: true, mes: "Something went wrong", error: err })

    }
})
        } else {
            res.send({ status: true, error: true, mes: "Something went wrong", error: err })

        }
    })


})




module.exports = app
