class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `x=${this.x} | y=${this.y}`;
    }
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

class Line extends Point {
    constructor(x1, y1) {
        super(x, y)
    }
}

var point_1 = new Point(10, 10);
var point_2 = new Point(10, 20);


