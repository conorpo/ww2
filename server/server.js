const express = require('express');
const path = require('path');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mapService = require("./map.js")

app.use(express.static(path.join(__dirname, '..' , 'public')));

let players = [];
let bullets = [];
const cfg = {
    bS: 12, //bullet Speed
    bL: 2000/12, //bulletlife in ms
    tR: 20//tick rate of server
}
let score = [];
for(let i = 0; i < 9; i++){score.push(null)};
let round = 1;
const roundLength =  60 * 1000 //ms
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

io.on('connection', socket => {
    socket.emit("map", mapService.map);
    socket.emit("id", socket.id);
    let player = {"id":socket.id,"x":0,"y":0,"angle":0, "changeID":0};
    players.push(player);
    socket.on("fire", (angle) => {
        player.angle = angle;
        const bulletAngle = angle;
        const bullet = {"x": player.x+Math.cos(bulletAngle+Math.PI/8)*40, "y": player.y+Math.sin(bulletAngle+Math.PI/8)*40, "angle": bulletAngle, "dx":Math.cos(bulletAngle)*cfg.bS, "dy":Math.sin(bulletAngle)*cfg.bS, "lifespan": cfg.bL};
        bullets.push(bullet);
    })
    socket.on('update', updateObj => {
        if(updateObj.dx != 0 || updateObj.dy != 0){
            player.x += updateObj.dx;
            player.y += updateObj.dy;
            player.changeID = updateObj.id;
        }
        player.angle = updateObj.angle;
    })
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
    }
    bullets.forEach(bullet => {
        bullet.x+=bullet.dx;
        bullet.y+=bullet.dy;
    })
    data.bullets = bullets;
    data.players = players//.map(player => ({x:player.x, y:player.y, mx:player.mx, my:player.my}));   
    let roundTime = new Date() - startTime;
    roundScore.good+=Math.round(Math.random()-0.3);
    roundScore.bad+=Math.round(Math.random()-0.3);
    if(roundTime > roundLength){
        startTime = new Date();
        roundTime = 0;
        score[round-1] = (Math.random() < 0.5) ? "Good" : "Bad";
        roundScore.good = 0;
        roundScore.bad = 0;
        round++;
        mapService.getNewMap();
        console.log("emit map");
        io.emit("map", mapService.map);
        if(round > 9){
            //restart game
        }
    }
    data.game = {round, score}
    data.round = {progress: roundTime, score: roundScore, teams: teams[round-1], length: roundLength};
    io.emit("update", data);
}

const port = process.env.PORT || 3000;
http.listen(port, () => console.log(`Example app listening on port ${port}!`))