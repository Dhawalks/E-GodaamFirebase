const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const fs = require('fs');
const os = require('os');
const path = require('path');

const gcsConfig = {
    projectId: "e-godaam",
    keyFilename:"e-godaam-firebase-adminsdk-zi1hi-81ee5a65ce.json"
}
const gcs = require('@google-cloud/storage')(gcsConfig);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.uploadFile = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(500).json({
                meassage: "Not allowed!"
            })
        }
        const busboy = new Busboy({ headers: req.headers });
        let uploadData = null;
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const filepath = path.join(os.tmpdir(), filename);
            uploadData = { file: filepath, type: mimetype };
            file.pipe(fs.createWriteStream(filepath))
        });
        busboy.on('finish', () => {
            const buck = gcs.bucket('e-godaam.appspot.com');
            buck.upload(uploadData.file, {
                uploadType: 'media',
                metadata: {
                    metadata: {
                        contentType: uploadData.type
                    }
                }
            }).then(() => {
                return res.status(200).json({
                    message: 'It worked!'
                });
            }).catch( err =>{
                return res.status(500).json({
                       error: err
                });
            });
        });
        busboy.end(req.rawBody);
    });
})    

