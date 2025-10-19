const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const fs = require('fs')
const path = require('path');


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
    const id = req.body.id.trim();
    if (!id)
        return res
            .status(400)
            .json({ status: false, error: true, mes: 'Missing video id' });

    const tempDir = path.join('temp', id);
    const assetsDir = path.join('assets', id);

    const tempVideo = path.join(tempDir, `${id}.mp4`);
    const tempThumbJpg = path.join(tempDir, `${id}.jpg`);
    const tempThumbJpeg = path.join(tempDir, `${id}.jpeg`);
    const assetsVideo = path.join(assetsDir, `${id}1080.mp4`);

    // Check existence
    const hasTemp = fs.existsSync(tempDir);
    const hasAssets = fs.existsSync(assetsDir);
    const thumbExists =
        fs.existsSync(tempThumbJpg) || fs.existsSync(tempThumbJpeg);
    const videoExists =
        fs.existsSync(tempVideo) || fs.existsSync(assetsVideo);

    console.log(`Checking upload for id: ${id}`);
    console.log({ hasTemp, hasAssets, videoExists, thumbExists });

    // ✅ JSON structure for response
    const responseData = {
        status: true,
        error: false,
        message: 'Upload progress status',
        data: {
            video: videoExists,
            thumbnail: thumbExists,
            processed: hasAssets,
        },
    };

    // === ✅ Always ensure DB matches actual file state ===
    db.query('SELECT `video`, `thumnail`, `process` FROM `videos` WHERE `id`=?', [id], (err, result) => {
        if (err) {
            console.error('DB read error:', err);
            return res
                .status(500)
                .json({ status: false, error: true, mes: 'Database read failed' });
        }

        if (!result.length) {
            console.warn('Video not found in DB for ID:', id);
            return res.json(responseData);
        }

        const dbVideo = result[0].video;
        const dbThumb = result[0].thumnail;
        const dbProcess = result[0].process;

        // Build update fields dynamically
        const updateFields = {};
        if (videoExists && dbVideo == 0) updateFields.video = 1;
        if (thumbExists && dbThumb == 0) updateFields.thumnail = 1;
        if (hasAssets && dbProcess == 0) updateFields.process = 1;

        if (Object.keys(updateFields).length > 0) {
            const setClause = Object.keys(updateFields)
                .map((key) => `\`${key}\`=?`)
                .join(', ');
            const values = Object.values(updateFields);
            values.push(id);

            const query = `UPDATE \`videos\` SET ${setClause} WHERE \`id\`=?`;

            db.query(query, values, (updateErr) => {
                if (updateErr) {
                    console.error('DB update error:', updateErr);
                    return res
                        .status(500)
                        .json({ status: false, error: true, mes: 'Database update failed' });
                }

                console.log(`✅ Updated DB for ID: ${id}`, updateFields);
                return res.json(responseData);
            });
        } else {
            return res.json(responseData);
        }
    });
});


module.exports = app