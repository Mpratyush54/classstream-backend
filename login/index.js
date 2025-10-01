const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const jwt = require('jsonwebtoken')

let jsonFile = require('jsonfile');


const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');
const { die } = require('random-js');


const urlencoded = bodyParser.urlencoded({ extended: false })

// For Login
app.post('/', urlencoded, [
    //email
    check('name', "Username is required").exists({ checkFalsy: true }),
    check('name', "Username can not be longer then 50 char").isLength({ max: 50 }),



    //pasword
    check('password', "Password is required").exists({ checkFalsy: true }),
    check('password', "Password must be atlest 8 characters long").isLength({ min: 8 }),
    check('password', "Password must contain lowercase , uppercase , numbers , special charecters").isStrongPassword()

], (req, res) => {
    let password_eror = ""
    let passwordeee = false
    let username_eror = ""
    let usermaeeee = false
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        var all_error = errors.array()
        var no_of_error = all_error.length


        for (var i = 0; i < no_of_error; i++) {
            var array = errors.array()[i]



            if (array['msg'] == 'Username is required') {
                usermaeeee = true
                username_eror = array['msg']


            }
            if (array['msg'] == 'Password is required') {
                passwordeee = true
                password_eror = array['msg']



            }

        }

        if (usermaeeee == true && passwordeee == true) {
            return res.status(200).json({ status: true, error: true, fields: '0', premsg: "Username and Password are empty" })

        }
        if (passwordeee == true) {
            return res.status(200).json({ status: true, error: true, fields: '1', premsg: " Password is empty" })

        }
        if (usermaeeee == true) {
            return res.status(200).json({ status: true, error: true, fields: '2', premsg: "Username is empty" })

        }

        return res.status(200).json({ status: true, error: true, fields: errors.array() }

        )
    }
    var userame = String(req.body.name);
    var password = String(req.body.password);
    db.query('SELECT * FROM `login` WHERE  `username` = ? limit 1', [userame], (err, result) => {
        let jsontoken = Math.floor(Math.random() * (1000000000 - 9999999999)) + 1000000000

        if (!err) {
            if (result[0]) {

                if (result[0].username) {
                    if (result[0].username == userame) {

                        var hcf = result[0].username
                        let serverpassword = (result[0].password);
                        const verified = bcrypt.compareSync(password, serverpassword);
                        if (verified) {


                            var resemail = result[0].email
                            var resname = result[0].name
                            var resuseraname = result[0].username
                            var status = result[0].status
                            var role = result[0].role
                            var Class = result[0].class
                            if (status == 1) {


                                const dates = new Date();





                                var date = dateFormat(dates, "ddmmyyyyhhmmss")
                                const token = jsontoken

                                const sign_token = { email: resemail, username: resuseraname, class: Class, name: resname, query_token: token, role: role }
                                const atoken = jwt.sign(sign_token, process.env.crypto)
                                console.log();
                                db.query('INSERT INTO `loginlog`(`username`, `date`, `token`, `name`, `email`, `auth_token`) VALUES (?,?,?,?,?,?)', [resuseraname, date, token, resname, resemail, atoken], (err, result) => {
                                    if (!err) {

                                        res.send({ status: true, error: false, login: true, email: resemail, username: hcf, class: Class, name: resname, query_token: token, role: role })

                                    } else {
                                        if (err.sqlMessage == `Duplicate entry '${resname}' for key 'name'`) {



                                            db.query('UPDATE `loginlog` SET `date`=?,`token`=?, `auth_token` = ? WHERE `username`=?', [date, token, atoken, resuseraname], (err, result) => {
                                                if (!err) {
                                                    res.send({ status: true, error: false, login: true, email: resemail, username: resuseraname, class: Class, name: resname, query_token: token, role: role })

                                                } else {
                                                    console.log(err);
                                                }
                                            })
                                        } else if (err.sqlMessage == `Duplicate entry '${resemail}' for key 'email'`) {
                                            db.query('UPDATE `loginlog` SET `date`=?,`token`=? ,`auth_token` = ?  WHERE `username`=?', [date, token, atoken, resuseraname], (err, result) => {
                                                if (!err) {

                                                    res.send({ status: true, error: false, login: true, email: resemail, username: resuseraname, class: Class, name: resname, query_token: token, role: role, query_token2: atoken })

                                                } else {
                                                    console.log(err);
                                                }
                                            })
                                        } else {
                                            res.send({ status: true, error: true, mes: "Something Went wrong" })

                                        }

                                    }
                                })
                            } else {
                                res.send({ status: true, error: true, mes: "Banned by school/teacher" })

                            }

                        } else {


                            res.send({ status: true, error: true, mes: "Invalid Details" })

                        }
                    } else {
                        return res.send({ status: true, error: true, mes: "Invalid Details" })

                    }
                } else {
                    return res.send({ status: true, error: true, mes: "Invalid Details" })

                }
            } else {
                return res.send({ status: true, error: true, mes: "Invalid Details" })

            }

        } else {


            res.send({ status: true, error: true, mes: "Something went wrong" });

        }
    })

});


module.exports = app