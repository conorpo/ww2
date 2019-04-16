const canvas = document.getElementById("myCanvas");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

const playerImg = document.createElement("IMG");
playerImg.src = "assets/player_temp.png";

const treeImg = document.createElement("IMG");
treeImg.src ="assets/tree_temp.png";

let players = [];
let mouse  = {x: 0, y: 0};
let player = {x: 0, y: 0, health:100, ammo: 20, maxammo: 20};
let inputs= {'w': 0, 'a': 0 , 's': 0 , 'd': 0};
let map = [];
let bullets = [];
const keys = Object.keys(inputs);

//IO Stuff
const socket = io();
socket.on("update", gameData => {
    players = gameData.players;
    bullets = gameData.bullets;
});

socket.on("map", serverMap => {
    map = serverMap;
})


canvas.addEventListener("mousemove", (evt) => {
    mouse = {
      x: evt.clientX - rect.left - width/2,
      y: evt.clientY - rect.top - height/2
    };
})

let readyToFire = false;
let mouseDown = false;
let reloading = false;
firingInterval = setInterval(() => {
    readyToFire = true;
    if(mouseDown){
        fire();
    }
},300);
canvas.addEventListener("mousedown", (evt) => {
    fire();
    mouseDown = true;
})

canvas.addEventListener("mouseup", (evt) => {
    mouseDown = false;
})

function fire(){
    if(readyToFire && !reloading){
        socket.emit("fire", null);
        readyToFire = false;
        player.ammo--;
        if(player.ammo == 0){
            reloading = true;
            setTimeout(() => {
                player.ammo = 20;
                reloading = false;
            }, 3000)
        }
    }
}

document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if(keys.includes(key)){
        inputs[key] = 5;
    }
})

document.addEventListener("keyup", (evt) => {
    const key = evt.key;
    if(keys.includes(key)){
        inputs[key] = 0;
    }
})

ctx.fillStyle = "green";
ctx.strokeStyle = "red";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "18px Arial"

function draw(){
    ctx.fillRect(0,0,width,height);
    ctx.save();
        ctx.translate(width/2, height/2);

        player.x+=(inputs.d-inputs.a);
        player.y+=(inputs.s-inputs.w);
        socket.emit('position', {player,mouse});

        drawMap();

        for(let i = 0; i < players.length; i++){
            //Add optimization
            drawPlayer(players[i]);
        }

        bullets.forEach(bullet => {
            //Add optimization
            drawBullet(bullet);
        })

        drawUI();
    ctx.restore();
    window.requestAnimationFrame(draw)
}

function drawBullet(bullet){
    ctx.save();
        ctx.translate(bullet.x-player.x,bullet.y-player.y)
        ctx.rotate(bullet.angle);
        ctx.fillStyle="coral";
        ctx.fillRect(0,0,20,5);
    ctx.restore();
}

function drawMap(){
    ctx.save();
    ctx.translate(-player.x,-player.y)
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.rect(-5004,-5004,10008,10008);
    ctx.stroke();
    map.forEach(object => {
        if(Math.abs(object[0]-player.x)-100 < width/2 && Math.abs(object[1]-player.y)-100 < height/2){
            ctx.drawImage(treeImg, object[0] - 50 , object[1] - 50, 100,100);
        }
    })
    ctx.stroke();
    ctx.restore();
}

function drawPlayer(person){
    ctx.save();
        ctx.translate(person.x-player.x, +person.y-player.y);
        ctx.scale(0.5,0.5);
        let angle = Math.atan((person.my)/(person.mx));
        if(person.mx < 0){
            angle+=Math.PI;
        }
        ctx.rotate(angle);
        ctx.drawImage(playerImg, -105 , -105);
    ctx.restore();
}

function drawUI(){
    ctx.save();
        ctx.translate(-width/2,-height/2)
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(20,20,200,55);
        //Health Bar

        //Ammo Bar
        ctx.fillStyle = "coral";
        ctx.fillRect(25,25,190*(player.ammo/player.maxammo), 20)
        ctx.fillStyle = "black";
        if(reloading){
            ctx.fillText("Reloading", 120, 35);
        }else{
            ctx.fillText(player.ammo, 120, 35);
        }

        //Health Box
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.rect(25,25,190,20);
        ctx.stroke();
        //Ammo Box
        ctx.beginPath();
        ctx.rect(25,50,190,20)
        ctx.stroke();
        //Minimap
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.rect(width-210, 10, 200, 200);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "#CCCCCC";
        ctx.beginPath();
        ctx.rect(width-210, 10, 200, 200);
        ctx.stroke();
        map.forEach(object => {
            ctx.fillRect(object[0]/50+width-110-1,object[1]/50+110-1, 2 , 2)
        })
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(player.x/50 + width - 110 - 1, player.y/50 + 110 -1, 2, 2)

    ctx.restore();

}

window.requestAnimationFrame(draw);

