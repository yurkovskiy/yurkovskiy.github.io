var i;
for (i = 1; i <= 5; i++) {
  const btn = document.createElement("button");
  btn.appendChild(document.createTextNode("Button " + i));
  document.body.appendChild(btn);
  btn.onclick = function(ev) {
    const par = document.createElement("p");
    par.innerHTML = "Button " + i + " is clicked.";
    document.body.appendChild(par);
  };
}
