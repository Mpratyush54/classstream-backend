const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');


const db = require('../database/index')
    // video things requered
const fs = require('fs-extra')
const util = require('util')
const exec = util.promisify(require('child_process').exec);
const pathToFfmpeg = require('ffmpeg-static')

// end video
// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');


const urlencoded = bodyParser.urlencoded({ extended: false })
app.post('/', (req, res) => {

    videoid = req.body.video_id
    db.query('SELECT id FROM `videos` WHERE `id` = ?', [videoid], (err, result) => {
        if (!err) {

            let folderName = videoid
            const videoEncoder = 'h264'
            const input = 'temp/' + folderName + '/' + folderName + '.mp4'
            const output1080 = 'aseets/' + folderName + '/' + folderName + '1080' + '.mp4'
            const output720 = 'aseets/' + folderName + '/' + folderName + '720' + '.mp4'
            const output480 = 'aseets/' + folderName + '/' + folderName + '480' + '.mp4'
            const output240 = 'aseets/' + folderName + '/' + folderName + '280' + '.mp4'
            const output144 = 'aseets/' + folderName + '/' + folderName + '144' + '.mp4'



            // if (fs.existsSync('temp/' + folderName + '/' + folderName + '.mp4')) {


            const exec = util.promisify(require("child_process").exec);

            const debug = false;


            (async function() {

                try {

                    console.log("Initializing temporary files");
                    if (fs.existsSync('aseets/' + folderName)) {} else {
                        await fs.mkdir('aseets/' + folderName);

                    }


                    console.log("Decoding");
                    let our1080 = false
                        // let our720 = false
                        // let our480 = false
                        // let our240 = false
                    let our144 = false
                    if (fs.existsSync(output1080)) {
                        our1080 = true
                    } else {
                        
                        await exec(`ffmpeg -i ${input} -b:v 5000k   ${output1080}`);
                        // 5000
                        our1080 = true
                            // ffmpeg -i 01092021031080.mp4 -vf scale=1920:1080 -c:v omx_enc_hevc -omx_core omxil_core.dll -omx_name OMX.MAINConcept.enchevc.video -omx_pram "preset=dash1:acc_type=sw" output.mp4

                    }
                    // if (fs.existsSync(output720)) {
                    //     our720 = true
                    // } else {
                    //     await exec(`ffmpeg -i ${input} -b:v 2500k   ${output720}`);
                    //     // 2500

                    //     our720 = true
                    // }
                    // if (fs.existsSync(output480)) {
                    //     our480 = true
                    // } else {
                    //     await exec(`ffmpeg -i ${input} -b:v 1200k ${output480}`);
                    //     // 1200
                    //     our480 = true

                    // }
                    // if (fs.existsSync(output240)) {
                    //     our240 = true
                    // } else {
                    //     await exec(`ffmpeg -i ${input} -b:v 700k ${output240}`);
                    //     // 700
                    //     our240 = true

                    // }
                    // if (fs.existsSync(output144)) {
                    //     // 350
                    //     our144 = true
                    // } else {
                    //     await exec(`ffmpeg -i ${input}  -b:v 350k ${output144}`);
                    //     our144 = true

                    // }

                    if (our1080 == true) {


                        if (fs.existsSync('temp/' + folderName + '/' + folderName + '.jpg')) {
                            fs.rename('temp/' + folderName + '/' + folderName + '.jpg', 'aseets/' + folderName + '/' + folderName + '.jpg')



                        }
                        if (fs.existsSync('temp/' + folderName + '/' + folderName + '.jpeg')) {
                            fs.rename('temp/' + folderName + '/' + folderName + '.jpeg', 'aseets/' + folderName + '/' + folderName + '.jpeg')

                        }

                        db.query('UPDATE `videos` SET `process`= ? WHERE `id` = ?', [1, req.body.video_id], (err, result) => {
                            if (!err) {
                                res.send({ status: true, error: false, mes: 'Video proccsed successfully' })

                            } else {}
                        })
                    } else {
                        res.send({ status: true, error: true, mes: 'Something went Wrong' })
                    }
                } catch (error) {

                    console.log("An error occurred:", error);

                    if (debug === false) {


                    }

                }

            })();




            // } else {
            //     res.send('somthing')
            // }
        } else {
            return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

        }
    })

})




module.exports = app