const express = require('express');
const app = express.Router();
const dateFormat = require('dateformat');
const jwt = require('jsonwebtoken');
const db = require('../database/index');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { randomUUID } = require('crypto');
const SessionLog = require('../models/LoginAudit');

const mongo = require('../database/mongo.cjs');
const urlencoded = bodyParser.urlencoded({ extended: false });

// LOGIN ROUTE
app.post('/', urlencoded, [
    check('name', "Username is required").exists({ checkFalsy: true }),
    check('name', "Username can not be longer then 50 char").isLength({ max: 50 }),
    check('password', "Password is required").exists({ checkFalsy: true }),
    check('password', "Password must be atlest 8 characters long").isLength({ min: 8 }),
    check('password', "Password must contain lowercase , uppercase , numbers , special charecters").isStrongPassword()
], async(req, res) => {
    console.log('✅ Login API hit');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsgs = errors.array();
        const userEmpty = errorMsgs.some(e => e.msg.includes('Username is required'));
        const passEmpty = errorMsgs.some(e => e.msg.includes('Password is required'));

        if (userEmpty && passEmpty)
            return res.status(200).json({ status: true, error: true, fields: '0', premsg: "Username and Password are empty" });
        if (passEmpty)
            return res.status(200).json({ status: true, error: true, fields: '1', premsg: " Password is empty" });
        if (userEmpty)
            return res.status(200).json({ status: true, error: true, fields: '2', premsg: "Username is empty" });

        return res.status(200).json({ status: true, error: true, fields: errorMsgs });
    }

    const userame = String(req.body.name);
    const password = String(req.body.password);
    const { deviceId, deviceName, platform, browser, appVersion } = req.body; // 👈 optional device info

    db.query('SELECT * FROM `login` WHERE  `username` = ? limit 1', [userame], async(err, result) => {
        const jsontoken = Math.floor(Math.random() * (1000000000 - 9999999999)) + 1000000000;

        if (err) return res.send({ status: true, error: true, mes: "Something went wrong" });
        console.log(result[0].username)
        console.log(userame)
        if (!result[0] || !result[0].username || result[0].username !== userame) {

            return res.send({ status: true, error: true, mes: "Invalid Details" });
        }


        const serverpassword = result[0].password;
        const verified = bcrypt.compareSync(password, serverpassword);
        if (!verified) {
            await new SessionLog({
                username: userame,
                email: result[0].email,
                role: result[0].role,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                status: 'revoked',
                action: 'login',
                message: 'Invalid password'
            }).save();
            return res.send({ status: true, error: true, mes: "Invalid Details" });
        }

        // Success
        const resemail = result[0].email;
        const resname = result[0].name;
        const resuseraname = result[0].username;
        const status = result[0].status;
        const role = result[0].role;
        const Class = result[0].class;

        if (status != 1) {

            return res.send({ status: true, error: true, mes: "Banned by school/teacher" });
        }
        const dates = new Date();
        const date = dateFormat(dates, "ddmmyyyyhhmmss");
        const token = jsontoken;
        const sign_token = { email: resemail, username: resuseraname, class: Class, name: resname, query_token: token, role: role };
        const atoken = jwt.sign(sign_token, process.env.crypto);

        try {
            // 🔒 Revoke existing active sessions for same username
            await SessionLog.updateMany({ username: resuseraname, status: 'active' }, { $set: { status: 'revoked', message: 'Revoked due to new login', action: 'logout' } });

            // 🧠 Log this session with device info
            await new SessionLog({
                username: resuseraname,
                email: resemail,
                role,
                class: Class,
                deviceId,
                deviceName,
                platform,
                browser,
                appVersion,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                query_token: token,
                jwt: atoken,
                action: 'login',
                status: 'active',
                message: 'Login successful'
            }).save();
        } catch (mongoErr) {
            console.error('Mongo logging error:', mongoErr);
        }

        // 🗄️ MySQL update / insert
        db.query('INSERT INTO `loginlog`(`username`, `date`, `token`, `name`, `email`, `auth_token`) VALUES (?,?,?,?,?,?)', [resuseraname, date, token, resname, resemail, atoken],
            (err, result) => {
                if (!err) {
                    return res.send({ status: true, error: false, login: true, email: resemail, username: resuseraname, class: Class, name: resname, query_token: token, role: role });
                } else {
                    if (err.sqlMessage.includes(`Duplicate entry '${resname}' for key 'name'`)) {
                        db.query('UPDATE `loginlog` SET `date`=?,`token`=?, `auth_token` = ? WHERE `username`=?', [date, token, atoken, resuseraname], (err, resul) => {
                            return res.send({ status: true, error: false, login: true, email: resemail, username: resuseraname, class: Class, name: resname, query_token: token, role: role });
                        });
                    } else if (err.sqlMessage.includes(`Duplicate entry '${resemail}' for key 'email'`)) {
                        db.query('UPDATE `loginlog` SET `date`=?,`token`=?, `auth_token` = ? WHERE `username`=?', [date, token, atoken, resuseraname], (err, resu) => {
                            return res.send({ status: true, error: false, login: true, email: resemail, username: resuseraname, class: Class, name: resname, query_token: token, role: role });

                        });
                    } else {
                        return res.send({ status: true, error: true, mes: "Something Went wrong" });
                    }
                }
            });
    });
});

module.exports = app;