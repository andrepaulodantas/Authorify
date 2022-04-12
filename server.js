const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const Grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require('path');
const Pusher = require('pusher');
//const connectDB = require('./config/db');

const facePosts = require('./models/facePosts');

// routes

Grid.mongo = mongoose.mongo;

const app = express();

const pusher = new Pusher({
  appId: "1383515",
  key: "6bcabaee92f3e67baee2",
  secret: "fae1664d9b93bbb344bd",
  cluster: "sa1",
  useTLS: true
});

// Connect Database
const mongoURI = ""

const conn = mongoose.createConnection(mongoURI);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');

  const changeStream = mongoose.connection.collection('posts').watch();

  changeStream.on('change', (change) => {
    console.log(change);
    if (change.operationType === 'insert') {
      pusher.trigger('posts', 'inserted', {
        change: change        
      })
      } else {
        console.log('Error in change stream');
      }
  });
})
   
     let gfs;
    
    conn.once("open", () => {
      console.log("Connected to MongoDB");
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection("images");
    });
    
  // Create storage engine
    const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const filename=`image-${Date.now()}${path.extname(file.originalname)}`
          const fileInfo = {
            filename: filename,
            bucketName: "images"
          };
          resolve(fileInfo);
      });
    }
  });

    const upload = multer({ storage });

    mongoose.connect(mongoURI); 

// cors
app.use(cors({ origin: true, credentials: true }));

// Init Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// use Routes
app.get("/", (req, res) => res.status(200).send("<h1>Hi Programmers!!!</h1>"));

app.post("/upload/post", (req, res) => {
    const dbPost = req.body;
    console.log(dbPost);
    facePosts.create(dbPost, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.get("/retrieve/posts", (req, res) => {
	facePosts.find((err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			data.sort((b, a) => {
				return a.timestamp - b.timestamp;
			});

			res.status(200).send(data);
		}
	});
});

app.post("/upload/image", upload.single("file"), (req, res) => {
    res.status(201).send(req.file);
});


app.get("/retrieve/image/single",  (req, res) => { 
    gfs.files.findOne({filename: req.query.name}, (err, file) => {
          if(err) {
            res.status(500).send(err);
            }else{            
            if(!file || file.length === 0) {   // if(!file)
                res.status(404).json({err: 'No file found'});
            }else{
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            }
        }
    });
});

//listen
const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));
