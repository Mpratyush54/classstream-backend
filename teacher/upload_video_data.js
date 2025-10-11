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
app.post('/', urlencoded, [
    //Chapter_Name
    check('Chapter_Name', "Chapter Name is required").exists({ checkFalsy: true }),
    check('Chapter_Name', "Chapter Name must not contain special character").isString(),



    // Title
    check('Title', "Title is required").exists({ checkFalsy: true }),
    check('Title', "Title must not contain special character").isString(),



    //Chapter_No
    check('Chapter_No', "Chapter Number is required").exists({ checkFalsy: true }),
    check('Chapter_No', "Chapter Number must be a number").isNumeric(),

    // class 
    check('Class', "Class is required").exists({ checkFalsy: true }),
    check('Class', "Class must be a number").isNumeric(),



], (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        var Chapter_Nameee = false
        var Titleeeee = false
        var Chapter_Noeeee = false
        var Classeee = false
        var all_error = errors.array()
        var no_of_error = all_error.length


        for (var i = 0; i < no_of_error; i++) {
            var array = errors.array()[i]



            if (array['msg'] == 'Chapter Name is required') {
                Chapter_Nameee = true



            }
            if (array['msg'] == 'Title is required') {
                Titleeeee = true




            }
            if (array['msg'] == 'Chapter Number is required') {
                Chapter_Noeeee = true




            }
            if (array['msg'] == 'Class is required') {
                Classeee = true




            }


        }


        return res.status(422).json({ status: true, error: true, fields: errors.array() }

        )

    }
    var usernames = String(req.body.username);

    var Chapter_Name = String(req.body.Chapter_Name)
    var Title = String(req.body.Title)
    var Chapter_No = String(req.body.Chapter_No)
    var Class = String(req.body.Class)
    let jsontoken = dateFormat("ddmmyyyyss")
        // res.send({ jsontoken })
    db.query('INSERT INTO `videos`(`username`,  `title`, `ChapterName`, `ChapterNumber`, `class`, `id`) VALUES (?,?,?,?,?,?)', [usernames, Title, Chapter_Name, Chapter_No, Class, jsontoken], (err, result1) => {
        if (!err) {
            res.send({ status: true, error: false, id: jsontoken, class: Class })
        } else {
            res.send({ status: true, error: true, mes: "Something went wrong", error: err })

        }
    })


})
app.post('/verify-upload', (req, res) => {
    const id = req.body.id
    var folderintemp = false
    var folderinasset = false
    console.log('iii');
    if (fs.existsSync('temp/' + id)) {
        folderintemp = true
console.log(folderintemp)
    } 
    if (fs.existsSync('aseets/' + id)) {
        folderinasset = true
        console.log(folderinasset)

    }
    console.log('`````````````````````````````````````````````````````');
    console.log('`````````````````````````````````````````````````````');
    console.log(req.body.id);
if(folderintemp == true || folderinasset == true){
    if (folderintemp == true) {

        if (fs.existsSync('temp/' + id + '/' + id + '.mp4')) {
            if (fs.existsSync('temp/' + id + '/' + id + '.jpg')) {

                db.query('UPDATE `videos` SET `video`=?,`thumnail`=? WHERE `id` = ? ', [1, 1, id], (err, result) => {
                    if (!err) {
                        res.send({ status: true, error: true, mes: 'Video && Thumbnail is already uploaded' })

                    } else {
                        res.send({ status: true, error: false })

                    }
                })


            } else {
                if (fs.existsSync('temp/' + id + '/' + id + '.jpeg')) {
                    db.query('UPDATE `videos` SET `video`=?,`thumnail`=? WHERE `id` = ? ', [1, 1, id], (err, result) => {
                        if (!err) {
                            res.send({ status: true, error: true, mes: 'Video && Thumbnail is already uploaded' })

                        } else {
                            res.send({ status: true, error: false })

                        }
                    })

                }
            }

        }
    } else if (folderinasset = true) {
        console.log('aseets/' + id + '/' + id + '1080.mp4');

        if (fs.existsSync('aseets/' + id + '/' + id + '1080.mp4')) {
            if (fs.existsSync('temp/' + id + '/' + id + '.jpg')) {

                db.query('UPDATE `videos` SET `process`= ? WHERE `id` = ?', [1, id], (err, result) => {
                    if (!err) {
                        res.send({ status: true, error: true, mes: 'Video && Thumbnail is already uploaded and proceesed' })

                    } else {}
                })
            } else {
                if (fs.existsSync('temp/' + id + '/' + id + '.jpeg')) {
                    db.query('UPDATE `videos` SET `process`= ? WHERE `id` = ?', [1, id], (err, result) => {
                        if (!err) {
                            res.send({ status: true, error: true, mes: 'Video && Thumbnail is already uploaded and proceesed' })

                        } else {}
                    })
                }

            }
        }

    } else {
        res.send({ status: true, error: false })
    }
}
})
module.exports = app