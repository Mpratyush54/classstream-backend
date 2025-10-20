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
    const username = req.body.student_username
    const time = req.body.time
    const id = req.body.id
    const Class = req.body.class

    db.query('SELECT  `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`,  `notes`,  `date`, `subject` FROM `notes` WHERE `type` LIKE 0 && `class` LIKE ?', [Class], (err, result) => {
        if (!err) {
            var process = result

            db.query('SELECT  `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`,  `url`,  `date`, `subject` FROM `notes` WHERE `type` LIKE ? && `class` LIKE ?', ['true', Class], (err, result) => {
                if (!err) {
                    res.status(200).json({ status: true, error: false, notes: process, pdf: result })


                } else {
                    console.log(err);
                }
            })

        } else {
            console.log(err);
        }
    })

})
app.post('/idividual', (req, res) => {

    const username = req.body.student_username
    const time = req.body.time
    const id = req.body.id
    const Class = req.body.class
    db.query('SELECT`type` FROM `notes` WHERE `id` LIKE ?', [id], (err, result) => {
        var process = result
        if (!err) {
            if (result[0].type == 0) {
                db.query('SELECT  `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`,  `notes`,  `date`, `subject` FROM `notes` WHERE   `type` LIKE 0 &&  `class` LIKE ? && `id` LIKE ?', [Class, id], (err, result1) => {
                    if (!err) {

                        res.status(200).json({ status: true, error: false, datas: result1 })

                    } else {
                        console.log(err);
                    }
                })
            } else if (result[0].type == 'true') {

                db.query('SELECT  `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`,  `url`,  `date`, `subject` FROM `notes` WHERE `type` LIKE ? && `class` LIKE ? && `id` LIKE ?', ['true', Class, id], (err, result1) => {
                    if (!err) {

                        res.status(200).json({ status: true, error: false, pdf: result1 })

                    } else {
                        console.log(err);
                    }
                })
            } else {

            }


        } else {
            console.log(err);
        }
    })

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