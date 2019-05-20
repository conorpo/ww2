const express = require('express');
const path = require('path');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mapService = require("./map.js");
const helper = require("./util.js")
const uniqid = require("uniqid");

app.use(express.static(path.join(__dirname, '..' , 'public')));

let players = [];
let bullets = [];
const cfg = {
    bS: 30, //bullet Speed
    bL: 2000/12, //bulletlife in ms
    tR: 20,//tick rate of server
    bD: 8,//bulletDamage
    rL: 20 * 1000 //round length in ms
}
let score = [];
for(let i = 0; i < 9; i++){score.push(null)};
let round = 1;
let roundScore = {bad: 0, good: 0};
const teams = [
    {bad:"Spanish", good:"Native Americans"},
    {bad:"Sickness", good:"Americans"},
    {bad:"British", good:"Americans"},
    {bad:"Men", good:"Women"},
    {bad:"Confederates", good:"Union"},
    {bad:"Whites", good:"Blacks"},
    {bad:"Nazi", good:"Americans"},
    {bad:"Communists", good:"Americans"},
    {bad:"Terrorists", good:"Americans"}
]
let startTime = new Date();

let killFeed = [];

function addToKillFeed(event){
  killFeed.unshift(event);
  setTimeout(function(){
    killFeed.pop();
  },5500);
}


io.on('connection', socket => {
    socket.on("join", queryObject => {
        socket.join("main");
        console.log("join");
        socket.emit("map", mapService.map);
        socket.emit("id", socket.id);
        if(queryObject.team != "Good" && queryObject.team != "Bad"){
            queryObject.team = (Math.random() < 0.5) ? "Good" : "Bad";
        }
        if(queryObject.name.trim() === ""){
            queryObject.name = helper.names[Math.floor(helper.names.length*Math.random())];
        }
        let player = {username: queryObject.name, team: queryObject.team, respawnTime: 10, alive: true, "id":socket.id,"x":0,"y":0,"angle":0, "changeID":0, "health":100};
        players.push(player);
        socket.on("fire", (angle) => {
            if(!player.alive){ return; }
            player.angle = angle;
            const bulletAngle = angle;
            const bullet = {"id":uniqid.time(),"source":player.username,"team":player.team,"x": player.x,"y": player.y, "angle": bulletAngle, "dx":Math.cos(bulletAngle)*cfg.bS, "dy":Math.sin(bulletAngle)*cfg.bS, "lifespan": cfg.bL};
            bullet.x -= bullet.dy/2;
            bullet.y += bullet.dx/2
            bullets.push(bullet);
        })
        socket.on('update', updateObj => {
            if(!player.alive){ return; }
            if(updateObj.dx != 0 || updateObj.dy != 0){
                player.x += updateObj.dx;
                player.y += updateObj.dy;
                player.changeID = updateObj.id;
            }
            player.angle = updateObj.angle;
        })
        socket.on("disconnect", () => {
            let playerIds = players.map(player => player.id);
            players.splice(playerIds.indexOf(player.id),1);
        })   
    });
})

let updateLoop = setInterval(updateClients, 1000/cfg.tR);
function updateClients(){
    const data = {};
    for(let i = 0; i < bullets.length; i++){
        let bullet = bullets[i];
        bullet.lifespan--;
        if(bullet.lifespan < 0){
            bullets.splice(i,1);
            i--;
            continue;
        }
        bullet.x+=bullet.dx;
        bullet.y+=bullet.dy;

        //Check for impact
        for(let j = 0; j < mapService.map.length; j++){
            const object = mapService.map[j];
            const distance = (object[3]) ? 3000 : 300;
            if(helper.checkDistance(object[0], object[1], bullet.x, bullet.y, distance)){
                //Bullet hits tree
                bullets.splice(i,1);
                i--;
                break;
            }
        }

        for(let j = 0; j < players.length; j++){
            let player = players[j];
            if(player.team == bullet.team || !player.alive){ continue; }
            if(helper.checkDistance(player.x, player.y, bullet.x, bullet.y, 2000)){
                //Player got hit
                bullets.splice(i,1);
                i--;
                player.health-=cfg.bD;
                if(player.health <= 0){
                    //Add score to appropriate team
                    addToKillFeed({t:{name: player.username, team: player.team}, 
                                   s:{name: bullet.source, team: bullet.team}})
                    roundScore[bullet.team.toLowerCase()]++;
                    player.alive = false;
                    player.respawnTime = 160; // * 50 ms
                }
                break;
            }
        }
    }
    for(let i = 0; i < players.length; i++){
        let player = players[i];
        if(!player.alive){
            player.respawnTime--;
            if(player.respawnTime <= 0){
                player.x = 0;
                player.y = 0;
                player.alive = true;
                player.health = 100;
                player.changeID = 999999;
            }
        }
    }
    data.bullets = bullets;
    data.players = players//.map(player => ({x:player.x, y:player.y, mx:player.mx, my:player.my}));   
    let roundTime = new Date() - startTime;
    if(roundTime > cfg.rL){
        startTime = new Date();
        roundTime = 0;
        if(round == 9){
            round = 1;
            score = [];
            for(let i = 0; i < 9; i++){score.push(null)};
        }else{
            if(roundScore.good == roundScore.bad){
                if(Math.random()<0.5){
                    roundScore.good++;
                }else{
                    roundScore.bad++;
                }
            }
            score[round-1] = (roundScore.good > roundScore.bad) ? "Good" : "Bad";
            round++;
        }
        roundScore.good = 0;
        roundScore.bad = 0;
        mapService.getNewMap();
        io.emit("map", mapService.map);
    }
    data.killFeed = killFeed;
    data.game = {round, score}
    data.round = {progress: roundTime, score: roundScore, teams: teams[round-1], length: cfg.rL};
    io.in("main").emit("update", data);
}

const port = process.env.PORT || 3000;
http.listen(port, () => console.log(`Example app listening on port ${port}!`))