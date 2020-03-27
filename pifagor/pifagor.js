var main = document.getElementById("main");

// Pifagor's table generator
for (var i = 1; i <= 9; i++) {
    var row = document.createElement("div");
    row.setAttribute("class", "row");
    for (var j = 1; j <= 9; j++) {  
        var cell = document.createElement("div");
        cell.setAttribute("class", "cell cell-main");
        cell.innerText = i * j;
        row.appendChild(cell);
    }
    main.appendChild(row);
}