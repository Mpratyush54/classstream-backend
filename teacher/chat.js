const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const jwt = require('jsonwebtoken')

let jsonFile = require('jsonfile');

const fs = require('fs')
const dotenv = require('dotenv');
dotenv.config({ path: './.env' })
const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');


const crypto = require("crypto");
const { log } = require('console');

// INSERT INTO `chats`(`id`, `message`, `user`, `room`, `time`) VALUES ([value-1],[value-2],[value-3],[value-4],[value-5])

app.get('/save-chat', (req, res) => {
console.log('fffffffffffffffffffffffffffffffffff')
console.log('fffffffffffffffffffffffffffffffffff')
console.log('fffffffffffffffffffffffffffffffffff')
console.log('fffffffffffffffffffffffffffffffffff')
console.log('fffffffffffffffffffffffffffffffffff')
console.log('fffffffffffffffffffffffffffffffffff')
    db.query('INSERT INTO `chats`( `message`, `user`, `room`) VALUES (?,?,?,?,?)', [req.body.message, req.body.user , req.body.room], (err, result) => {
        if (!err) {

           


            res.status(200).json({ status: true, error: false })
        } else {

        }
    })

})
app.get('/get-chat', (req, res) => {
   

})



module.exports = app