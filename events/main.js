var div_a = document.getElementById("A");
var div_b = document.getElementById("B");
var div_c = document.getElementById("C");

div_a.addEventListener("click", function(e) {
    console.log("I am A");
    console.log(this);
    e.stopPropagation();
}, false);

div_b.addEventListener("click", (e) => {
    console.log("I am B");
    console.log(this);
    e.stopPropagation();
}, false);

div_c.addEventListener("click", (e) => {
    console.log("I am C");
    console.log(this);
    e.stopPropagation();
}, false);


var nbu = document.getElementsByTagName("a")[0];
nbu.addEventListener("click", function(e) {
    console.log("Go to NBU Web page");
    e.preventDefault();  
}, true);


