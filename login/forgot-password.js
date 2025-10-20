const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const jwt = require('jsonwebtoken')

let jsonFile = require('jsonfile');
const crypto = require("crypto");

const nodemailer = require("nodemailer");


const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');
const { die } = require('random-js');


const urlencoded = bodyParser.urlencoded({ extended: false })

// For Login
app.post('/', (req, res) => {

  var email = String(req.body.email);
  db.query('SELECT * FROM `login` WHERE  `email` = ? limit 1', [email], (err, result) => {

    if (!err) {
      if (result[0]) {


        if (result[0].username) {


          var hcf = result[0].username
          let serverpassword = (result[0].password);


          let jsontoken = Math.floor(Math.random() * (1000000000 - 9999999999)) + 1000000000
          var resemail = result[0].email
          var resname = result[0].name
          var resuseraname = result[0].username
          var role = result[0].role
          var Class = result[0].class


          const dates = new Date();





          var date = dateFormat(dates, "dd/mm/yyyy")
          var time = dateFormat(dates, "hh:mm:ss")
          // 

          const sign_token = { email: resemail, username: resuseraname, class: Class, name: resname, role: role }
          const atoken = jwt.sign(sign_token, process.env.crypto)
          console.log();

          db.query('INSERT INTO `reset_password`(`username`, `hash_code`, `date`, `time`, `id`) VALUES (?,?,?,?,?)', [resuseraname, atoken, date, time, jsontoken], (err, result) => {
            if (!err) {
              link = 'http://localhost:4200/forogot-password/' + resuseraname + '/' + atoken
              const sendEmail = async (mailObj) => {
                const { from, recipients, subject, message } = mailObj;

                try {
                  // Create a transporter
                  let transporter = nodemailer.createTransport({
                    host: "smtp-relay.sendinblue.com",
                    port: 587,
                    auth: {
                      user: "mpratyush54@gmail.com",
                      pass: "xsmtpsib-4197ec1ca6cc795f420a149c767e321287de8e2d21680fc0078deb72aab1f121-Gkp9mcNnywMLhHFP",
                    },
                  });

                  // send mail with defined transport object
                  let mailStatus = await transporter.sendMail({
                    from: from, // sender address
                    to: recipients, // list of recipients
                    subject: subject, // Subject line
                    text: message, // plain text
                  });

                  console.log(`Message sent: ${mailStatus.messageId}`);
                  return `Message sent: ${mailStatus.messageId}`;
                } catch (error) {
                  console.error(error);
                  throw new Error(
                    `Something went wrong in the sendmail method. Error: ${error.message}`
                  );
                }
              };

              const mailObj = {
                from: "password@pratyush.gq",
                recipients: [resemail],
                subject: `ALERT,Hi ${resname} this is a email by by System`,
                message: `
                                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">School Administration</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Please click below to reset your password. Your Password change requested on ${date} at ${time}. If you were not the pesron then please avoid to click</p>
      <a href="${link}" _blank>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Reset password</h2></a>
      <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>This was a system genrated mail please do not replay</p>
        <p>The request was made  on ${date} at ${time}.</p>
        <p>Your school</p>
      </div>
    </div>
  </div>

`,
              };

              sendEmail(mailObj).then((data) => {
                console.log(data);
                res.send({ status: true, error: false })
              });

            } else {

            }
          })

        } else {


          res.send({ status: true, error: true, mes: "Invalid Details" })


        }
      } else {
        return res.send({ status: true, error: true, mes: "Invalid Details" })

      }

    } else {


      res.send({ status: true, error: true, mes: "Something went wrong" });

    }
  })

});









app.post('/verify_data', (req, res) => {

  var username = String(req.body.username);
  var hash = String(req.body.hash);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1wcmF0eXVzaDU0QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoibXByYXR5dXNoNSIsImNsYXNzIjowLCJuYW1lIjoiUHJhdHl1c2ggTWlzaHJhIiwicm9sZSI6MiwiaWF0IjoxNjU5NDYyNTIyfQ.nMV2cmssqTzM7czv4Yf88uYdthrAH3cNQqJKBKb6AYU

data = jwt.verify(hash, process.env.crypto)
  if (data) {

    data_receved_token = jwt.decode(hash, process.env.crypto)
    if (data.username == username) {









      db.query('SELECT * FROM `login` WHERE  `username` = ? limit 1', [username], (err, result) => {

        if (!err) {
          if (result[0]) {


            if (result[0].username) {


              db.query('SELECT * FROM `reset_password` WHERE  `username` = ? limit 1 ', [result[0].username], (err, result2) => {
                if (!err) {
                  if (result2[0]) {

                    if (result2[0].hash_code == hash) {


                        res.send({ status: true, error: false })

                      // const password =bcrypt.encodeBase64(req.body.password)

                      // db.query('UPDATE `login` SET `password`= ? WHERE `username`= ?', [password,result[0].username ], (err, result) => {
                      //   if(!err){
                      //   res.send({ status: true, error: false })

                      //   }else{
                      //     res.send({ status: true, error: false })

                      //   }
                      // })

                
                      // const sendEmail = async (mailObj) => {
                      //   const { from, recipients, subject, message } = mailObj;

                      //   try {
                      //     // Create a transporter
                      //     let transporter = nodemailer.createTransport({
                      //       host: "smtp-relay.sendinblue.com",
                      //       port: 587,
                      //       auth: {
                      //         user: "mpratyush54@gmail.com",
                      //         pass: "xsmtpsib-4197ec1ca6cc795f420a149c767e321287de8e2d21680fc0078deb72aab1f121-Gkp9mcNnywMLhHFP",
                      //       },
                      //     });

                      //     // send mail with defined transport object
                      //     let mailStatus = await transporter.sendMail({
                      //       from: from, // sender address
                      //       to: recipients, // list of recipients
                      //       subject: subject, // Subject line
                      //       text: message, // plain text
                      //     });

                      //     console.log(`Message sent: ${mailStatus.messageId}`);
                      //     return `Message sent: ${mailStatus.messageId}`;
                      //   } catch (error) {
                      //     console.error(error);
                      //     throw new Error(
                      //       `Something went wrong in the sendmail method. Error: ${error.message}`
                      //     );
                      //   }
                      // };

                      // const mailObj = {
                      //   from: "password@pratyush.gq",
                      //   recipients: [resemail],
                      //   subject: `ALERT,Hi ${resname} this is a email by by System`,
                      //   message: `
                      //       <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                      //       <div style="margin:50px auto;width:70%;padding:20px 0">
                      //         <div style="border-bottom:1px solid #eee">
                      //           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">School Administration</a>
                      //         </div>
                      //         <p style="font-size:1.1em">Hi,</p>
                      //         <p>Please click below to reset your password. Your Password change requested on ${date} at ${time}. If you were not the pesron then please avoid to click</p>
                      //         <a href="${link}" _blank>
                      //         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Reset password</h2></a>
                      //         <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
                      //         <hr style="border:none;border-top:1px solid #eee" />
                      //         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                      //           <p>This was a system genrated mail please do not replay</p>
                      //           <p>The request was made  on ${date} at ${time}.</p>
                      //           <p>Your school</p>
                      //         </div>
                      //       </div>
                      //       </div>
                                              
                      //       `,
                      // };

                      // sendEmail(mailObj).then((data) => {
                      //   console.log(data);
                      //   res.send({ status: true, error: false })
                      // });

                    } else {
                      res.send({ status: true, error: false , mes:'Invalid Details' })

                    }
                  }else{
                    
                    res.send({ status: true, error: false , mes:'Invalid Details' })

                  }

                }else{
                  res.send({ status: true, error: false , mes:'Invalid Details' })

                }
              })

            } else {


              res.send({ status: true, error: true, mes: "Invalid Details" })


            }
          } else {
            return res.send({ status: true, error: true, mes: "Invalid Details" })

          }

        } else {


          res.send({ status: true, error: true, mes: "Something went wrong" });

        }
      })













































    }else{
      res.send({ status: true, error: true, mes: "Something went wrong" });

    }
  }else{
    res.send({ status: true, error: true, mes: "Something went wrong" });

  }

});


app.post('/verify_fill', (req, res) => {

  var username = String(req.body.username);
  var hash = String(req.body.hash);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1wcmF0eXVzaDU0QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoibXByYXR5dXNoNSIsImNsYXNzIjowLCJuYW1lIjoiUHJhdHl1c2ggTWlzaHJhIiwicm9sZSI6MiwiaWF0IjoxNjU5NDYyNTIyfQ.nMV2cmssqTzM7czv4Yf88uYdthrAH3cNQqJKBKb6AYU

data = jwt.verify(hash, process.env.crypto)
  if (data) {

    data_receved_token = jwt.decode(hash, process.env.crypto)
    if (data.username == username) {









      db.query('SELECT * FROM `login` WHERE  `username` = ? limit 1', [username], (err, result) => {

        if (!err) {
          if (result[0]) {


            if (result[0].username) {


              db.query('SELECT * FROM `reset_password` WHERE  `username` = ? limit 1 ', [result[0].username], (err, result2) => {
                if (!err) {
                  if (result2[0]) {

                    if (result2[0].hash_code == hash) {



                      const password =bcrypt.encodeBase64(req.body.password)

                      db.query('UPDATE `login` SET `password`= ? WHERE `username`= ?', [password,result[0].username ], (err, result) => {
                        if(!err){
                        res.send({ status: true, error: false })

                        }else{
                          res.send({ status: true, error: false })

                        }
                      })

                
                      // const sendEmail = async (mailObj) => {
                      //   const { from, recipients, subject, message } = mailObj;

                      //   try {
                      //     // Create a transporter
                      //     let transporter = nodemailer.createTransport({
                      //       host: "smtp-relay.sendinblue.com",
                      //       port: 587,
                      //       auth: {
                      //         user: "mpratyush54@gmail.com",
                      //         pass: "xsmtpsib-4197ec1ca6cc795f420a149c767e321287de8e2d21680fc0078deb72aab1f121-Gkp9mcNnywMLhHFP",
                      //       },
                      //     });

                      //     // send mail with defined transport object
                      //     let mailStatus = await transporter.sendMail({
                      //       from: from, // sender address
                      //       to: recipients, // list of recipients
                      //       subject: subject, // Subject line
                      //       text: message, // plain text
                      //     });

                      //     console.log(`Message sent: ${mailStatus.messageId}`);
                      //     return `Message sent: ${mailStatus.messageId}`;
                      //   } catch (error) {
                      //     console.error(error);
                      //     throw new Error(
                      //       `Something went wrong in the sendmail method. Error: ${error.message}`
                      //     );
                      //   }
                      // };

                      // const mailObj = {
                      //   from: "password@pratyush.gq",
                      //   recipients: [resemail],
                      //   subject: `ALERT,Hi ${resname} this is a email by by System`,
                      //   message: `
                      //       <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                      //       <div style="margin:50px auto;width:70%;padding:20px 0">
                      //         <div style="border-bottom:1px solid #eee">
                      //           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">School Administration</a>
                      //         </div>
                      //         <p style="font-size:1.1em">Hi,</p>
                      //         <p>Please click below to reset your password. Your Password change requested on ${date} at ${time}. If you were not the pesron then please avoid to click</p>
                      //         <a href="${link}" _blank>
                      //         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Reset password</h2></a>
                      //         <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
                      //         <hr style="border:none;border-top:1px solid #eee" />
                      //         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                      //           <p>This was a system genrated mail please do not replay</p>
                      //           <p>The request was made  on ${date} at ${time}.</p>
                      //           <p>Your school</p>
                      //         </div>
                      //       </div>
                      //       </div>
                                              
                      //       `,
                      // };

                      // sendEmail(mailObj).then((data) => {
                      //   console.log(data);
                      //   res.send({ status: true, error: false })
                      // });

                    } else {
                      res.send({ status: true, error: false , mes:'Invalid Details' })

                    }
                  }else{
                    
                    res.send({ status: true, error: false , mes:'Invalid Details' })

                  }

                }else{
                  res.send({ status: true, error: false , mes:'Invalid Details' })

                }
              })

            } else {


              res.send({ status: true, error: true, mes: "Invalid Details" })


            }
          } else {
            return res.send({ status: true, error: true, mes: "Invalid Details" })

          }

        } else {


          res.send({ status: true, error: true, mes: "Something went wrong" });

        }
      })













































    }else{
      res.send({ status: true, error: true, mes: "Something went wrong" });

    }
  }else{
    res.send({ status: true, error: true, mes: "Something went wrong" });

  }

});

module.exports = app