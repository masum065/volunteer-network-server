var express = require('express');
var router = express.Router();
const multer = require('multer');

const fs = require('fs');
const {
  promisify
} = require('util');
const pipeline = promisify(require('stream').pipeline);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express',
  });
});

const upload = multer();
const MongoClient = require('mongodb').MongoClient;
const uri =
  'mongodb+srv://rider:XBy6BoY1A6WyHZ8e@cluster1.fwfle.mongodb.net/eventsDB?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const eventCollections = client.db('eventsDB').collection('programs');

  // Add new event From User 
  router.post('/upload', upload.single('file'), async function (
    req,
    res,
    next
  ) {
    const url = req.protocol + '://' + req.get('host');
    const {
      file,
      body: {
        title,
        date,
        description
      },
    } = req;
    const fileName = Date.now() * 110000 + file.detectedFileExtension;
    await pipeline(
      file.stream,
      fs.createWriteStream(`${__dirname}/../public/images/${fileName}`)
    );
    res.send(req.file);

    const eventData = {
      imageBanner: url + '/images/' + fileName,
      title,
      description,
      date,
    };

    eventCollections.insertOne(eventData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // show/ Update Operation
  router.get('/events', (req, res) => {
    eventCollections.find({}).toArray((errr, docs) => {
      res.send(docs);
    });
  });



});

router.get('/images', (req, res) => {
  res.send(`${__dirname}/../public/images`);
});

module.exports = router;