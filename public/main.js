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
let player = {x: 0, y: 0, health:100, maxhealth:100, ammo: 20, maxammo: 20, angle: 0};
let heldInputs = {'w': 0, 'a': 0 , 's': 0 , 'd': 0};
let pressInputs = {'r':reload}
let map = [];
let bullets = [];
let round = {score: {Bad: 0, Good: 0}, teams: {Good: "Good", Bad:"Bad"}, progress: 0};
let game = {score: [], round:1};
let serverPlayer = {x:0, y:0, angle: 0, changeID: 0, id: null};
let zoom = 1;
const cfg = {
    zoomRate: 1.05
}
const heldKeys = Object.keys(heldInputs);
const pressKeys = Object.keys(pressInputs);
let changes = [];
let oldPlayerIds = [];

let interpolationStartTime = new Date();

//IO Stuff
const socket = io();
socket.on("update", gameData => {
    oldPlayers = players;
    oldPlayerIds = oldPlayers.map(player => player.id);

    players = gameData.players;


    const playerIds = players.map(player => player.id);
    serverPlayer = players.splice(playerIds.indexOf(player.id),1);
    bullets = gameData.bullets;
    round = gameData.round;
    game = gameData.game;

    interpolationLength = new Date() - interpolationStartTime;
    interpolationStartTime = new Date();
});

socket.on("id", id => {
    player.id = id;
    window.requestAnimationFrame(draw);
})

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
canvas.addEventListener("wheel",(evt) => {
    const scroll = evt.deltaY;
    if(scroll > 0){
        zoom/=cfg.zoomRate;
    }else if(scroll < 0){
        zoom*=cfg.zoomRate;
    }

})

function calculateAngle(){
    return (mouse.x < 0) ? Math.atan(mouse.y/mouse.x) 
    + Math.PI : Math.atan(mouse.y/mouse.x);
}

function fire(){
    if(readyToFire && !reloading){
        socket.emit("fire", calculateAngle());
        readyToFire = false;
        player.ammo--;
        if(player.ammo == 0){ reload() };
    }
}

function reload(){
    reloading = true;
    setTimeout(() => {
        player.ammo = 20;
        reloading = false;
    }, 3000)
}

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

ctx.fillStyle = "green";
ctx.strokeStyle = "red";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "18px Arial";

let regenerating = false;
let regenTimeout = null;
function damage(amount){
    if(player.health - amount < 0){
        //Die
    }else{
        player.health-=amount;
        regenerating = false;
        clearInterval(regenTimeout);
        regenTimeout = setTimeout(function(){
            regenerating = true;
        },2000)
    }
}


function draw(){
    ctx.fillRect(0,0,width,height);
    ctx.save();
        ctx.translate(width/2, height/2);

        let change = {}
        change.id = changes.length + 1;
        player.y += change.dy = (heldInputs.s-heldInputs.w);
        player.x += change.dx = (heldInputs.d-heldInputs.a);
        change.angle = player.angle = calculateAngle();
        socket.emit('update', change);
        if(change.dy != 0 || change.dx != 0){
            changes.push(change);
        }

        if(regenerating && player.health < 100){ player.health+=1 }
        if(Math.random()<0.05 && player.x > 0) {damage(5)};
        
        ctx.scale(zoom,zoom);

        reconcile(); //Makes sure server data is same as client data
        drawMap(); //Draws map base don player position (to center player)

        drawPlayer();
        for(let i = 0; i < players.length; i++){
            drawEnemy(players[i]);
        }

        bullets.forEach(bullet => {
            drawBullet(bullet);
        })
        ctx.scale(1/zoom,1/zoom);
        drawUI();
        if(round.progress > round.length-(3*1000) || (game.round > 1 && round.progress < 7 * 1000)){
            drawFade();
        }
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
        if(Math.abs(object[0]-player.x)-100 < width/(2*zoom) && Math.abs(object[1]-player.y)-100 < height/(2*zoom)){
            ctx.drawImage(treeImg, object[0] - 50 , object[1] - 50, 100,100);
        }
    })
    ctx.stroke();
    ctx.restore();
}

function drawPlayer(){
    ctx.save();
        ctx.scale(0.5,0.5);
        ctx.rotate(player.angle);
        ctx.drawImage(playerImg, -105 , -105);
    ctx.restore();
}

function drawEnemy(person){
    ctx.save();
        const index = oldPlayerIds.indexOf(person.id);
        if(index != -1){
            const oldVersion = oldPlayers[oldPlayerIds.indexOf(person.id)];
            const lerpedPosition = lerp(oldVersion, person, new Date()-interpolationStartTime);
            ctx.translate(lerpedPosition.x-player.x, + lerpedPosition.y-player.y);
            ctx.scale(0.7,0.7);
            ctx.rotate(lerpedPosition.angle);
            ctx.drawImage(playerImg, -105 , -105);
        }else{

        }

       
    ctx.restore();
}

function drawUI(){
    ctx.save();
        ctx.translate(-width/2,-height/2)
        ctx.fillStyle = "#CCCCCC";
        ctx.fillRect(20,20,200,55);
        //Health Bar
        ctx.fillStyle = " #cb433c";
        ctx.fillRect(25,25,190*(player.health/player.maxhealth),20);
        ctx.fillStyle = "black";
        ctx.fillText(player.health, 120, 35);
        //Ammo Bar
        ctx.fillStyle = "#eb984e";
        ctx.fillRect(25,50,190*(player.ammo/player.maxammo), 20)
        ctx.fillStyle = "black";
        if(reloading){
            ctx.fillText("Reloading", 120, 60);
        }else{
            ctx.fillText(player.ammo, 120, 60);
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
        ctx.fillRect(player.x/50 + width - 110 - 2, player.y/50 + 110 -2, 4, 4)

        //Round Info
        ctx.lineWidth = 4;
        ctx.fillStyle = "grey";
        ctx.fillRect(width/2 - 450, 20 , 900, 40);
        for(let i = 0; i < game.score.length; i++){
            outcome =  game.score[i];
            if(outcome != null){
                if(outcome == "Good"){
                    ctx.fillStyle = "blue";
                }else{
                    ctx.fillStyle = "red";
                }
                ctx.fillRect(width/2 - (100 * (4-i)) -50, 20, 100 , 40);
            }else if(i == game.round -1){
                ctx.fillStyle = "orange";
                ctx.fillRect(width/2 - (100 * (4-i)) -50, 20, round.progress*100/round.length , 40);
            }
            ctx.beginPath();
            ctx.moveTo(width/2 - (100 * (4-i)) + 50, 20);
            ctx.lineTo(width/2 - (100 * (4-i)) + 50, 60);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.rect(width/2 - 450, 20 , 900, 40);
        ctx.stroke();

        //Current 
        const scoreString = round.teams.good + " : " + round.score.good + " - " + round.score.bad + " : " + round.teams.bad;
        ctx.fillText(scoreString, width/2, 100);


    ctx.restore();

}

function drawFade(){
    ctx.save();
    ctx.translate(-width/2,-height/2);
    ctx.fillStyle = "black";
    if(round.progress > round.length - (3 * 1000)){
        ctx.globalAlpha = 1-((round.length-round.progress)/(3*1000));
    }else{
        ctx.globalAlpha = Math.min(1, 1-((round.progress-(4 * 1000))/(3*1000)))
    }
    ctx.fillRect(0,0,width,height);
    ctx.restore();
}

function reconcile(){
    if(serverPlayer.changeID < changes.length){
        let untrackedChanges = changes.slice(serverPlayer.changeID, changes.length)
        if(untrackedChanges.length == 0){
            console.log("final mismatch");
            changes = [];
            if(player.x != serverPlayer.x || player.y != serverPlayer.y){;
                player.x = serverPlayer.x;
                player.y = serverPlayer.y;
            }
        }else{
            const changeSum = untrackedChanges.reduce((a,b) => ({dx: a.dx+b.dx, dy: a.dy+b.dy})); 
            const xSync = (player.x == serverPlayer.x + changeSum.dx);
            const ySync = (player.y == serverPlayer.y + changeSum.dy);
            if(!xSync || !ySync){
                console.log("mismatch");
            }
        }
    }
}

function lerp(old, current, progress){ //progress in milliseconds
    const progressPercent = progress/interpolationLength;
    if(progressPercent >= 1){
        return current;
    }else{
        return {
            x:((current.x-old.x)*progressPercent)+old.x,
            y:((current.y-old.y)*progressPercent)+old.y,
            angle:((current.angle-old.angle)*progressPercent)+old.angle
        }
    }
}