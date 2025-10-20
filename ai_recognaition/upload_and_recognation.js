const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const base64Img = require('base64-img');
var crypto = require('crypto');
const { Configuration, OpenAIApi } = require('openai');
const cv = require('opencv4nodejs');

const fetch = require('cross-fetch');


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);


async function main(image) {
    console.log(openai);
    console.log(openai);
    try {

        const response = await openai.createChatCompletion({
            model: "gpt-4o-mini",
            messages: [

                {
                    "role": "user",
                    "content": [{
                            "type": "image_url",
                            "image_url": {
                                "url": image
                            }
                        },
                        {
                            "type": "text",
                            "text": "extract  transform and translate table "
                        }
                    ]
                },

            ],
            temperature: 1,
            max_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "get_student_detail",
                    "description": "Get the details of a student based on provided information.",
                    "strict": true,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "Date of Application": {
                                "type": "string",
                                "description": "date in DD-MM-YYYY format",
                            },
                            "Name in English": {
                                "type": "string"
                            },
                            "Name in Hindi": {
                                "type": "string"
                            },
                            "Father's Name in English": {
                                "type": "string"
                            },
                            "Father's Name in Hindi": {
                                "type": "string"
                            },
                            "Mother's Name in English": {
                                "type": "string"
                            },
                            "Mother's Name in Hindi": {
                                "type": "string"
                            },
                            "Parents Address in English": {
                                "type": "string"
                            },
                            "Parents Address in Hindi": {
                                "type": "string"
                            },
                            "Pincode": {
                                "type": "integer"
                            },
                            "Scholar's date of birth": {
                                "type": "string",
                                "description": "date in DD-MM-YYYY format",

                            },
                            "Mobile No": {
                                "type": "string",
                                "description": "Make shure it is a mobile no"
                            },
                            "Aadhar no": {
                                "type": "string",
                                "description": "Make shure it is aadhaar No"
                            },
                            "Gender": {
                                "type": "string",
                                "enum": ["Male", "Female", "Transgender"]
                            },
                            "Category / Caste": {
                                "type": "string",
                                "enum": ["General", "SC", "ST", "OBC"]
                            },
                            "Minority Group": {
                                "type": "string",
                                "enum": ["N/A", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"]
                            },
                            "Class to which admission is sought": {
                                "type": "integer",
                                "enum": [6, 7, 8, 9, 10]
                            },
                            "Father's Occupation": {
                                "type": "string"
                            },
                            "Name, Address of the local guardian": {
                                "type": "string"
                            },
                            "Duration of Stay of the Scholar in State": {
                                "type": "string"
                            },
                            "Religion": {
                                "type": "string"
                            }
                        },
                        "additionalProperties": false,
                        "required": [
                            "Date of Application",
                            "Name in English",
                            "Name in Hindi",
                            "Father's Name in English",
                            "Father's Name in Hindi",
                            "Mother's Name in English",
                            "Mother's Name in Hindi",
                            "Parents Address in English",
                            "Parents Address in Hindi",
                            "Pincode",
                            "Scholar's date of birth",
                            "Mobile No",
                            "Aadhar no",
                            "Gender",
                            "Category / Caste",
                            "Minority Group",
                            "Class to which admission is sought",
                            "Father's Occupation",
                            "Name, Address of the local guardian",
                            "Duration of Stay of the Scholar in State",
                            "Religion"
                        ]
                    }
                }
            }




        });


        console.log(response);

        return response.data;

    } catch (error) {
        console.error('Error processing image:', error);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        // throw error; // Re-throw or handle the error accordingly

    }

}









let jsonFile = require('jsonfile');


const db = require('../database/index')

// const dotenv = require('dotenv');

// dotenv.config({ path: './../.env' })

const date_now = Date.now()
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Student_entrance_form/');
    },
    filename: (req, file, cb) => {
        extention = file.originalname.split('.').pop();

        cb(null, Date.now() + '-' + Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000 + '.' + extention);


    },
});
const upload = multer({ storage: storage });


app.post('/', upload.single('file'), (req, res) => {
    console.log('frfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    console.log(req.student_username);
    console.log(req.body[0]);
    var usernames = String(req.body.student_username);
    var emails = String(req.body.student_email);
    var query_tokens = String(req.body.student_query_token)
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a file.' });
    }

    db.query('SELECT `username`,  `token`,  `email` FROM `loginlog` WHERE `token` = ?', [query_tokens], (err, result) => {
        if (!err) {

            if (!result[0] == []) {
                // res.send({ result })
                rec_username = result[0].username
                rec_emails = result[0].email
                rec_query_tokens = result[0].token


                if (usernames == rec_username & emails == rec_emails && query_tokens == rec_query_tokens) {

                    const jsonData = Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;

                    console.log(jsonData);

                    db.query('INSERT INTO processing_data (id, username, image_name,  status) VALUES (?, ?, ?, ?)', [jsonData, req.body.student_username, req.file.filename, 'pending'], async(err, result) => {
                        if (!err) {
                            extention = req.file.originalname.split('.').pop();

                            // const base64String =`data:image/${extention};base64,` + base64Img.base64Sync('Student_entrance_form/' + req.file.filename).split(',')[1];
                            const base64String = `https://api.pratyushh.online/api/photo/photo/${jsonData}`
                            console.log(base64String);
                            images_genrated = []

                            data = await main(base64String)
                                // data =  "Data not found"
                            const image = cv.imread('Student_entrance_form/' + req.file.filename);

                            // console.log(image);

                            const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
                            const detectedFaces = classifier.detectMultiScale(image).objects;
                            console.log(detectedFaces);

                            detectedFaces.forEach((faceRect, index) => {

                                data = faceRect.height * faceRect.width
                                if (data < 15 * 1024) { // 10KB in bytes

                                } else {
                                    // console.log(stats.size);

                                    images_genrated.push(faceRect)

                                }
                            })
                            images_genrated.forEach((faceRect, index) => {


                                const padding = 40; // Adjust this value as needed

                                // Expand the bounding box
                                const expandedFaceRect = new cv.Rect(
                                    Math.max(faceRect.x - padding, 0),
                                    Math.max(faceRect.y - padding, 0),
                                    Math.min(faceRect.width + 2 * padding, image.cols - faceRect.x + padding),
                                    Math.min(faceRect.height + 2 * padding, image.rows - faceRect.y + padding)
                                );

                                // Crop the detected face with the expanded rectangle
                                const croppedFace = image.getRegion(expandedFaceRect);

                                // Crop the detected face
                                cv.imwrite(`temp/${jsonData}_${index}.jpg`, croppedFace);

                            });


                            db.query('UPDATE processing_data SET status = ?, jsondata = ? WHERE id = ?', ['completed', JSON.stringify(data), jsonData], (err, result) => {
                                if (err) {
                                    console.error('Error updating status:', err);
                                }
                            });








                            res.status(200).json({ status: true, error: err, id: jsonData, message: 'File uploaded successfully', file: req.file, data: data })

                        } else {
                            console.log(err);
                            return res.status(400).send({ status: true, error: err, message: 'Someeeeeeeeee', file: req.file });

                        }
                    })

                } else {
                    console.log("user is loged out");

                    return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

                }




            } else {
                console.log(result);
                console.log(err);

                res.send({ status: true, error: true, mes: "Something went wrong" })
            }
        } else {
            console.log("user is loged out 3");

            return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

        }
    })





    // res.status(200).json({ message: 'File uploaded successfully', file: req.file })

})





module.exports = app