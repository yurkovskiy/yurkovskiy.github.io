var div = document.getElementsByTagName("div")[0];

div.addEventListener("mouseover", handler, false);
div.addEventListener("mouseout", handler, false);
div.addEventListener("click", handler, false);
div.addEventListener("dblclick", handler, false);


function handler(e) {
    var myHash = {
        mouseover: "yellow",
        mouseout: "white",
        click: "red",
        dblclick: "blue"
    };
    e.target.style.backgroundColor = myHash[e.type];
}