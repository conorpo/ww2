const canvas = document.getElementById("myCanvas");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
const closeStory = document.getElementById("storyClose");
const story = document.getElementById("storyBox");
const storyH = document.getElementById("storyHead");
const storyB = document.getElementById("storyBody");

//Mouse

let mouse  = {x: 0, y: 0};
canvas.addEventListener("mousemove", (evt) => {
    mouse = {
      x: evt.clientX - rect.left - width/2,
      y: evt.clientY - rect.top - height/2
    };
})

let mouseDown = false;
canvas.addEventListener("mousedown", (evt) => {
    game.fire();
    mouseDown = true;
})

canvas.addEventListener("mouseup", (evt) => {
    mouseDown = false;
})
canvas.addEventListener("wheel",(evt) => {
    const scroll = evt.deltaY;
    if(scroll > 0 && game.zoom > 1){
        game.zoom/=game.cfg.zoomRate;
    }else if(scroll < 0 && game.zoom < 4){
        game.zoom*=game.cfg.zoomRate;
    }

})


closeStory.addEventListener("click", () => {
    story.style.display = "none";
})

function openStoryBox(round){
    story.style.display = "initial"
    storyH.innerText = "Time Period " + round;
    storyB.innerText = storyTexts[round];
    console.log("Opened " + round)
}


//Keyboard

let heldInputs = {'w': 0, 'a': 0 , 's': 0 , 'd': 0};
let pressInputs = {'r':game.reload}
const heldKeys = Object.keys(heldInputs);
const pressKeys = Object.keys(pressInputs);

document.addEventListener("keydown", (evt) => {
    const key = evt.key.toLocaleLowerCase();
    if(heldKeys.includes(key)){
        heldInputs[key] = 5;
    }
})

document.addEventListener("keyup", (evt) => {
    const key = evt.key.toLocaleLowerCase();
    if(heldKeys.includes(key)){
        heldInputs[key] = 0;
    }else if(pressKeys.includes(key)){
        pressInputs[key](); //Calls corresponding function
    }
})

function loadImage(url){
    const image = document.createElement("img");
    image.src = "assets/"+url;
    return image;
  }


function deparam(uri){
    if(uri === undefined){
      uri = window.location.search;
    }
    var queryString = {};
    uri.replace(
      new RegExp(
        "([^?=&]+)(=([^&#]*))?", "g"),
        function($0, $1, $2, $3) {
        	queryString[$1] = decodeURIComponent($3.replace(/\+/g, '%20'));
        }
      );
    return queryString;
};

let queryObject = deparam(window.location.search);
socket.emit("join",queryObject);


const storyTexts = [null, 
    "This period is basically everything that happened prior to the arrival of the English. The start of the period, 1491 (the year before Christopher Columbus “sailed the ocean blue”), is really shorthand for “before the Europeans showed up.” The end of the period is 1607, the year that the English landed in Jamestown, Virginia and founded the first permanent English settlement in the New World. In a nutshell, this period focuses on Native Americans and on early, non-English exploration of the New World, especially that of the Spanish. This is why round 1 is Native Americans vs Spanish",
    "The next period is largely focused on European (including the British this time) exploration and settlement. The beginning date is the founding of Jamestown, as discussed above. The end date is the start of the French and Indian War, which totally changed the game in the British colonies. This is why round 2 is colonists vs. sickness",
    "Here we start to focus exclusively on the British colonies that will turn into the United States. The starting year, 1754, is the beginning of the French and Indian War. This marked the end of salutary neglect and the beginning of growing tensions between the colonies and Great Britain. The period takes you through the tumultuous revolution and its aftermath to the year 1800, in which the new democracy is solidified by its first official peaceful transfer of power between two political parties. This is why round 3 is Patriots vs British",
    "The U.S. was growing in territory and strength, but faced internal threats to its stability. This is why round 4 is women vs. men",
    "Period 5 centers on the Civil War—its causes, events, and aftermath. This is why round 5 is union vs confederates",
    "This is the Gilded Age, where America was bright and shiny on the outside (industrial growth, wealth, railroads, big cities, population growth) and dark and grimy underneath (terrible working conditions, socioeconomic stratification, racism, political corruption). This is why round 6 is black people vs. white people",
    "This period sees the United States starting to get pulled onto the world stage in a big way for the first time. This is why round 7 is americans vs. nazis.",
    "In the aftermath of World War II, the United States emerged as one of two major world powers. The Cold War dominated foreign policy, while domestically, the U.S. went through many social changes. This why round 8 is americans vs. communists",
    "This is the modern, post-Cold War era. This is why round 9 is americans vs. terrorists"
]

openStoryBox(1);