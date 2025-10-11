const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");


let jsonFile = require('jsonfile');

const fs = require('fs')

const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');





const urlencoded = bodyParser.urlencoded({ extended: false })

app.post('/', (req, res) => {


    db.query('SELECT * FROM `user_data` ', [], (err, result) => {
        var process = result[0]
        if (!err) {

            res.send({ status: true, error: false, data: result })



            // res.status(200).json({ status: true, error: false, mes: result })
        } else {

        }
    })



});
app.post('/fill-form', (req, res) => {
console.log(req.body.class)

    db.query('SELECT `sr_no`,`unique_identification_no`  FROM `user_data` WHERE `class` Like ? ORDER BY `sr_no` ASC', [req.body.class], (err, result) => {
        if (!err) {
            console.log(result)

            res.send({ status: true, error: false, data: result })



            // res.status(200).json({ status: true, error: false, mes: result })
        } else {
            console.log(err)

        }
    })



});

app.post('/fetch-pdf', (req, res) => {


    db.query('SELECT *  FROM `user_data` WHERE `sr_no` =?', [req.body.sr_no], (err, result) => {
        var process = result[0]
        if (!err) {

            res.send({ status: true, error: false, data: result[0] })



            // res.status(200).json({ status: true, error: false, mes: result })
        } else {

        }
    })



});

app.post('/fetch-details', (req, res) => {


    db.query('SELECT *  FROM `user_data` WHERE `unique_identification_no` =?', [req.body.unique_identification_no], (err, result) => {
        // var process = result[0]
        if (!err) {


            res.send({ status: true, error: false, data: result[0] })



            // res.status(200).json({ status: true, error: false, mes: result })
        } else {

        }
    })



});
app.post('/search-data', (req, res) => {

const dataddd= `%${req.body.serarch_data}%`
    db.query('SELECT * FROM `user_data` WHERE `Address` LIKE ?     OR `Address_in_hindi` LIKE ? OR  `AdharNo`LIKE ? OR  `Date_of_birth`LIKE ? OR   `Father_Name_english`LIKE ? OR    `Father_Name_hindi`LIKE ? OR  `MinorityGroups`LIKE ? OR  `MobileNo`LIKE ? OR    `MotherTongue`LIKE ? OR   `Mother_Name_english`LIKE ? OR  `Mother_Name_hindi`LIKE ? OR   `Name_english`LIKE ? OR    `Name_hindi`LIKE ? OR  `Pincode`LIKE ? OR`SelectCategory`LIKE ? OR`gender`LIKE ? OR`croppedImage`LIKE ? OR`croppedImageAdhar`LIKE ? OR`croppedImageAdhar2`LIKE ? OR`sr_no`LIKE ? OR`admission_date`LIKE ? OR`By_user`LIKE ? OR`Admission_no`LIKE ? OR`Roll_no`LIKE ? OR`Session`LIKE ? OR`unique_identification_no`LIKE ? OR`croppedImageSig`LIKE ? OR`class`LIKE ? ', 
                                              [dataddd,    dataddd,        dataddd,  dataddd,       dataddd,              dataddd,          dataddd,       dataddd,   dataddd,     dataddd,             dataddd,           dataddd,       dataddd,   dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,dataddd,], (err, result) => {
        var process = result
        if (!err) {

            res.send({ status: true, error: false, data: result })



            // res.status(200).json({ status: true, error: false, mes: result })
        } else {
console.log(err)
        }
    })



});

app.post('/edit-data', (req, res) => {


    db.query('SELECT *  FROM `user_data` WHERE `unique_identification_no` =?', [req.body.unique_identification_no], (err, result) => {
        var process = result[0]
        if (!err) {

            res.send({ status: true, error: false, data: result[0] })



            // res.status(200).json({ status: true, error: false, mes: result })
        } else {

        }
    })


    


});


app.post('/update-edit-data', (req, res) => {


    db.query('SELECT *  FROM `user_data` WHERE `unique_identification_no` =?', [req.body.unique_identification_no], (err, result) => {
        var process = result[0]
        if (!err) {

            res.send({ status: true, error: false, data: result[0] })



            // res.status(200).json({ status: true, error: false, mes: result })
        } else {

        }
    })


    


});

module.exports = app