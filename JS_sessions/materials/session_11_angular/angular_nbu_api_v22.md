# Практичний проект: Калькулятор обміну валют на базі NBU API (Angular 22.x)

У цьому покроковому посібнику ми створимо інтерактивний додаток конвертації валют на базі сучасного **Angular 22.x** (повністю Standalone-архітектура, Signal-based reactivity, Reactive Forms, зовнішні `.html` та `.scss` шаблони і функціональний `provideHttpClient`).

Додаток дозволяє обрати валюту зі списку ключових валют (**USD, PLN, EUR, GBP**), вказати довільну дату для отримання історичного курсу від НБУ, ввести суму та виконати двосторонній розрахунок.

---

## 1. Архітектура та потік даних

```
┌─────────────────────────────────────────────────────────────┐
│                    AppComponent (Контейнер)                 │
│   - Ініціалізує та керує активною валютою й датою           │
│   - Передає стан у дочірні компоненти через Signal inputs   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │ [rate]
               │                              ▼
               │                ┌────────────────────────────┐
               │                │    CurrencyDetailsComponent│
               │                │   - Зовнішній HTML/SCSS    │
               │                │   - Детальна картка НБУ    │
               │                │   - Офіційний курс і дата  │
               │                └────────────────────────────┘
               ▼ [selectedRate]
┌─────────────────────────────────────────────────────────────┐
│                 CurrencyConverterComponent                  │
│   - Реактивна форма (Amount, Currency Selector, Date Picker)│
│   - Підтримувані валюти: USD, EUR, PLN, GBP                 │
│   - Запит курсу на обрану дату через NbuExchangeService     │
│   - Двостороння конвертація (UAH <-> CURR) через computed() │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    NbuExchangeService                       │
│   - HTTP-запити до https://bank.gov.ua/...                  │
│   - Параметри: valcode={USD|EUR|PLN|GBP}&date={YYYYMMDD}    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Крок 1: Ініціалізація проекту Angular 22.x

Створюємо проект за допомогою Angular CLI з окремими файлами шаблонів та препроцесором SCSS:

```bash
ng new nbu-currency-calculator --style=scss --ssr=false
cd nbu-currency-calculator
```

### Налаштування `src/app/app.config.ts`:

Підключаємо функціональний клієнт `provideHttpClient()`:

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

## 3. Крок 2: Опис моделей даних (Contracts)

Створюємо файл `src/app/models/nbu-rate.model.ts`:

```typescript
// src/app/models/nbu-rate.model.ts

export type SupportedCurrency = 'USD' | 'EUR' | 'PLN' | 'GBP';

export interface NbuExchangeRate {
  r030: number;          // Цифровий код ISO
  txt: string;           // Назва валюти ("Долар США", "Євро"...)
  rate: number;          // Офіційний курс до гривні (UAH)
  cc: SupportedCurrency; // Літерний код
  exchangedate: string;  // Дата у форматі DD.MM.YYYY
}

export type ConversionDirection = 'UAH_TO_CURRENCY' | 'CURRENCY_TO_UAH';

export interface ConversionResult {
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  direction: ConversionDirection;
  currencyCode: SupportedCurrency;
  exchangeDate: string;
}
```

---

## 4. Крок 3: Сервіс запитів до НБУ (`NbuExchangeService`)

Генеруємо сервіс:

```bash
ng g s services/nbu-exchange
```

Реалізуємо запит курсу для конкретної валюти на задану дату (`valcode` та `date=YYYYMMDD`):

```typescript
// src/app/services/nbu-exchange.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { NbuExchangeRate, SupportedCurrency } from '../models/nbu-rate.model';

@Injectable({
  providedIn: 'root'
})
export class NbuExchangeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange';

  /**
   * Отримання курсу валюти на обрану дату
   * @param currency Код валюти (USD, EUR, PLN, GBP)
   * @param dateStr Дата у форматі YYYYMMDD (наприклад, 20261103)
   */
  public getRateByCurrencyAndDate(
    currency: SupportedCurrency,
    dateStr: string
  ): Observable<NbuExchangeRate> {
    const params = new HttpParams()
      .set('valcode', currency)
      .set('date', dateStr)
      .set('json', '');

    return this.http.get<NbuExchangeRate[]>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (!response || response.length === 0) {
          throw new Error(`Дані для валюти ${currency} на дату ${dateStr} відсутні`);
        }
        return response[0];
      }),
      catchError((error) => {
        console.error('Помилка NBU API:', error);
        return throwError(() => new Error('Не вдалося завантажити офіційний курс НБУ'));
      })
    );
  }
}
```

---

## 5. Крок 4: Компонент деталей курсу (`CurrencyDetailsComponent`)

Цей компонент є чисто презентаційним і використовує виключно зовнішній HTML-шаблон.

Генеруємо компонент:

```bash
ng g c components/currency-details
```

### TypeScript: `src/app/components/currency-details/currency-details.component.ts`

```typescript
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NbuExchangeRate } from '../../models/nbu-rate.model';

@Component({
  selector: 'app-currency-details',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './currency-details.component.html',
  styleUrl: './currency-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyDetailsComponent {
  readonly rate = input<NbuExchangeRate | null>(null);
  readonly isLoading = input<boolean>(false);
}
```

### HTML: `src/app/components/currency-details/currency-details.component.html`

```html
<div class="details-card">
  @if (isLoading()) {
    <div class="state-box">
      <span class="spinner"></span>
      <p>Оновлення банківського курсу...</p>
    </div>
  } @else if (rate(); as r) {
    <div class="card-header">
      <span class="currency-tag">{{ r.cc }}</span>
      <h3>{{ r.txt }}</h3>
    </div>
    <div class="card-body">
      <div class="info-row">
        <span class="label">Офіційний курс НБУ:</span>
        <span class="val highlight">{{ r.rate | number:'1.2-4' }} ₴</span>
      </div>
      <div class="info-row">
        <span class="label">Дата встановлення:</span>
        <span class="val">{{ r.exchangedate }}</span>
      </div>
      <div class="info-row">
        <span class="label">Код класифікатора (ISO):</span>
        <span class="val">{{ r.r030 }}</span>
      </div>
    </div>
  } @else {
    <div class="state-box placeholder">
      <p>Оберіть валюту та дату для відображення деталей.</p>
    </div>
  }
</div>
```

### SCSS: `src/app/components/currency-details/currency-details.component.scss`

```scss
.details-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 12px;

    .currency-tag {
      background: #0284c7;
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 4px 10px;
      border-radius: 6px;
    }

    h3 {
      margin: 0;
      color: #0f172a;
      font-size: 1.15rem;
    }
  }

  .card-body {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;

      .label { color: #64748b; }
      .val { font-weight: 600; color: #1e293b; }
      .highlight { color: #0284c7; font-size: 1.1rem; }
    }
  }

  .state-box {
    text-align: center;
    padding: 30px 10px;
    color: #64748b;
  }
}
```

---

## 6. Крок 5: Компонент форми конвертера (`CurrencyConverterComponent`)

Компонент містить:
1. Поле вибору однієї з 4 підтримуваних валют (**USD, PLN, EUR, GBP**).
2. Поле вибору дати (`<input type="date">`).
3. Поле суми та перемикач напрямку обміну.

Генеруємо компонент:

```bash
ng g c components/currency-converter
```

### TypeScript: `src/app/components/currency-converter/currency-converter.component.ts`

```typescript
import { Component, OnInit, output, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NbuExchangeService } from '../../services/nbu-exchange.service';
import { ConversionDirection, ConversionResult, NbuExchangeRate, SupportedCurrency } from '../../models/nbu-rate.model';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss'
})
export class CurrencyConverterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly nbuService = inject(NbuExchangeService);
  private readonly destroyRef = inject(DestroyRef);

  // Сповіщення батьківського компонента про отриманий курс
  rateLoaded = output<NbuExchangeRate>();
  loadingStatusChange = output<boolean>();

  readonly availableCurrencies: { code: SupportedCurrency; name: string }[] = [
    { code: 'USD', name: 'Долар США' },
    { code: 'EUR', name: 'Євро' },
    { code: 'PLN', name: 'Польський злотий' },
    { code: 'GBP', name: 'Фунт стерлінгів' }
  ];

  converterForm!: FormGroup;

  // Сигнали стану форми
  enteredAmount = signal<number>(100);
  activeRate = signal<NbuExchangeRate | null>(null);
  direction = signal<ConversionDirection>('UAH_TO_CURRENCY');
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Динамічний підрахунок результату
  calculation = computed<ConversionResult | null>(() => {
    const rateItem = this.activeRate();
    const amount = this.enteredAmount();
    const dir = this.direction();

    if (!rateItem || amount <= 0 || isNaN(amount)) {
      return null;
    }

    const calculated = dir === 'UAH_TO_CURRENCY'
      ? amount / rateItem.rate
      : amount * rateItem.rate;

    return {
      sourceAmount: amount,
      targetAmount: Number(calculated.toFixed(2)),
      rate: rateItem.rate,
      direction: dir,
      currencyCode: rateItem.cc,
      exchangeDate: rateItem.exchangedate
    };
  });

  ngOnInit(): void {
    // Встановлюємо сьогоднішню дату за замовчуванням (YYYY-MM-DD)
    const todayIso = new Date().toISOString().split('T')[0];

    this.converterForm = this.fb.group({
      amount: [100, [Validators.required, Validators.min(0.01)]],
      currency: ['USD' as SupportedCurrency, [Validators.required]],
      date: [todayIso, [Validators.required]],
      direction: ['UAH_TO_CURRENCY' as ConversionDirection, [Validators.required]]
    });

    // Реакція на зміну суми або напрямку
    this.converterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (val.amount) {
          this.enteredAmount.set(Number(val.amount));
        }
        if (val.direction) {
          this.direction.set(val.direction);
        }
      });

    // Завантажуємо курс за замовчуванням
    this.fetchCurrentRate();
  }

  fetchCurrentRate(): void {
    if (this.converterForm.invalid) return;

    const currency: SupportedCurrency = this.converterForm.get('currency')?.value;
    const rawDate: string = this.converterForm.get('date')?.value; // YYYY-MM-DD
    const formattedDate = rawDate.replace(/-/g, ''); // YYYYMMDD

    this.isSubmitting.set(true);
    this.loadingStatusChange.emit(true);
    this.errorMessage.set(null);

    this.nbuService.getRateByCurrencyAndDate(currency, formattedDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rate) => {
          this.activeRate.set(rate);
          this.rateLoaded.emit(rate);
          this.isSubmitting.set(false);
          this.loadingStatusChange.emit(false);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isSubmitting.set(false);
          this.loadingStatusChange.emit(false);
        }
      });
  }

  toggleDirection(): void {
    const next: ConversionDirection =
      this.direction() === 'UAH_TO_CURRENCY' ? 'CURRENCY_TO_UAH' : 'UAH_TO_CURRENCY';
    this.converterForm.patchValue({ direction: next });
  }
}
```

### HTML: `src/app/components/currency-converter/currency-converter.component.html`

```html
<div class="converter-card">
  <h2>Параметри конвертації</h2>

  <form [formGroup]="converterForm" class="converter-form">
    <!-- Поле вибору валюти зі списку 4 валют -->
    <div class="form-group">
      <label for="currencySelect">Валюта для обміну:</label>
      <select
        id="currencySelect"
        formControlName="currency"
        class="form-control"
        (change)="fetchCurrentRate()"
      >
        @for (item of availableCurrencies; track item.code) {
          <option [value]="item.code">{{ item.code }} — {{ item.name }}</option>
        }
      </select>
    </div>

    <!-- Поле вибору дати курсу -->
    <div class="form-group">
      <label for="rateDate">Дата фіксації курсу:</label>
      <input
        id="rateDate"
        type="date"
        formControlName="date"
        class="form-control"
        (change)="fetchCurrentRate()"
      />
    </div>

    <!-- Поле введення суми -->
    <div class="form-group">
      <label for="amount">Сума:</label>
      <input
        id="amount"
        type="number"
        formControlName="amount"
        step="any"
        class="form-control"
        placeholder="Введіть суму"
      />
      @if (converterForm.get('amount')?.invalid && converterForm.get('amount')?.touched) {
        <small class="error-msg">Сума повинна бути більшою за нуль.</small>
      }
    </div>

    <!-- Напрямок обміну -->
    <div class="form-group direction-box">
      <span class="label">Напрямок конвертації:</span>
      <div class="direction-actions">
        <span class="direction-badge">
          @if (direction() === 'UAH_TO_CURRENCY') {
            Гривня (UAH) ➔ {{ converterForm.get('currency')?.value }}
          } @else {
            {{ converterForm.get('currency')?.value }} ➔ Гривня (UAH)
          }
        </span>
        <button type="button" class="btn-swap" (click)="toggleDirection()">
          ⇄ Змінити напрямок
        </button>
      </div>
    </div>
  </form>

  @if (errorMessage()) {
    <div class="alert-error">{{ errorMessage() }}</div>
  }

  <!-- Результат обчислення -->
  @if (calculation(); as res) {
    <div class="result-box">
      <span class="result-caption">Розрахована сума:</span>
      @if (res.direction === 'UAH_TO_CURRENCY') {
        <p class="final-val">
          {{ res.sourceAmount | number:'1.2-2' }} ₴ =
          <span class="accent">{{ res.targetAmount | number:'1.2-2' }} {{ res.currencyCode }}</span>
        </p>
      } @else {
        <p class="final-val">
          {{ res.sourceAmount | number:'1.2-2' }} {{ res.currencyCode }} =
          <span class="accent">{{ res.targetAmount | number:'1.2-2' }} ₴</span>
        </p>
      }
      <small class="rate-note">Курс НБУ на {{ res.exchangeDate }}: 1 {{ res.currencyCode }} = {{ res.rate }} ₴</small>
    </div>
  }
</div>
```

### SCSS: `src/app/components/currency-converter/currency-converter.component.scss`

```scss
.converter-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  h2 {
    margin-top: 0;
    color: #0f172a;
    font-size: 1.25rem;
    margin-bottom: 20px;
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
    font-size: 0.875rem;
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
  background-color: #fff;
  transition: border-color 0.2s;

  &:focus {
    border-color: #0284c7;
  }
}

.error-msg {
  color: #dc2626;
  font-size: 0.8rem;
}

.direction-box {
  margin-top: 4px;

  .direction-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .direction-badge {
      font-weight: 600;
      color: #0369a1;
      background: #e0f2fe;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .btn-swap {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      color: #334155;
      font-weight: 500;
      &:hover { background: #e2e8f0; }
    }
  }
}

.alert-error {
  margin-top: 16px;
  padding: 10px;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 0.9rem;
}

.result-box {
  margin-top: 24px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 16px;
  text-align: center;

  .result-caption {
    font-size: 0.8rem;
    color: #166534;
    text-transform: uppercase;
    font-weight: 700;
  }

  .final-val {
    margin: 8px 0;
    font-size: 1.45rem;
    color: #14532d;

    .accent {
      font-weight: 700;
      color: #15803d;
    }
  }

  .rate-note {
    color: #16a34a;
    font-size: 0.8rem;
  }
}
```

---

## 7. Крок 6: Об'єднання компонентів у `AppComponent`

### TypeScript: `src/app/app.component.ts`

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { CurrencyDetailsComponent } from './components/currency-details/currency-details.component';
import { NbuExchangeRate } from './models/nbu-rate.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyConverterComponent,
    CurrencyDetailsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentRate = signal<NbuExchangeRate | null>(null);
  isLoading = signal<boolean>(false);

  onRateLoaded(rate: NbuExchangeRate): void {
    this.currentRate.set(rate);
  }

  onLoadingChanged(status: boolean): void {
    this.isLoading.set(status);
  }
}
```

### HTML: `src/app/app.component.html`

```html
<div class="app-layout">
  <header class="app-header">
    <h1>Офіційний конвертер валют НБУ (Angular 22)</h1>
    <p class="desc">Розрахунок курсів USD, EUR, PLN, GBP за будь-яку дату</p>
  </header>

  <main class="main-content">
    <div class="content-grid">
      <div class="grid-col">
        <app-currency-converter
          (rateLoaded)="onRateLoaded($event)"
          (loadingStatusChange)="onLoadingChanged($event)"
        />
      </div>

      <div class="grid-col">
        <app-currency-details
          [rate]="currentRate()"
          [isLoading]="isLoading()"
        />
      </div>
    </div>
  </main>
</div>
```

### SCSS: `src/app/app.component.scss`

```scss
.app-layout {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 28px;

  h1 {
    font-size: 1.85rem;
    color: #0f172a;
    margin: 0;
  }

  .desc {
    color: #64748b;
    margin-top: 6px;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: 1.3fr 1fr;
  }
}
```

---

## 8. Запуск та перевірка роботи

Запустіть сервер розробки:

```bash
ng serve --host 0.0.0.0
```

1. Відкрийте браузер за адресою `http://localhost:4200/`.
2. Оберіть у випадаючому списку валюту (**USD**, **EUR**, **PLN** або **GBP**).
3. Змініть дату (наприклад, оберіть дату дворічної давності): додаток автоматично надішле запит на NBU API з відповідним форматом `date=YYYYMMDD`, оновить курс у картці деталей та перерахує результат.
4. Натисніть кнопку «⇄ Змінити напрямок», щоб перевірити конвертацію як з гривні у валюту, так і навпаки.