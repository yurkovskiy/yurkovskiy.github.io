var a = 10;
console.log("outside the function");
console.log(a, b);
test();
function test() {
    var a = 30;
    var b = 40;
    console.log("inside the function");
    console.log(a, b);
}
var b = 20;
console.log("outside the function");
console.log(a, b);