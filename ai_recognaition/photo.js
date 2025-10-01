const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const base64Img = require('base64-img');
const cv = require('opencv4nodejs');

var crypto = require('crypto');

const fetch = require('cross-fetch');

// async
  
let jsonFile = require('jsonfile');


const db = require('../database/index')

// const dotenv = require('dotenv');


const date_now = Date.now()
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Student_entrance_form/');
    },
    filename: (req, file, cb) => {
        extention = file.originalname.split('.').pop();
     
        cb(null, Date.now() + '-' + Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000 +'.' + extention);


    },
});
const upload = multer({ storage: storage });


app.get('/:id', upload.single('file'), (req, res) => {
    folderName = req.params.id.trim()





    db.query('select * from processing_data where id = ?', [folderName], async (err, result) => {
        if (!err) {
 if(result[0]){
    console.log(result[0].image_name);
    const path   = 'Student_entrance_form/' + result[0].image_name
    if (fs.existsSync(path)) {
        console.log(path);
    
        res.sendfile(path)
    
    
    
    
    
    
    } else {
        res.status(404)
    
    
    }
 } else {

    res.status(404)

}


            // res.status(200).json({ status: true, error: err, id: jsonData, message: 'File uploaded successfully', file: req.file   })

        } else {
   
            res.status(404)
        
        }
    })
  
    // res.status(200).json({ message: 'File uploaded successfully', file: req.file })

})

app.get('/personal/:id', upload.single('file'), (req, res) => {
    folderName = req.params.id.trim()
    const paths   = 'temp/' + folderName+'_0.jpg'

    if (fs.existsSync(paths)) {
        console.log(paths);
    
        res.sendfile(paths)
    
    
    
    
    
    
    } else {

        
        db.query('select * from processing_data where id = ?', [folderName], async (err, result) => {
            if (!err) {
     if(result[0]){
        images_genrated = []


          const image = cv.imread('Student_entrance_form/' + result[0].image_name);
      
          // console.log(image);

          const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
          const detectedFaces = classifier.detectMultiScale(image).objects;
          console.log(detectedFaces);
         
          detectedFaces.forEach((faceRect, index) => {
           
              data = faceRect.height*faceRect.width
              if (data < 15 * 1024) { // 10KB in bytes
                     
                    } else {
                        // console.log(stats.size);
                        
                        images_genrated.push(faceRect)
        
                    }
          })
          console.log("images_genrated;",images_genrated);
         
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
            cv.imwrite(`temp/${folderName}_${index}.jpg`, croppedFace);
      
        });
          res.sendfile(`temp/${folderName}_0.jpg`)

     } else {
        res.sendStatus(404)

    
    }
    
    
                // res.status(200).json({ status: true, error: err, id: jsonData, message: 'File uploaded successfully', file: req.file   })
    
            } else {
       
                res.sendStatus(404)
            
            }
        })    
    
    }




  
    // res.status(200).json({ message: 'File uploaded successfully', file: req.file })

})



module.exports = app