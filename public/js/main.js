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

//API ROUTES
const API_GET_ALL = '/api';
const API_SEND = '/api/send';
const API_DELETE_ALL = '/api/delete';
const API_DELETE_ID = '/api/delete/';
const API_LOGIN = '/api/login';
const API_REGISTER = '/api/register';

//getting the submitted data from the post-form
postForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(postForm);
  const title = formData.get('title');
  const content = formData.get('content');
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  let id;
  
  const data = {
    title,
    content,
    id,
    time,
    date
  };

  //save a post to mongodb
  fetch(API_SEND, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'content-type':'application/json'
    }
  });
  //reload the window and resetting the form 
  window.location.reload();
});

//getting login data
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const loginData = new FormData(loginForm);
  const username = loginData.get('username');
  const password = loginData.get('password');
  const time = new Date();
  
  const data = {
    username,
    password,
    time
  };

  // save a post to mongodb
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
    }
  });
});

//getting register data
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const registerData = new FormData(registerForm);
  const username = registerData.get('username');
  const email = registerData.get('email');
  const password = registerData.get('password');
  const password2 = registerData.get('password2');
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
      //If error, show error
      if(response.length > 0){
        // alert(response[0].msg);
        popup.classList.toggle('hidden');
        popup.innerHTML = response[0].msg;
        setTimeout(() => {
          popup.classList.toggle('hidden');
        },1500);
      }
      //if success, show success-msg and reload
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

//get all posts from mongodb
window.onload = loadAllPosts();

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
        div.appendChild(time);
        div.appendChild(date);
        div.appendChild(delBtn);
        postsElement.appendChild(div);
      });
  });
}

function show(id){
  if(id == 1){
    document.querySelector('.container1').classList.toggle('hidden');
    loginForm.classList.toggle('hidden');
    center.style.zIndex = 3;
  }
  if(id == 2){
    document.querySelector('.container2').classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    center2.style.zIndex = 3;
  }
  header.classList.toggle('blur');
  wrapper.classList.toggle('blur');
}

function hide(id){
  if(id == 'login-layer'){
    loginForm.classList.toggle('hidden');
    center.style.zIndex = -3;
  }
  if(id == 'register-layer'){
    registerForm.classList.toggle('hidden');
    center2.style.zIndex = -3;
  }
  document.getElementById(id).classList.toggle('hidden');
  header.classList.toggle('blur');
  wrapper.classList.toggle('blur');
}

function logout(){
  console.log('byebye');
}

function editor(){
  document.querySelector('#title').classList.remove('hidden2');
  document.querySelector('#content').classList.remove('hidden2');
  document.querySelector('.post-form').style.height = 200 +'px';
  send.style.transform = 'translateY(0px)';
  send.innerHTML = 'Send';
  
}


