import Employee from "./Employee.js";

export default class Manager extends Employee {
    #bonus;
    constructor(firstname, lastname, birthday, salary, position, bonus) {
        super(firstname, lastname, birthday, salary, position);
        this.#bonus = bonus;
    }

    salary() {
        return super.salary() + this.#bonus;
    }
}
