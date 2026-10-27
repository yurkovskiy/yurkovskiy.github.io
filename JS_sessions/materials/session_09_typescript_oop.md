# Об'єктно-орієнтоване програмування (ООП) в TypeScript

Об'єктно-орієнтоване програмування в TypeScript спирається на синтаксис класів ECMAScript 2015 (ES6), додаючи статичну систему типів, модифікатори доступу, абстрактні класи, інтерфейси та параметричні типи (Generics).

---

## 1. Класи в TypeScript (Classes)

Клас у TypeScript є одночасно і значенням (конструктор для створення екземплярів у runtime), і типом (опис форми екземпляра для системи типів).

### 1.1 Оголошення полів, конструктор та методи

```typescript
class User {
  // Поля екземпляра
  id: number;
  name: string;
  isActive: boolean = true; // значення за замовчуванням

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  // Метод екземпляра
  getDetails(): string {
    return `Користувач #${this.id}: ${this.name} (${this.isActive ? "Активний" : "Неактивний"})`;
  }
}

const user1 = new User(1, "Олександр");
console.log(user1.getDetails());
```

---

## 2. Модифікатори доступу (Access Modifiers)

TypeScript пропонує три рівні доступу до членів класу на етапі компіляції, а також підтримує приватні поля стандарту ECMAScript (`#`).

### 2.1 `public`, `protected`, `private` та `#private`

| Модифікатор | Доступ ззовні класу | Доступ у класах-нащадках | Runtime-поведінка |
| :--- | :--- | :--- | :--- |
| **`public`** (за замовчуванням) | Так | Так | Звичайне поле JS |
| **`protected`** | Ні | Так | Звичайне поле JS (перевіряється лише `tsc`) |
| **`private`** | Ні | Ні | Звичайне поле JS (перевіряється лише `tsc`) |
| **`#field` (Hard Private)** | Ні | Ні | Повна ізоляція в JS на рівні V8 engine |

```typescript
class BankAccount {
  public readonly accountNumber: string; // можна читати ззовні, але не змінювати
  protected ownerName: string;           // доступно в BankAccount та підкласах
  private internalPin: number;           // доступно лише всередині BankAccount (compile-time)
  #hardSecurityCode: string;             // hard private (ECMAScript runtime)

  constructor(accountNumber: string, ownerName: string, pin: number, securityCode: string) {
    this.accountNumber = accountNumber;
    this.ownerName = ownerName;
    this.internalPin = pin;
    this.#hardSecurityCode = securityCode;
  }

  public authenticate(enteredPin: number): boolean {
    return this.internalPin === enteredPin;
  }
}

class PremiumAccount extends BankAccount {
  public displayOwner(): void {
    // console.log(this.internalPin); // ПОМИЛКА: 'internalPin' приватний
    console.log(`Власник рахунку: ${this.ownerName}`); // Валідно: protected
  }
}
```

### 2.2 Скорочений синтаксис конструктора (Parameter Properties)

TypeScript дозволяє одночасно оголошувати поля класу та ініціалізувати їх прямо в списку аргументів конструктора:

```typescript
class Product {
  // Параметри з модифікаторами автоматично стають полями класу
  constructor(
    public id: string,
    public title: string,
    private _price: number,
    readonly isAvailable: boolean = true
  ) {}

  // Геттери та сеттери
  get price(): number {
    return this._price;
  }

  set price(newPrice: number) {
    if (newPrice <= 0) {
      throw new Error("Ціна повинна бути більшою за нуль");
    }
    this._price = newPrice;
  }
}

const item = new Product("p1", "Клавіатура", 1200);
console.log(item.title); // "Клавіатура"
console.log(item.price); // 1200
```

---

## 3. Інтерфейси (Interfaces) та контрактне програмування

Інтерфейс визначає контракт: набір полів і методів, які зобов'язаний мати об'єкт або клас. Інтерфейси існують **виключно на етапі компіляції** і повністю видаляються зі згенерованого JS.

### 3.1 Реалізація через `implements`

Клас може реалізовувати один або кілька інтерфейсів:

```typescript
interface Authenticatable {
  token: string;
  login(credentials: { email: string; pass: string }): Promise<boolean>;
  logout(): void;
}

interface Auditable {
  createdAt: Date;
  updatedAt: Date;
}

class AuthService implements Authenticatable, Auditable {
  token: string = "";
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  async login(credentials: { email: string; pass: string }): Promise<boolean> {
    this.token = "jwt-example-token";
    return true;
  }

  logout(): void {
    this.token = "";
  }
}
```

### 3.2 Успадкування інтерфейсів (`extends`)

```typescript
interface BaseEntity {
  id: string;
}

interface Timestamps {
  createdAt: Date;
}

// Множинне успадкування інтерфейсів
interface DatabaseRecord extends BaseEntity, Timestamps {
  deletedAt?: Date;
}
```

---

## 4. Абстрактні класи (Abstract Classes)

Абстрактні класи є базовими класами, екземпляри яких **не можна** створити напряму через `new`. На відміну від інтерфейсів:
1. Абстрактний клас існує в скомпільованому JS-коді.
2. Може містити як абстрактні методи (без реалізації), так і повністю реалізовані методи зі спільною логікою.

```typescript
abstract class PaymentProcessor {
  constructor(protected apiKey: string) {}

  // Спільна конкретна реалізація для всіх нащадків
  protected logTransaction(amount: number, currency: string): void {
    console.log(`[LOG] Ініціалізовано платіж: ${amount} ${currency}`);
  }

  // Абстрактний метод: кожен нащадок зобов'язаний реалізувати самостійно
  abstract processPayment(amount: number, currency: string): Promise<boolean>;
  abstract refund(transactionId: string): Promise<boolean>;
}

class StripeProcessor extends PaymentProcessor {
  async processPayment(amount: number, currency: string): Promise<boolean> {
    this.logTransaction(amount, currency);
    console.log(`Обробка платежу через Stripe API з ключем ${this.apiKey}`);
    return true;
  }

  async refund(transactionId: string): Promise<boolean> {
    console.log(`Повернення коштів Stripe для транзакції ${transactionId}`);
    return true;
  }
}

// const base = new PaymentProcessor("key"); // ПОМИЛКА: Не можна створити екземпляр абстрактного класу
const stripe = new StripeProcessor("sk_live_123");
stripe.processPayment(150, "USD");
```

---

## 5. Порівняння: `interface` проти `abstract class`

| Характеристика | `interface` | `abstract class` |
| :--- | :--- | :--- |
| **Присутність у Runtime** | Відсутній (повне видалення) | Залишається як функція-конструктор JS |
| **Реалізація методів** | Тільки сигнатури (без коду) | Може містити конкретний виконуваний код |
| **Множинна підтримка** | Клас може реалізувати $\ge 1$ інтерфейсів | Клас може успадкувати лише один клас |
| **Модифікатори доступу** | Лише публічні властивості | `public`, `protected`, `private` |
| **Коли використовувати** | Опис структури даних, контрактів API | Шаблонний метод, спільний стан та поведінка |

---

## 6. Узагальнені типи (Generics) в ООП

Дженерики дозволяють писати класи та інтерфейси, які зберігають безпеку типів незалежно від конкретних переданих типів даних.

### 6.1 Узагальнений інтерфейс та клас-сховище

```typescript
interface Repository<T> {
  findById(id: string): T | undefined;
  save(item: T): void;
  getAll(): readonly T[];
}

// Клас із типізованим сховищем
class MemoryRepository<T extends { id: string }> implements Repository<T> {
  private items: Map<string, T> = new Map();

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  save(item: T): void {
    this.items.set(item.id, item);
  }

  getAll(): readonly T[] {
    return Array.from(this.items.values());
  }
}

// Використання
type Customer = { id: string; fullName: string };

const customerRepo = new MemoryRepository<Customer>();
customerRepo.save({ id: "c1", fullName: "Марія Коваль" });

const found = customerRepo.findById("c1"); // тип автоматично виведено як Customer | undefined
console.log(found?.fullName);
```

### 6.2 Обмеження дженериків (Generic Constraints: `extends`)

Ключове слово `extends` у контексті дженерика вимагає, щоб переданий тип мав певну форму:

```typescript
interface HasId {
  id: string | number;
}

// T зобов'язаний містити поле id
class EntityPrinter<T extends HasId> {
  constructor(private entity: T) {}

  printId(): void {
    console.log(`Ідентифікатор сутності: ${this.entity.id}`);
  }
}
```

---

## 7. Комплексний приклад: Патерн «Репозиторій» та сервісний шар

Об'єднаємо всі теми: модифікатори доступу, інтерфейси, абстрактні класи та дженерики в єдину міні-архітектуру.

```typescript
// 1. Базовий контракт сутності
interface Identifiable {
  id: string;
  createdAt: Date;
}

// 2. Доменна сутність
class Order implements Identifiable {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly customerEmail: string,
    public readonly createdAt: Date = new Date(),
    public status: "pending" | "completed" | "cancelled" = "pending"
  ) {}
}

// 3. Базовий узагальнений репозиторій
abstract class BaseStorage<T extends Identifiable> {
  protected collection: Map<string, T> = new Map();

  public count(): number {
    return this.collection.size;
  }

  abstract add(item: T): void;
  abstract getOne(id: string): T;
}

// 4. Специфічний репозиторій замовлень
class OrderStorage extends BaseStorage<Order> {
  public add(item: Order): void {
    this.collection.set(item.id, item);
  }

  public getOne(id: string): Order {
    const order = this.collection.get(id);
    if (!order) {
      throw new Error(`Замовлення #${id} не знайдено.`);
    }
    return order;
  }

  public findByStatus(status: Order["status"]): Order[] {
    return Array.from(this.collection.values()).filter(o => o.status === status);
  }
}

// 5. Сервіс, залежний від абстракції (Dependency Inversion)
class OrderManagementService {
  constructor(private readonly storage: BaseStorage<Order>) {}

  public registerOrder(id: string, amount: number, email: string): void {
    const order = new Order(id, amount, email);
    this.storage.add(order);
    console.log(`Замовлення ${id} успішно зареєстровано. Всього в системі: ${this.storage.count()}`);
  }
}

// Тестування архітектури
const storage = new OrderStorage();
const orderService = new OrderManagementService(storage);

orderService.registerOrder("ord-101", 3400, "client@example.com");
orderService.registerOrder("ord-102", 890, "client2@example.com");

const retrieved = storage.getOne("ord-101");
console.log(`Статус замовлення: ${retrieved.status}, сума: ${retrieved.amount} грн`);
```

---

## 8. Підсумкова шпаргалка

| Концепція | Синтаксис | Головна роль |
| :--- | :--- | :--- |
| **Клас** | `class Name { ... }` | Створення об'єктів з полями і методами. |
| **Параметри конструктора** | `constructor(private x: number) {}` | Скорочене оголошення та ініціалізація полів. |
| **Інтерфейс** | `interface Printable { print(): void }` | Контракт для типізації, відсутній у runtime. |
| **Реалізація інтерфейсу** | `class Doc implements Printable` | Гарантує виконання контракту класом. |
| **Абстрактний клас** | `abstract class Base { ... }` | Спільний каркас із можливістю базової реалізації. |
| **Дженерик у класі** | `class Store<T> { ... }` | Параметризована типобезпечна поведінка. |
| **Обмеження дженерика** | `<T extends { id: string }>` | Звуження допустимих типів до наявності структури. |