const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
var UserAgent = require('user-agents');
var equal = require('deep-equal');

// seen




const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');





const urlencoded = bodyParser.urlencoded({ extended: false })
const webpush = require('web-push');
const { lchmod } = require('fs');
const { url } = require('inspector');
const { json } = require('body-parser');
const { JsonWebTokenError } = require('jsonwebtoken');

app.use('/',
    (req, res, next) => {

        // email — req.body is undefined on GET/HEAD (no JSON body) which crashed prod with
        // "Cannot read properties of undefined (reading 'username')"
        const body = req.body || {};
        var usernames = String(body.username || '');
        var emails = String(body.email || '');
        var query_tokens = String(body.query_token || '');

        db.query('SELECT `username`,  `token`,  `email` FROM `loginlog` WHERE `token` = ?', [query_tokens], (err, result) => {
            if (!err) {

                if (result && result.length) {



                    // res.send({ result })
                    rec_username = result[0].username
                    rec_emails = result[0].email
                    rec_query_tokens = result[0].token


                    if (usernames == rec_username & emails == rec_emails && query_tokens == rec_query_tokens) {
                        next()
                    } else {
                        return res.status(403).json({ status: true, error: true, mes: "user is loged out" })

                    }
                } else {
                    return res.status(403).json({ status: true, error: true, mes: "user is loged out" })
                }
            } else {
                return res.status(403).json({ status: true, error: true, mes: "user is loged outs" })

            }
        })
    })


app.post('/check-notifaction-custom', (req, res) => {
    var usernames = String(req.body.username);

    db.query('SELECT * FROM `notifiction` WHERE  `by` = ? GROUP BY `sttus_seen_time`   ', [usernames], (err, result) => {
        if (!err) {

            if (!result[0] == []) {

                res.send({ status: true, error: false, mes: result })

            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", errora: err, mes: result })
            }
        } else {
            console.log(err);
            return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

        }
    })
})
app.post('/check-notifaction-custom2', (req, res) => {
    var usernames = String(req.body.username);
    var data = String(req.body.data);

    db.query('SELECT * FROM `notifiction` WHERE   `sttus_seen_time` LIKE ?', [data], (err, result) => {
        if (!err) {

            if (!result[0] == []) {

                res.send({ status: true, error: false, mes: result })

            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", errora: err })
            }
        } else {
            console.log(err);
            return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

        }
    })
})
app.post('/know_class', (req, res) => {
    var usernames = String(req.body.username);
    var usename = String(req.body.data);

    db.query('SELECT  `class` FROM `login` WHERE `username` = ?', [usename], (err, result) => {
        if (!err) {

            if (!result[0] == []) {

                res.send({ status: true, error: false, mes: result })

            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", errora: err })
            }
        } else {
            return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

        }
    })
})

app.post('/check-notifaction', (req, res) => {
    var usernames = String(req.body.username);

    db.query('SELECT * FROM `notifiction` WHERE  `username` = ? && `status`  = ? && `sent`=? ', [usernames, 1, 1], (err, result) => {
        if (!err) {

            if (!result[0] == []) {
                const dates = new Date();
                var json = dateFormat(dates, "ddmmyyyyhhmmss")

                res.send({ status: true, error: false, notify: result, time: json })
                db.query('UPDATE `notifiction` SET `sent`=? WHERE `username`  = ?', [2, usernames], (err, result) => {
                    if (!err) {


                    } else {
                        return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

                    }
                })

            } else {
                res.send({ status: true, error: true, mes: "Something went wrong", errora: err })
            }
        } else {
            return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

        }
    })
})
app.post('/check-notifaction-all', (req, res) => {

    var usernames = String(req.body.username);

    db.query('SELECT * FROM `notifiction` WHERE  `username` = ? && `status`  = ? ', [usernames, 1], (err, result) => {
        if (!err) {

            if (!result[0] == []) {
                const dates = new Date();
                var json = dateFormat(dates, "ddmmyyyyhhmmss")

                res.send({ status: true, error: false, notify: result, time: json })
                db.query('UPDATE `notifiction` SET `sent`=? WHERE `username`  = ?', [2, usernames], (err, result) => {
                    if (!err) {


                    } else {
                        console.log("--------------------------");
                        console.log(err);
                        console.log("--------------------------");

                        return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

                    }
                })

            } else {
                console.log("--------------------------");
                console.log("--------------------------");

                console.log(result);
                console.log("--------------------------");

                res.send({ status: true, error: true, mes: "Something went wrong", error: err })
            }
        } else {
            console.log("--------------------------");
            console.log("--------------------------");
            console.log("--------------------------");

            console.log(err);
            console.log("--------------------------");

            return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

        }
    })
})

app.post('/seen', (req, res) => {
    let id = Number(req.body.id);
    db.query('UPDATE `notifiction` SET `status`=? WHERE id  = ?', [2, id], (err, result) => {
        if (!err) {
            return res.status(200).json({ status: true, error: false, mes: "Sucessfull" })


        } else {
            return res.status(500).json({ status: true, error: true, mes: "Soemthing Went Wrong" })

        }
    })
})

app.post('/data', urlencoded, [
    //email
    check('username', "Username is required").exists({ checkFalsy: true }),
    check('name', "Username can not be longer then 50 char").isLength({ max: 50 }),



    //pasword
    check('password', "Password is required").exists({ checkFalsy: true }),
    check('password', "Password must be atlest 8 characters long").isLength({ min: 8 }),
    check('password', "Password must contain lowercase , uppercase , numbers , special charecters").isStrongPassword()

], (req, res) => {

    const publicKey =
        'BL1k4svygg7piYjqcY8MH8XW7QAt5T9QU20hWn9wQgLgw6zgVpOOHYmGza1kknjWuc1S-rkkKKazzqGBXpEEWzU';
    const privateKey = 'ywKhgIcofvO6RRiQXufih8dhEbyibWR-epftZSFHIjg';

    const sub = req.body.data
    webpush.setVapidDetails('mailto:mpratyush54@gmail.com', publicKey, privateKey);





    const usernames = String(req.body.username);
    const random = req.body.data.deviceId


    let date = dateFormat("dd-mm-yyyy")
    let time = dateFormat("hh-MM-ss")
    var userAgent = JSON.stringify(req.body.useragent)
    var enddata = JSON.stringify(req.body.data)
        // console.log(req.body.data);





    db.query('SELECT * FROM `notification_divice_detalis` WHERE `id` = ? && `username` = ?', [req.body.data.deviceId, req.body.username], (err, result) => {
        if (!err) {

            if (result[0] && result[0].id == req.body.data.deviceId) {
                const payLoad = {
                    notification: {
                        data: { url: 'https://school.pratyushh.online/assets/images/icon/avatar-01.jpg' },
                        title: `Hello ${req.body.username}, You are already registered for notifcation`,
                        vibrate: [100, 50, 100],
                    },
                };

                res.send({ status: true, error: false, mes: 'sucessful' })

            } else {
                db.query('INSERT INTO `notification_divice_detalis`(`id`, `username`, `useragents`, `data`, `date`, `time`) VALUES (?,?,?,?,?,?)', [random, req.body.username, userAgent, enddata, date, time], (err, result) => {
                    if (!err) {
                        // data is inserted 


                        //here we are updating logginlog table to the id of notification_divice_detalis table to find regestred divice
                        db.query("SELECT  `testing_array`  FROM `login` WHERE `username` LIKE ? ", [req.body.username], (err, result) => {
                            if (!err) {
                                const rand2 = random
                                    // console.log();
                                ls = JSON.parse(result[0].testing_array)
                                ls.push(rand2)
                                console.log(ls);

                                ids = JSON.stringify(ls)
                                console.log(ids);

                                db.query('UPDATE `login` SET `testing_array`= ? WHERE `username` LIKE ? ', [ids, req.body.username], (err, result) => {
                                    if (!err) {
                                        const payLoad = {
                                            notification: {
                                                data: { url: 'https://school.pratyushh.online/assets/images/icon/avatar-01.jpg' },
                                                title: `Hello ${req.body.username}, You are sucessfully registered for notifcation`,
                                                vibrate: [100, 50, 100],
                                            },
                                        };
                                        Promise.resolve(webpush.sendNotification(req.body.data.subscription, JSON.stringify(payLoad))).then(() => {
                                            console.log('sucessful');
                                        }).catch(function(ex) {
                                            return console.log(ex);
                                        })
                                        console.log(result);
                                        res.send({ status: true, error: false, mes: 'sucessful' })
                                    } else {
                                        console.log(err);

                                        res.sendStatus(500)

                                    }
                                })


                            } else {
                                console.log(err);
                            }
                        })

                    } else {
                        console.log(err);
                    }


                })

            }
        } else {
            console.log(err);

            res.sendStatus(500)

        }
    })


    // checking part finishes

    // here we are inserting the data into notification divice details diffrent from login log




});


app.post('/new', (req, res) => {
    const usernames = String(req.body.username);
    const data = String(req.body.data);
    const heading = String(req.body.data.Title);
    const Body = String(req.body.data.Body);
    // console.log(heading);
    const dates = new Date();



    const Class = req.body.data.class;
    db.query('SELECT `username`,`testing_array`  FROM `login` WHERE `class` = ?', [Class], (err, result) => {
        if (!err) {
            console.log('recived eq');
            const random = Math.floor(Math.random() * (100000 - 999999) + 100000)
            for (let i = 0; i < result.length; i++) {
                const url = "https://school.pratyushh.online/login"
                var data = result[i]
                if (result[i].testing_array) {
                    const all_data = JSON.parse(result[i].testing_array)
                    const username_sent = result[i].username

                    console.log(username_sent);
                    db.query('INSERT INTO `notifiction`(`username`, `photo`, `heading`, `onclick`, `date`,   `body`,   `by` ,`sttus_seen_time`) VALUES (?,?,?,?,?,?,? , ?)', [username_sent, 'none', heading, url, dateFormat(dates, "dd-mm-yyyy"), Body, usernames, random], (err, result1) => {
                        if (!err) {
                            const publicKey =
                                'BL1k4svygg7piYjqcY8MH8XW7QAt5T9QU20hWn9wQgLgw6zgVpOOHYmGza1kknjWuc1S-rkkKKazzqGBXpEEWzU';
                            const privateKey = 'ywKhgIcofvO6RRiQXufih8dhEbyibWR-epftZSFHIjg';

                            webpush.setVapidDetails('mailto:mpratyush54@gmail.com', publicKey, privateKey);

                            const payLoad = {
                                notification: {
                                    data: { url: 'https://school.pratyushh.online/assets/images/icon/avatar-01.jpg' },
                                    image: "https://school.pratyushh.online/assets/images/icon/avatar-01.jpg",
                                    icon: 'https://school.pratyushh.online/assets/images/icon/avatar-01.jpg',
                                    title: `${heading}`,
                                    body: `${Body}`,
                                    vibrate: [100, 50, 100],
                                },
                            };

                            for (let y = 0; y < all_data.length;) {
                                console.log(result[i].username);
                                console.log(all_data[y]);

                                db.query('SELECT * FROM `notification_divice_detalis` WHERE `id` = ? && `username` = ?', [all_data[y], result[i].username], (err, result3) => {
                                    if (!err) {
                                        // console.log(result3);
                                        if (result3[0] && result3.length > 0) {
                                            data = JSON.parse(result3[0].data)
                                            console.log(data);

                                            Promise.resolve(webpush.sendNotification(data.subscription, JSON.stringify(payLoad))).then(() => {
                                                console.log('sucessful');
                                            }).catch(function(error) {
                                                if (error.body == "push subscription has unsubscribed or expired.", error.statusCode == 410) {
                                                    delete_notification_data(result[i].username, all_data[y])
                                                } else {
                                                    console.log(error);
                                                }
                                                console.log(error.statusCode);
                                                console.log(error.body);

                                            })
                                        } else {

                                            console.log('result[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].usernameresult[i].username');
                                            console.log(result[i].username);
                                            console.log(result);
                                            console.log(all_data[y]);
                                        }

                                    } else {
                                        console.log(err);

                                        res.sendStatus(500)

                                    }
                                })






                                y++

                            }


                        } else {
                            console.log(err);
                        }
                    })
                }
            }


            res.send({ status: true, error: false, mes: random })
        } else {
            console.log(err);
            return res.status(500).json({ status: true, error: err, mes: "Soemthing Went Wrong" })

        }
    })


});

function delete_notification_data(username, id) {

    console.log(username, id);

    db.query("SELECT  `testing_array`  FROM `login` WHERE `username` LIKE ? ", [username], (err, result) => {
        if (!err) {

            // console.log();
            ls = JSON.parse(result[0].testing_array)

            index = ls.indexOf(id)
            ls.splice(index, 1);


            ids = JSON.stringify(ls)
            console.log(ids);

            db.query('UPDATE `login` SET `testing_array`= ? WHERE `username` LIKE ? ', [ids, username], (err, result) => {
                if (!err) {
                    db.query('DELETE FROM `notification_divice_detalis` WHERE `id` = ? && `username` = ?', [id, username], (err, result) => {
                        if (!err) {
                            // data is inserted 
                            console.log("deleted" + id, username);


                            //here we are updating logginlog table to the id of notification_divice_detalis table to find regestred divice

                        } else {
                            console.log(err);
                        }


                    })
                    console.log(result);

                } else {
                    console.log(err);



                }
            })


        } else {
            console.log(err);
        }
    })




}
module.exports = app