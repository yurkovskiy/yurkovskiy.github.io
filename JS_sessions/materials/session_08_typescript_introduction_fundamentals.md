# Основи TypeScript: Вступ та базова система типів

---

## 1. Вступ: Проблематика JavaScript та народження TypeScript

### 1.1 Динамічна типізація та її підводні камені
JavaScript створювався як легка скриптова мова для браузера з **динамічною типізацією**. Це означає, що типи асоціюються зі значеннями під час виконання (runtime), а не зі змінними на етапі написання чи компіляції.

З ростом масштабів проектів це призводить до системних проблем:

```javascript
// Звичайний JavaScript
let id = 1;        // number
id = "Alex";       // string
id = true;         // boolean

// Десь далі в коді:
id.toUpperCase();  // Uncaught TypeError: id.toUpperCase is not a function
```

Оскільки JS є інтерпретованою мовою, критичні помилки (наприклад, друкарські помилки у назвах полів об'єкта або неправильні типи параметрів функцій) проявляються вже під час тестування чи на продакшені в консолі браузера.

### 1.2 Що таке TypeScript?
**TypeScript (TS)** — це сувора синтаксична надбудова над JavaScript (superset), розроблена Microsoft, яка додає статичну типізацію та потужний статичний аналіз коду.

* Будь-який валідний JS-код є валідним TS-кодом.
* Браузери та класичний Node.js не виконують TypeScript напряму. Код обов'язково транспілюється (компілюється) у чистий JavaScript, а вся інформація про типи видаляється (type erasure).

```
┌────────────────────────────────────────────────────────┐
│                    TypeScript-код                      │
│     (Статичні типи, інтерфейси, аліаси, перевірки)     │
└────────────────────────────────────────────────────────┘
                            │
                            │ Компіляція (tsc / bundler)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Чистий JavaScript                    │
│             (Виконується у V8 / браузері)              │
└────────────────────────────────────────────────────────┘
```

### 1.3 Переваги та компроміси

| Переваги | Компроміси / Виклики |
| :--- | :--- |
| **Виявлення помилок до запуску:** Помилки підсвічуються безпосередньо в IDE. | **Необхідність етапу збірки:** Потрібен інструмент для компіляції. |
| **Самодокументований код:** Сигнатури функцій та типи замінюють більшість коментарів. | **Час на типізацію:** Дещо довший старт при створенні швидких прототипів. |
| **Автодоповнення (IntelliSense):** Навігація по коду, безпечний рефакторинг та автокомпліт. | **Крива навчання:** Необхідно розуміти систему типів (Generic, Narrowing тощо). |

> **Короткий зміст (Slide Summary):** JavaScript динамічний, що спричиняє помилки в runtime. TypeScript вирішує це через статичний аналіз і типізацію на етапі збірки, компілюючись у чистий JS.
>
> 💬 **Питання для дискусії:** *Чи стикалися ви на практиці з помилками на кшталт `Cannot read properties of undefined`? На якому етапі розробки дешевше знайти та виправити такий баг?*

---

## 2. Сучасний робочий процес та налаштування оточення

### 2.1 Локальне встановлення замість глобального
Раніше часто рекомендували глобальне встановлення (`npm install -g typescript`). Сучасний стандарт розробки — фіксація версії TS всередині кожного проекту через локальні `devDependencies`.

```bash
# Ініціалізація проекту
npm init -y

# Встановлення TypeScript та базових типів локально
npm install -D typescript @types/node

# Генерація файлу конфігурації
npx tsc --init
```

### 2.2 Компіляція та виконання
* **Компіляція:**
  ```bash
  # Скомпілювати окремий файл у .js:
  npx tsc index.ts

  # Зібрати весь проект згідно з tsconfig.json:
  npx tsc
  ```
* **Швидкий запуск для розробки (без ручного кроку компіляції):**
  ```bash
  # Використання сучасного раннера tsx
  npm install -D tsx
  npx tsx index.ts
  ```

### 2.3 Базовий `tsconfig.json`
Файл `tsconfig.json` визначає корінь проекту та правила поведінки компілятора:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,                 /* Вмикає суворий режим, зокрема strictNullChecks */
    "noImplicitAny": true,           /* Забороняє неявний тип any */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

> **Короткий зміст (Slide Summary):** Сучасний підхід вимагає локального встановлення TypeScript у проект (`-D`), активного `strict`-режиму в `tsconfig.json` та швидких інструментів запуску на кшталт `tsx`.

---

## 3. Базові типи даних та анотація типів

Для визначення типу використовується синтаксис `: TypeName`.

### 3.1 Примітивні типи

```typescript
// Числа (як цілі, так і з плаваючою крапкою)
let age: number = 25;
let price: number = 99.95;

// Рядки
let username: string = "Andrii";
let greeting: string = `Привіт, ${username}!`;

// Булеві значення
let isEnrolled: boolean = true;

// BigInt (для великих цілих чисел)
let largeCounter: bigint = 9007199254740991n;

// Symbol
let uniqueId: symbol = Symbol("user_id");
```

### 3.2 `null` та `undefined`
При увімкненому прапорці `strictNullChecks: true` (частина `strict`) типи `null` та `undefined` є окремими незалежними сутностями:

```typescript
let notAssigned: undefined = undefined;
let emptyObjectRef: null = null;

let regularName: string = "Oleh";
// regularName = null; // Помилка: Type 'null' is not assignable to type 'string'.
```

### 3.3 Пастка `any` та безпечна альтернатива `unknown`
* **`any`**: Повністю вимикає перевірку типів. Фактично переводить дану ділянку коду у чистий небезпечний JavaScript. Використовувати вкрай небажано.
* **`unknown`**: Сучасна типобезпечна заміна `any`. Змінна може прийняти будь-яке значення, але перед виконанням операцій над нею TypeScript вимагає зробити звуження типу (type narrowing).

```typescript
// НЕБЕЗПЕЧНО: any
let badData: any = "Привіт";
badData.toFixed(); // Пройде компілятор, але зламає програму в runtime!

// БЕЗПЕЧНО: unknown
let rawInput: unknown = "Привіт";
// rawInput.toUpperCase(); // Помилка компілятора: 'rawInput' is of type 'unknown'.

if (typeof rawInput === "string") {
  console.log(rawInput.toUpperCase()); // Безпечно! TS знає, що тут це string.
}
```

> **Короткий зміст (Slide Summary):** TS підтримує стандартні примітиви JS. Головне правило сучасної розробки — уникати `any`, надаючи перевагу `unknown` разом із перевірками типів.

---

## 4. Типізація функцій: параметри та специфічні типи повернення

### 4.1 Параметри та значення, що повертається

```typescript
function calculateTotal(price: number, taxRate: number): number {
  return price + price * taxRate;
}

// Стрілкова функція з явними типами
const formatGreeting = (name: string): string => `Ласкаво просимо, ${name}!`;
```

### 4.2 Тип `void`
Вказує на те, що функція завершує роботу, але не повертає корисного значення (за замовчуванням повертає `undefined`).

```typescript
function logMessage(msg: string): void {
  console.log(`[LOG]: ${msg}`);
}
```

### 4.3 Тип `never`
Означає, що функція **ніколи не завершить своє виконання нормально** (вона або викидає виняток, або входить у нескінченний цикл).

```typescript
function throwApplicationError(message: string): never {
  throw new Error(`Фатальна помилка: ${message}`);
}

function runInfiniteWorker(): never {
  while (true) {
    // безперервне опитування черги
  }
}
```

> **Короткий зміст (Slide Summary):** Аргументи функцій та повернені значення типізуються явно. `void` означає «функція повертає нічого/undefined», а `never` — «функція ніколи не досягне точки завершення».
>
> 💬 **Питання для дискусії:** *Чим концептуально відрізняються функції з поверненням `: undefined`, `: void` та `: never`? У яких випадках корисний `never`?*

---

## 5. Структуровані дані: Об'єкти, Масиви та Кортежі (Tuples)

### 5.1 Об'єкти
Структура об'єкта задається переліком властивостей та їхніх типів. За допомогою знака `?` можна вказати опціональне поле:

```typescript
let student: {
  id: number;
  name: string;
  course: number;
  department?: string; // Опціональне поле
} = {
  id: 1,
  name: "Олена",
  course: 3,
};

student.course = 4; // Валідно
// student.name = 123; // Помилка: number не підходить до string
// student.scholarship = true; // Помилка: властивість не існує
```

### 5.2 Масиви (Arrays)
Позначаються синтаксисом `type[]` або узагальненим записом `Array<type>`:

```typescript
const marks: number[] = [90, 85, 95];
const cities: string[] = ["Львів", "Київ", "Одеса"];

// Двовимірні масиви (матриці)
const matrix: number[][] = [
  [1, 2],
  [3, 4],
];
```

### 5.3 Кортежі (Tuples)
Кортеж — це масив із суворо фіксованою довжиною та визначеними типами для кожної позиції за індексом.

```typescript
// [ім'я, статус активності, рейтинг]
let userRecord: [string, boolean, number] = ["Тарас", true, 4.8];

// Важливо: звичайні методи масивів (як .push()) можуть порушити довжину кортежу в JS.
// Тому рекомендується використовувати модифікатор readonly:
const readonlyCoordinate: readonly [number, number] = [50.4501, 30.5234];
// readonlyCoordinate.push(10); // Помилка компілятора! Захищено від мутацій.
```

> **Короткий зміст (Slide Summary):** Об'єкти перевіряють наявність і тип кожного ключа. Масиви обмежують вміст одним або кількома типами. Кортежі фіксують тип за кожним індексом.

---

## 6. Enum чи Union-літерали: сучасні стандарти

### 6.1 Класичні перелічення (Enum)
```typescript
// Числовий Enum (автоінкремент)
enum Direction {
  Up = 1,
  Down, // 2
  Left, // 3
  Right // 4
}

// Рядковий Enum
enum Role {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST"
}
```

### 6.2 Чому в сучасному TS обирають Union-літерали?
Класичні `enum` створюють додатковий громіздкий код під час компіляції в JS (runtime overhead) та мають нюанси з типізацією числових значень.

У сучасному TypeScript стандартною практикою є використання **літеральних типів у поєднанні з Union (`|`)**:

```typescript
// Сучасна альтернатива Enum:
type UserRole = "ADMIN" | "USER" | "GUEST";

function setPermission(role: UserRole): void {
  console.log(`Надано права для: ${role}`);
}

setPermission("ADMIN"); // Повне автодоповнення в IDE
// setPermission("SUPERADMIN"); // Помилка компілятора ще до запуску коду!
```

> **Короткий зміст (Slide Summary):** Традиційні `enum` все ще існують, але індустріальний стандарт тяжіє до об'єднань рядкових літералів (`"A" | "B"`) через простоту і нульовий оверхед у скомпільованому JS.

---

## 7. Композиція: Type Aliases та Union Types

### 7.1 Псевдоніми типів (Type Aliases)
Створюють зручне читабельне ім'я для будь-якого типу:

```typescript
type ID = string | number;

type GeoPoint = {
  latitude: number;
  longitude: number;
};
```

### 7.2 Об'єднання типів (Union Types)
Оператор `|` дозволяє описати сутність, яка може приймати одне з кількох допустимих значень/типів:

```typescript
let identifier: string | number;
identifier = 101;     // Валідно
identifier = "UA-55"; // Валідно
// identifier = false; // Помилка
```

---

## 8. Звуження типів (Type Narrowing)

Якщо змінна має тип Union (наприклад, `string | number`), ми не можемо напряму викликати специфічні методи рядка чи числа, доки TypeScript не буде впевнений, що саме лежить у змінній.

### 8.1 Перевірка через `typeof`
```typescript
function printFormattedValue(value: string | number): void {
  if (typeof value === "string") {
    // Всередині цього блоку 'value' гарантовано має тип string
    console.log(value.trim().toUpperCase());
  } else {
    // Тут TypeScript розуміє, що 'value' може бути лише number
    console.log(value.toFixed(2));
  }
}
```

### 8.2 Discriminated Unions (Розмічені об'єднання)
Найбільш надійний патерн проектування станів та API-відповідей у TypeScript:

```typescript
type FetchSuccess = {
  status: "success"; // спільний літеральний дискримінант
  payload: string[];
};

type FetchError = {
  status: "error";
  errorMessage: string;
};

type FetchResult = FetchSuccess | FetchError;

function processApiResponse(result: FetchResult): void {
  if (result.status === "success") {
    // TS автоматично звузив тип до FetchSuccess
    console.log(`Отримано елементів: ${result.payload.length}`);
  } else {
    // TS автоматично визначив, що це FetchError
    console.error(`Помилка запиту: ${result.errorMessage}`);
  }
}
```

> **Короткий зміст (Slide Summary):** TypeScript аналізує гілки умов (`if`, `switch`, `typeof`) і автоматично звужує тип змінної всередині блоку (Control Flow Analysis).
>
> 💬 **Питання для дискусії:** *Чому Discriminated Unions вважаються безпечнішими за передачу одного великого об'єкта з полями на кшталт `{ isSuccess: boolean, data?: any, error?: string }`?*

---

## 9. Інтерактивні практичні завдання (Coding Exercises)

### Завдання 1: Безпечна робота з невідомими типами
**Умова:** Перепишіть функцію, замінивши небезпечний `any` на `unknown`. Додайте звуження типів, щоб функція коректно обробляла рядок (повертала довжину рядка) або число (повертала кількість цифр), а для інших типів викидала помилку.

```typescript
// ВИХІДНИЙ КОД (потребує рефакторингу):
function calculateLength(item: any): number {
  return item.length;
}

// ВАШЕ РІШЕННЯ:
function calculateLengthSafe(item: unknown): number {
  // Реалізуйте перевірку typeof
}
```

<details>
<summary>👉 Рішення (переглянути після виконання)</summary>

```typescript
function calculateLengthSafe(item: unknown): number {
  if (typeof item === "string") {
    return item.length;
  }
  if (typeof item === "number") {
    return Math.abs(item).toString().length;
  }
  throw new Error("Непідтримуваний тип даних");
}
```
</details>

---

### Завдання 2: Створення суворого кортежу
**Умова:** Опишіть тип для координати геопозиції `Coordinate`, що складається з двох чисел `[широта, довгота]`. Зробіть так, щоб випадковий виклик методу `.push()` викликав помилку компілятора.

```typescript
// ВАШЕ РІШЕННЯ:
type Coordinate = any; // замініть на правильну типізацію кортежу
```

<details>
<summary>👉 Рішення</summary>

```typescript
type Coordinate = readonly [number, number];

const point: Coordinate = [50.4501, 30.5234];
// point.push(10); // Помилка компілятора: Property 'push' does not exist on type 'readonly [number, number]'
```
</details>

---

### Завдання 3: Discriminated Unions для платіжної системи
**Умова:** Створіть типи для обробки трьох методів оплати:
1. `CreditCard`: метод `"card"`, номер картки (`cardNumber: string`), CVV (`cvv: number`).
2. `PayPal`: метод `"paypal"`, електронна адреса (`email: string`).
3. `Crypto`: метод `"crypto"`, адреса гаманця (`walletAddress: string`).

Напишіть функцію `processPayment(payment: PaymentMethod)`, яка через `switch` або `if` виводить відповідне повідомлення залежно від методу.

```typescript
// ВАШЕ РІШЕННЯ ТУТ:
```

<details>
<summary>👉 Рішення</summary>

```typescript
type CreditCard = {
  method: "card";
  cardNumber: string;
  cvv: number;
};

type PayPal = {
  method: "paypal";
  email: string;
};

type Crypto = {
  method: "crypto";
  walletAddress: string;
};

type PaymentMethod = CreditCard | PayPal | Crypto;

function processPayment(payment: PaymentMethod): void {
  switch (payment.method) {
    case "card":
      console.log(`Оплата карткою: ${payment.cardNumber}`);
      break;
    case "paypal":
      console.log(`Оплата через PayPal акаунт: ${payment.email}`);
      break;
    case "crypto":
      console.log(`Оплата на гаманець: ${payment.walletAddress}`);
      break;
  }
}
```
</details>

---

## 10. Підсумкова шпаргалка

| Поняття / Тип | Приклад синтаксису | Призначення |
| :--- | :--- | :--- |
| **Примітиви** | `let val: number = 42;` | Базові типи даних JS. |
| **Масиви** | `const list: string[] = ["a", "b"];` | Списки динамічної довжини одного типу. |
| **Кортеж (Tuple)** | `const t: readonly [string, number] = ["id", 1];` | Фіксована довжина та типи за конкретними індексами. |
| **Union (`\|`)** | `type Id = string \| number;` | Змінна, що може бути одним із кількох типів. |
| **Union літералів**| `type Status = "open" \| "closed";` | Сучасна альтернатива Enum для списку констант. |
| **`unknown`** | `let x: unknown;` | Безпечна альтернатива `any` із обов'язковим звуженням. |
| **`void` vs `never`**| `(): void` vs `(): never` | «Нічого не повертає» проти «Ніколи не завершиться нормально». |