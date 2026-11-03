# Урок 1: Вступ до сучасного Angular (1.5 години)

Цей конспект розроблений для швидкого та системного старту початківців у **Modern Angular** (версії 17–19+), де за замовчуванням використовуються **Standalone Components**, реактивність на базі **Signals**, новий вбудований синтаксис шаблонів (**Control Flow: `@if`, `@for`**) та функціональне налаштування **`provideHttpClient`**.

---

## 1. Рекомендований порядок викладання (Таймінг на 90 хвилин)

| Час | Блок | Тема |
| :--- | :--- | :--- |
| **00:00 – 00:15** | **Блок 1** | Що таке Angular, налаштування середовища (IDE, DevTools, CLI), створення проекту. |
| **00:15 – 00:30** | **Блок 2** | Анатомія Standalone-компонента та шаблони (Template Syntax, новий Control Flow). |
| **00:30 – 00:45** | **Блок 3** | Data Binding: інтерполяція, Property, Event та Two-Way binding. |
| **00:45 – 01:05** | **Блок 4** | Реактивність: Signals (`signal`, `computed`, оновлення стану через `set`/`update`). |
| **01:05 – 01:25** | **Блок 5** | Створення сервісу (`@Injectable`), `provideHttpClient` та завантаження даних через HTTP. |
| **01:25 – 01:30** | **Блок 6** | Підсумки, Q&A та завдання для самостійної практики. |

---

## 2. Налаштування робочого середовища (Інструменти)

### 2.1 Розширення для Visual Studio Code
Для комфортної розробки студентам необхідно встановити такі плагіни:
1. **Angular Language Service** (`Angular.ng-template`) — обов'язковий офіційний плагін від команди Angular. Забезпечує автодоповнення, перевірку типів у шаблонах HTML, навігацію до визначень.
2. **ESLint** (`dbaeumer.vscode-eslint`) — статичний аналіз стилю та пошук помилок у TypeScript.
3. **Prettier - Code formatter** (`esbenp.prettier-vscode`) — автоматичне форматування HTML, SCSS та TS файлів при збереженні.
4. **Auto Rename Tag** (`formulahendry.auto-rename-tag`) — автоматично перейменовує парні HTML-теги.

### 2.2 Розширення для браузерів (Debugging & Profiling)
Для інспектування дерева компонентів, стану сигналів та профілювання швидкодії:
* **Google Chrome**: [Angular DevTools](https://chromewebstore.google.com/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh) (офіційний плагін від Google).
* **Mozilla Firefox**: [Angular DevTools для Firefox](https://addons.mozilla.org/en-US/firefox/addon/angular-devtools/).

> **Підказка для лектора:** Покажіть вкладку **Angular** у DevTools браузера — студенти одразу побачать дерево компонентів і значення їхніх властивостей у реальному часі.

---

## 3. Створення першого проекту через Angular CLI

### 3.1 Встановлення Angular CLI
Перевірте наявність Node.js (рекомендовано v20+ LTS) і встановіть CLI глобально:
```bash
npm install -g @angular/cli
```

### 3.2 Генерація проекту
Створюємо новий проект із сучасними прапорцями за замовчуванням (Standalone components, стилі SCSS):
```bash
ng new my-first-angular-app --style=scss --ssr=false
```
* `--style=scss` — використання препроцесора SCSS.
* `--ssr=false` — для першого заняття вимикаємо Server-Side Rendering, щоб не ускладнювати архітектуру новачкам.

### 3.3 Запуск локального dev-сервера
```bash
cd my-first-angular-app
ng serve -o
```
Прапорець `-o` автоматично відкриє сторінку `http://localhost:4200/` у браузері.

---

## 4. Анатомія Standalone-компонента

Сучасний Angular відмовився від обов'язкових `NgModule`. Кожен компонент самодостатній (`standalone: true` є поведінкою за замовчуванням).

### 4.1 Структура файлу `app.component.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',          // HTML-тег для виклику: <app-root></app-root>
  standalone: true,              // Автономний компонент
  imports: [],                   // Імпорт інших компонентів, директив чи пайпів
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  lessonTitle = 'Основи Angular та TypeScript';
}
```

---

## 5. Data Binding (Прив'язка даних)

Angular надає чотири основні механізми зв'язування даних між TypeScript-класом і HTML-шаблоном:

```
┌────────────────────────────────────────────────────────┐
│                   TypeScript (Клас)                    │
└────────────────────────────────────────────────────────┘
       │                              ▲
       │ 1. Інтерполяція {{ value }}   │ 3. Події (event)
       │ 2. Властивість [prop]="val"  │    (click)="fn()"
       ▼                              │
┌────────────────────────────────────────────────────────┐
│                      HTML (Шаблон)                     │
└────────────────────────────────────────────────────────┘
       ▲                                              │
       └──────── 4. Двосторонній [(ngModel)] ─────────┘
```

### 5.1 Приклади синтаксису

1. **Інтерполяція (`{{ }}`)**: вивід тексту з TS у DOM.
   ```html
   <h1>{{ lessonTitle }}</h1>
   <p>2 + 2 = {{ 2 + 2 }}</p>
   ```

2. **Property Binding (`[property]`)**: передача значення з TS у властивість HTML-елемента.
   ```html
   <button [disabled]="isSubmitting">Надіслати</button>
   <img [src]="userAvatarUrl" alt="Аватар користувача" />
   ```

3. **Event Binding (`(event)`)**: перехоплення подій браузера (click, input, submit).
   ```html
   <button (click)="handleSaveClick($event)">Зберегти</button>
   ```

4. **Two-Way Binding (`[(ngModel)]`)**: двостороннє зв'язування форми (потребує імпорту `FormsModule`).
   ```typescript
   // app.component.ts
   import { FormsModule } from '@angular/forms';

   @Component({
     imports: [FormsModule],
     // ...
   })
   export class AppComponent {
     userName = 'Остап';
   }
   ```
   ```html
   <!-- app.component.html -->
   <input [(ngModel)]="userName" placeholder="Введіть ім'я" />
   <p>Привіт, {{ userName }}!</p>
   ```

---

## 6. Сучасний Control Flow у шаблонах (`@if`, `@for`)

У сучасних версіях Angular замість директив `*ngIf` та `*ngFor` використовується новий декларативний синтаксис:

```html
<!-- Умовний рендеринг -->
@if (isLoggedIn) {
  <p>Ласкаво просимо, {{ userName }}!</p>
} @else {
  <button (click)="login()">Увійти</button>
}

<!-- Рендеринг списків (track є обов'язковим для оптимізації DOM) -->
<ul>
  @for (item of courseList; track item.id) {
    <li>#{{ item.id }}: {{ item.title }}</li>
  } @empty {
    <li>Список курсів порожній.</li>
  }
</ul>
```

---

## 7. Реактивність за допомогою Signals

**Signals (Сигнали)** — це реактивна система Angular для автоматичного та гранулярного відстеження змін значень без зайвих перерахунків.

### 7.1 Базові операції з сигналами

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <h3>Лічильник: {{ count() }}</h3>
    <p>Подвоєне значення: {{ doubleCount() }}</p>

    <button (click)="increment()">+1</button>
    <button (click)="reset()">Скинути</button>
  `
})
export class CounterComponent {
  // 1. Оголошення змінюваного сигналу (WritableSignal)
  count = signal<number>(0);

  // 2. Обчислюваний сигнал (ComputedSignal: залежить від count і кешується)
  doubleCount = computed(() => this.count() * 2);

  increment(): void {
    // Зміна значення на основі попереднього
    this.count.update(prev => prev + 1);
  }

  reset(): void {
    // Встановлення нового абсолютного значення
    this.count.set(0);
  }
}
```

> **Важливо:** Щоб отримати значення сигналу в коді або шаблоні, його потрібно викликати як функцію: `count()`.

---

## 8. Робота з віддаленим сервером: `HttpClient` + Signals

### 8.1 Підключення `provideHttpClient` у `app.config.ts`

У Standalone-додатках провайдери налаштовуються у файлі `src/app/app.config.ts`:

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient() // Вмикає підтримку HttpClient у всьому додатку
  ]
};
```

### 8.2 Створення сервісу даних (`ng g s services/user`)

```typescript
// src/app/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root' // Singleton-сервіс, доступний у всьому додатку
})
export class UserService {
  private readonly http = inject(HttpClient); // Сучасний спосіб DI замість конструктора
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';

  public fetchUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }
}
```

### 8.3 Інтеграція сервісу в компонент із збереженням у Signals

```typescript
// src/app/app.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { UserService, UserDto } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="container">
      <h2>Список користувачів (HTTP + Signals)</h2>

      @if (isLoading()) {
        <p>Завантаження даних...</p>
      }

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <ul class="user-list">
        @for (user of users(); track user.id) {
          <li>
            <strong>{{ user.name }}</strong> ({{ user.email }})
          </li>
        }
      </ul>
    </main>
  `,
  styles: [`
    .container { font-family: sans-serif; padding: 20px; }
    .error { color: red; font-weight: bold; }
  `]
})
export class AppComponent implements OnInit {
  private readonly userService = inject(UserService);

  // Стан компонента на базі сигналів
  users = signal<UserDto[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.fetchUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Не вдалося завантажити дані користувачів');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
}
```

---

## 9. Практичне міні-завдання для студентів у кінці уроку

**Завдання «Пошуковий фільтр» (15 хвилин):**
1. Додати поле пошуку (`<input>`) над списком користувачів.
2. Створити сигнал `searchQuery = signal<string>('')`.
3. Створити обчислюваний сигнал `filteredUsers = computed(() => ...)` за допомогою метода масиву `.filter()`.
4. Замінити рендеринг у `@for` з `users()` на `filteredUsers()`.