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
    const path = require('path');
    const folderName = String(req.params.id || '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
    if (!folderName) return res.status(400).json({ status: false, message: 'Invalid id' });

    if (fs.existsSync('aseets/' + folderName + '/' + folderName + '' + '.jpg')) {
        const videopath = 'aseets/' + folderName + '/' + folderName + '' + '.jpg'
        return res.sendFile(path.resolve(videopath))






    } else if (fs.existsSync('aseets/' + folderName + '/' + folderName + '' + '.jpeg')) {

        const videopath = 'aseets/' + folderName + '/' + folderName + '' + '.jpeg'
        return res.sendFile(path.resolve(videopath))



    } else {
        const videopath = 'aseets/' + '404.png'
        return res.sendFile(path.resolve(videopath))

    }


    // const output720 = 'aseets/' + folderName + '/' + folderName + '720' + '.mp4'
    // const output480 = 'aseets/' + folderName + '/' + folderName + '480' + '.mp4'
    // const output280 = 'aseets/' + folderName + '/' + folderName + '280' + '.mp4'
    // const output144 = 'aseets/' + folderName + '/' + folderName + '144' + '.mp4'

})



module.exports = app