import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {getDatabase, ref, onValue, set, get, child, update, remove} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://dachser-endorsement-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const feedsInDB = ref(database, "dachserFeeds")

const feedEl = document.getElementById('feed')
const feedInput = document.getElementById('feed-input')
const feedFrom = document.getElementById('feed-from')
const feedTo = document.getElementById('feed-to')

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       checkCookieLikes(e.target.dataset.like) 
    }
    else if (e.target.dataset.trash){
        handleTrashClick(e.target.dataset.trash)
    }
    else if(e.target.id === 'feed-btn'){
        handleFeedBtnClick()
    }
})

function setLike(feedID) {
    document.cookie=feedID+'=y';
}

function hasLiked(feedID) {
    let cookies=document.cookie.split(';')
    for (let i=0;i<cookies.length;i++) {
        let cookie=cookies[i].split('=');

        for(let j=0; j<cookie.length;j++) {
            console.log(cookie[0].trim())
            if (cookie[0].trim()==feedID) return true;
        }
            
    }
    return false;
}

function checkCookieLikes(feedId) {

    if (!hasLiked(feedId)) {
        handleLikeClick(feedId);
        setLike(feedId);
    } else {
        alert('You cant like twice');
    }
}

function handleLikeClick(feedId){
       
    get(child(feedsInDB, `${feedId}`)).then((snapshot) => {
        if (snapshot.exists()) {
            let currentFeed = snapshot.val()
            let currentLikes = currentFeed.likes

            currentLikes += 1

            update(ref(database,'dachserFeeds/' + feedId), {
                isLiked: true,
                likes: currentLikes
            } )

        }
    })     
                  
}  
        
 

function handleFeedBtnClick(){

    if(feedInput.value){

        let uuidValue = uuidv4()
        
        set(ref(database, 'dachserFeeds/' + uuidValue), {
            from: feedFrom.value,
            to: feedTo.value,
            likes: 0,
            feedText: feedInput.value,
            isLiked: false,
            uuid: uuidValue
          });

        clearInputFieldEl()
                
    }
}

function handleTrashClick(feedId){

    let exactLocationOfFeedInDB = ref(database, `dachserFeeds/${feedId}`)
        
    remove(exactLocationOfFeedInDB)
}


onValue(feedsInDB, function(snapshot) {
    if (snapshot.exists()) {

        let feedsArray = Object.entries(snapshot.val()).reverse()
    
        clearFeedEl()
        
        for (let i = 0; i < feedsArray.length; i++) {
            let currentItem = feedsArray[i]
           
          
                      
            appendFeedToFeedEl(currentItem)
        }  

    } else {
        feedEl.innerHTML = "Zatiaľ žiadne pochvaly ..."
    }
})

function clearFeedEl() {
    feedEl.innerHTML = ""
}

function clearInputFieldEl() {
    feedInput.value = ''
    feedFrom.value = ''
    feedTo.value = ''
}

function appendFeedToFeedEl(feed) {

    let feedValue = feed[1]
    let likeIconClass = ''
        
        if (feedValue.isLiked){
            likeIconClass = 'liked'
        }
        
    let newEl = document.createElement("div")

    newEl.className = "feed"
    
    newEl.innerHTML =  `

        <div class="feed-details">
            <p class="to-output">Pre: ${feedValue.to}</p>
            <span class="feed-detail">
                <i class="fa-solid fa-trash" data-trash="${feedValue.uuid}"></i>
            </span>      
        </div>           
        
        <p class="feed-text">${feedValue.feedText}</p>

        <div class="feed-details">
            <p class="from-output">Od: ${feedValue.from}</p>
            <span class="feed-detail">
                <i class="fa-solid fa-heart ${likeIconClass}" data-like="${feedValue.uuid}"></i>
                ${feedValue.likes}
            </span>      
        </div>           
`

    feedEl.append(newEl)
}

