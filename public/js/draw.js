let treeImgs = [];
treeImgs[0] = loadImage("tree0.svg");
treeImgs[1] = loadImage("tree1.svg");
treeImgs[2] = loadImage("tree2.svg");

let rockImgs = [];
rockImgs[0] = loadImage("rock0.svg");
rockImgs[1] = loadImage("rock1.svg");
rockImgs[2] = loadImage("rock2.svg");



let playerImgs = [];
for(let i = 1; i < 10 ; i++){
  playerImgs.push({
    "good":loadImage("good"+i+".png"),
    "bad":loadImage("bad"+i+".png")
  })
}



ctx.fillStyle = "green";
ctx.strokeStyle = "red";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "18px Arial";


function draw(){
    ctx.fillRect(0,0,width,height);
    ctx.save();
        ctx.translate(width/2, height/2);

        ctx.scale(game.zoom,game.zoom);

        game.update();

        drawBackground();

        ctx.fillStyle = "#000000"
        drawPlayer();
        for(let i = 0; i < game.players.length; i++){
            if(game.players[i].alive){
                drawEnemy(game.players[i]);
            }
        }

        game.bullets.forEach(bullet => {
            drawBullet(bullet);
        })

        drawMap();   //Draws map based on player position (to center player)

        ctx.scale(1/game.zoom,1/game.zoom);
        drawUI();
        if(game.round.progress > game.round.length-(3*1000) || (game.round.number > 1 && game.round.progress < 7 * 1000)){
            drawFade();
        }
    ctx.restore();

    window.requestAnimationFrame(draw);

}


function drawBullet(bullet){
    ctx.save();

        const index = game.oldBulletIds.indexOf(bullet.id);
        if(index != -1){
            const oldVersion = game.oldBullets[index];
            const lerpedPosition = game.lerp(oldVersion, bullet);
            ctx.translate(lerpedPosition.x-game.player.x,lerpedPosition.y-game.player.y)
            ctx.rotate(bullet.angle);
            ctx.fillStyle="coral";
            ctx.fillRect(0,0,20,5);
        }else{
            ctx.translate(bullet.x-game.player.x,bullet.y-game.player.y)
            ctx.rotate(bullet.angle);
            ctx.fillStyle="coral";
            ctx.fillRect(0,0,20,5);
        }
    ctx.restore();
}

function drawBackground(){
    ctx.save();
    ctx.translate(-game.player.x,-game.player.y)
    ctx.beginPath();
    ctx.lineWidth = 30;
    ctx.rect(-5004,-5004,10008,10008);
    ctx.stroke();
    ctx.restore();
}

function drawMap(){
    ctx.save();
    ctx.translate(-game.player.x,-game.player.y)
    game.map.forEach(object => {
        if(Math.abs(object[0]-game.player.x)-100 < width/(2*game.zoom) && Math.abs(object[1]-game.player.y)-100 < height/(2*game.zoom)){
            if(object[3]){
                ctx.drawImage(rockImgs[object[2]], object[0] - 50 , object[1] - 50);
            }else{
                ctx.drawImage(treeImgs[object[2]], object[0] - 50 , object[1] - 50);
            }
        }
    })
    ctx.restore();
}

function drawPlayer(){
    ctx.save();
        ctx.fillText(game.serverPlayer.username, 0, -60);
        ctx.scale(0.3,0.3);
        ctx.rotate(game.player.angle);
        if(game.serverPlayer.team == "Good"){
            ctx.drawImage(playerImgs[game.round.number-1].good,-125,-125);
        }else{
            ctx.drawImage(playerImgs[game.round.number-1].bad,-125, -125);
        }
    ctx.restore();
}

function drawEnemy(person){
    ctx.save();
        const index = game.oldPlayerIds.indexOf(person.id);
        if(index != -1){
            const oldVersion = game.oldPlayers[index];
            const lerpedPosition = game.lerp(oldVersion, person);
            ctx.translate(lerpedPosition.x-game.player.x, + lerpedPosition.y-game.player.y);
            ctx.fillText(person.username, 0, -60);           
            ctx.scale(0.3,0.3);
            ctx.rotate(lerpedPosition.angle);
            if(person.team == "Good"){
                ctx.drawImage(playerImgs[game.round.number-1].good, -125 , -125);
            }else{
                ctx.drawImage(playerImgs[game.round.number-1].bad, -125 , -125);
            }
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
        ctx.fillRect(25,25,190*(game.player.health/game.player.maxhealth),20);
        ctx.fillStyle = "black";
        ctx.fillText(game.player.health, 120, 35);
        //Ammo Bar
        ctx.fillStyle = "#eb984e";
        ctx.fillRect(25,50,190*(game.player.ammo/game.player.maxammo), 20)
        ctx.fillStyle = "black";
        if(game.reloading){
            ctx.fillText("Reloading", 120, 60);
        }else{
            ctx.fillText(game.player.ammo, 120, 60);
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
        game.map.forEach(object => {
            ctx.fillRect(object[0]/50+width-110-1,object[1]/50+110-1, 2 , 2)
        })
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(game.player.x/50 + width - 110 - 2, game.player.y/50 + 110 -2, 4, 4)

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
            }else if(i == game.round.number -1){
                ctx.fillStyle = "orange";
                ctx.fillRect(width/2 - (100 * (4-i)) -50, 20, game.round.progress*100/game.round.length , 40);
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
        const scoreString = game.round.teams.good + " : " + game.round.score.good + " - " + game.round.score.bad + " : " + game.round.teams.bad;
        ctx.fillText(scoreString, width/2, 100);


        //Draw killfeed
        for(let i = 0; i < game.killFeed.length; i++){
            const kill = game.killFeed[i];
            ctx.fillStyle = "#BBBBBB";
            ctx.fillRect(width-210,220+i*40,200,30);
            ctx.fillStyle = "black";
            ctx.fillText("killed",width-110,235+i*40);
            ctx.fillStyle = (kill.s.team == "Good") ? "blue" : "red";
            ctx.textAlign="right";
            ctx.fillText(kill.s.name,width-135,235+i*40)
            ctx.fillStyle = (kill.t.team == "Good") ? "blue" : "red";
            ctx.textAlign="left";
            ctx.fillText(kill.t.name,width-85,235+i*40)
        }

    ctx.restore();
}

function drawFade(){
    ctx.save();
    ctx.translate(-width/2,-height/2);
    ctx.fillStyle = "black";
    if(game.round.progress > game.round.length - (3 * 1000)){
        ctx.globalAlpha = 1-((game.round.length-game.round.progress)/(3*1000));
    }else{
        ctx.globalAlpha = Math.min(1, 1-((game.round.progress-(4 * 1000))/(3*1000)))
    }
    ctx.fillRect(0,0,width,height);
    ctx.restore();
}
