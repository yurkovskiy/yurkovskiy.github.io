export default class Triangle {
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
