const tumult = require("tumult");
let map = [];

function getNewMap(){
    map.splice(0, map.length);

    const rocksimplex = new tumult.Simplex2(Math.random());
    for(let i = 0; i < 10000 ; i++){
        const x = Math.floor(Math.random()*10000);
        const y = Math.floor(Math.random()*10000);
        const density = (rocksimplex.gen(x/10000*3,y/10000*3) + 1)/2;
        if(Math.random()<density-0.6){
            map.push([x-5000,y-5000,Math.floor(Math.random()*3),true]);
        }
    }

    
    const treesimplex = new tumult.Simplex2(Math.random());

    for(let i = 0; i < 10000 ; i++){
        const x = Math.floor(Math.random()*10000);
        const y = Math.floor(Math.random()*10000);
        const density = (treesimplex.gen(x/10000*3,y/10000*3) + 1)/2;
        if(Math.random()<density-0.6){
            map.push([x-5000,y-5000,Math.floor(Math.random()*3),false]);
        }
    }
}
getNewMap();
// 10k by 10k grid

module.exports = {map, getNewMap};