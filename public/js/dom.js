const canvas = document.getElementById("myCanvas");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();


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
    if(scroll > 0 && game.zoom > 0.6){
        game.zoom/=game.cfg.zoomRate;
    }else if(scroll < 0 && game.zoom < 4){
        game.zoom*=game.cfg.zoomRate;
    }

})





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
