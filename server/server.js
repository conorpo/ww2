const express = require('express');
const path = require('path');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const map = require("./map.js")

app.use(express.static(path.join(__dirname, '..' , 'public')));

let players = [];
let bullets = [];
const bS = 15; //bullet Speed

io.on('connection', socket => {
    socket.emit("map", map);
    let player = {"id":socket.id,"x":0,"y":0,"mx":0,"my":0};
    players.push(player);
    socket.on("fire", () => {
        const bulletAngle = (player.mx < 0) ? Math.atan(player.my/player.mx) + Math.PI : Math.atan(player.my/player.mx);
        const bullet = {"x": player.x, "y": player.y, "angle": bulletAngle, "dx":Math.cos(bulletAngle)*bS, "dy":Math.sin(bulletAngle)*bS};
        bullets.push(bullet);
    })
    socket.on('position', position => {
        player.x = position.player.x;
        player.y = position.player.y;
        player.mx = position.mouse.x;
        player.my = position.mouse.y;
    })
})

let updateLoop = setInterval(updateClients, 12);
function updateClients(){
    bullets.forEach(bullet => {
        bullet.x+=bullet.dx;
        bullet.y+=bullet.dy;
    })   
    io.emit("update", {players:players.map(player => ({x:player.x, y:player.y, mx:player.mx, my:player.my})), bullets: bullets});
}

const port = process.env.PORT || 3000;
http.listen(port, () => console.log(`Example app listening on port ${port}!`))