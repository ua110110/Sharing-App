const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { send } = require('process');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file')

// let storage = multer.diskStorage({
//     destination: (req, file , cb) => cb(null , 'uploads/'),
//     filename: (req , file , cb) => {
//         const uniqueName = `${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`;
//         cb(null , uniqueName);
//     }
// })

// let upload = multer({
//     storage,
//     limit: {
//         fileSize: 100000000
//     }
// }).single('myfile');


let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb



router.post('/', (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        res.json({ file: `${process.env.APP_BASE_URL}files/${response.uuid}` });
      });
});

// router.post('/' , (req, res) => {
    
//       // Store file
//       upload(req , res , async (err) => {
//           // validate request
//          if(!req.file) {
//              return res.json({error : 'File not attached.'});

//           }

//           if(err) {
//               return res.status(500).send({error: err.message})

//           }

//           const file = new File({
//               filename: req.file.filename,
//               uuid: uuid4() ,
//               path: req.file.path ,
//               size: req.file.size
//           });

//           const response = await file.save();
//           return res.json({ file:`${process.env.APP_BASE_URL}files/${response.uuid}`});

//       })

// });

router.post('/send' , async (req , res) => {
    const {uuid , emailTo, emailFrom} = req.body;

    if(!uuid || !emailFrom || !emailTo) {
        return res.status(422).send({error: 'All fields are required'})
    }

    // Get data from database
    const file = await File.findOne({uuid: uuid});  
    if(file.sender) {
        return res.status(422).send({error: 'Email already send'})
    }
    file.sender = emailFrom ;
    file.receiver = emailTo ;
    const response = await file.save();

    // Send Mail
    const sendMail = require('../services/emailService');
    sendMail({
        from: emailFrom,
        to:emailTo ,
        subject:'inShare file sharing' ,
        text: `${emailFrom} shared a file with you.` ,
        html: require('../services/emailTemplate')({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}files/${file.uuid}`,
            size: parseInt(file.size/1000) + ' KB',
            expires: '24 hours'
        })

    });
    return res.send({success: true}) ;
});

module.exports = router ;