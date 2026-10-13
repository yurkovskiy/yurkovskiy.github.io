import Person from "./Person.js";

export default class Employee extends Person {
    #salary;
    #position;
    constructor(firstname, lastname, birthday, salary, position) {
        super(firstname, lastname, birthday);
        this.#salary = salary;
        this.#position = position;
    }

    salary() {
        return this.#salary;
    }

    toString() {
        return `${super.toString()} ${this.salary()} ${this.#position}`;
    }
}
