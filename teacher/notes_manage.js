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


app.post('/delete', (req, res) => {
    db.query('DELETE FROM `notes` WHERE `id` = ?', [req.body.id], (err, result) => {
        if (!err) {

            return res.send({ status: true, error: false })
        } else {
            return res.send({ status: true, error: true, mes: "Something went wrong" })

        }
    })
})

module.exports = app