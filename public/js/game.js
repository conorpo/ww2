class Game {
    constructor(){
        this.cfg = {
            zoomRate: 1.05,
            defaultMaxHealth: 100,
            defaultMaxAmmo: 20
        }
        this.players = [];
        this.player = new Player(this.cfg);
        this.serverPlayer = {x:0, y:0, angle:0, changeID: 0, id:null, health: 100};
        this.map = [];
        this.bullets = [];
        this.round = {
            number: 1,
            score: [0,0],
            teams: ["Good","Bad"],
            progress: 0,
            length: 100
        }
        this.score = [];
        this.zoom = 1;
        this.changes = [];

        //Interpolation
        this.oldPlayers = [];
        this.oldPlayerIds = [];
        this.oldBullets = [];
        this.oldBulletIds = [];
        this.interpolationStartTime = new Date();
        this.interpolationLength = 100;

        this.readyToFire = false;
        this.reloading = false;
        this.firingInterval = setInterval(() => {
            this.readyToFire = true;
            if(mouseDown){
                this.fire();
            }
        },300);

        this.regenerating = false;
        this.regenTimeout = null;
    }

    update(){
        let change = {}
        change.id = this.changes.length + 1;
        this.player.y += change.dy = (heldInputs.s-heldInputs.w);
        this.player.x += change.dx = (heldInputs.d-heldInputs.a);
        change.angle = this.player.angle = this.calculateAngle();
        socket.emit('update', change);
        if(change.dy != 0 || change.dx != 0){
            this.changes.push(change);
        }
                
        this.reconcile(); //Makes sure server data is same as client data
 
        const healthChange = this.player.health - this.serverPlayer.health;
        this.damage(healthChange);
        if(this.regenerating && this.player.health < 100){ this.player.health+=1 }

    }

    fire(){
        if(this.readyToFire && !this.reloading){
            socket.emit("fire", this.calculateAngle());
            this.readyToFire = false;
            this.player.ammo--;
            if(this.player.ammo == 0){ this.reload() };
        }
    }

    reload(){
        this.reloading = true;
        setTimeout(() => {
            this.player.ammo = 20;
            this.reloading = false;
        }, 3000)
    }

    lerp(old, current){ //progress in milliseconds
        const progress = new Date() - this.interpolationStartTime;
        const progressPercent = progress/this.interpolationLength;
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

    calculateAngle(){
        return (mouse.x < 0) ? Math.atan(mouse.y/mouse.x) 
        + Math.PI : Math.atan(mouse.y/mouse.x);
    }
    

    reconcile(){
        if(this.serverPlayer.changeID < this.changes.length){
            let untrackedChanges = this.changes.slice(this.serverPlayer.changeID, this.changes.length)
            if(untrackedChanges.length == 0){
                changes = [];
                if(this.player.x != this.serverPlayer.x || this.player.y != this.serverPlayer.y){;
                    console.log("final mismatch");
                    this.player.x = this.serverPlayer.x;
                    this.player.y = this.serverPlayer.y;
                }
            }else{
                const changeSum = untrackedChanges.reduce((a,b) => ({dx: a.dx+b.dx, dy: a.dy+b.dy})); 
                const xSync = (this.player.x == this.serverPlayer.x + changeSum.dx);
                const ySync = (this.player.y == this.serverPlayer.y + changeSum.dy);
                if(!xSync || !ySync){
                    console.log("mismatch");
                    this.player.x = this.serverPlayer.x;
                    this.player.y = this.serverPlayer.y; 
                }
            }
        }
    }

    damage(amount){
        if(this.player.health - amount < 0){
            //Die
        }else{
            this.player.health-=amount;
            this.regenerating  = false;
            clearInterval(this.regenTimeout);
            this.regenTimeout = setTimeout(function(){
                this.regenerating = true;
            },2000)
        }
    }
    
}

class Player {
    constructor(cfg){
        this.x = 0;
        this.y = 0;
        this.health = this.maxhealth = cfg.defaultMaxHealth;
        this.ammo = this.maxammo = cfg.defaultMaxAmmo;
        this.angle = 0;
        this.id = null;
    }
}

//IO Stuff
const socket = io();
let game = new Game();

socket.on("update", gameData => {
    game.oldPlayers = game.players;
    game.oldPlayerIds = game.oldPlayers.map(player => player.id);

    game.players = gameData.players;

    const playerIds = game.players.map(player => player.id);
    game.serverPlayer = game.players.splice(playerIds.indexOf(game.player.id),1)[0];

    game.oldBullets = game.bullets;
    game.oldBulletIds = game.oldBullets.map(bullet => bullet.id);

    game.bullets = gameData.bullets;
    game.round.number = gameData.game.round;
    game.score = gameData.game.score;
    game.round.score = gameData.round.score;
    game.round.teams = gameData.round.teams;
    game.round.progress = gameData.round.progress;
    game.round.length = gameData.round.length;

    game.interpolationLength = new Date() - game.interpolationStartTime;
    game.interpolationStartTime = new Date();
});

socket.on("id", id => {
    game.player.id = id;
    window.requestAnimationFrame(draw);
})

socket.on("map", serverMap => {
    game.map = serverMap;
})

