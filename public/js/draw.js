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

const bulletImg = loadImage("bullet.svg");
const arrowImg = loadImage("arrow.svg")

const offCanv = {
    grid: document.createElement("canvas"),
    minimap: document.createElement("canvas"),
    fui: document.createElement("canvas"),
    bui: document.createElement("canvas")
}


ctx.fillStyle = "green";
ctx.strokeStyle = "red";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "18px Arial";

(function(){
    offCanv.gridSize = 200;
    offCanv.grid.width = width + offCanv.gridSize*2.5;
    offCanv.grid.height = height + offCanv.gridSize*2.5;
    const gCtx = offCanv.grid.getContext("2d");
    
    gCtx.fillStyle = "#248525";
    gCtx.fillRect(0,0,width+offCanv.gridSize*2.5,height+offCanv.gridSize*2.5);
    gCtx.strokeStyle = "#1F5F1F"
    gCtx.lineWidth = 10;
    for(let x = (width/2)%offCanv.gridSize; x < width + offCanv.gridSize*2.5; x+=offCanv.gridSize){
        gCtx.beginPath();
        gCtx.moveTo(x,0);
        gCtx.lineTo(x,offCanv.grid.height);
        gCtx.stroke();
    }
    for(let y = (height/2)%offCanv.gridSize; y < height + offCanv.gridSize*2.5; y+=offCanv.gridSize){
        gCtx.beginPath();
        gCtx.moveTo(0,y);
        gCtx.lineTo(offCanv.grid.width,y);
        gCtx.stroke();
    }

    //Minimap
    offCanv.minimap.width = 200;
    offCanv.minimap.height = 200;
    offCanv.mCtx = offCanv.minimap.getContext("2d");
    offCanv.mCtx.strokeStyle = "white";
    drawMinimap()

    offCanv.fui.width = offCanv.bui.width = width;
    offCanv.fui.height = offCanv.bui.height = height;
    const bCtx = offCanv.bui.getContext("2d");
    const fCtx = offCanv.fui.getContext("2d");


    bCtx.fillStyle = "#CCCCCC";
    bCtx.fillRect(20,20,200,55);

    bCtx.lineWidth = 4;
    bCtx.fillStyle = "grey";
    bCtx.fillRect(width/2 - 450, 20 , 900, 40);

    bCtx.fillStyle = "#DDDDDD";
    bCtx.strokeStyle = "black";
    bCtx.lineWidth = 3;
    bCtx.beginPath();
    bCtx.rect(width/2 - 150, 68, 300, 24);
    bCtx.stroke();
    bCtx.fill();
    //Health Box
    fCtx.strokeStyle = "black";
    fCtx.beginPath();
    fCtx.rect(25,25,190,20);
    fCtx.stroke();
    //Ammo Box
    fCtx.beginPath();
    fCtx.rect(25,50,190,20)
    fCtx.stroke();

    fCtx.lineWidth = 2;
    fCtx.strokeStyle = "white";
    fCtx.beginPath();
    fCtx.rect(width/2 - 450, 20 , 900, 40);
    fCtx.stroke();

    for(let i = 0; i < 9; i++){
        fCtx.beginPath();
        fCtx.moveTo(width/2 - (100 * (4-i)) + 50, 20);
        fCtx.lineTo(width/2 - (100 * (4-i)) + 50, 60);
        fCtx.stroke();
    }
})();

function drawMinimap(){
    offCanv.mCtx.fillStyle = "black";
    offCanv.mCtx.beginPath();
    offCanv.mCtx.rect(0, 0, 200, 200);
    offCanv.mCtx.fill();
    offCanv.mCtx.stroke();
    offCanv.mCtx.fillStyle = "#CCCCCC";
    game.map.forEach(object => {
        offCanv.mCtx.fillRect(object[0]/50 + 99,object[1]/50+99, 2 , 2)
    })
}

function draw(){
    ctx.save();
        
      
        ctx.translate(width/2, height/2);
        drawBackground();


        ctx.scale(game.zoom,game.zoom);
        ctx.drawImage(offCanv.grid,(-game.player.x%offCanv.gridSize)-offCanv.gridSize*1.25-width/2,(-game.player.y%offCanv.gridSize)-offCanv.gridSize*1.25-height/2);

        game.update();

        ctx.fillStyle = "#000000"

        if(game.serverPlayer.alive){
            drawPlayer();
        }
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
        }else if(!game.serverPlayer.alive){
            drawDeath();
        }

    ctx.restore();

    window.requestAnimationFrame(draw);

}

function drawDeath(){
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(-width/2,-height/2,width,height);
    ctx.fillStyle = "#DD3333";
    ctx.font = "60px Arial";
    ctx.fillText("You Died",0,0);
    ctx.restore();
}


function drawBullet(bullet){
    ctx.save();
        const drawnImg = (game.round.number == 1 && bullet.team == "Good") ? arrowImg : bulletImg;
        const index = game.oldBulletIds.indexOf(bullet.id);
        if(index != -1){
            const oldVersion = game.oldBullets[index];
            const lerpedPosition = game.lerp(oldVersion, bullet);
            ctx.translate(lerpedPosition.x-game.player.x,lerpedPosition.y-game.player.y)
            ctx.rotate(bullet.angle);
            ctx.drawImage(drawnImg,0,0);
        }else{
            ctx.translate(bullet.x-game.player.x,bullet.y-game.player.y)
            ctx.rotate(bullet.angle);
            ctx.drawImage(drawnImg,0,0);
        }
    ctx.restore();
}

function drawBackground(){
    ctx.save();
    ctx.translate(-game.player.x,-game.player.y);
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
        ctx.drawImage(offCanv.bui,0,0);
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

        //Minimap
        ctx.drawImage(offCanv.minimap, width-210, 10);
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(game.player.x/50 + width - 110 - 2, game.player.y/50 + 110 -2, 4, 4)

        ctx.strokeStyle = "white";
        //Round Info
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
        }

        //Current 
        ctx.fillStyle = "black";
        const scoreString = game.round.teams.good + " : " + game.round.score.good + " - " + game.round.score.bad + " : " + game.round.teams.bad;
        ctx.fillText(scoreString, width/2, 80);


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

        ctx.drawImage(offCanv.fui,0,0);

    ctx.restore();
}

function drawFade(){
    ctx.save();
    ctx.fillStyle = "black";
    ctx.font = "60px Arial"
    if(game.round.progress > game.round.length - (3 * 1000)){
        ctx.globalAlpha = 1-((game.round.length-game.round.progress)/(3*1000));
        ctx.fillRect(-width/2,-height/2,width,height);
    }else{
        ctx.globalAlpha = Math.min(1, 1-((game.round.progress-(4 * 1000))/(3*1000)));
        ctx.fillRect(-width/2,-height/2,width,height);
        const winString = game.score[game.round.number-2] + " win round " + (game.round.number-1);
        ctx.fillStyle = (game.score[game.round.number-2] == "Good") ? "blue" : "red";
        ctx.fillText(winString, 0, 0);
    }
    ctx.restore();
}
