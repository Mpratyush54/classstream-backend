const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
var UserAgent = require('user-agents');


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
app.use('/index', (req, res) => {
    db.query('SELECT name,class,email, role,username, testing_array,status FROM `login` where class= 1 ||class= 2   ||class= 3  ||class= 4  ||class= 5  ||class= 6 ||class= 7 ||class= 8 ||class= 9 ||class= 10        ', [], (err, result) => {
        if (!err) {

            if (result) {
                data = []
                for (i = 0; i < result.length; i++) {

                    if (result[i] != '') {
                        var tem_role = ''
                        var tem_status = ''
                        var no_of_device = ''
                        if (result[i].role = 1) {
                            tem_role = 'Student'
                        }
                        if (result[i].status = 1) {
                            tem_status = 'Not Blocked'
                        } else if (result[i].status = 2) {
                            tem_status = 'Blocked'

                        }
                        if (result[i].testing_array != '') {
                            var array = JSON.parse(result[i].testing_array)
                            no_of_device = array[0].length


                        }
                        tem_data = { username: result[i].username, class: result[i].class, name: result[i].name, email: result[i].email, role: tem_role, status: tem_status, no_of_device: no_of_device }
                        data[data.length] = tem_data
                    }
                }
                return res.send({ status: true, mes: data, error: false })
            } else {

            }


        } else {
            res.send({ status: true, mes: "Something went wrong", error: err })

        }
    })
})
app.use('/user-search', (req, res) => {
        db.query('SELECT name,class,email, role,username, testing_array,status FROM `login` where     username like ? limit 1  ', [req.body.student_username], (err, result) => {
            if (!err) {

                if (result) {
                    data = []



                    var tem_role = ''
                    var tem_status = ''
                    var no_of_device = ''
                    if (result[0].role = 1) {
                        tem_role = 'Student'
                    }
                    if (result[0].status = 1) {
                        tem_status = 'Not Blocked'
                    }
                    if (result[0].testing_array != '') {
                        var array = JSON.parse(result[0].testing_array)
                        no_of_device = array[0].length


                    }
                    tem_data = { username: result[0].username, class: result[0].class, name: result[0].name, email: result[0].email, role: tem_role, status: tem_status, no_of_device: no_of_device }


                    return res.send({ status: true, mes: tem_data, error: false })
                } else {

                }


            } else {
                res.send({ status: true, mes: "Something went wrong", error: err })

            }
        })
    })
    // middle ware /api/regester usename
app.use('/', (req, res, next) => {
        // email
        var usernames = String(req.body.username);

        db.query('SELECT * FROM `login` WHERE  `username` = ? limit 1', [usernames], (err, result) => {
            if (!err) {

                if (result) {
                    if (result[0].username == usernames) {
                        // res.send(result)
                        res.send({ status: true, error: false, mes: result })

                    } else {

                        next()



                    }

                } else {
                    next()

                }


            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", error: err })

            }
        })
    })
    // middle ware /api/regester email
app.use('/', (req, res, next) => {
    // email
    var emails = String(req.body.email);

    db.query('SELECT * FROM `login` WHERE  `email` = ? limit 1', [emails], (err, result) => {
        if (!err) {
            if (result = '[]') {
                if (result[0].email == emails) {
                    // res.send(result)
                    res.send({ status: true, error: true, mes: "The email is already regesterd with us" })

                } else {

                    next()



                }
            } else {

            }
            // res.send({ status: true, error: true, mes: "Something went wrong" })

        }
    })
})


app.post('/', urlencoded, [
    //email
    check('email', "Email is required").exists({ checkFalsy: true }),
    check('email', "This Must be Email").isEmail(),
    check('email', "falid to convert email to normal").normalizeEmail(),
    check('email', "Email can not be longer then 50 char").isLength({ max: 50 }),


    // name
    check('name', "Email is required").exists({ checkFalsy: true }),
    check('name', "Name can not contain numbers or specal charecters").isString(),
    check('name', "Name can not be longer then 50 char").isLength({ max: 50 }),


    //pasword
    check('password', "Password is required").exists({ checkFalsy: true }),
    check('password', "Password must be atlest 8 characters long").isLength({ min: 8 }),
    check('password', "Password must contain lowercase , uppercase , numbers , special charecters").isStrongPassword(),
    // username
    check('username', "Username is required").exists({ checkFalsy: true }),
    check('username', "Username can not be longer then 50 char").isLength({ max: 50 })
], (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {

        return res.status(422).json({ status: true, error: true, fields: errors.array() }

        )
    }
    // email
    var usernames = String(req.body.username);
    // email
    var emails = String(req.body.email);
    // passwords
    var passwords = String(req.body.password);
    // name
    var names = String(req.body.name);
    // hahed password
    passwordshahs = bcrypt.hashSync(passwords, 10)


    // genrating otp


    // cheak the username and email may already exists


    const otp = Math.floor(100000 + Math.random() * 900000)
    const subject = 'Mr' + names + 'you were successfully registered to our portal'
    const text = 'Mr' + names + 'you were successfully registered to our portal. Your temporary password is: ' + passwords + 'Plese visit school website and navigate to login >new user > enter the details from below <br> Your details are metioned below <br> <b>Username: </b>' + usernames + '<br><b>Temprory password</b>' + passwords
    let mailOptions = nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'pratyush', // generated ethereal user
            pass: 'xsmtpsib-4197ec1ca6cc795f420a149c767e321287de8e2d21680fc0078deb72aab1f121-LCdMVvFtOPhnUwJj' // generated ethereal password
        }

    });


    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    // the user is a new user
    // db.query('INSERT INTO `login`(`username`, `password`, `name`, `email`) VALUES (?,?,?,?)', [usernames, passwordshahs, names, emails], (err, result) => {
    //     if (!err) {
    //         if (result.protocol41)
    //             suceesss = { status: true, error: false, mes: 'The user was regestered successfully' }


    //         res.send(suceesss)

    //     } else {
    //         if (err.code = "ER_DUP_ENTRY") {
    //             res.send(err);
    //         }

    //         // res.send(err);

    //     }
    // })




    // data to be inserted




});

module.exports = app