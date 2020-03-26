class Triangle {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    length() {
        return this.a + this.b + this.c;
    }
    square() {
        var p = this.length() / 2;
        return Math.sqrt(p * (p - this.a) * (p - this.b) * (p - this.c));
    }
}


var t1 = new Triangle(3, 4, 5);
console.log(t1.length());
console.log(t1.square());

var t2 = new Triangle(7, 9, 10);
console.log(t2.length());
console.log(t2.square());