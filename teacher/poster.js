const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');

const fs = require('fs')


// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');





const urlencoded = bodyParser.urlencoded({ extended: false })

app.get('/:id', (req, res) => {
    folderName = req.params.id.trim()

    if (fs.existsSync('aseets/' + folderName + '/' + folderName + '' + '.jpg')) {
        const videopath = 'aseets/' + folderName + '/' + folderName + '' + '.jpg'
        res.sendfile(videopath)






    } else if (fs.existsSync('aseets/' + folderName + '/' + folderName + '' + '.jpeg')) {

        const videopath = 'aseets/' + folderName + '/' + folderName + '' + '.jpeg'
        res.sendfile(videopath)



    } else {
        const videopath = 'aseets/' + '404.png'
        res.sendfile(videopath)

    }


    // const output720 = 'aseets/' + folderName + '/' + folderName + '720' + '.mp4'
    // const output480 = 'aseets/' + folderName + '/' + folderName + '480' + '.mp4'
    // const output280 = 'aseets/' + folderName + '/' + folderName + '280' + '.mp4'
    // const output144 = 'aseets/' + folderName + '/' + folderName + '144' + '.mp4'

})



module.exports = app