const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');


const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');


const urlencoded = bodyParser.urlencoded({ extended: false })






app.use('/upload-data', require('./upload_data'))
app.use('/fetch-data', require('./fetch_data'))
app.use('/delete', require('./delete'))
app.use('/vote', require('./votefor'))

// app.use('/data-check', require('./verify_data'))
// app.use('/processvideo', require('./processvideo'))
// app.use('/notes_fetch', require('./notes_fetch'))
// app.use('/notes_manage', require('./notes_manage'))
// app.use('/signup', require('./signup'))
// app.use('/live/live-setup', require('./connetion_teacher'))
// app.use('/chat', require('./connetion_teacher'))

module.exports = app
