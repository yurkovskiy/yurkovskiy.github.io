# Практичне завдання: Клієнтська система обліку фінансів (Personal Finance Manager)

Цей документ містить покрокову інструкцію та архітектурний шаблон для виконання індивідуального проекту **Personal Finance Manager ("Babules")**.

Згідно з технічними вимогами:
* **Стек:** Чистий **TypeScript** (без фронтенд-фреймворків) + **HTML5**;
* **Стилі:** Виключно **Bootstrap 5** (без написання кастомного CSS);
* **Архітектура:** Без серверної частини (Client-Only);
* **Збереження даних:** HTML5 **`localStorage`**;
* **ООП-сутності:** Реалізація сутностей **`Category`** та **`Activity`** (транзакцій) у вигляді повноцінних TypeScript-класів;
* **Функціонал:** Повний CRUD для категорій та операцій, фільтрація, валідація, генерація звітів (групування за категоріями та помісячно/по днях).

---

## 1. Архітектура проекту та структура файлів

Проект розбивається на прозорі шари за принципами SOLID:

```
personal-finance/
├── index.html                  # Головний SPA-інтерфейс (Bootstrap 5 розмітка)
├── package.json                # Залежності збірки (TypeScript, Vite)
├── tsconfig.json               # Сувора конфігурація TypeScript
└── src/
    ├── models/
    │   ├── Category.ts         # TS-клас Категорії
    │   └── Activity.ts         # TS-клас Транзакції (Операції)
    ├── services/
    │   └── StorageService.ts   # Типобезпечна робота з HTML5 localStorage
    ├── repositories/
    │   ├── CategoryRepository.ts # CRUD для категорій
    │   └── ActivityRepository.ts # CRUD для транзакцій + фільтрація
    ├── services/
    │   └── ReportService.ts    # Генерація звітів (групування за категоріями та датами)
    └── app.ts                  # Точка входу: ініціалізація, прив'язка DOM-подій та рендеринг
```

---

## 2. Крок 1: Налаштування середовища (TypeScript + Vite)

Використовуємо **Vite** як швидкий бандлер для швидкого запуску TypeScript у браузері без складної конфігурації Webpack.

### 2.1 Ініціалізація

```bash
mkdir personal-finance-manager
cd personal-finance-manager
npm init -y
npm install -D typescript vite
```

### 2.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### 2.3 Скрипти запуску в `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

---

## 3. Крок 2: Моделі предметної області (ООП Класи)

Сутності описуються повноцінними класами з валідацією полів, розрахунковими методами та серіалізацією/десеріалізацією з JSON.

### 3.1 Клас `Category` (`src/models/Category.ts`)

```typescript
export interface ICategoryDto {
  id: string;
  name: string;
  description: string;
}

export class Category {
  private _id: string;
  private _name: string;
  private _description: string;

  constructor(id: string, name: string, description: string = '') {
    this._id = id;
    this.name = name;
    this._description = description.trim();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error('Назва категорії не може бути порожньою.');
    }
    this._name = trimmed;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value.trim();
  }

  /**
   * Серіалізація в DTO для збереження в localStorage
   */
  public toJSON(): ICategoryDto {
    return {
      id: this._id,
      name: this._name,
      description: this._description
    };
  }

  /**
   * Фабричний метод створення екземпляра з JSON-об'єкта
   */
  public static fromJSON(dto: ICategoryDto): Category {
    return new Category(dto.id, dto.name, dto.description);
  }
}
```

### 3.2 Клас `Activity` (`src/models/Activity.ts`)

```typescript
export type OperationType = 'Expense' | 'Revenue'; // "Витрата" | "Дохід"

export interface IActivityDto {
  id: string;
  categoryId: string;
  type: OperationType;
  amount: number;
  date: string; // Формат: YYYY-MM-DD
  description: string;
}

export class Activity {
  private _id: string;
  private _categoryId: string;
  private _type: OperationType;
  private _amount: number;
  private _date: string;
  private _description: string;

  constructor(
    id: string,
    categoryId: string,
    type: OperationType,
    amount: number,
    date: string,
    description: string = ''
  ) {
    this._id = id;
    this.categoryId = categoryId;
    this._type = type;
    this.amount = amount;
    this.date = date;
    this._description = description.trim();
  }

  get id(): string {
    return this._id;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  set categoryId(val: string) {
    if (!val) throw new Error('Категорія є обов\'язковою для транзакції.');
    this._categoryId = val;
  }

  get type(): OperationType {
    return this._type;
  }

  set type(val: OperationType) {
    this._type = val;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(val: number) {
    if (isNaN(val) || val <= 0) {
      throw new Error('Сума операції має бути додатним числом більше за 0.');
    }
    this._amount = Number(val.toFixed(2));
  }

  get date(): string {
    return this._date;
  }

  set date(val: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      throw new Error('Некоректний формат дати. Очікується YYYY-MM-DD.');
    }
    this._date = val;
  }

  get description(): string {
    return this._description;
  }

  set description(val: string) {
    this._description = val.trim();
  }

  public toJSON(): IActivityDto {
    return {
      id: this._id,
      categoryId: this._categoryId,
      type: this._type,
      amount: this._amount,
      date: this._date,
      description: this._description
    };
  }

  public static fromJSON(dto: IActivityDto): Activity {
    return new Activity(
      dto.id,
      dto.categoryId,
      dto.type,
      dto.amount,
      dto.date,
      dto.description
    );
  }
}
```

---

## 4. Крок 3: Шар роботи з даними (HTML5 Storage та Repositories)

### 4.1 Типобезпечна обгортка `StorageService` (`src/services/StorageService.ts`)

```typescript
export class StorageService {
  public static getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (e) {
      console.error(`Помилка зчитування з localStorage [${key}]:`, e);
      return null;
    }
  }

  public static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Помилка запису в localStorage [${key}]:`, e);
    }
  }
}
```

### 4.2 Репозиторій категорій (`src/repositories/CategoryRepository.ts`)

```typescript
import { Category, ICategoryDto } from '../models/Category';
import { StorageService } from '../services/StorageService';

export class CategoryRepository {
  private readonly storageKey = 'pfm_categories';
  private categories: Map<string, Category> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const rawList = StorageService.getItem<ICategoryDto[]>(this.storageKey);
    if (rawList && rawList.length > 0) {
      rawList.forEach((dto) => this.categories.set(dto.id, Category.fromJSON(dto)));
    } else {
      // Стартові категорії за замовчуванням (як на скріншотах Fig 1)
      this.save(new Category('c-1', 'Продукти харчування', 'Витрати на продукти'));
      this.save(new Category('c-2', 'Харчування', 'Витрати на обіди, сніданки в закладах громадського харчування'));
      this.save(new Category('c-3', 'Відпочинок', 'Витрати на гулянки, походи в гори, туризм'));
    }
  }

  private persist(): void {
    const dtoList = Array.from(this.categories.values()).map((c) => c.toJSON());
    StorageService.setItem(this.storageKey, dtoList);
  }

  public getAll(): Category[] {
    return Array.from(this.categories.values());
  }

  public getById(id: string): Category | null {
    return this.categories.get(id) ?? null;
  }

  public save(category: Category): void {
    this.categories.set(category.id, category);
    this.persist();
  }

  public delete(id: string): boolean {
    const deleted = this.categories.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  public searchByName(query: string): Category[] {
    const lower = query.toLowerCase().trim();
    if (!lower) return this.getAll();
    return this.getAll().filter((c) => c.name.toLowerCase().includes(lower));
  }
}
```

### 4.3 Репозиторій транзакцій (`src/repositories/ActivityRepository.ts`)

```typescript
import { Activity, IActivityDto, OperationType } from '../models/Activity';
import { StorageService } from '../services/StorageService';

export class ActivityRepository {
  private readonly storageKey = 'pfm_activities';
  private activities: Map<string, Activity> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const rawList = StorageService.getItem<IActivityDto[]>(this.storageKey);
    if (rawList && rawList.length > 0) {
      rawList.forEach((dto) => this.activities.set(dto.id, Activity.fromJSON(dto)));
    } else {
      // Стартові початкові дані (зі скріншоту Fig 3)
      this.save(new Activity('a-1', 'c-2', 'Expense', 45.00, '2017-09-07', 'Акрополь (Сахарова, 21а)'));
      this.save(new Activity('a-2', 'c-1', 'Expense', 200.00, '2017-09-07', 'Продукти ("Фуршет", Володимира Великого, 9)'));
      this.save(new Activity('a-3', 'c-3', 'Expense', 200.00, '2017-09-08', 'Похід вихідного дня на Маковицю (Яремче)'));
      this.save(new Activity('a-4', 'c-2', 'Expense', 25.00, '2017-09-08', 'Обід ("Комора", Тичини, 9)'));
    }
  }

  private persist(): void {
    const dtoList = Array.from(this.activities.values()).map((a) => a.toJSON());
    StorageService.setItem(this.storageKey, dtoList);
  }

  public getAll(): Activity[] {
    return Array.from(this.activities.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public getById(id: string): Activity | null {
    return this.activities.get(id) ?? null;
  }

  public save(activity: Activity): void {
    this.activities.set(activity.id, activity);
    this.persist();
  }

  public delete(id: string): boolean {
    const res = this.activities.delete(id);
    if (res) this.persist();
    return res;
  }

  public filter(categoryId?: string, type?: OperationType, startDate?: string, endDate?: string): Activity[] {
    return this.getAll().filter((item) => {
      if (categoryId && item.categoryId !== categoryId) return false;
      if (type && item.type !== type) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    });
  }
}
```

---

## 5. Крок 4: Сервіс генератора звітів (`src/services/ReportService.ts`)

Відповідає за агрегацію витрат і доходів за категоріями та помісячно/по днях (як показано на Fig 5, 6, 7).

```typescript
import { Activity, OperationType } from '../models/Activity';
import { CategoryRepository } from '../repositories/CategoryRepository';

export interface ICategoryReportItem {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface IDayReportItem {
  date: string;
  totalAmount: number;
}

export class ReportService {
  constructor(private categoryRepo: CategoryRepository) {}

  /**
   * Звіт 1: Витрати/Доходи за період, згруповані за категоріями (Fig 6)
   */
  public generateCategoryReport(
    activities: Activity[],
    type: OperationType,
    startDate: string,
    endDate: string
  ): { items: ICategoryReportItem[]; grandTotal: number } {
    const filtered = activities.filter(
      (a) => a.type === type && a.date >= startDate && a.date <= endDate
    );

    const totalsByCategory = new Map<string, number>();
    let grandTotal = 0;

    for (const act of filtered) {
      const current = totalsByCategory.get(act.categoryId) || 0;
      totalsByCategory.set(act.categoryId, current + act.amount);
      grandTotal += act.amount;
    }

    const items: ICategoryReportItem[] = [];

    totalsByCategory.forEach((sum, catId) => {
      const cat = this.categoryRepo.getById(catId);
      const categoryName = cat ? cat.name : 'Видалена категорія';
      const percentage = grandTotal > 0 ? Number(((sum / grandTotal) * 100).toFixed(1)) : 0;

      items.push({
        categoryId: catId,
        categoryName,
        totalAmount: Number(sum.toFixed(2)),
        percentage
      });
    });

    // Сортуємо від найбільших витрат до найменших
    items.sort((a, b) => b.totalAmount - a.totalAmount);

    return { items, grandTotal: Number(grandTotal.toFixed(2)) };
  }

  /**
   * Звіт 2: Динаміка витрат день за днем (Day-by-Day report, Fig 7)
   */
  public generateDayByDayReport(
    activities: Activity[],
    type: OperationType,
    startDate: string,
    endDate: string
  ): IDayReportItem[] {
    const filtered = activities.filter(
      (a) => a.type === type && a.date >= startDate && a.date <= endDate
    );

    const totalsByDay = new Map<string, number>();

    for (const act of filtered) {
      const current = totalsByDay.get(act.date) || 0;
      totalsByDay.set(act.date, current + act.amount);
    }

    const result: IDayReportItem[] = [];
    totalsByDay.forEach((totalAmount, date) => {
      result.push({ date, totalAmount: Number(totalAmount.toFixed(2)) });
    });

    // Сортування за хронологією дат
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
}
```

---

## 6. Крок 5: Інтерфейс користувача (HTML5 + Bootstrap 5)

Створюємо файл `index.html`. Він містить навігаційну панель (як на скріншотах "BABULES"), модальні форми для додавання/редагування та секції відображення даних.

```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BABULES — Особисті Фінанси</title>
  <!-- Bootstrap 5 CSS (CDN) -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  />
</head>
<body class="bg-light">

  <!-- Навігаційна панель BABULES (в точності як на скріншотах) -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container-fluid px-4">
      <a class="navbar-brand fw-bold tracking-wider" href="#">BABULES</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <button class="btn nav-link text-white active" id="nav-categories-btn">Categories</button>
          </li>
          <li class="nav-item">
            <button class="btn nav-link text-white" id="nav-activities-btn">Activities</button>
          </li>
          <li class="nav-item">
            <button class="btn nav-link text-white" id="nav-reports-btn">Звіти</button>
          </li>
        </ul>
        <span class="navbar-text text-white-50">
          <i class="bi bi-person-circle"></i> admin
        </span>
      </div>
    </div>
  </nav>

  <div class="container mb-5">

    <!-- ==================== СЕКЦІЯ 1: КАТЕГОРІЇ (Fig 1) ==================== -->
    <section id="section-categories">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4">
          <h2 class="card-title h3 mb-4">Категорії витрат / доходів</h2>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <input
                type="text"
                id="search-category-input"
                class="form-control"
                placeholder="Введіть перші літери назви категорії..."
              />
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Назва</th>
                  <th>Опис</th>
                  <th style="width: 140px;" class="text-center">Управління</th>
                </tr>
              </thead>
              <tbody id="categories-table-body">
                <!-- Рендериться через TypeScript -->
              </tbody>
            </table>
          </div>

          <button class="btn btn-primary mt-2" id="btn-open-category-modal">
            Додати нову категорію
          </button>
        </div>
      </div>
    </section>

    <!-- ==================== СЕКЦІЯ 2: ТРАНЗАКЦІЇ / ОПЕРАЦІЇ (Fig 3) ==================== -->
    <section id="section-activities" class="d-none">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4">
          <h2 class="card-title h3 mb-4">Транзакції</h2>

          <!-- Фільтри операцій -->
          <div class="row g-3 mb-4 bg-white p-3 rounded border">
            <div class="col-md-4">
              <label class="form-label small text-muted">Фільтр по категоріям</label>
              <select id="filter-activity-category" class="form-select">
                <option value="">&lt;Всі категорії&gt;</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Тип операції</label>
              <select id="filter-activity-type" class="form-select">
                <option value="">&lt;Всі типи&gt;</option>
                <option value="Expense">Витрата</option>
                <option value="Revenue">Дохід</option>
              </select>
            </div>
            <div class="col-md-5 d-flex align-items-end gap-2">
              <button class="btn btn-outline-secondary w-100" id="btn-reset-filters">Скинути фільтр</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Категорія</th>
                  <th>Тип операції</th>
                  <th>Сума (грн)</th>
                  <th>Дата</th>
                  <th>Опис</th>
                  <th style="width: 130px;" class="text-center">Управління</th>
                </tr>
              </thead>
              <tbody id="activities-table-body">
                <!-- Рендериться через TypeScript -->
              </tbody>
            </table>
          </div>

          <button class="btn btn-primary mt-2" id="btn-open-activity-modal">
            Додати нову транзакцію
          </button>
        </div>
      </div>
    </section>

    <!-- ==================== СЕКЦІЯ 3: ГЕНЕРАТОР ЗВІТІВ (Fig 5, 6, 7) ==================== -->
    <section id="section-reports" class="d-none">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4">
          <h2 class="card-title h3 mb-4">Генератор звітів</h2>

          <form id="report-form" class="bg-white p-3 rounded border mb-4">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label small">Початкова дата (YYYY-MM-DD):</label>
                <input type="date" id="report-start-date" class="form-control" required />
              </div>
              <div class="col-md-3">
                <label class="form-label small">Кінцева дата (YYYY-MM-DD):</label>
                <input type="date" id="report-end-date" class="form-control" required />
              </div>
              <div class="col-md-3">
                <label class="form-label small">Тип операції:</label>
                <select id="report-type" class="form-select">
                  <option value="Expense">Витрата</option>
                  <option value="Revenue">Дохід</option>
                </select>
              </div>
              <div class="col-md-3 d-flex align-items-end gap-2">
                <button type="submit" class="btn btn-primary">Згенерувати</button>
              </div>
            </div>
          </form>

          <!-- Результати звіту: Таблиця та зведення (Fig 6) -->
          <div id="report-result-container" class="d-none">
            <div class="alert alert-info py-2" id="report-header-text"></div>
            
            <div class="row">
              <div class="col-md-7">
                <h4 class="h5 mb-3">Розподіл за категоріями</h4>
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th>Категорія</th>
                      <th class="text-end">Сума (грн)</th>
                      <th class="text-end">Частка (%)</th>
                    </tr>
                  </thead>
                  <tbody id="report-table-body"></tbody>
                  <tfoot class="table-light fw-bold">
                    <tr>
                      <td>Всього:</td>
                      <td class="text-end" id="report-grand-total">0.00</td>
                      <td class="text-end">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Текстова візуалізація / список по днях (Fig 7) -->
              <div class="col-md-5">
                <h4 class="h5 mb-3">Хронологія по датах</h4>
                <ul class="list-group" id="report-days-list"></ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>

  <!-- ==================== МОДАЛЬНЕ ВІКНО: КАТЕГОРІЯ (Fig 2) ==================== -->
  <div class="modal fade" id="categoryModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="categoryModalTitle">Реєстрація / Редагування категорії</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form id="category-form">
          <div class="modal-body">
            <input type="hidden" id="category-id-input" />
            <div class="mb-3">
              <label class="form-label">Назва категорії:</label>
              <input type="text" id="category-name-input" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Короткий опис:</label>
              <textarea id="category-desc-input" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="reset" class="btn btn-outline-secondary">Очистити</button>
            <button type="submit" class="btn btn-primary">Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- ==================== МОДАЛЬНЕ ВІКНО: ТРАНЗАКЦІЯ (Fig 4) ==================== -->
  <div class="modal fade" id="activityModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="activityModalTitle">Реєстрація / Редагування транзакції</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form id="activity-form">
          <div class="modal-body">
            <input type="hidden" id="activity-id-input" />
            <div class="mb-3">
              <label class="form-label">Категорія:</label>
              <select id="activity-category-select" class="form-select" required></select>
            </div>
            <div class="mb-3">
              <label class="form-label">Тип операції:</label>
              <select id="activity-type-select" class="form-select" required>
                <option value="Expense">Витрата</option>
                <option value="Revenue">Дохід</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Сума (грн):</label>
              <input type="number" step="0.01" min="0.01" id="activity-amount-input" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Дата (YYYY-MM-DD):</label>
              <input type="date" id="activity-date-input" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Короткий опис:</label>
              <input type="text" id="activity-desc-input" class="form-control" placeholder="Введіть опис транзакції" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="reset" class="btn btn-outline-secondary">Очистити</button>
            <button type="submit" class="btn btn-primary">Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Bootstrap JS (CDN) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Вхідний скрипт TypeScript -->
  <script type="module" src="/src/app.ts"></script>
</body>
</html>
```

---

## 7. Крок 6: Головний контролер додатку (`src/app.ts`)

Цей файл зв'язує DOM-події з репозиторіями та оновлює таблиці без повного перезавантаження сторінки.

```typescript
import { Category } from './models/Category';
import { Activity, OperationType } from './models/Activity';
import { CategoryRepository } from './repositories/CategoryRepository';
import { ActivityRepository } from './repositories/ActivityRepository';
import { ReportService } from './services/ReportService';

// Оголошуємо тип для глобального Bootstrap об'єкта
declare const bootstrap: any;

class AppController {
  private categoryRepo = new CategoryRepository();
  private activityRepo = new ActivityRepository();
  private reportService = new ReportService(this.categoryRepo);

  // Модальні вікна Bootstrap
  private categoryModal: any;
  private activityModal: any;

  constructor() {
    this.initModals();
    this.bindNavigation();
    this.bindCategoryEvents();
    this.bindActivityEvents();
    this.bindReportEvents();

    // Початковий рендеринг
    this.renderCategoriesTable();
    this.renderActivitiesTable();
    this.populateCategoryDropdowns();
    this.setDefaultReportDates();
  }

  private initModals(): void {
    const catEl = document.getElementById('categoryModal');
    if (catEl) this.categoryModal = new bootstrap.Modal(catEl);

    const actEl = document.getElementById('activityModal');
    if (actEl) this.activityModal = new bootstrap.Modal(actEl);
  }

  // --- Навігація між секціями ---
  private bindNavigation(): void {
    const secCategories = document.getElementById('section-categories')!;
    const secActivities = document.getElementById('section-activities')!;
    const secReports = document.getElementById('section-reports')!;

    const btnCat = document.getElementById('nav-categories-btn')!;
    const btnAct = document.getElementById('nav-activities-btn')!;
    const btnRep = document.getElementById('nav-reports-btn')!;

    const switchSection = (activeSec: HTMLElement, activeBtn: HTMLElement) => {
      [secCategories, secActivities, secReports].forEach((s) => s.classList.add('d-none'));
      [btnCat, btnAct, btnRep].forEach((b) => b.classList.remove('active'));

      activeSec.classList.remove('d-none');
      activeBtn.classList.add('active');
    };

    btnCat.addEventListener('click', () => switchSection(secCategories, btnCat));
    btnAct.addEventListener('click', () => switchSection(secActivities, btnAct));
    btnRep.addEventListener('click', () => switchSection(secReports, btnRep));
  }

  // --- Категорії ---
  private bindCategoryEvents(): void {
    const searchInput = document.getElementById('search-category-input') as HTMLInputElement;
    searchInput.addEventListener('input', () => {
      const filtered = this.categoryRepo.searchByName(searchInput.value);
      this.renderCategoriesTable(filtered);
    });

    const openModalBtn = document.getElementById('btn-open-category-modal')!;
    openModalBtn.addEventListener('click', () => {
      (document.getElementById('category-form') as HTMLFormElement).reset();
      (document.getElementById('category-id-input') as HTMLInputElement).value = '';
      document.getElementById('categoryModalTitle')!.textContent = 'Реєстрація інформації про категорію';
      this.categoryModal.show();
    });

    const catForm = document.getElementById('category-form') as HTMLFormElement;
    catForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const idInput = (document.getElementById('category-id-input') as HTMLInputElement).value;
      const nameInput = (document.getElementById('category-name-input') as HTMLInputElement).value;
      const descInput = (document.getElementById('category-desc-input') as HTMLInputElement).value;

      try {
        const id = idInput || `cat-${Date.now()}`;
        const category = new Category(id, nameInput, descInput);
        this.categoryRepo.save(category);

        this.categoryModal.hide();
        this.renderCategoriesTable();
        this.populateCategoryDropdowns();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  private renderCategoriesTable(list: Category[] = this.categoryRepo.getAll()): void {
    const tbody = document.getElementById('categories-table-body')!;
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Категорій не знайдено</td></tr>`;
      return;
    }

    list.forEach((cat, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td class="fw-bold">${cat.name}</td>
        <td>${cat.description || '<span class="text-muted">—</span>'}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary me-1 edit-cat-btn" data-id="${cat.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger del-cat-btn" data-id="${cat.id}">
            <i class="bi bi-x-lg"></i>
          </button>
        </td>
      `;

      tr.querySelector('.edit-cat-btn')!.addEventListener('click', () => this.editCategory(cat.id));
      tr.querySelector('.del-cat-btn')!.addEventListener('click', () => this.deleteCategory(cat.id));

      tbody.appendChild(tr);
    });
  }

  private editCategory(id: string): void {
    const cat = this.categoryRepo.getById(id);
    if (!cat) return;

    (document.getElementById('category-id-input') as HTMLInputElement).value = cat.id;
    (document.getElementById('category-name-input') as HTMLInputElement).value = cat.name;
    (document.getElementById('category-desc-input') as HTMLInputElement).value = cat.description;
    document.getElementById('categoryModalTitle')!.textContent = 'Редагування інформації про категорію';
    this.categoryModal.show();
  }

  private deleteCategory(id: string): void {
    if (confirm('Видалити цю категорію? Усі пов\'язані операції залишаться в історії.')) {
      this.categoryRepo.delete(id);
      this.renderCategoriesTable();
      this.populateCategoryDropdowns();
    }
  }

  // --- Транзакції ---
  private bindActivityEvents(): void {
    const filterCat = document.getElementById('filter-activity-category') as HTMLSelectElement;
    const filterType = document.getElementById('filter-activity-type') as HTMLSelectElement;
    const btnReset = document.getElementById('btn-reset-filters')!;

    const applyFilter = () => {
      const catId = filterCat.value || undefined;
      const type = (filterType.value as OperationType) || undefined;
      const filtered = this.activityRepo.filter(catId, type);
      this.renderActivitiesTable(filtered);
    };

    filterCat.addEventListener('change', applyFilter);
    filterType.addEventListener('change', applyFilter);

    btnReset.addEventListener('click', () => {
      filterCat.value = '';
      filterType.value = '';
      this.renderActivitiesTable();
    });

    const openActModalBtn = document.getElementById('btn-open-activity-modal')!;
    openActModalBtn.addEventListener('click', () => {
      (document.getElementById('activity-form') as HTMLFormElement).reset();
      (document.getElementById('activity-id-input') as HTMLInputElement).value = '';
      (document.getElementById('activity-date-input') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
      document.getElementById('activityModalTitle')!.textContent = 'Реєстрація інформації про транзакцію';
      this.activityModal.show();
    });

    const actForm = document.getElementById('activity-form') as HTMLFormElement;
    actForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const idInput = (document.getElementById('activity-id-input') as HTMLInputElement).value;
      const catId = (document.getElementById('activity-category-select') as HTMLSelectElement).value;
      const type = (document.getElementById('activity-type-select') as HTMLSelectElement).value as OperationType;
      const amount = parseFloat((document.getElementById('activity-amount-input') as HTMLInputElement).value);
      const date = (document.getElementById('activity-date-input') as HTMLInputElement).value;
      const desc = (document.getElementById('activity-desc-input') as HTMLInputElement).value;

      try {
        const id = idInput || `act-${Date.now()}`;
        const act = new Activity(id, catId, type, amount, date, desc);
        this.activityRepo.save(act);

        this.activityModal.hide();
        this.renderActivitiesTable();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  private renderActivitiesTable(list: Activity[] = this.activityRepo.getAll()): void {
    const tbody = document.getElementById('activities-table-body')!;
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Транзакцій не знайдено</td></tr>`;
      return;
    }

    list.forEach((act, index) => {
      const cat = this.categoryRepo.getById(act.categoryId);
      const catName = cat ? cat.name : 'Невідома категорія';
      const isExpense = act.type === 'Expense';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><span class="badge bg-secondary">${catName}</span></td>
        <td>
          <span class="badge ${isExpense ? 'bg-danger' : 'bg-success'}">
            ${isExpense ? 'Витрата' : 'Дохід'}
          </span>
        </td>
        <td class="fw-bold ${isExpense ? 'text-danger' : 'text-success'}">
          ${isExpense ? '-' : '+'}${act.amount.toFixed(2)}
        </td>
        <td>${act.date}</td>
        <td>${act.description || '—'}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary me-1 edit-act-btn" data-id="${act.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger del-act-btn" data-id="${act.id}">
            <i class="bi bi-x-lg"></i>
          </button>
        </td>
      `;

      tr.querySelector('.edit-act-btn')!.addEventListener('click', () => this.editActivity(act.id));
      tr.querySelector('.del-act-btn')!.addEventListener('click', () => this.deleteActivity(act.id));

      tbody.appendChild(tr);
    });
  }

  private editActivity(id: string): void {
    const act = this.activityRepo.getById(id);
    if (!act) return;

    (document.getElementById('activity-id-input') as HTMLInputElement).value = act.id;
    (document.getElementById('activity-category-select') as HTMLSelectElement).value = act.categoryId;
    (document.getElementById('activity-type-select') as HTMLSelectElement).value = act.type;
    (document.getElementById('activity-amount-input') as HTMLInputElement).value = act.amount.toString();
    (document.getElementById('activity-date-input') as HTMLInputElement).value = act.date;
    (document.getElementById('activity-desc-input') as HTMLInputElement).value = act.description;

    document.getElementById('activityModalTitle')!.textContent = 'Редагування інформації про транзакцію';
    this.activityModal.show();
  }

  private deleteActivity(id: string): void {
    if (confirm('Видалити цю транзакцію?')) {
      this.activityRepo.delete(id);
      this.renderActivitiesTable();
    }
  }

  private populateCategoryDropdowns(): void {
    const filterCat = document.getElementById('filter-activity-category') as HTMLSelectElement;
    const modalCat = document.getElementById('activity-category-select') as HTMLSelectElement;

    const categories = this.categoryRepo.getAll();

    // Для фільтра зберігаємо перший дефолтний пункт
    filterCat.innerHTML = '<option value="">&lt;Всі категорії&gt;</option>';
    modalCat.innerHTML = '';

    categories.forEach((c) => {
      filterCat.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      modalCat.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
  }

  // --- Звіти ---
  private setDefaultReportDates(): void {
    const end = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const start = startDate.toISOString().split('T')[0];

    (document.getElementById('report-start-date') as HTMLInputElement).value = start;
    (document.getElementById('report-end-date') as HTMLInputElement).value = end;
  }

  private bindReportEvents(): void {
    const form = document.getElementById('report-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const start = (document.getElementById('report-start-date') as HTMLInputElement).value;
      const end = (document.getElementById('report-end-date') as HTMLInputElement).value;
      const type = (document.getElementById('report-type') as HTMLSelectElement).value as OperationType;

      const reportData = this.reportService.generateCategoryReport(
        this.activityRepo.getAll(),
        type,
        start,
        end
      );

      const daysData = this.reportService.generateDayByDayReport(
        this.activityRepo.getAll(),
        type,
        start,
        end
      );

      this.renderReport(reportData, daysData, start, end, type);
    });
  }

  private renderReport(
    catReport: { items: any[]; grandTotal: number },
    daysReport: any[],
    start: string,
    end: string,
    type: OperationType
  ): void {
    const container = document.getElementById('report-result-container')!;
    container.classList.remove('d-none');

    const header = document.getElementById('report-header-text')!;
    header.textContent = `Звіт за період: ${start} — ${end} (${type === 'Expense' ? 'Витрати' : 'Доходи'})`;

    const tbody = document.getElementById('report-table-body')!;
    tbody.innerHTML = '';

    if (catReport.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">За обраний період операцій не знайдено</td></tr>`;
    } else {
      catReport.items.forEach((item) => {
        tbody.innerHTML += `
          <tr>
            <td>${item.categoryName}</td>
            <td class="text-end fw-bold">${item.totalAmount.toFixed(2)}</td>
            <td class="text-end">${item.percentage}%</td>
          </tr>
        `;
      });
    }

    document.getElementById('report-grand-total')!.textContent = `${catReport.grandTotal.toFixed(2)} грн`;

    // Рендеринг списку по датах (Fig 7)
    const daysList = document.getElementById('report-days-list')!;
    daysList.innerHTML = '';

    if (daysReport.length === 0) {
      daysList.innerHTML = `<li class="list-group-item text-muted text-center">Немає записів</li>`;
    } else {
      daysReport.forEach((d) => {
        daysList.innerHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="bi bi-calendar3 me-2 text-primary"></i>${d.date}</span>
            <span class="badge bg-primary rounded-pill">${d.totalAmount.toFixed(2)} грн</span>
          </li>
        `;
      });
    }
  }
}

// Запуск програми при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
```

---

## 8. Критерії оцінювання та самостійна робота студентів

### Обов'язкові вимоги для зарахування:
1. **Типізація та ООП:** Сутності `Category` та `Activity` обов'язково повинні бути екземплярами відповідних TypeScript-класів, а не "голими" JS-об'єктами (`Object literal`).
2. **Незмінність даних при перезавантаженні:** Перезавантаження сторінки `F5` зберігає всі додані категорії та транзакції за рахунок `localStorage`.
3. **Обмеження видалення:** При видаленні категорії перевіряти, чи закріплені за нею транзакції (або виводити попередження).
4. **Валідація полів:** Сума не може бути від'ємною або нулем; назва категорії не може бути порожньою.

### Додаткові завдання для високого балу:
* **Експорт у CSV / JSON:** Додати кнопку експорту історії фінансів у текстовий файл для резервного копіювання.
* **Інтеграція Highcharts:** За бажанням підключити CDN бібліотеки `Highcharts.js` (як показано на Fig 6 у PDF) для малювання кругової діаграми розподілу витрат на основі даних із `ReportService`.