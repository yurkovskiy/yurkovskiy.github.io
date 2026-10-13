export default class Ship {
  // data section (private)
  #id;
  #x;
  #y;
  #size;
  #color;

  // methods section
  constructor(x, y, size, color) {
    this.#id = document.createElement("div"); // DOM element
    this.#x = x;
    this.#y = y;
    this.#size = size;
    this.#color = color;
  }

  id() {
    return this.#id;
  }

  show() {
    this.#id.style = `position: absolute; left: ${this.#x}px; top: ${this.#y}px; width: ${this.#size}px; height: ${this.#size}px; display: block; background-color: ${this.#color}; border: 1px solid #000;`;
  }

  hide() {
    this.#id.style.display = "none";
  }

  move(dx, dy) {
    this.hide();
    this.#x += dx;
    this.#y += dy;
    this.show();
  }

  x() {
    return this.#x;
  }

  y() {
    return this.#y;
  }
}
