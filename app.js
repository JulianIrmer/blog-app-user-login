const express = require('express');
const cors = require('cors');
const mongojs = require('mongojs');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const expressValidator = require('express-validator');
// const session = require('express-session');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const PORT = process.env.PORT || 5000;
const DB_URL = 'mongodb://Holly:ikou05667@ds123614.mlab.com:23614/hollydb';
let seqID = 0;


//connect to mongodb
const db = mongojs(DB_URL, ['postsDev', 'users']);

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

//cookie session
server.use(cookieSession({
  name: 'Session',
  keys: ['1', '2', '3', '4', '5'],
  maxAge: 1000*60*60*48 //ms*s*m*h
}));

//express session
// server.use(session({
//   secret: 'secret',
//   saveUninitialized: true,
//   resave: true
// }));

//passport init
// server.use(passport.initialize());
// server.use(passport.session());

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

// global variables
// server.use((req, res, next) => {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next();
// });

//load html/css/js from public folder
server.use(express.static("public"));

//get latest ID
function getMaxID(){
  db.postsDev.find().sort({id: -1}, (err, docs) => {
    if(docs.length > 0){
      maxID = docs[0].id;
      seqID = maxID;
    }
    else{
      console.log('no data');
    }
  });
}

//get all posts
server.get('/api', (req, res) => {
  db.postsDev.find((err, posts) => {
    if(err){
      console.log('database error', err);
    }
    else{
      if(posts.length < 1){
        res.send('No data');
      }
      else{
        res.json(posts);
      }
    }
  });
  getMaxID();
});

//save a post
server.post('/api/send', (req, res) => {
  let data = req.body;
  seqID++;
  data.id = seqID;
  db.postsDev.save(data);
});

//delete all posts
server.post('/api/delete', (req, res) => {
  db.postsDev.remove({});
  seqID = 1;
});

//delete single post
server.post('/api/delete/:id', (req, res) => {
  let postid = JSON.parse(req.params.id);
  
  db.postsDev.remove({id: postid}, (err, post) => {
    if(err){
      console.log('database error', err);
    }
  });
});

//login route
server.post('/api/login', (req, res) => {
  db.users.findOne({name : req.body.username}, (err, user) => {
    if(!user || err){
      console.log('database error', err);
    }
    else if(user){
      //check pw. oder is important!!
      bcrypt.compare(req.body.password, user.password).then((response) => {
        if(!response){
          console.log('password wrong');
        }
        else{
          console.log('logging in...');
          res.json(user.name);
          req.session.views = (req.session.views || 0) + 1;
          res.end(req.session.views + ' views');
          console.log(req.session.views);
        }
    });
    }
  });
});

//register route
server.post('/api/register', (req, res) => {
  let name = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  //validation
  req.checkBody('username', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Must be an email adress').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password mismatch').equals(password);

  let errors = req.validationErrors();

  //check for errors. if there is an error, send the error to client
  if(errors){
    console.log('Validation error ' +errors);
    res.json(errors);
  }

  //if there is no error, send success msg to client,
  //hash the user pw, create a new user object and
  //send it to the db
  else{
    res.json({message: 'success'});

    //hash the user pw
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    //generate a new User
    const user = {
      'name' : name,
      'email' : email,
      'password' : hash
    };

    //send the user object to the database
    db.users.save(user);
  }
});//<--- END REGISTRATION ROUTE

//starting the server
server.listen(PORT, () => {
  console.log('Server listening on port '+PORT);
});