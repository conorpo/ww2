const goodImg = document.createElement("IMG");
goodImg.src = "assets/blue.svg";

const badImg = document.createElement("IMG");
badImg.src ="assets/red.svg";

const treeImgs = [];
treeImgs[0] = document.createElement("IMG");
treeImgs[1] = document.createElement("IMG");
treeImgs[2] = document.createElement("IMG");
treeImgs[0].src = "assets/tree0.svg";
treeImgs[1].src = "assets/tree1.svg";
treeImgs[2].src = "assets/tree2.svg";




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
    ctx.rect(-5004,-5004,10008,10008);
    ctx.stroke();
    ctx.restore();
}

function drawMap(){
    ctx.save();
    ctx.translate(-game.player.x,-game.player.y)
    game.map.forEach(object => {
        if(Math.abs(object[0]-game.player.x)-100 < width/(2*game.zoom) && Math.abs(object[1]-game.player.y)-100 < height/(2*game.zoom)){
            ctx.drawImage(treeImgs[object[2]], object[0] - 50 , object[1] - 50);
        }
    })
    ctx.stroke();
    ctx.restore();
}

function drawPlayer(){
    ctx.save();
        ctx.scale(0.23,0.23);
        ctx.rotate(game.player.angle);
        if(game.serverPlayer.team == "Good"){
            ctx.drawImage(goodImg,-125,-125);
        }else{
            ctx.drawImage(badImg,-125, -125);
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
            ctx.scale(0.23,0.23);
            ctx.rotate(lerpedPosition.angle);
            if(person.team == "Good"){
                ctx.drawImage(goodImg, -125 , -125);
            }else{
                ctx.drawImage(badImg, -125 , -125);
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
