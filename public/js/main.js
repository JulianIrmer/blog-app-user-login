//HTML ELEMENTS
const postForm = document.querySelector('.post-form');
const loginForm = document.querySelector('.login');
const registerForm = document.querySelector('.register');
const postsElement = document.querySelector('.posts');
const header = document.querySelector('header');
const wrapper = document.querySelector('.wrapper');
const center = document.querySelector('.center');
const center2 = document.querySelector('.center2');
const popup = document.querySelector('.popup');
const send = document.querySelector('.send-btn');

//GLOBAL VARIABLES
let currentUser = '';

//API ROUTES
const API_GET_ALL = 'http://localhost:5000/api';
const API_SEND = 'http://localhost:5000/api/send';
const API_DELETE_ALL = 'http://localhost:5000/api/delete';
const API_DELETE_ID = 'http://localhost:5000/api/delete/';
const API_LOGIN = 'http://localhost:5000/api/login';
const API_REGISTER = 'http://localhost:5000/api/register';
const API_CHECK_SESSION = 'http://localhost:5000/api/checksession';



//get all posts from mongodb
window.onload = () => {
  loadAllPosts();
}; 
checkSession();

function checkSession(){
  fetch(API_CHECK_SESSION)
    .then(response => {return response.json()})
    .then(response => {
      console.log(response);
    })
    .catch(err => console.log(err));
};

//create a post
postForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // const formData = new FormData(postForm);
  // const title = formData.get('title');
  // const content = formData.get('content');
  const title = document.querySelector('#title').value;
  const content = document.querySelector('#content').value;
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  const author = currentUser;
  let id;

  const data = {
    title,
    content,
    id,
    time,
    date,
    author
  };

  //save a post to mongodb
  fetch(API_SEND, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'content-type':'application/json'
    }
  });
  //reload the window
  window.location.reload();
  loadAllPosts();
  document.querySelector('#title').value = '';
  document.querySelector('#content').value = '';
});

//getting login data
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // const loginData = new FormData(loginForm);
  // const username = loginData.get('username');
  // const password = loginData.get('password');
  const username = document.querySelector('#name-login').value;
  const password = document.querySelector('#pw-login').value;
  
  const data = {
    username,
    password
  };

  fetch(API_LOGIN, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'content-type':'application/json'
    },
  })
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    if(response){
      console.log('logging in');
      loginForm.classList.toggle('hidden');
      document.querySelector('.container1').classList.toggle('hidden');
      center.style.zIndex = -3;
      header.classList.toggle('blur');
      wrapper.classList.toggle('blur');
      document.querySelector('.login-li').innerHTML = 'Hello, '+response+'!';
      document.querySelector('.login-li').onclick = '';
    };
  });
});

//getting register data
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // const registerData = new FormData(registerForm);
  // const username = registerData.get('username');
  // const email = registerData.get('email');
  // const password = registerData.get('password');
  // const password2 = registerData.get('password2');
  const username = document.querySelector('#name-register').value; 
  const email = document.querySelector('#email-register').value; 
  const password = document.querySelector('#pw-register').value; 
  const password2 = document.querySelector('#pw-register-conf').value; 
  const time = new Date();
  
  const data = {
    username,
    email,
    password,
    password2,
    time
  };

  // save a post to mongodb
  fetch(API_REGISTER, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'content-type':'application/json'
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if(response.length > 0){
        popup.classList.toggle('hidden');
        popup.innerHTML = response[0].msg;
        setTimeout(() => {
          popup.classList.toggle('hidden');
        },1500);
      }
      else{
        popup.classList.toggle('hidden');
        popup.innerHTML = response.message;
        setTimeout(() => {
          popup.classList.toggle('hidden');
          window.location.reload();
        },1000);
      }
    });
});

//create new html elements for every element in the array
function loadAllPosts() {
  postsElement.innerHTML = '';
  fetch(API_GET_ALL)
    .then((response) => {
      return response.json();
    })
    .then((allPosts) => {
      allPosts.reverse();
      allPosts.forEach(post => {
        //create a new div for every post
        const div = document.createElement('div');
        div.className = 'post';

        //add the title
        const title = document.createElement('h2');
        title.textContent = post.title;
        title.className = 'post-title';

        //add the content
        const content = document.createElement('p');
        content.textContent = post.content;
        content.className = 'post-content';

        //add the author
        const author = document.createElement('p');
        author.textContent = post.author;
        author.className = 'post-author';

        //add the time
        const time = document.createElement('small');
        time.textContent = post.date;
        time.className = 'post-date';

        //add the date
        const date = document.createElement('small');
        date.textContent = post.time;
        date.className = 'post-date';

        //add delete button
        const delBtn = document.createElement('div');
        delBtn.textContent = 'X';
        delBtn.className = 'delete-btn';
        delBtn.id = post.id;

        //add the 'delete a single post'-function
        delBtn.addEventListener('click', (delBtn) => {
          let postid = delBtn.path[0].id;
          fetch(API_DELETE_ID+postid, {
            method: 'POST',
            headers: {
              'content-type':'application/json'
            }
          });
          //make sure the server has enough time to fetch the new data
          setTimeout(loadAllPosts, 500);
        });

        //add all new elements to the div and add the div to the posts-div
        div.appendChild(title);
        div.appendChild(content);
        div.appendChild(author);
        div.appendChild(time);
        div.appendChild(date);
        div.appendChild(delBtn);
        postsElement.appendChild(div);
      });
  });
};

function show(id){
  if(id == 1){
    document.querySelector('.container1').classList.toggle('hidden');
    loginForm.classList.toggle('hidden');
    center.style.zIndex = 3;
  };
  if(id == 2){
    document.querySelector('.container2').classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    center2.style.zIndex = 3;
  };
  header.classList.toggle('blur');
  wrapper.classList.toggle('blur');
};

function hide(id){
  if(id == 'login-layer'){
    loginForm.classList.toggle('hidden');
    center.style.zIndex = -3;
  };
  if(id == 'register-layer'){
    registerForm.classList.toggle('hidden');
    center2.style.zIndex = -3;
  };
  document.getElementById(id).classList.toggle('hidden');
  header.classList.toggle('blur');
  wrapper.classList.toggle('blur');
};

function logout(){
  console.log('byebye');
};

function editor(){
  document.querySelector('#title').classList.remove('hidden2');
  document.querySelector('#content').classList.remove('hidden2');
  document.querySelector('.post-form').style.height = 200 +'px';
  send.style.transform = 'translateY(0px)';
  send.innerHTML = 'Send';
};


