// ########## DEPENDENCIES ########## 
const express = require('express');
const server = express();
const http = require('http').Server(server);
const cors = require('cors');
const mongojs = require('mongojs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo')(session);


// ########## GLOBAL VARIABLES ##########
const PORT = process.env.PORT || 5000;
const DB_URL = 'mongodb://Holly:ikou05667@ds123614.mlab.com:23614/hollydb';
let seqID = 0;


// ########## DATABASE CONNECTION ##########
const db = mongojs(DB_URL, ['postsDev', 'users']);

db.on('connect', (err) => {
  if(err){
    console.log('database error', err);
  }
  else{
    console.log('database connected');
  };
});

//setting up the express server


//load html/css/js from public folder
server.use(express.static("public"));

//middleware
server.use(express.json());
server.use(cors());
server.use(cookieParser());

// express session
const sessConfig = {
  name: 'sid',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: DB_URL,
    ttl: 60*60, //(sec*min*hour*day)
    autoRemove: 'native'
  })
};

server.use(session(sessConfig));

// check if the user is logged in
let authenticate = (req, res, next) => {
  console.log(req.session.username);
  if(!req.session.username){
    res.redirect('/login');
  }
  else{
    next();
  };
};

//get latest ID
function getMaxID(){
  db.postsDev.find().sort({id: -1}, (err, docs) => {
    if(docs.length > 0){
      maxID = docs[0].id;
      seqID = maxID;
    }
    else{
      console.log('no data');
    };
  });
};

//check if the user has a session
server.get('/api/checksession', (req, res) => {
  if(req.session.username !== ''){
    // res.json({
    //   'isLoggedIn':true,
    //   'username':req.session.username
    // });
    console.log(req.session.username);
  }
  else{
    res.json({'isLoggedIn':false});
  };
});

// ########## GET ALL POSTS ##########
server.get('/api', (req, res) => {
  db.postsDev.find((err, posts) => {
    if(err){
      console.log('database error', err);
    }
    else{
      if(posts == null){
        res.send('No data');
      }
      else{
        res.json(posts);
      };
    };
  });
  getMaxID();
});

// ########## SAVE A POST ##########
server.post('/api/send', authenticate, (req, res) => {
  let data = req.body;
  seqID++;
  data.id = seqID;
  db.postsDev.save(data);
});

// ########## DELETE ALL POSTS ##########
server.post('/api/delete', authenticate,(req, res) => {
  db.postsDev.remove({});
  seqID = 1;
});

// ########## DELETE SINGLE POST ##########
server.post('/api/delete/:id', authenticate, (req, res) => {
  // let postid = JSON.parse(req.params.id);
  let postid = req.params.id;
  
  db.postsDev.remove({id: postid}, (err) => {
    if(err){
      console.log('database error', err);
    };
  });
});

// ########## LOGIN ##########
server.post('/api/login', (req, res) => {
  db.users.findOne({name : req.body.username}, (err, user) => {
    if(!user){
      console.log('no matching user found');
    }
    else if(err){
      console.error(err);
    }
    else if(user){
      //check pw. 
      // order is important!!
      bcrypt.compare(req.body.password, user.password).then((response) => {
        if(!response){
          console.log('password wrong');
        }
        else{
          console.log('logging in...');
          req.session.username = user.name;
          res.json(user.name);
        };
      });
    };
  });
});

// ########## LOGOUT ##########
server.get('/api/logout', authenticate, (req, res) => {
  req.session.destroy();
});

// ########## REGISTER ##########
server.post('/api/register', (req, res) => {
  let name = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  //hash the password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  //generate a new user object
  const user = {
    'name' : name,
    'email' : email,
    'password' : hash
  };

  //send the user object to the database
  db.users.save(user, (err) => {
    if(err){
      console.error(err);
    }
    else{
      res.json({'message':'success'});
    };
  });
});

// ########## START SERVER ##########
http.listen(PORT, () => {
  console.log('Server listening on port '+PORT);
});