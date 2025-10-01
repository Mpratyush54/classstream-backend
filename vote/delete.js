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


const urlencoded = bodyParser.urlencoded({ extended: false })
app.post('/', urlencoded, (req, res) => {
    const errors = validationResult(req)
console.log(req.body)



    var id = String(req.body.id);

    var Post = String(req.body.Post)
    var img = String(req.body.image)

        // res.send({ jsontoken })
    db.query('DELETE FROM `election_head_boy` WHERE `id`  = ?', [id], (err, result1) => {
        if (!err) {
            res.send({ status: true, error: false })
        } else {
            res.send({ status: true, error: true, mes: "Something went wrong", error: err })

        }
    })


})




module.exports = app
