const express = require('express');
const cors = require('cors');
const mongojs = require('mongojs');
const PORT = process.env.PORT || 5000;
const DB_URL = 'mongodb://Holly:ikou05667@ds123614.mlab.com:23614/hollydb'
let seqID = 1;

//connect to mongodb
const db = mongojs(DB_URL, ['posts']);

db.on('connect', (err) => {
  if(err){
    console.log('database error', err)
  }
  else{
    console.log('database connected')
  }
});

//setting up the express server
const server = express();

//middleware
server.use(express.json());
server.use(cors());

// server.get('/', (req, res) => {
//   res.json({message: 'Hello World'});
// });

//load html/css/js from public folder
server.use(express.static("public"));

//get all posts
server.get('/api', (req, res) => {
  db.posts.find((err, posts) => {
    if(err){
      console.log('database error', err);
    }
    else{
      console.log(posts);
      if(posts.length < 1){
        res.send('No data');
      }
      else{
        res.json(posts);
      }
    }
  });
});

//save a post
server.post('/api/send', (req, res) => {
  let data = req.body;
  data.id = seqID;
  db.posts.save(data);
  seqID++;
});

//delete all posts
server.post('/api/delete', (req, res) => {
  db.posts.remove({});
  seqID = 1;
  console.log('removed all posts');
});

//delete single post
server.post('/api/delete/:id', (req, res) => {
  let postid = JSON.parse(req.params.id);
  
  db.posts.remove({id: postid}, (err, post) => {
    if(err){
      console.log('database error', err);
    }
    else{
      console.log('Delete Post with ID '+postid);
    }
  });
});

//starting the server
server.listen(PORT, () => {
  console.log('Server listening on port '+PORT);
});

