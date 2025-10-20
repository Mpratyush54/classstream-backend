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
    var username = req.body.username

    if (req.body.limit) {
        db.query('SELECT `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`, `type`, `notes`, `url`, `date`, `subject` FROM `notes` WHERE `username` = ? limit ?', [username, req.body.limit], (err, result1) => {
            if (!err) {

                return res.send({ status: true, error: false, fields: result1 })
            } else {
                return res.send({ status: true, error: true, mes: "Something went wrong", errors: err })

            }
        })
    } else if (req.body.all) {
        if (req.body.all == true) {
            db.query('SELECT `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`, `type`, `notes`, `url`, `date`, `subject` FROM `notes` WHERE `username` = ? ', [username], (err, result1) => {
                if (!err) {

                    return res.send({ status: true, error: false, mes: result1 })
                } else {
                    return res.send({ status: true, error: true, mes: "Something went wrong" })

                }
            })
        } else {
            db.query('SELECT `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`, `type`, `notes`, `url`, `date`, `subject` FROM `notes` WHERE `username` = ? limit 10', [username], (err, result1) => {
                if (!err) {

                    return res.send({ status: true, error: false, fields: result1 })
                } else {
                    return res.send({ status: true, error: true, mes: "Something went wrong" })

                }
            })
        }
        // 'SELECT `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`, `type`, `notes`, `url`, `date`, `subject`  FROM `notes` WHERE `username` = ? limit 10 '
    } else {
        db.query('SELECT `id`, `title`, `class`, `chapterno`, `ChapterName`, `username`, `type`, `notes`, `url`, `date`, `subject`  FROM `notes` WHERE `username` = ? limit 10 ', [username], (err, result1) => {
            if (!err) {

                return res.send({ status: true, error: false, mes: result1 })
            } else {
                return res.send({ status: true, error: true, mes: "Something went wrong", error: err })

            }
        })

    }
})





module.exports = app