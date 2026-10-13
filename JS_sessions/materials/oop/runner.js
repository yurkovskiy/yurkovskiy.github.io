import Employee from "./Employee.js";
import Manager from "./Manager.js";
import Person from "./Person.js";

const p_1 = new Person("John", "Rambo", "1946-01-01");
const e_1 = new Employee("Dana", "Scully", "1968-01-01", 5000, "director");
const m_1 = new Manager("Fox", "Mulder", "1961-01-01", 7000, "CEO", 2000);

console.log(p_1.toString());
console.log(e_1.toString());
console.log(m_1.toString());
