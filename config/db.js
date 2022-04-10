const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(
      db,
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log('MongoDB is Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  Grid.mongo = mongoose.mongo;

  const conn = mongoose.createConnection(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    });
  
     let gfs
    
    conn.once('open', () => {
      console.log('Connected to MongoDB');
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection('images');
    });
    
    // create storage engine
    const storage = new GridFsStorage({
      url: db,
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return reject(err);
            }
            const filename = `image-${Date.now()}${path.extname(file.originalname)}`;
            const fileInfo = {
              filename: filename,
              bucketName: 'images'
            };
            resolve(fileInfo);
          });
        });
      }
    });

    const upload = multer({ storage });
    
};

module.exports = connectDB;