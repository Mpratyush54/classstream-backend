const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const sizeOf = require('image-size')



let jsonFile = require('jsonfile');


const fs = require('fs')

const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');



const urlencoded = bodyParser.urlencoded({ extended: false })





app.post('/:id', (req, res) => {
    let folderName = req.params.id.trim()
    let video = false
    let photo = false






    if (fs.existsSync('temp/' + folderName + '/' + folderName + '.jpg' || 'temp/' + folderName + '/' + folderName + '.JPG')) {


        photo = 1


    }
    if (fs.existsSync('temp/' + folderName + '/' + folderName + '.jpeg')) {
        photo = 1



    }

    if (fs.existsSync('temp/' + folderName + '/' + folderName + '.mp4')) {
        video = 1


    }

    if (video == 1 && photo == 1) {

        db.query('UPDATE `videos` SET `video`=?,`thumnail`=? WHERE `id` = ? ', [video, photo, folderName], (err, result) => {
            if (!err) {
                res.send({ status: true, error: false, mes: 'Video Uploaded' })
            } else {
                return res.status(403).json({ status: true, error: true, mes: "Video Could not be uploaded" })

            }
        })




















    } else {

        res.send({ status: true, error: false, video: video, thumnai: photo })






    }






















})

module.exports = app