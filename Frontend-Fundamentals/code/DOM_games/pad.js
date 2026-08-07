// pad.js
function generatePad(parent) {
	var keys = ["*", "0", "#"];
	for (var i = 9;i >= 1;i--) {
		keys.unshift(i.toString());
	}

	var counter = 0;
	var table = document.createElement("table");
	table.setAttribute("border", 1);

	for (var i = 0; i < 4;i++) {
		var tr = document.createElement("tr");
		for (var j = 0;j < 3;j++) {
			var td = document.createElement("td");
			td.innerText = keys[counter];
			tr.appendChild(td);
			counter++;
		}
		table.appendChild(tr);
	}
	parent.appendChild(table);
}