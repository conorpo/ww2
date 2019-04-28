
const teamElement = document.getElementById("team");
const buttons = {
    "1": document.getElementById("good"),
    "2": document.getElementById("bad"),
    "3": document.getElementById("random"),
}
function select(selection,select,unselecta,unselectb){
    teamElement.value = selection;
    buttons[select].classList.add("selected");
    buttons[unselecta].classList.remove("selected");
    buttons[unselectb].classList.remove("selected");
}