const tumult = require("tumult");
const simplex = new tumult.Simplex2();
let finalData = [];


for(let i = 0; i < 10000 ; i++){
    const x = Math.floor(Math.random()*10000);
    const y = Math.floor(Math.random()*10000);
    const density = (simplex.gen(x/10000*3,y/10000*3) + 1)/2;
    if(Math.random()<density-0.6){
        finalData.push([x-5000,y-5000]);
    }
}

// 10k by 10k grid

module.exports = finalData;