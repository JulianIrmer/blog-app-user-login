const form = document.querySelector('form');
const postsElement = document.querySelector('.posts');
const API_GET_ALL = '/api';
const API_SEND = '/api/send';
const API_DELETE_ALL = '/api/delete';
const API_DELETE_ID = '/api/delete/';
const API_MAXID = '/api/maxid';
let id;
let allData;

function getMaxID(){
  fetch(API_MAXID)
    .then((response) => {
      id = response;
      console.log(id);
    })
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const title = formData.get('title');
  const content = formData.get('content');
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  
  
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
  })
  // id++;
  window.location.reload()
  form.reset();
});

//get all posts from mongodb
// window.onload = getMaxID();
window.onload = loadAllPosts();


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
        title.className = 'post-title'

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
          let postid = delBtn.path[0].id
          fetch(API_DELETE_ID+postid, {
            method: 'POST',
            headers: {
              'content-type':'application/json'
            }
          });
          //make sure the server has enough time to fetch the new data
          setTimeout(loadAllPosts, 1000);
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
};


