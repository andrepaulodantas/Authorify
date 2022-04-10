const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const Grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require('path');
const Pusher = require('pusher');
const connectDB = require('./config/db');

const facePosts = require('./models/facePosts');

// routes
//const books = require('./routes/api/books');

Grid.mongo = mongoose.mongo;

const app = express();

// Connect Database
const mongoURI = "mongodb+srv://authorify:Authorify@cluster0.4z22m.mongodb.net/Cluster0?retryWrites=true&w=majority"

const conn = mongoose.createConnection(mongoURI, {
   
    }, err => {
        if(err) throw err;
        });

    mongoose.connect(mongoURI,
      {           
      }, err => {
        if(err) throw err;
        }); 

    mongoose.connection.once('open', () => {
        console.log('MongoDB is Connected...');
  });  

     let gfs
    
    conn.once('open', () => {
      console.log('Connected to MongoDB');
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection('images');
    });
    
    // create storage engine
    const storage = new GridFsStorage({
      url: mongoURI,
      file: (req, file) => {
        return new Promise((resolve, reject) => {
         
            const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
            const fileInfo = {
              filename: filename,
              bucketName: 'images'
            };
            resolve(fileInfo);
          });      
       }
    });

    const upload = multer({ storage });

// cors
app.use(cors({ origin: true, credentials: true }));

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// use Routes
app.get('/', (req, res) => res.status(200).send('Hello world!'));

app.post('/upload/image', upload.single('file'), (req, res) => {
    res.status(201).send(req.file);
});

app.post('/upload/post', (req, res) => {
    const dbPost = req.body

    facePosts.create(dbPost, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.get('/retrieve/image/single',(req, res) => {
    gfs.files.findOne({filename: req.query.filename}, (err, file) => {
          if(err) {
            res.status(500).send(err);
            }else{            
            if(!file || file.length === 0) {   // if(!file)
                res.status(404).send('No file found');
            }else{
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            }
        }
    });
});

app.get('/retrieve/posts', (req, res) => {
    facePosts.find({}, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            data.sort((b, a) => {
                return a.timestamp - b.timestamp;
            });
            res.status(200).send(data)
        }
    })
})
               

//listen
const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));