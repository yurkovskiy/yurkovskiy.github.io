class Student {
    constructor(id, surname, name) {
        this.id = id;
        this.surname = surname;
        this.name = name;
    }
    toString() {
        return this.id + ": " + this.surname + " " + this.name;
    }
}


var student_1 = new Student(10, "Kurii", "Tetiana");
var student_2 = new Student(20, "Tkachuk", "Oleh");