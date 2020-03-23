var squareOfTriangle = function (a, b, c) {
    var p;
    p = (a + b + c) / 2;
    return Math.sqrt(p * (p - a) * (p - b) * (p - c));
}

console.log("S = ", squareOfTriangle(3, 4, 5));
console.log("S = ", squareOfTriangle(7, 9, 10));
console.log("S = ", squareOfTriangle(6.1, 8.2, 3.3));