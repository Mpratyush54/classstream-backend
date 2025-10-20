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
    if (fs.existsSync('aseets/' + folderName + '/' + folderName + '1080' + '.mp4')) {
        if (req.headers.range) {
            const range = req.headers.range
            const videopath = 'aseets/' + folderName + '/' + folderName + '1080' + '.mp4'
            
            console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            console.log(videopath);
            console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');

            const videosize = fs.statSync(videopath).size


            const chunksize = 1 * 1e+6
            const start = Number(range.replace(/\D/g, ''))
            const end = Math.min(start + chunksize, videosize - 1);
            const contentLength = end - start + 1
            const headers = {
                "Content-range": `bytes ${start}- ${end}/${videosize}`,
                "Accept-Range": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4"
            }

            res.writeHead(206, headers)

            const stream = fs.createReadStream(videopath, { start, end })
            stream.pipe(res)

        } else {
            return res.send(422)
        }
    }
    // const output720 = 'aseets/' + folderName + '/' + folderName + '720' + '.mp4'
    // const output480 = 'aseets/' + folderName + '/' + folderName + '480' + '.mp4'
    // const output280 = 'aseets/' + folderName + '/' + folderName + '280' + '.mp4'
    // const output144 = 'aseets/' + folderName + '/' + folderName + '144' + '.mp4'

})




module.exports = app