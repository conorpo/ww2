function checkDistance(xa,ya,xb,yb,ds){
    return ((xa-xb)**2 + (ya-yb)**2 <= ds);
}

const names = [
    "I couldn't pick a name",
    "I'm an idiot",
    "Default Name 2",
    "Bob"
];

module.exports = {checkDistance, names}