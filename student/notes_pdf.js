const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');

const fs = require('fs')

const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult, header } = require('express-validator');



app.get('/:id', (req, res) => {
        folderName = req.params.id.trim()
        const videopath = 'aseets/pdf/' + folderName + '.pdf'
        if (fs.existsSync('aseets/pdf/' + folderName + '.pdf')) {

            res.sendfile(videopath)
        } else {

            res.sendStatus(404)
        }

    })
    // db.query('SELECT  `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`,  `notes`,  `date`, `subject` FROM `notes` WHERE `type` LIKE 0 && `class` LIKE ? &', [Class], (err, result) => {
    //     var process = result
    //     if (!err) {


//         res.status(200).json({ status: true, error: false, })

//     } else {
//         console.log(err);
//     }
// })





module.exports = app