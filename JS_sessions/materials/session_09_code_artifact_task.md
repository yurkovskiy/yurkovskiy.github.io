# Практичне завдання: Архітектура системи управління університетом (Learning Process)

Цей документ містить повний опис предметної області, архітектурний аналіз зв'язків між класами (успадкування, композиція, агрегація, реалізація інтерфейсів), технічне завдання для студентів та покрокову еталонну реалізацію на TypeScript.

---

## 1. Концепція та цілі завдання

Мета цього завдання — закріпити на практиці фундаментальні інструменти TypeScript:
* **Класи та модифікатори доступу** (`public`, `private`, `protected`, `readonly`, parameter properties);
* **Інкапсуляцію та валідацію** через гетери/сетери;
* **Абстрактні класи та поліморфізм** (шаблонний метод, спільні поля);
* **Інтерфейси (Contracts)** для слабкого зв'язування компонентів;
* **Узагальнення (Generics)** та обмеження типів (`T extends Identifiable`);
* **Архітектурні зв'язки**:
  * **Успадкування (Inheritance)**: «є різновидом» (*is-a*);
  * **Композиція (Composition)**: жорстке володіння життєвим циклом (*part-of* / *owns-a*);
  * **Агрегація (Aggregation)**: слабке володіння, спільне використання (*has-a* / *uses-a*);
  * **Паттерн Репозиторій (Generic Repository Pattern)**.

---

## 2. Предметна область (Domain Model) та зв'язки

### 2.1 Сутності:
1. **Людина (`Person`)** — базовий абстрактний клас.
2. **Студент (`Student`)** — нащадок `Person`.
3. **Викладач (`Teacher`)** — абстрактний нащадок `Person` або конкретні класи (професор, доцент).
4. **Курс / Дисципліна (`Course`)** — навчальний предмет із закріпленим викладачем.
5. **Академічна група (`Group`)** — група студентів із куратором.
6. **Факультет (`Faculty`)** — структурний підрозділ.
7. **Оцінка / Успішність (`Grade`)** — запис оцінки студента.

### 2.2 Модель зв'язків між сутностями

| Зв'язок | Між ким | Тип зв'язку | Обґрунтування в бізнес-домені |
| :--- | :--- | :--- | :--- |
| **Успадкування (Inheritance)** | `Person` $\leftarrow$ `Student`<br>`Person` $\leftarrow$ `Teacher` | **IS-A** | Студент і викладач є людьми: мають спільні ім'я, email, ідентифікатор, але різну поведінку. |
| **Композиція (Composition)** | `Faculty` $\rightarrow$ `Group` | **HAS-A (Strong)** | Група належить конкретному факультету. Якщо факультет ліквідується або формується, його навчальні групи створюються і належать цьому структурному факультету. |
| **Агрегація (Aggregation)** | `Group` $\rightarrow$ `Student` | **HAS-A (Weak)** | Студент існує незалежно від групи (може бути переведений, відрахований, академічна відпустка). Група агрегує посилання на студентів. |
| **Агрегація (Aggregation)** | `Course` $\rightarrow$ `Teacher` | **HAS-A (Weak)** | Викладач читає курс. Викладач існує окремо від дисципліни. При зміні лектора курс продовжує існувати. |
| **Асоціація (Association)** | `Student` $\rightarrow$ `Grade` | **HAS-A** | Студент накопичує записи оцінок з різних дисциплін. |
| **Реалізація інтерфейсу** | `InMemoryRepository<T>` $\rightarrow$ `IRepository<T>` | **IMPLEMENTS** | Реалізація сховища даних відповідно до абстрактного контракту. |

---

## 3. Технічне завдання (Вимоги до реалізації)

1. **Контракти (Interfaces):**
   * Створити спільний контракт `Identifiable` для сутностей із полем `id`.
   * Описати узагальнений інтерфейс `IRepository<T extends Identifiable, ID>`.
2. **Абстракція людини:**
   * Створити абстрактний клас `Person` із захищеними (`protected`) або приватними полями, валідацією email та абстрактним методом `getRoleDescription(): string`.
3. **Викладацький склад:**
   * Створити базовий клас `Teacher` та розширити його (наприклад, `Professor` та `AssociateProfessor`), додавши розрахунок коефіцієнта навантаження.
4. **Студент та журнал оцінок:**
   * Клас `Student` повинен містити приватний масив оцінок (`Grade`) і метод підрахунку середнього балу (GPA).
5. **Дисципліна та Академічна група:**
   * `Course` агрегує об'єкт викладача (`Teacher`).
   * `Group` агрегує масив студентів і має призначення куратора (`Teacher`).
6. **Факультет:**
   * `Faculty` створює та управляє групами через композицію (методи `createGroup(...)`, `removeGroup(...)`).
7. **Типобезпечний репозиторій:**
   * Реалізувати `InMemoryRepository<T extends Identifiable>` з базовими CRUD-методами (`save`, `findById`, `findAll`, `delete`).

---

## 4. Покрокова реалізація (Step-by-Step Implementation)

### Крок 1: Базові типи та контракти

```typescript
// basic-contracts.ts

/**
 * Базовий контракт для будь-якої сутності з унікальним ідентифікатором
 */
export interface Identifiable {
  readonly id: string;
}

/**
 * Рівні посад викладацького складу (Union-літерали)
 */
export type AcademicTitle = "Assistant" | "AssociateProfessor" | "Professor";

/**
 * Структура оцінки (Асоціація зі студентом і курсом)
 */
export interface Grade {
  readonly courseId: string;
  readonly score: number; // 0 - 100
  readonly date: Date;
}
```

### Крок 2: Ієрархія користувачів (Абстрактні класи та наслідування)

```typescript
// person-hierarchy.ts
import { Identifiable, AcademicTitle, Grade } from "./basic-contracts";

/**
 * Базовий абстрактний клас Person
 */
export abstract class Person implements Identifiable {
  constructor(
    public readonly id: string,
    public firstName: string,
    public lastName: string,
    private _email: string
  ) {
    this.email = _email; // використання сетера для валідації
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    if (!value.includes("@") || !value.includes(".")) {
      throw new Error(`Невалідний email: ${value}`);
    }
    this._email = value;
  }

  /**
   * Абстрактний метод, який кожен нащадок реалізує самостійно
   */
  abstract getRoleDescription(): string;
}

/**
 * Клас Student (IS-A Person)
 */
export class Student extends Person {
  // Приватне сховище оцінок студента
  private _grades: Grade[] = [];

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    public readonly studentCardNumber: string
  ) {
    super(id, firstName, lastName, email);
  }

  public addGrade(grade: Grade): void {
    if (grade.score < 0 || grade.score > 100) {
      throw new Error("Оцінка повинна бути в діапазоні від 0 до 100");
    }
    this._grades.push(grade);
  }

  public getGrades(): readonly Grade[] {
    return this._grades; // повертаємо readonly версію для захисту від мутацій ззовні
  }

  public calculateGPA(): number {
    if (this._grades.length === 0) return 0;
    const total = this._grades.reduce((acc, curr) => acc + curr.score, 0);
    return Number((total / this._grades.length).toFixed(2));
  }

  override getRoleDescription(): string {
    return `Студент (Квиток: ${this.studentCardNumber}), Сер. бал: ${this.calculateGPA()}`;
  }
}

/**
 * Базовий клас Teacher (IS-A Person)
 */
export abstract class Teacher extends Person {
  constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    public readonly academicTitle: AcademicTitle,
    protected baseSalary: number
  ) {
    super(id, firstName, lastName, email);
  }

  // Розрахунок заробітної плати за поліморфним коефіцієнтом
  public abstract calculateSalary(): number;
}

/**
 * Професор (Конкретний викладач)
 */
export class Professor extends Teacher {
  constructor(id: string, firstName: string, lastName: string, email: string, baseSalary: number) {
    super(id, firstName, lastName, email, "Professor", baseSalary);
  }

  public calculateSalary(): number {
    return this.baseSalary * 1.5; // Набавка 50%
  }

  override getRoleDescription(): string {
    return `Професор кафедри (${this.fullName})`;
  }
}

/**
 * Доцент (Конкретний викладач)
 */
export class AssociateProfessor extends Teacher {
  constructor(id: string, firstName: string, lastName: string, email: string, baseSalary: number) {
    super(id, firstName, lastName, email, "AssociateProfessor", baseSalary);
  }

  public calculateSalary(): number {
    return this.baseSalary * 1.25; // Набавка 25%
  }

  override getRoleDescription(): string {
    return `Доцент кафедри (${this.fullName})`;
  }
}
```

### Крок 3: Агрегація (Курс та Академічна група)

```typescript
// learning-units.ts
import { Identifiable } from "./basic-contracts";
import { Student, Teacher } from "./person-hierarchy";

/**
 * Клас Course (Агрегує викладача)
 */
export class Course implements Identifiable {
  constructor(
    public readonly id: string,
    public title: string,
    public credits: number,
    // АГРЕГАЦІЯ: Курс знає про вчителя, але вчитель існує незалежно від курсу
    private _instructor: Teacher
  ) {}

  get instructor(): Teacher {
    return this._instructor;
  }

  public reassignInstructor(newInstructor: Teacher): void {
    console.log(`[Course Info] Зміна викладача курсу "${this.title}": ${newInstructor.fullName}`);
    this._instructor = newInstructor;
  }
}

/**
 * Клас AcademicGroup (Агрегує студентів та призначеного куратора)
 */
export class AcademicGroup implements Identifiable {
  // АГРЕГАЦІЯ: Масив посилань на студентів, які існують самостійно
  private _students: Map<string, Student> = new Map();

  constructor(
    public readonly id: string,
    public name: string,
    // АГРЕГАЦІЯ: Викладач виступає куратором
    public curator?: Teacher
  ) {}

  public addStudent(student: Student): void {
    if (this._students.has(student.id)) {
      throw new Error(`Студент ${student.fullName} вже зарахований до групи ${this.name}`);
    }
    this._students.set(student.id, student);
  }

  public removeStudent(studentId: string): boolean {
    return this._students.delete(studentId);
  }

  public getStudents(): Student[] {
    return Array.from(this._students.values());
  }

  public getGroupAverageScore(): number {
    const list = this.getStudents();
    if (list.length === 0) return 0;
    const totalGpa = list.reduce((acc, s) => acc + s.calculateGPA(), 0);
    return Number((totalGpa / list.length).toFixed(2));
  }
}
```

### Крок 4: Композиція (Факультет та Групи)

```typescript
// faculty.ts
import { Identifiable } from "./basic-contracts";
import { AcademicGroup } from "./learning-units";
import { Teacher } from "./person-hierarchy";

/**
 * Клас Faculty
 * Демонструє КОМПОЗИЦІЮ: Факультет сам створює та знищує свої навчальні групи.
 */
export class Faculty implements Identifiable {
  private _groups: Map<string, AcademicGroup> = new Map();

  constructor(
    public readonly id: string,
    public name: string
  ) {}

  /**
   * КОМПОЗИЦІЯ: Факультет інкапсулює процес створення групи у своєму складі.
   */
  public createGroup(id: string, name: string, curator?: Teacher): AcademicGroup {
    if (this._groups.has(id)) {
      throw new Error(`Група з ID ${id} вже створена на факультеті ${this.name}`);
    }
    const newGroup = new AcademicGroup(id, name, curator);
    this._groups.set(id, newGroup);
    return newGroup;
  }

  public deleteGroup(groupId: string): boolean {
    return this._groups.delete(groupId);
  }

  public findGroupById(groupId: string): AcademicGroup | undefined {
    return this._groups.get(groupId);
  }

  public getAllGroups(): AcademicGroup[] {
    return Array.from(this._groups.values());
  }
}
```

### Крок 5: Дженерики та Паттерн Репозиторій (Generic Repository)

```typescript
// repository.ts
import { Identifiable } from "./basic-contracts";

/**
 * Узагальнений контракт репозиторію
 */
export interface IRepository<T extends Identifiable> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  delete(id: string): Promise<boolean>;
}

/**
 * Універсальна реалізація сховища в пам'яті (Generic In-Memory Store)
 */
export class InMemoryRepository<T extends Identifiable> implements IRepository<T> {
  private _items: Map<string, T> = new Map();

  async save(entity: T): Promise<void> {
    this._items.set(entity.id, entity);
  }

  async findById(id: string): Promise<T | null> {
    const item = this._items.get(id);
    return item ?? null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this._items.values());
  }

  async delete(id: string): Promise<boolean> {
    return this._items.delete(id);
  }
}
```

---

## 5. Демонстраційний сценарій для уроку (Run Demo)

Цей файл можна запустити на занятті (наприклад, через `npx tsx main.ts`), щоб наочно показати роботу кожної частини архітектури:

```typescript
// main.ts
import { Student, Professor, AssociateProfessor } from "./person-hierarchy";
import { Course } from "./learning-units";
import { Faculty } from "./faculty";
import { InMemoryRepository } from "./repository";

async function runDemonstration() {
  console.log("=== 1. Створення викладачів (Поліморфізм та спадкування) ===");
  const profShevchenko = new Professor(
    "t-1",
    "Тарас",
    "Шевченко",
    "t.shevchenko@univ.edu",
    20000
  );

  const docentKoval = new AssociateProfessor(
    "t-2",
    "Олена",
    "Коваль",
    "o.koval@univ.edu",
    16000
  );

  console.log(`${profShevchenko.getRoleDescription()} | Зарплата: ${profShevchenko.calculateSalary()}`);
  console.log(`${docentKoval.getRoleDescription()} | Зарплата: ${docentKoval.calculateSalary()}`);

  console.log("\n=== 2. Створення факультету та груп (Композиція) ===");
  const csFaculty = new Faculty("f-1", "Факультет комп'ютерних наук");
  
  // Факультет породжує групу
  const groupKN21 = csFaculty.createGroup("g-kn21", "КН-21", docentKoval);
  console.log(`Створено групу "${groupKN21.name}" на факультеті "${csFaculty.name}"`);

  console.log("\n=== 3. Студенти та оцінки (Агрегація + Інкапсуляція) ===");
  const studentIvan = new Student("s-101", "Іван", "Мельник", "ivan.m@univ.edu", "KB123456");
  const studentAnna = new Student("s-102", "Анна", "Бойко", "anna.b@univ.edu", "KB123457");

  // Агрегуємо студентів у групу
  groupKN21.addStudent(studentIvan);
  groupKN21.addStudent(studentAnna);

  // Створюємо курс (Агрегує викладача)
  const tsCourse = new Course("c-ts", "TypeScript Enterprise Patterns", 5, profShevchenko);

  // Виставляємо оцінки
  studentIvan.addGrade({ courseId: tsCourse.id, score: 95, date: new Date() });
  studentIvan.addGrade({ courseId: tsCourse.id, score: 87, date: new Date() });

  studentAnna.addGrade({ courseId: tsCourse.id, score: 98, date: new Date() });
  studentAnna.addGrade({ courseId: tsCourse.id, score: 92, date: new Date() });

  console.log(`GPA Івана: ${studentIvan.calculateGPA()}`);
  console.log(`GPA Анни: ${studentAnna.calculateGPA()}`);
  console.log(`Середній бал групи ${groupKN21.name}: ${groupKN21.getGroupAverageScore()}`);

  console.log("\n=== 4. Узагальнене сховище даних (Generic Repository) ===");
  const studentRepo = new InMemoryRepository<Student>();
  await studentRepo.save(studentIvan);
  await studentRepo.save(studentAnna);

  const foundStudent = await studentRepo.findById("s-101");
  console.log(`Знайдено в репозиторії: ${foundStudent?.fullName} (${foundStudent?.email})`);

  console.log(`Всього студентів у сховищі: ${(await studentRepo.findAll()).length}`);
}

runDemonstration().catch(console.error);
```

---

## 6. Варіанти завдань для самостійної роботи студентів

Щоб студенти могли вдосконалити проект, запропонуйте їм наступні завдання:

1. **Додати новий вид персони — `Staff` (Адміністратор):**
   * Успадкувати `Person`, додати поле `department` та реалізувати метод генерації службового посвідчення.
2. **Розширити логіку курсів (Передумови / Prerequisites):**
   * Додати до курсу список попередніх курсів `prerequisites: Course[]` (Агрегація) та метод перевірки, чи студент закрив необхідні курси перед записом.
3. **Механізм експорту звітів (Шаблонний метод):**
   * Створити абстрактний клас `ReportGenerator` із шаблоном генерації звіту (`generateHeader()`, `generateBody()`, `generateFooter()`), а нащадки `XmlReportGenerator` та `JsonReportGenerator` мають реалізувати деталі.
4. **Репозиторій із фільтрацією за предикатом:**
   * Додати в `IRepository<T>` метод `findWhere(predicate: (item: T) => boolean): Promise<T[]>`.