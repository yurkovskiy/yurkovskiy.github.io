export default class Person {
    #firstname;
    #lastname;
    #birthday;

    constructor(firstname, lastname, birthday) {
        this.#firstname = firstname;
        this.#lastname = lastname;
        this.#birthday = birthday;
    }

    toString() {
        return `${this.#firstname} ${this.#lastname} ${this.#birthday}`;
    }
}
