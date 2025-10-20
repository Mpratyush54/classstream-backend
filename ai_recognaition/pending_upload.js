const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const base64Img = require('base64-img');
var crypto = require('crypto');

const fetch = require('cross-fetch');






  

  



  
let jsonFile = require('jsonfile');


const db = require('../database/index')

// const dotenv = require('dotenv');

// dotenv.config({ path: './../.env' })

const date_now = Date.now()
const multer = require('multer');




app.post('/',  (req, res) => {
    console.log('frfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    console.log(req.student_username);
    console.log(req.body[0]);
    var usernames = String(req.body.student_username);
    var emails = String(req.body.student_email);
    var query_tokens = String(req.body.student_query_token)
  

    db.query('select * from processing_data where username = ? ORDER BY id DESC', [usernames], (err, result) => {
        if (!err) {

            if (!result[0] == []) {
                // res.send({ result })



                res.send({ status: true, error: false, mes: result})



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

app.post('/individual',  (req, res) => {
    console.log('frfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    console.log(req.student_username);
    console.log(req.body[0]);
    var usernames = String(req.body.student_username);
    var emails = String(req.body.student_email);
    var query_tokens = String(req.body.student_query_token)
  

    db.query('select * from processing_data where id = ?', [req.body.id], (err, result) => {
        if (!err) {

            if (!result[0] == []) {
                // res.send({ result })



console.log(JSON.parse(result[0].jsondata));

                let datadd = JSON.parse(JSON.parse(result[0].jsondata).choices[0].message.content)
console.log(datadd);
datadd[`krutidev Mother's Name in Hindi`] = unicode_to_krutidev_10(datadd[`Mother's Name in Hindi`])
datadd[`krutidev Name in Hindi`] = unicode_to_krutidev_10(datadd[`Name in Hindi`])
datadd[`krutidev Father's Name in Hindi`] = unicode_to_krutidev_10(datadd[`Father's Name in Hindi`])
datadd[`krutidev Parents Address in Hindi`] = unicode_to_krutidev_10(datadd[`Parents Address in Hindi`])
console.log(datadd);


                res.send({ status: true, error: false, mes: datadd})

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
var legacy_text_var = ""; // in Kruti Dev
var unicode_text_var = ""; // in Unicode

app.post('/individual/unicode-kruti-dev',  (req, res) => {
  var data = String(req.body.message)
  
return res.status(403).json({ status: true, error: false, mes: unicode_to_krutidev_10(data)})
 
})
function unicode_to_krutidev_10(unicode_text_var = "", max_text_size = 6000) {
  var array_one = new Array(
    // ignore all nuktas except in ड़ and ढ़
    "‘",
    "’",
    "“",
    "”",
    "(",
    ")",
    "{",
    "}",
    "=",
    "।",
    "?",
    "-",
    "µ",
    "॰",
    ",",
    ".",
    "् ",
    "०",
    "१",
    "२",
    "३",
    "४",
    "५",
    "६",
    "७",
    "८",
    "९",
    "x",

    "फ़्",
    "क़",
    "ख़",
    "ग़",
    "ज़्",
    "ज़",
    "ड़",
    "ढ़",
    "फ़",
    "य़",
    "ऱ",
    "ऩ", // one-byte nukta varNas
    "त्त्",
    "त्त",
    "क्त",
    "दृ",
    "कृ",

    "ह्न",
    "ह्य",
    "हृ",
    "ह्म",
    "ह्र",
    "ह्",
    "द्द",
    "क्ष्",
    "क्ष",
    "त्र्",
    "त्र",
    "ज्ञ",
    "छ्य",
    "ट्य",
    "ठ्य",
    "ड्य",
    "ढ्य",
    "द्य",
    "द्व",
    "श्र",
    "ट्र",
    "ड्र",
    "ढ्र",
    "छ्र",
    "क्र",
    "फ्र",
    "द्र",
    "प्र",
    "ग्र",
    "रु",
    "रू",
    "्र",

    "ओ",
    "औ",
    "आ",
    "अ",
    "ई",
    "इ",
    "उ",
    "ऊ",
    "ऐ",
    "ए",
    "ऋ",

    "क्",
    "क",
    "क्क",
    "ख्",
    "ख",
    "ग्",
    "ग",
    "घ्",
    "घ",
    "ङ",
    "चै",
    "च्",
    "च",
    "छ",
    "ज्",
    "ज",
    "झ्",
    "झ",
    "ञ",

    "ट्ट",
    "ट्ठ",
    "ट",
    "ठ",
    "ड्ड",
    "ड्ढ",
    "ड",
    "ढ",
    "ण्",
    "ण",
    "त्",
    "त",
    "थ्",
    "थ",
    "द्ध",
    "द",
    "ध्",
    "ध",
    "न्",
    "न",

    "प्",
    "प",
    "फ्",
    "फ",
    "ब्",
    "ब",
    "भ्",
    "भ",
    "म्",
    "म",
    "य्",
    "य",
    "र",
    "ल्",
    "ल",
    "ळ",
    "व्",
    "व",
    "श्",
    "श",
    "ष्",
    "ष",
    "स्",
    "स",
    "ह",

    "ऑ",
    "ॉ",
    "ो",
    "ौ",
    "ा",
    "ी",
    "ु",
    "ू",
    "ृ",
    "े",
    "ै",
    "ं",
    "ँ",
    "ः",
    "ॅ",
    "ऽ",
    "् ",
    "्"
  );

  var array_two = new Array(
    "^",
    "*",
    "Þ",
    "ß",
    "¼",
    "½",
    "¿",
    "À",
    "¾",
    "A",
    "\\",
    "&",
    "&",
    "Œ",
    "]",
    "-",
    "~ ",
    "å",
    "ƒ",
    "„",
    "…",
    "†",
    "‡",
    "ˆ",
    "‰",
    "Š",
    "‹",
    "Û",

    "¶",
    "d",
    "[k",
    "x",
    "T",
    "t",
    "M+",
    "<+",
    "Q",
    ";",
    "j",
    "u",
    "Ù",
    "Ùk",
    "ä",
    "–",
    "—",

    "à",
    "á",
    "â",
    "ã",
    "ºz",
    "º",
    "í",
    "{",
    "{k",
    "«",
    "=",
    "K",
    "Nî",
    "Vî",
    "Bî",
    "Mî",
    "<î",
    "|",
    "}",
    "J",
    "Vª",
    "Mª",
    "<ªª",
    "Nª",
    "Ø",
    "Ý",
    "æ",
    "ç",
    "xz",
    "#",
    ":",
    "z",

    "vks",
    "vkS",
    "vk",
    "v",
    "bZ",
    "b",
    "m",
    "Å",
    ",s",
    ",",
    "_",

    "D",
    "d",
    "ô",
    "[",
    "[k",
    "X",
    "x",
    "?",
    "?k",
    "³",
    "pkS",
    "P",
    "p",
    "N",
    "T",
    "t",
    "÷",
    ">",
    "¥",

    "ê",
    "ë",
    "V",
    "B",
    "ì",
    "ï",
    "M",
    "<",
    ".",
    ".k",
    "R",
    "r",
    "F",
    "Fk",
    ")",
    "n",
    "/",
    "/k",
    "U",
    "u",

    "I",
    "i",
    "¶",
    "Q",
    "C",
    "c",
    "H",
    "Hk",
    "E",
    "e",
    "¸",
    ";",
    "j",
    "Y",
    "y",
    "G",
    "O",
    "o",
    "'",
    "'k",
    '"',
    '"k',
    "L",
    "l",
    "g",

    "v‚",
    "‚",
    "ks",
    "kS",
    "k",
    "h",
    "q",
    "w",
    "`",
    "s",
    "S",
    "a",
    "¡",
    "%",
    "W",
    "·",
    "~ ",
    "~"
  ); // "~j"

  //************************************************************
  //Put "Enter chunk size:" line before "<textarea name= ..." if required to be used.
  //************************************************************
  //Enter chunk size: <input type="text" name="chunksize" value="6000" size="7" maxsize="7" style="text-align:right"><br/><br/>
  //************************************************************
  // The following two characters are to be replaced through proper checking of locations:

  // "र्" (reph)
  // "Z" )

  // "ि"
  // "f" )

  var array_one_length = array_one.length;

  var modified_substring = unicode_text_var;

  //****************************************************************************************
  //  Break the long text into small bunches of max. max_text_size  characters each.
  //****************************************************************************************
  var text_size = unicode_text_var.length;

  var processed_text = ""; //blank

  var sthiti1 = 0;
  var sthiti2 = 0;
  var chale_chalo = 1;

  //************************************************************
  // var max_text_size = chunksize;
  // alert(max_text_size);
  //************************************************************

  while (chale_chalo == 1) {
    sthiti1 = sthiti2;

    if (sthiti2 < text_size - max_text_size) {
      sthiti2 += max_text_size;
      while (unicode_text_var.charAt(sthiti2) != " ") {
        sthiti2--;
      }
    } else {
      sthiti2 = text_size;
      chale_chalo = 0;
    }

    var modified_substring = unicode_text_var.substring(sthiti1, sthiti2);

    Replace_Symbols();

    processed_text += modified_substring;

    //****************************************************************************************
    //  Breaking part code over
    //****************************************************************************************
    //  processed_text = processed_text.replace( /mangal/g , "Krutidev010" ) ;

    legacy_text_var = processed_text;
  }

  return legacy_text_var;
  //**************************************************

  function Replace_Symbols() {
    // if string to be converted is non-blank then no need of any processing.
    if (modified_substring != "") {
      // first replace the two-byte nukta_varNa with corresponding one-byte nukta varNas.

      modified_substring = modified_substring.replace(/क़/, "क़");
      modified_substring = modified_substring.replace(/ख़‌/g, "ख़");
      modified_substring = modified_substring.replace(/ग़/g, "ग़");
      modified_substring = modified_substring.replace(/ज़/g, "ज़");
      modified_substring = modified_substring.replace(/ड़/g, "ड़");
      modified_substring = modified_substring.replace(/ढ़/g, "ढ़");
      modified_substring = modified_substring.replace(/ऩ/g, "ऩ");
      modified_substring = modified_substring.replace(/फ़/g, "फ़");
      modified_substring = modified_substring.replace(/य़/g, "य़");
      modified_substring = modified_substring.replace(/ऱ/g, "ऱ");

      // code for replacing "ि" (chhotee ee kii maatraa) with "f"  and correcting its position too.

      var position_of_f = modified_substring.indexOf("ि");
      while (position_of_f != -1) {
        //while-02
        var character_left_to_f = modified_substring.charAt(position_of_f - 1);
        modified_substring = modified_substring.replace(
          character_left_to_f + "ि",
          "f" + character_left_to_f
        );

        position_of_f = position_of_f - 1;

        while (
          (modified_substring.charAt(position_of_f - 1) == "्") &
          (position_of_f != 0)
        ) {
          var string_to_be_replaced =
            modified_substring.charAt(position_of_f - 2) + "्";
          modified_substring = modified_substring.replace(
            string_to_be_replaced + "f",
            "f" + string_to_be_replaced
          );

          position_of_f = position_of_f - 2;
        }
        position_of_f = modified_substring.search(/ि/, position_of_f + 1); // search for f ahead of the current position.
      } // end of while-02 loop
      //************************************************************
      //     modified_substring = modified_substring.replace( /fर्/g , "£"  )  ;
      //************************************************************
      // Eliminating "र्" and putting  Z  at proper position for this.

      set_of_matras = "ािीुूृेैोौं:ँॅ";

      modified_substring += "  "; // add two spaces after the string to avoid UNDEFINED char in the following code.

      var position_of_half_R = modified_substring.indexOf("र्");
      while (position_of_half_R > 0) {
        // while-04
        // "र्"  is two bytes long
        var probable_position_of_Z = position_of_half_R + 2;

        var character_right_to_probable_position_of_Z =
          modified_substring.charAt(probable_position_of_Z + 1);

        // trying to find non-maatra position right to probable_position_of_Z .

        while (
          set_of_matras.indexOf(character_right_to_probable_position_of_Z) != -1
        ) {
          probable_position_of_Z = probable_position_of_Z + 1;
          character_right_to_probable_position_of_Z = modified_substring.charAt(
            probable_position_of_Z + 1
          );
        } // end of while-05

        string_to_be_replaced = modified_substring.substr(
          position_of_half_R + 2,
          probable_position_of_Z - position_of_half_R - 1
        );
        modified_substring = modified_substring.replace(
          "र्" + string_to_be_replaced,
          string_to_be_replaced + "Z"
        );
        position_of_half_R = modified_substring.indexOf("र्");
      } // end of while-04

      modified_substring = modified_substring.substr(
        0,
        modified_substring.length - 2
      );

      //substitute array_two elements in place of corresponding array_one elements

      for (
        input_symbol_idx = 0;
        input_symbol_idx < array_one_length;
        input_symbol_idx++
      ) {
        idx = 0; // index of the symbol being searched for replacement

        while (idx != -1) {
          //whie-00
          modified_substring = modified_substring.replace(
            array_one[input_symbol_idx],
            array_two[input_symbol_idx]
          );
          idx = modified_substring.indexOf(array_one[input_symbol_idx]);
        } // end of while-00 loop
      } // end of for loop
    } // end of IF  statement  meant to  supress processing of  blank  string.
  } // end of the function  Replace_Symbols( )
} // end of Convert_Unicode_to_Krutidev010 function
module.exports = { unicode_to_krutidev_10 };



module.exports = app