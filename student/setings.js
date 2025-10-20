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
const { LOADIPHLPAPI } = require('dns');



app.post('/', (req, res) => {

        db.query('SELECT  `testing_array` FROM `login` WHERE `username` = ?', ['hello'], (err, result) => {
            if (!err) {

                var data = JSON.parse(result[0].testing_array)[0]
                var data_finil = []
                console.log(data);
                for (let i = 0; i <= data.length; i++) {
                    console.log(i);
                    // if (data[i].useragents) {
                    //     console.log(data[i]['useragents']);
                    // }
                }
                res.send({
                        status: true,
                        error: false,
                        data: JSON.parse(result[0].testing_array)[0]
                    })
                    // const userAgents = new UserAgent();
                    // const useragent2 = [userAgents]
                    // var userAgent = JSON.stringify(useragent2)
                    // var data = { useragents: userAgents.data, userAgent2: req.body.useragent, data: userAgent }
                    // const data4 = [data, req.body.data]
                    // var data2 = [data4]
                    // var data3 = JSON.stringify(data2)

                // console.log(data);



                // var data_recived = JSON.parse(result[0].testing_array)
                // var daf = false

                // for (let i = 0; i < result.length; i++) {

                //     if (data_recived[i].data == req.body.data) {


                //     } else {


                //     }


                // }

            } else {

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