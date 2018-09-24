const express = require('express');
const cors = require('cors');
const mongojs = require('mongojs');

// const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const PORT = process.env.PORT || 5000;
const DB_URL = 'mongodb://Holly:ikou05667@ds123614.mlab.com:23614/hollydb'
let seqID = 1;

//connect to mongodb
const db = mongojs(DB_URL, ['posts']);

db.on('connect', (err) => {
  if(err){
    console.log('database error', err);
  }
  else{
    console.log('database connected');
  }
});

//setting up the express server
const server = express();

//middleware
server.use(express.json());
server.use(cors());
server.use(cookieParser());

//express session
server.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

//passport init
server.use(passport.initialize());
server.use(passport.session());

//express validator
server.use(expressValidator({
  errorFormatter: (param, msg, value) =>{
    let namespace = param.split('');
    let root = namespace.shift();
    let formParam = root;

    while(namespace.length){
      formParam += '[' +namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

// connect flash
server.use(flash());

// global variables
server.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});




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