function checkDistance(xa,ya,xb,yb,ds){
    return ((xa-xb)**2 + (ya-yb)**2 <= ds);
}

module.exports = {checkDistance}