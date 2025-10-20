const express = require('express')
const app = express.Router()
var randomstring = require("randomstring");
var dateFormat = require("dateformat");
var getDimensions = require('get-video-dimensions');
const { spawn } = require('child_process');

let jsonFile = require('jsonfile');

const path = require('path'); // ✅ required for path.join(), etc.
const fs = require('fs')

const db = require('../database/index')

// const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');


const { randomUUID } = require('crypto');
const multer = require('multer');


const urlencoded = bodyParser.urlencoded({ extended: false })

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './temp')
    },
    filename: (req, file, callback) => {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        let filename = req.params.id.trim()
        let folderName = req.params.id.trim()
        try {
            if (!fs.existsSync('temp/' + folderName)) {
                fs.mkdirSync('temp/' + folderName)
            }
        } catch (err) {
            console.error(err)
        }

        callback(null, `${filename}/${filename}${ext}`)

    }
})


const upload = multer({ storage: multer.memoryStorage() });

app.post('/:id', upload.single('file'), (req, res, next) => {
        // email
        var usernames = String(req.body.username);
        var emails = String(req.body.email);
        var query_tokens = String(req.body.query_token);

        db.query('SELECT `username`,  `token`,  `email` FROM `loginlog` WHERE `token` = ?', [query_tokens], (err, result) => {
            if (!err) {

                if (!result[0] == []) {



                    // res.send({ result })
                    rec_username = result[0].username
                    rec_emails = result[0].email
                    rec_query_tokens = result[0].token


                    if (usernames == rec_username & emails == rec_emails && query_tokens == rec_query_tokens) {






                        const file = req.file

                        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);

                        if (ext == '.mp4') {


                            if (!file) {
                                const error = new Error('Please upload file')

                                res.status(400).json({ status: true, error: true, mes: 'No video fonund' })
                            }

                            getDimensions('temp/' + req.params.id.trim() + '/' + req.params.id.trim() + '.mp4').then(function(dimensions) {


                                if (dimensions.width >= 1080 && dimensions.height >= 720) {
                                    data = { status: true, error: false, mes: 'Video uploaded ' }

                                    res.send(data)
                                    console.log(data);
                                } else {



                                    fs.unlinkSync('temp/' + req.params.id.trim() + '/' + req.params.id.trim() + '.mp4')
                                    return res.send({ status: true, error: true, mes: 'Invalid video Quality' })


                                }

                            })

                        } else {
                            res.send({ status: true, error: true, mes: 'Invalid extension' })
                        }



                    } else {
                        return res.status(403).json({ status: true, error: true, mes: "You are logged out" })

                    }
                } else {
                    res.send({ status: true, error: true, mes: "Something went wrong", error: err })
                }
            } else {
                return res.status(403).json({ status: true, error: true, mes: "You are logged out" })

            }
        })



    })
    // ✅ Helper: Auth validation same as your older code
async function verifyAuth(req, res, next) {
    const username = req.headers['x-username'];
    const email = req.headers['x-email'];
    const query_token = req.headers['x-token'];

    if (!username || !email || !query_token) {
        return res.status(401).json({ status: true, error: true, mes: 'Missing auth headers' });
    }

    db.query(
        'SELECT `username`, `email`, `token` FROM `loginlog` WHERE `token` = ?', [query_token],
        (err, result) => {
            if (err || !result[0]) {
                return res.status(403).json({ status: true, error: true, mes: 'Invalid session' });
            }

            const rec = result[0];
            if (rec.username === username && rec.email === email && rec.token == query_token) {
                next();
            } else {
                return res.status(403).json({ status: true, error: true, mes: 'You are logged out' });
            }
        }
    );
}
const TEMP_DIR = path.join(__dirname, '../temp');

app.post('/v2/init/:id', verifyAuth, (req, res) => {
    const id = req.params.id.trim();
    const folder = path.join(TEMP_DIR, id);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'meta.json'), JSON.stringify({ chunks: [] }, null, 2));
    res.json({ status: true, uploadId: id });
});

/** 2️⃣ RECEIVE CHUNK **/

app.post("/v2/chunk/:id/:index", verifyAuth, upload.single("chunk"), async(req, res) => {
    try {
        const { id, index } = req.params;
        const username = req.headers["x-username"];
        const email = req.headers["x-email"];
        const token = req.headers["x-token"];

        if (!username || !email || !token) {
            return res.status(401).json({ status: false, error: true, mes: "Missing headers" });
        }

        const folder = path.join(TEMP_DIR, id);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

        const partPath = path.join(folder, `part-${index}`);
        const metaPath = path.join(folder, "meta.json");

        // ✅ write pure binary buffer
        fs.writeFileSync(partPath, req.file.buffer);

        let meta = { chunks: [] };
        if (fs.existsSync(metaPath)) meta = JSON.parse(fs.readFileSync(metaPath));
        if (!meta.chunks.includes(Number(index))) meta.chunks.push(Number(index));
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

        console.log(`✅ Saved clean chunk ${index} for ${id}`);
        res.json({ ok: true, index: Number(index) });
    } catch (err) {
        console.error("❌ Chunk save error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});


/** 3️⃣ COMPLETE UPLOAD **/
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });



// ✅ Complete upload route
app.post('/v2/complete/:id', verifyAuth, async(req, res) => {

    const id = req.params.id.trim();
    const folder = path.join(TEMP_DIR, id);
    const metaPath = path.join(folder, 'meta.json');
    const outputPath = path.join(folder, `${id}.mp4`);

    console.log(`Merging upload for ${id}`);

    try {
        if (!fs.existsSync(metaPath)) {
            return res.status(400).json({ status: false, error: true, mes: 'Upload session not found' });
        }

        const meta = JSON.parse(fs.readFileSync(metaPath));
        if (!meta.chunks || meta.chunks.length === 0) {
            return res.status(400).json({ status: false, error: true, mes: 'No chunks uploaded' });
        }

        const ordered = meta.chunks.sort((a, b) => a - b);
        console.log(`Total chunks in meta.json: ${ordered.length}`);
        console.log(`Chunk list:`, ordered);

        // ✅ Merge all chunks into one file
        const writeStream = fs.createWriteStream(outputPath, { flags: 'w' });
        for (const i of ordered) {
            const partPath = path.join(folder, `part-${i}`);
            console.log(`Merging: ${partPath}`);

            if (!fs.existsSync(partPath)) {
                console.log(`❌ Missing chunk part-${i}`);
                continue;
            }

            await new Promise((resolve, reject) => {
                const readStream = fs.createReadStream(partPath);
                readStream.pipe(writeStream, { end: false });
                readStream.on('end', () => {
                    console.log(`Finished reading ${partPath}`);
                    fs.unlinkSync(partPath);
                    resolve();
                });
                readStream.on('error', reject);
            });
        }

        // ✅ Ensure file flushed completely
        await new Promise(resolve => writeStream.end(resolve));
        console.log('✅ Merge complete, running ffmpeg rewrap...');

        // ✅ Rewrap the MP4 to ensure moov atom exists
        const fixedPath = path.join(folder, `${id}-fixed.mp4`);
        await new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
                '-y',
                '-i', outputPath,
                '-c', 'copy',
                fixedPath
            ]);

            ffmpeg.stderr.on('data', (d) => console.log(d.toString()));
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    fs.renameSync(fixedPath, outputPath);
                    resolve();
                } else reject(new Error('ffmpeg copy failed'));
            });
        });

        console.log('✅ FFmpeg rewrap done, verifying video...');

        // ✅ Validate resolution
        const dimensions = await getDimensions(outputPath);
        console.log('Video dimensions:', dimensions);

        if (dimensions.width >= 1280 && dimensions.height >= 720) {
            return res.json({ status: true, error: false, mes: 'Video uploaded successfully' });
        } else {
            fs.unlinkSync(outputPath);
            return res.json({ status: true, error: true, mes: 'Invalid video resolution (<720p)' });
        }

    } catch (err) {
        console.error('❌ Error in /v2/complete:', err);
        return res.status(500).json({ status: false, error: true, mes: err.message });
    }
});

module.exports = app