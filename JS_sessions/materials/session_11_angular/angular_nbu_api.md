# Практичний проект: Калькулятор обміну валют на базі NBU API

У цьому покроковому посібнику ми побудуємо інтерактивний калькулятор валют на базі сучасного Angular (Standalone Components, Signals, Reactive Forms, `provideHttpClient`). Додаток отримує офіційні курси валют від API Національного банку України, дозволяє користувачеві вводити суму, обирати валюту та напрямок конвертації, а також переглядати деталізовану інформацію про обраний курс.

---

## 1. Архітектура та вимоги до проекту

### 1.1 Структура компонентів та потоку даних:

```
┌─────────────────────────────────────────────────────────────┐
│                    AppComponent (Контейнер)                 │
│   - Ініціалізує NbuExchangeService                          │
│   - Зберігає список завантажених валют у Signal             │
│   - Керує глобальним станом завантаження й помилок          │
└──────────────┬──────────────────────────────┬───────────────┘
               │ [currencies]                 │ [selectedRate]
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   CurrencyConverterComponent │ │    CurrencyDetailsComponent│
│   - Angular Reactive Form    │ │   - Картка поточної валюти │
│   - Обчислення через Signals │ │   - Офіційний код, назва   │
│   - Конвертація UAH <-> CURR │ │   - Дата фіксації курсу    │
└──────────────────────────────┘ └────────────────────────────┘
               ▲
               │ Використовує
┌──────────────┴───────────────┐
│       NbuExchangeService     │
│   - HttpClient (GET запити)  │
│   - Валідація схеми / Guards │
└──────────────────────────────┘
```

### 1.2 Необхідні сутності:
1. **`NbuExchangeRate`** — інтерфейс опису контракту API НБУ.
2. **`NbuExchangeService`** — сервіс для виконання HTTP-запитів до endpoint НБУ.
3. **`CurrencyConverterComponent`** — форма для введення суми, вибору валюти, напрямку та динамічного підрахунку результату.
4. **`CurrencyDetailsComponent`** — презентаційний компонент для відображення картки поточної валюти.
5. **`AppComponent`** — кореневий компонент, що об'єднує додаток.

---

## 2. Крок 1: Ініціалізація проекту та налаштування `app.config.ts`

### 2.1 Створення нового проекту через CLI:
```bash
ng new nbu-currency-calculator --style=scss --ssr=false
cd nbu-currency-calculator
```

### 2.2 Підключення `provideHttpClient` у `src/app/app.config.ts`:
Для роботи сервісу `HttpClient` у додатку на Standalone-компонентах реєструємо його провайдер:

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient()
  ]
};
```

---

## 3. Крок 2: Опис моделі даних (Модель контракту НБУ)

Створимо файл типів: `src/app/models/nbu-rate.model.ts`.

```typescript
// src/app/models/nbu-rate.model.ts

export interface NbuExchangeRate {
  r030: number;          // Цифровий код валюти (ISO 4217, напр. 840)
  txt: string;           // Назва валюти українською ("Долар США")
  rate: number;          // Офіційний курс до гривні (UAH)
  cc: string;            // Символьний код валюти ("USD", "EUR")
  exchangedate: string;  // Дата у форматі "DD.MM.YYYY"
}

export type ConversionDirection = 'UAH_TO_CURRENCY' | 'CURRENCY_TO_UAH';

export interface ConversionResult {
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  direction: ConversionDirection;
  currencyCode: string;
}
```

---

## 4. Крок 3: Сервіс для роботи з API (`NbuExchangeService`)

Створимо сервіс генератором:
```bash
ng g s services/nbu-exchange
```

Реалізуємо виклики до відкритого API НБУ (`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json`):

```typescript
// src/app/services/nbu-exchange.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { NbuExchangeRate } from '../models/nbu-rate.model';

@Injectable({
  providedIn: 'root'
})
export class NbuExchangeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange';

  /**
   * Завантаження переліку всіх актуальних курсів валют від НБУ
   * @param date Необов'язкова дата у форматі YYYYMMDD
   */
  public getAllRates(date?: string): Observable<NbuExchangeRate[]> {
    let params = new HttpParams().set('json', '');
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<NbuExchangeRate[]>(this.apiUrl, { params }).pipe(
      map((rates) => {
        // Сортуємо список за абеткою назви валюти для зручності у випадаючому списку
        return rates.sort((a, b) => a.txt.localeCompare(b.txt));
      }),
      catchError((error) => {
        console.error('Помилка при завантаженні даних із НБУ:', error);
        return throwError(() => new Error('Не вдалося отримати курси валют від сервера НБУ.'));
      })
    );
  }
}
```

---

## 5. Крок 4: Компонент 1 — Картка інформації про валюту (`CurrencyDetailsComponent`)

Цей презентаційний компонент отримує обрану валюту через новий `input()` API сигналів Angular та виводить стилізовану картку з аналітикою курсу.

Генеруємо компонент:
```bash
ng g c components/currency-details --inline-template --inline-style
```

Код файлу `src/app/components/currency-details/currency-details.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbuExchangeRate } from '../../models/nbu-rate.model';

@Component({
  selector: 'app-currency-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="details-card">
      @if (rate(); as currentRate) {
        <div class="card-header">
          <h3>{{ currentRate.txt }} ({{ currentRate.cc }})</h3>
          <span class="currency-badge">Код ISO: {{ currentRate.r030 }}</span>
        </div>
        <div class="card-body">
          <div class="rate-metric">
            <span class="label">Офіційний курс НБУ:</span>
            <span class="value">{{ currentRate.rate | number:'1.2-4' }} ₴</span>
          </div>
          <div class="date-metric">
            <span class="label">Дата фіксації:</span>
            <span>{{ currentRate.exchangedate }}</span>
          </div>
        </div>
      } @else {
        <div class="placeholder">
          <p>Оберіть валюту в калькуляторі для перегляду деталей курсу.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .details-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin-top: 20px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 8px;
      h3 { margin: 0; color: #1e293b; font-size: 1.15rem; }
    }
    .currency-badge {
      background: #0284c7;
      color: #fff;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .card-body {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .rate-metric {
      font-size: 1.1rem;
      .value { font-weight: bold; color: #0f172a; margin-left: 8px; }
    }
    .label { color: #64748b; }
    .placeholder { color: #94a3b8; text-align: center; padding: 12px; }
  `]
})
export class CurrencyDetailsComponent {
  // Новий тип безпечного вхідного сигналу Angular 17.1+
  rate = input<NbuExchangeRate | null>(null);
}
```

---

## 6. Крок 5: Компонент 2 — Форма конвертатора (`CurrencyConverterComponent`)

Компонент використовує **Angular Reactive Forms** (`FormGroup`, `FormControl`, `Validators`) для збору даних і валідації суми та вибору валюти, обчислюючи результат за допомогою `computed()`.

Генеруємо компонент:
```bash
ng g c components/currency-converter
```

### 6.1 Логіка компонента: `src/app/components/currency-converter/currency-converter.component.ts`

```typescript
import { Component, OnInit, input, output, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConversionDirection, ConversionResult, NbuExchangeRate } from '../../models/nbu-rate.model';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss'
})
export class CurrencyConverterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // Вхідний список валют
  currencies = input.required<NbuExchangeRate[]>();

  // Подія сповіщення батьківського компонента про вибір валюти
  selectedRateChange = output<NbuExchangeRate | null>();

  // Реактивна форма для збору даних
  converterForm!: FormGroup;

  // Сигнали внутрішнього стану форми для миттєвих розрахунків
  enteredAmount = signal<number>(100);
  selectedCurrencyCode = signal<string>('USD');
  conversionDirection = signal<ConversionDirection>('UAH_TO_CURRENCY');

  // Обчислення обраної сутності валюти
  currentRate = computed<NbuExchangeRate | null>(() => {
    const list = this.currencies();
    const code = this.selectedCurrencyCode();
    return list.find((item) => item.cc === code) ?? null;
  });

  // Обчислення підсумкової суми конвертації
  calculationResult = computed<ConversionResult | null>(() => {
    const rateItem = this.currentRate();
    const amount = this.enteredAmount();
    const direction = this.conversionDirection();

    if (!rateItem || amount <= 0 || isNaN(amount)) {
      return null;
    }

    let calculated: number;
    if (direction === 'UAH_TO_CURRENCY') {
      // Гривні в іноземну валюту
      calculated = amount / rateItem.rate;
    } else {
      // Іноземну валюту в гривні
      calculated = amount * rateItem.rate;
    }

    return {
      sourceAmount: amount,
      targetAmount: Number(calculated.toFixed(2)),
      rate: rateItem.rate,
      direction,
      currencyCode: rateItem.cc
    };
  });

  ngOnInit(): void {
    this.initForm();
    this.listenToFormChanges();
  }

  private initForm(): void {
    this.converterForm = this.fb.group({
      amount: [100, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', [Validators.required]],
      direction: ['UAH_TO_CURRENCY', [Validators.required]]
    });
  }

  private listenToFormChanges(): void {
    // Синхронізація Reactive Forms із Signals
    this.converterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (this.converterForm.valid) {
          this.enteredAmount.set(Number(val.amount));
          this.selectedCurrencyCode.set(val.currency);
          this.conversionDirection.set(val.direction);

          // Сповіщаємо зовнішній світ про зміну валюти для CurrencyDetailsComponent
          this.selectedRateChange.emit(this.currentRate());
        }
      });
  }

  // Зміна напрямку конвертації в один клік
  toggleDirection(): void {
    const current = this.converterForm.get('direction')?.value as ConversionDirection;
    const next: ConversionDirection =
      current === 'UAH_TO_CURRENCY' ? 'CURRENCY_TO_UAH' : 'UAH_TO_CURRENCY';
    this.converterForm.patchValue({ direction: next });
  }
}
```

### 6.2 Шаблон форми: `src/app/components/currency-converter/currency-converter.component.html`

```html
<div class="converter-card">
  <h2>Калькулятор конвертації</h2>

  <form [formGroup]="converterForm" class="converter-form">
    <!-- Поле введення суми -->
    <div class="form-group">
      <label for="amount">Сума для обміну:</label>
      <input
        id="amount"
        type="number"
        formControlName="amount"
        step="any"
        placeholder="Введіть суму"
        class="form-control"
      />
      @if (converterForm.get('amount')?.invalid && converterForm.get('amount')?.touched) {
        <small class="error-text">Введіть додатне число більше 0.</small>
      }
    </div>

    <!-- Випадаючий список валют -->
    <div class="form-group">
      <label for="currency">Оберіть іноземну валюту:</label>
      <select id="currency" formControlName="currency" class="form-control">
        @for (item of currencies(); track item.cc) {
          <option [value]="item.cc">
            {{ item.cc }} — {{ item.txt }} ({{ item.rate | number:'1.2-2' }} ₴)
          </option>
        }
      </select>
    </div>

    <!-- Вибір напрямку конвертації -->
    <div class="form-group direction-group">
      <span class="label">Напрямок обміну:</span>
      <div class="radio-controls">
        <label>
          <input type="radio" value="UAH_TO_CURRENCY" formControlName="direction" />
          Гривня (UAH) ➔ Валюта
        </label>
        <label>
          <input type="radio" value="CURRENCY_TO_UAH" formControlName="direction" />
          Валюта ➔ Гривня (UAH)
        </label>
      </div>

      <button type="button" class="btn-swap" (click)="toggleDirection()">
        ⇄ Поміняти місцями
      </button>
    </div>
  </form>

  <!-- Блок відображення результату -->
  @if (calculationResult(); as res) {
    <div class="result-banner">
      <span class="caption">Результат розрахунку:</span>
      @if (res.direction === 'UAH_TO_CURRENCY') {
        <p class="final-amount">
          {{ res.sourceAmount | number:'1.2-2' }} ₴ =
          <span class="highlight">{{ res.targetAmount | number:'1.2-2' }} {{ res.currencyCode }}</span>
        </p>
      } @else {
        <p class="final-amount">
          {{ res.sourceAmount | number:'1.2-2' }} {{ res.currencyCode }} =
          <span class="highlight">{{ res.targetAmount | number:'1.2-2' }} ₴</span>
        </p>
      }
      <small class="rate-memo">За курсом НБУ: 1 {{ res.currencyCode }} = {{ res.rate }} ₴</small>
    </div>
  }
</div>
```

### 6.3 Стилі форми: `src/app/components/currency-converter/currency-converter.component.scss`

```scss
.converter-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  h2 {
    margin-top: 0;
    color: #0f172a;
    font-size: 1.35rem;
  }
}

.converter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label, .label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
  }
}

.form-control {
  padding: 10px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #0284c7;
  }
}

.error-text {
  color: #dc2626;
  font-size: 0.8rem;
}

.direction-group {
  .radio-controls {
    display: flex;
    gap: 16px;
    margin-top: 4px;
    label {
      font-weight: normal;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}

.btn-swap {
  align-self: flex-start;
  margin-top: 8px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  color: #334155;
  &:hover {
    background: #e2e8f0;
  }
}

.result-banner {
  margin-top: 24px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 16px;
  text-align: center;

  .caption {
    font-size: 0.85rem;
    color: #166534;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: bold;
  }

  .final-amount {
    margin: 8px 0;
    font-size: 1.5rem;
    color: #14532d;
    .highlight {
      font-weight: bold;
      color: #15803d;
    }
  }

  .rate-memo {
    color: #16a34a;
    font-size: 0.8rem;
  }
}
```

---

## 7. Крок 6: Об'єднання компонентів у `AppComponent`

Головний компонент ініціює запит до сервісу при завантаженні (`ngOnInit`), зберігає завантажені дані у `signal` та координує взаємодію між двома дочірніми компонентами.

### 7.1 Клас `src/app/app.component.ts`:

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbuExchangeService } from './services/nbu-exchange.service';
import { NbuExchangeRate } from './models/nbu-rate.model';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { CurrencyDetailsComponent } from './components/currency-details/currency-details.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyConverterComponent,
    CurrencyDetailsComponent
  ],
  template: `
    <div class="page-wrapper">
      <header class="app-header">
        <h1>Калькулятор валют НБУ</h1>
        <p class="subtitle">Офіційні курси валют Національного банку України в реальному часі</p>
      </header>

      <main class="content-container">
        @if (isLoading()) {
          <div class="state-banner loading">
            <span class="spinner"></span>
            Отримання свіжих курсів валют від НБУ...
          </div>
        }

        @if (errorMessage()) {
          <div class="state-banner error">
            {{ errorMessage() }}
            <button (click)="loadRates()" class="btn-retry">Спробувати знову</button>
          </div>
        }

        @if (!isLoading() && rates().length > 0) {
          <div class="grid-layout">
            <div class="column-main">
              <!-- Компонент 1: Форма розрахунку -->
              <app-currency-converter
                [currencies]="rates()"
                (selectedRateChange)="onCurrencySelected($event)"
              />
            </div>

            <div class="column-sidebar">
              <!-- Компонент 2: Деталі курсу обраної валюти -->
              <app-currency-details [rate]="activeCurrency()" />
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .page-wrapper {
      max-width: 960px;
      margin: 0 auto;
      padding: 30px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .app-header {
      text-align: center;
      margin-bottom: 30px;
      h1 { margin: 0; color: #0f172a; font-size: 2rem; }
      .subtitle { color: #64748b; margin-top: 6px; }
    }
    .grid-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      @media (min-width: 768px) {
        grid-template-columns: 1.4fr 1fr;
      }
    }
    .state-banner {
      padding: 18px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 20px;
      &.loading { background: #e0f2fe; color: #0369a1; }
      &.error { background: #fee2e2; color: #b91c1c; }
    }
    .btn-retry {
      margin-left: 12px;
      background: #b91c1c;
      color: #fff;
      border: none;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class AppComponent implements OnInit {
  private readonly nbuService = inject(NbuExchangeService);

  // Стан даних додатку
  rates = signal<NbuExchangeRate[]>([]);
  activeCurrency = signal<NbuExchangeRate | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRates();
  }

  loadRates(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.nbuService.getAllRates().subscribe({
      next: (data) => {
        this.rates.set(data);
        // За замовчуванням встановлюємо USD для картки деталей
        const defaultUsd = data.find((r) => r.cc === 'USD') ?? data[0] ?? null;
        this.activeCurrency.set(defaultUsd);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Сталася помилка зв’язку з сервером.');
        this.isLoading.set(false);
      }
    });
  }

  // Обробник вибору валюти з форми конвертатора
  onCurrencySelected(rate: NbuExchangeRate | null): void {
    this.activeCurrency.set(rate);
  }
}
```

---

## 8. Запуск і перевірка працездатності

Запустіть локальний сервер Angular:
```bash
ng serve
```

Відкрийте браузер за адресою `http://localhost:4200/`:
1. Переконайтеся, що список валют завантажується безпосередньо з NBU API.
2. Введіть будь-яку суму в поле вводу (наприклад, 1000).
3. Перемкніть валюту з USD на EUR або PLN: картка деталей миттєво оновить курс, а калькулятор перерахує результат.
4. Натисніть кнопку «⇄ Поміняти місцями», щоб перевірити конвертацію в обох напрямках: з гривні у валюту і навпаки.