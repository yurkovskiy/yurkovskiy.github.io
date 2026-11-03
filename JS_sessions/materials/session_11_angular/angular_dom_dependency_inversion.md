# Урок 2: Архітектурні принципи Angular: Робота з DOM та Dependency Inversion

Цей посібник присвячений внутрішній архітектурі Angular: як фреймворк взаємодіє з браузерним DOM, чим його підхід відрізняється від Virtual DOM у React, як працює інкапсуляція стилів (Shadow DOM) та як побудована система Dependency Injection (DI) з дотриманням принципу Dependency Inversion (DIP із SOLID).

---

## 1. Порівняння моделей DOM: Real DOM, Virtual DOM та Shadow DOM

Щоб зрозуміти продуктивність та механіку Angular, необхідно розрізняти три абсолютно різні концепції.

### 1.1 Real DOM (Реальний DOM)
* **Що це:** Деревоподібна структура об'єктів у пам'яті браузера, яка відображає розпарсений HTML-документ.
* **Проблема:** Пряма зміна вузлів DOM (через `document.createElement`, `appendChild`) коштує дешево, але провокує дорогі процеси браузера: **Reflow / Layout** (перерахунок геометрії елементів) та **Repaint** (перемальовування пікселів).
* **Як працює Angular:** На відміну від React, **в Angular НЕМАЄ Virtual DOM**. 
  Angular компілює HTML-шаблони у високооптимізовані інструкції JavaScript (**Ivy Engine / Template Instructions**). Під час зміни даних Angular оновлює конкретні вузли Real DOM напряму за допомогою гранулярного відстеження (Control Flow та Signals), оминаючи проміжний шар віртуальних дерев.

### 1.2 Virtual DOM (Віртуальний DOM у React / Vue)
* **Що це:** Легка копія дерева Real DOM у вигляді звичайних JavaScript-об'єктів.
* **Механіка:** При кожній зміні стану створюється нове віртуальне дерево, яке порівнюється з попереднім (**Reconciliation / Diffing**), і лише виявлена різниця застосовується до Real DOM.
* **Компроміс:** Витрачається додаткова пам'ять на зберігання дерев та процесорний час на алгоритм порівняння.

### 1.3 Shadow DOM (Тіньовий DOM)
* **Що це:** Частина офіційного стандарту **W3C Web Components**. Це ізольоване піддерево DOM-елементів, прикріплене до звичайного елемента (Shadow Host), яке повністю приховане від глобальних CSS-стилів та зовнішніх JS-селекторів.
* **Призначення:** Забезпечення повної ізоляції (інкапсуляції) стилів і розмітки компонента від решти додатку.

```
┌─────────────────────────────────────────────────────────────┐
│                       Light (Real) DOM                      │
│   <app-root>                                                │
│     ├── <header class="title">...                           │
│     └── <app-card>  ◄── (Shadow Host)                       │
│              │                                              │
│              ▼ [Shadow Root Boundary - Ізольований бар'єр]  │
│         ┌──────────────────────────────────────┐            │
│         │              Shadow DOM              │            │
│         │   <style>.title { color: red; }</style>           │
│         │   <div class="title">Ізольовано</div>│            │
│         └──────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Інкапсуляція стилів в Angular (`ViewEncapsulation`)

Angular надає вибір, як саме ізолювати стилі компонента за допомогою властивості `encapsulation` у декораторі `@Component`.

```typescript
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<div class="card-box">Картка товару</div>`,
  styles: [`.card-box { border: 1px solid #ccc; padding: 16px; }`],
  encapsulation: ViewEncapsulation.Emulated // За замовчуванням
})
export class CardComponent {}
```

### 2.1 Три режими `ViewEncapsulation`:

| Режим | Як працює під капотом | Ізоляція стилів | Присутність у DevTools |
| :--- | :--- | :--- | :--- |
| **`ViewEncapsulation.Emulated`** *(За замовчуванням)* | Емулює Shadow DOM: Angular модифікує селектори і додає унікальні host-атрибути (наприклад, `_ngcontent-ng-c123`) до HTML-тегів. | Стилі компонента не витікають назовні, але глобальні стилі можуть потрапляти всередину. | Звичайні теги з атрибутами `_ngcontent-*`. |
| **`ViewEncapsulation.ShadowDom`** | Використовує нативний браузерний Shadow DOM (`element.attachShadow()`). | Повна 100% двостороння ізоляція на рівні браузера. Глобальні стилі не проникають всередину. | Тег `#shadow-root (open)` всередині елемента в консолі DevTools. |
| **`ViewEncapsulation.None`** | Інкапсуляція повністю вимкнена. Стилі додаються до глобального тегу `<head>`. | Відсутня: стилі стають глобальними для всієї сторінки. | Чистий HTML без додаткових атрибутів. |

> **Slide Summary:** Angular не використовує Virtual DOM — натомість Ivy оновлює реальний DOM напряму. Для ізоляції стилів Angular за замовчуванням емулює Shadow DOM через унікальні атрибути (`_ngcontent`), але підтримує і нативний W3C Shadow DOM.
>
> 💬 **Питання для дискусії:** *У яких випадках варто перемикати компонент на `ViewEncapsulation.None`, і чим це загрожує у великих проектах?*

---

## 3. Безпечна взаємодія з DOM: `ElementRef` та `Renderer2`

В Angular суворо **не рекомендується** використовувати прямі звернення до DOM на кшталт `document.getElementById()` або `element.style.color = 'red'`. 

### Чому це заборонено:
1. **Вразливість XSS (Cross-Site Scripting):** Пряма маніпуляція DOM відкриває двері для шкідливого скриптингу.
2. **Неможливість роботи в SSR (Server-Side Rendering):** На сервері (Node.js) об'єктів `window` та `document` взагалі не існує. Виклик `document` призведе до падіння сервера.

### 3.1 Безпечний підхід через `Renderer2`

```typescript
import { Component, ElementRef, inject, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-highlight-box',
  standalone: true,
  template: `<div #myContainer class="box">Контейнер</div>`
})
export class HighlightBoxComponent implements AfterViewInit {
  private readonly hostElement = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngAfterViewInit(): void {
    // Безпечне додавання класу та стилів, що працює як у браузері, так і на SSR
    this.renderer.setStyle(this.hostElement.nativeElement, 'backgroundColor', '#f4f6f9');
    this.renderer.addClass(this.hostElement.nativeElement, 'initialized');
  }
}
```

---

## 4. Принцип інверсії залежностей (Dependency Inversion Principle)

**Dependency Inversion Principle (DIP)** — це літера **D** із SOLID:
1. *Модулі вищого рівня не повинні залежати від модулів нижчого рівня. Обидва повинні залежати від абстракцій.*
2. *Абстракції не повинні залежати від деталей. Деталі повинні залежати від абстракцій.*

```
Порушення DIP (Жорстка залежність):
[ OrderComponent ] ─── new OrderApiService() ───► [ OrderApiService (Concrete) ]

Дотримання DIP через Angular DI:
[ OrderComponent ] ───► [ IOrderService (Contract) ] ◄─── [ OrderApiService ]
                                   ▲
                   Angular Injector надає реалізацію
```

---

## 5. Система Dependency Injection (DI) в Angular

Angular володіє однією з найпотужніших в індустрії систем Dependency Injection. Вона складається з трьох ключових елементів:
1. **Залежність (Token / Contract):** Що саме потрібно компоненту.
2. **Провайдер (Provider):** Рецепт, який пояснює, як саме створити екземпляр залежності.
3. **Інжектор (Injector):** Механізм контейнера, який створює об'єкти та передає їх споживачам.

### 5.1 Конструктор vs сучасна функція `inject()`

Починаючи з Angular 14+, функція `inject()` стала стандартною альтернативою передачі залежностей через конструктор:

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `...`
})
export class ProfileComponent {
  // Сучасний підхід: типи виводяться автоматично, чистий клас без громіздких конструкторів
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
}
```

### 5.2 Реалізація Dependency Inversion через `InjectionToken`

Оскільки інтерфейси TypeScript видаляються після компіляції (`Type Erasure`), ми не можемо використовувати `interface` як токен DI під час виконання. Для цього Angular надає клас `InjectionToken`:

```typescript
// logger.contract.ts
import { InjectionToken } from '@angular/core';

// 1. Абстракція (контракт)
export interface ILoggerService {
  log(message: string): void;
  error(message: string): void;
}

// 2. Унікальний токен для DI контейнера
export const LOGGER_TOKEN = new InjectionToken<ILoggerService>('LOGGER_TOKEN');
```

```typescript
// logger-implementations.ts
import { Injectable } from '@angular/core';
import { ILoggerService } from './logger.contract';

// Деталь 1: Логування в консоль браузера (для Dev)
@Injectable()
export class ConsoleLoggerService implements ILoggerService {
  log(msg: string): void { console.log(`[Dev Console]: ${msg}`); }
  error(msg: string): void { console.error(`[Dev Error]: ${msg}`); }
}

// Деталь 2: Логування на сервер моніторингу (для Production / Sentry)
@Injectable()
export class ServerMonitoringLoggerService implements ILoggerService {
  log(msg: string): void { /* відправка POST запиту на /api/logs */ }
  error(msg: string): void { /* відправка POST запиту на /api/errors */ }
}
```

```typescript
// order.component.ts
import { Component, inject } from '@angular/core';
import { LOGGER_TOKEN } from './logger.contract';

@Component({
  selector: 'app-order',
  standalone: true,
  template: `<button (click)="submitOrder()">Оформити замовлення</button>`
})
export class OrderComponent {
  // Компонент залежить ВИКЛЮЧНО від абстракції (токена)
  private readonly logger = inject(LOGGER_TOKEN);

  submitOrder(): void {
    this.logger.log('Замовлення успішно створено');
  }
}
```

---

## 6. Типи провайдерів (Provider Recipes)

Angular дозволяє конфігурувати фабрикацію залежностей кількома способами:

```typescript
import { ApplicationConfig } from '@angular/core';
import { LOGGER_TOKEN } from './logger.contract';
import { ConsoleLoggerService, ServerMonitoringLoggerService } from './logger-implementations';

const isProduction = true;

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. useClass: підміна реалізації залежно від середовища
    {
      provide: LOGGER_TOKEN,
      useClass: isProduction ? ServerMonitoringLoggerService : ConsoleLoggerService
    },

    // 2. useValue: передача конфігураційного об'єкта або примітиву
    {
      provide: 'API_BASE_URL',
      useValue: 'https://api.myproject.ua/v1'
    },

    // 3. useFactory: гнучке створення екземпляра з доступом до інших сервісів
    {
      provide: 'FEATURE_FLAGS',
      useFactory: (http: HttpClient) => {
        // фабрична функція
        return { enableNewCheckout: true };
      },
      deps: [HttpClient]
    }
  ]
};
```

---

## 7. Ієрархія інжекторів (Hierarchical Injectors & Scopes)

В Angular інжектори утворюють багаторівневе дерево:

```
                  ┌──────────────────────────────┐
                  │      Platform Injector       │ (Спільний для кількох додатків на сторінці)
                  └──────────────┬───────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │  Root / Environment Injector │ (providedIn: 'root' / app.config.ts)
                  │          [Singleton]         │ 
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                                               │
┌────────▼──────────┐                         ┌──────────▼──────────┐
│ Element Injector  │                         │  Element Injector   │
│ (Component A)     │                         │  (Component B)      │
└────────┬──────────┘                         └─────────────────────┘
         │
┌────────▼──────────┐
│ Child Element     │
│ (Component A-1)   │
└───────────────────┘
```

### Рівні існування сервісу (Scopes):

1. **`providedIn: 'root'` (Application Scope - Singleton):**
   * Створюється один єдиний екземпляр на весь додаток.
   * Підтримує **Tree-shaking**: якщо сервіс не імпортується жодним компонентом, компілятор видалить його з фінального JS-бандла.

2. **Рівень компонента (`providers: [CartService]` у `@Component`):**
   * Кожен створений екземпляр цього компонента отримає **свій власний новий екземпляр сервісу**.
   * Коли компонент знищується з DOM, пов'язаний екземпляр сервісу також знищується збирачем сміття (Garbage Collector).

---

## 8. Практичне інтерактивне завдання

**Тема: Власний кеш-провайдер через DIP (15 хвилин)**

**Умова:**
1. Описати інтерфейс `ICacheService` із методами `get(key: string): unknown` та `set(key: string, val: unknown): void`.
2. Створити `InjectionToken<ICacheService>`.
3. Створити дві реалізації: `MemoryCacheService` (зберігає дані в `Map`) та `LocalStorageCacheService` (зберігає в браузерному `localStorage`).
4. Налаштувати провайдер у компоненті, який використовує `LocalStorageCacheService`.

```typescript
// РІШЕННЯ:
import { InjectionToken, Injectable, Component, inject } from '@angular/core';

export interface ICacheService {
  get(key: string): unknown;
  set(key: string, val: unknown): void;
}

export const CACHE_TOKEN = new InjectionToken<ICacheService>('CACHE_TOKEN');

@Injectable()
export class MemoryCacheService implements ICacheService {
  private store = new Map<string, unknown>();
  get(key: string): unknown { return this.store.get(key); }
  set(key: string, val: unknown): void { this.store.set(key, val); }
}

@Injectable()
export class LocalStorageCacheService implements ICacheService {
  get(key: string): unknown {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  set(key: string, val: unknown): void {
    localStorage.setItem(key, JSON.stringify(val));
  }
}

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `<p>Налаштування кешовано</p>`,
  providers: [
    // Локальна підміна: цей компонент використовуватиме LocalStorage
    { provide: CACHE_TOKEN, useClass: LocalStorageCacheService }
  ]
})
export class SettingsComponent {
  private readonly cache = inject(CACHE_TOKEN);

  saveTheme(theme: string): void {
    this.cache.set('user_theme', theme);
  }
}
```

---

## 9. Підсумкова шпаргалка

| Питання / Концепт | Відповідь в Angular |
| :--- | :--- |
| **Чи є Virtual DOM в Angular?** | **Ні.** Angular компілює шаблони в інструкції Ivy, оновлюючи Real DOM безпосередньо. |
| **Що таке Shadow DOM?** | Стандарт W3C для повної ізоляції DOM і CSS піддерева від зовнішнього коду. |
| **Емуляція за замовчуванням** | `ViewEncapsulation.Emulated` додає атрибути `_ngcontent-*` для ізоляції без накладних витрат Shadow DOM. |
| **Як безпечно змінювати DOM?** | Через `Renderer2` та `ElementRef`, що гарантує роботу в SSR та безпеку від XSS. |
| **Що таке DIP у SOLID?** | Принцип: залежте від абстракцій (інтерфейсів/токенів), а не від конкретних реалізацій класів. |
| **Як типізувати абстракцію в DI?** | Через `InjectionToken<T>`, оскільки `interface` зникає після транспіляції в JS. |
| **Як отримати залежність?** | За допомогою сучасної функції `inject(TOKEN)` у місці ініціалізації полів класу. |