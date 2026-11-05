# Backend на Node.js та Express.js із TypeScript

Цей практичний посібник розроблений для вивчення фундаментальних принципів серверного JavaScript/TypeScript. Він охоплює архітектуру середовища виконання Node.js (Event Loop, Libuv), роботу з базовими системними модулями (`node:fs`), створення веб-сервера на Express.js, вирішення проблеми CORS шляхом проксі-сервера (на прикладі API НБУ), а також покрокову реалізацію повноцінного REST API для сутності `Book` (GET, POST, PUT, DELETE).

---

## 1. Архітектура середовища виконання Node.js: Event Loop та Libuv

Node.js — це асинхронне подієво-орієнтоване середовище виконання JavaScript, побудоване на рушію V8 (Google Chrome) та системній C-бібліотеці **Libuv**.

### 1.1 Однопотоковість проти багатопотоковості

* **Головний потік (Main Thread):** JavaScript виконується в **одному** потоці. Тут знаходиться Call Stack (склянка викликів функцій) та пам'ять Heap.
* **Libuv Worker Thread Pool:** Усі важкі операції вводу-виводу (I/O) — читання дисків (`fs`), мережеві сокети, криптографія (`crypto`) та DNS — делегуються пулу фонових потоків операційної системи (Thread Pool за замовчуванням має 4 потоки).

```
┌────────────────────────────────────────────────────────┐
│             V8 Engine (Call Stack / Memory)            │
│               Однопотоковий JS код                     │
└───────────────────────────┬────────────────────────────┘
                            │ Асинхронні виклики
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Libuv Event Loop                     │
│  (Фази: Timers ➔ Pending ➔ Poll ➔ Check ➔ Close)       │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌──────────────────────────┐   ┌─────────────────────────┐
│ Thread Pool (4+ threads) │   │ Non-blocking OS Sockets │
│  - fs (робота з диском)  │   │  - epoll (Linux)        │
│  - crypto                │   │  - kqueue (macOS)       │
│  - dns.lookup            │   │  - IOCP (Windows)       │
└──────────────────────────┘   └─────────────────────────┘
```

### 1.2 Фази черги Event Loop

Кожна ітерація Event Loop («тік») проходить через чітко визначені черги:

1. **Microtasks (`process.nextTick()`, `Promise.then()`):** Виконуються **негайно** після завершення поточної операції JS до переходу до наступної фази Event Loop.
2. **Timers:** Обробляє колбеки таймерів, чий час вичерпано (`setTimeout`, `setInterval`).
3. **Pending Callbacks:** Системні колбеки I/O помилок (наприклад, типи мережевих помилок TCP).
4. **Poll (I/O polling):** Опитування системи щодо нових подій мережі та читання файлів. Якщо черга порожня, цикл блокується та очікує нових I/O.
5. **Check:** Колбеки `setImmediate()`.
6. **Close Callbacks:** Обробка закриття ресурсів (наприклад, `socket.on('close', ...)`).

> ⚠️ **Золоте правило Node.js:** *«Don't block the Event Loop»*. Ніколи не виконуйте тривалі синхронні операції (важкі математичні обчислення чи синхронний парсинг мегабайтних JSON) у головному потоці, інакше сервер перестане відповідати всім іншим клієнтам.

---

## 2. Базові модулі: Асинхронна робота з диском (`node:fs/promises`)

У сучасному TypeScript замість синхронних методів (`fs.readFileSync`) чи застарілих колбеків слід використовувати модуль `node:fs/promises`.

Створимо сервіс для збереження та читання логів або JSON-файлів:

```typescript
// src/services/file-storage.service.ts
import { promises as fs } from 'node:fs';
import path from 'node:path';

export class FileStorageService {
  private readonly storagePath: string;

  constructor(fileName: string) {
    // Формуємо надійний абсолютний шлях до каталогу з даними
    this.storagePath = path.resolve(process.cwd(), 'data', fileName);
  }

  /**
   * Читання та безпечний парсинг JSON-даних
   */
  async readJsonFile<T>(): Promise<T | null> {
    try {
      const raw = await fs.readFile(this.storagePath, { encoding: 'utf-8' });
      return JSON.parse(raw) as T;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Файл ще не створено
        return null;
      }
      throw new Error(`Помилка читання файлу ${this.storagePath}: ${error.message}`);
    }
  }

  /**
   * Атомарний запис даних на диск
   */
  async writeJsonFile<T>(data: T): Promise<void> {
    const dir = path.dirname(this.storagePath);
    // Створюємо папку, якщо її ще немає
    await fs.mkdir(dir, { recursive: true });
    
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(this.storagePath, serialized, { encoding: 'utf-8' });
  }
}
```

---

## 3. Налаштування проекту Express.js + TypeScript

### 3.1 Ініціалізація та встановлення залежностей

```bash
mkdir express-ts-starter
cd express-ts-starter
npm init -y

# Встановлення Express та додаткових утиліт
npm install express dotenv

# Встановлення компілятора та типізацій для розробки
npm install -D typescript @types/node @types/express tsx
```

### 3.2 Конфігурація `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### 3.3 Скрипти запуску в `package.json`

Додайте до `package.json`:

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

---

## 4. Вирішення проблеми CORS: Express як Reverse-Proxy для NBU API

### 4.1 Чому виникає помилка CORS у браузері?

Коли клієнтський додаток (наприклад, Angular на `http://localhost:4200`) намагається виконати запит до стороннього API (наприклад, `https://bank.gov.ua/NBU_Exchange/exchange_site?...`), браузер перевіряє заголовок відповіді `Access-Control-Allow-Origin`.

Якщо сервер банку не надсилає дозвіл для джерела запиту, браузер **блокує читання відповіді клієнтом** через політику *Same-Origin Policy (SOP)*.

### 4.2 Як вирішує проблему проксі-сервер на Express?

**Політика CORS діє виключно всередині браузера!** Серверний процес Node.js не є браузером, тому на нього правила CORS не поширюються.

```
┌────────────────────────┐                   ┌────────────────────────┐                   ┌────────────────────────┐
│    Клієнт (Angular)    │                   │   Express API-Proxy    │                   │   Сервер банку (NBU)   │
│  http://localhost:4200 │                   │  http://localhost:3000 │                   │   https://bank.gov.ua  │
└───────────┬────────────┘                   └───────────┬────────────┘                   └───────────┬────────────┘
            │                                            │                                            │
            │  1. GET /api/proxy/nbu?start=...           │                                            │
            │  (CORS дозволено нашим сервером)           │                                            │
            ├───────────────────────────────────────────►│                                            │
            │                                            │  2. Нативний fetch() сервер-до-сервера     │
            │                                            │  (CORS не перевіряється)                   │
            │                                            ├───────────────────────────────────────────►│
            │                                            │                                            │
            │                                            │  3. Повернення сирого JSON                 │
            │                                            │◄───────────────────────────────────────────┤
            │  4. Відправка відповіді клієнту            │                                            │
            │◄───────────────────────────────────────────┤                                            │
```

### 4.3 Реалізація контролера проксі

```typescript
// src/controllers/nbu-proxy.controller.ts
import { Request, Response } from 'express';

export async function proxyNbuRates(req: Request, res: Response): Promise<void> {
  try {
    const { start, end, valcode = 'usd' } = req.query;

    if (!start || !end) {
      res.status(400).json({
        error: "Обов'язкові параметри 'start' та 'end' у форматі YYYYMMDD (наприклад, 20220115)"
      });
      return;
    }

    // Формуємо цільовий URL до сервісу НБУ
    const targetUrl = new URL('https://bank.gov.ua/NBU_Exchange/exchange_site');
    targetUrl.searchParams.set('start', String(start));
    targetUrl.searchParams.set('end', String(end));
    targetUrl.searchParams.set('valcode', String(valcode).toLowerCase());
    targetUrl.searchParams.set('sort', 'exchangedate');
    targetUrl.searchParams.set('order', 'desc');
    targetUrl.searchParams.set('json', '');

    // Виконуємо нативний fetch із Node.js середовища
    const nbuResponse = await fetch(targetUrl.toString());

    if (!nbuResponse.ok) {
      res.status(nbuResponse.status).json({
        error: `НБУ API повернув помилку зі статусом ${nbuResponse.status}`
      });
      return;
    }

    const data = await nbuResponse.json();

    // Повертаємо дані клієнту із відкритим або налаштованим CORS-доступом
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error: any) {
    console.error('Помилка під час проксіювання запиту до НБУ:', error);
    res.status(500).json({
      error: 'Внутрішня помилка сервера при отриманні даних із НБУ',
      details: error.message
    });
  }
}
```

---

## 5. Створення REST API: Сутність `Book` (CRUD)

Реалізуємо сервіс для сутності книги згідно зі специфікацією:
* `id`: унікальний ідентифікатор (string/UUID);
* `isbn`: міжнародний стандартний номер книги (string);
* `title`: назва книги (string);
* `authors`: масив авторів (string[]);
* `publisher`: видавництво (string);
* `date`: дата публікації (string або ISO date).

### 5.1 Моделі та DTO контракти

```typescript
// src/models/book.model.ts

export interface Book {
  id: string;
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  date: string;
}

export type CreateBookDto = Omit<Book, 'id'>;
export type UpdateBookDto = Partial<CreateBookDto>;
```

### 5.2 Сховище даних (In-Memory + FS Persistence)

```typescript
// src/repositories/book.repository.ts
import crypto from 'node:crypto';
import { Book, CreateBookDto, UpdateBookDto } from '../models/book.model.js';
import { FileStorageService } from '../services/file-storage.service.js';

export class BookRepository {
  private books: Map<string, Book> = new Map();
  private readonly fileStorage = new FileStorageService('books.json');

  constructor() {
    this.initData();
  }

  private async initData(): Promise<void> {
    const saved = await this.fileStorage.readJsonFile<Book[]>();
    if (saved && saved.length > 0) {
      saved.forEach((b) => this.books.set(b.id, b));
    } else {
      // Демонстраційний початковий запис
      const seedBook: Book = {
        id: crypto.randomUUID(),
        isbn: '978-0132350884',
        title: 'Clean Code',
        authors: ['Robert C. Martin'],
        publisher: 'Prentice Hall',
        date: '2008-08-01'
      };
      this.books.set(seedBook.id, seedBook);
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    await this.fileStorage.writeJsonFile(Array.from(this.books.values()));
  }

  async getAll(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getById(id: string): Promise<Book | null> {
    return this.books.get(id) ?? null;
  }

  async create(dto: CreateBookDto): Promise<Book> {
    const newBook: Book = {
      id: crypto.randomUUID(),
      ...dto
    };
    this.books.set(newBook.id, newBook);
    await this.persist();
    return newBook;
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book | null> {
    const existing = this.books.get(id);
    if (!existing) return null;

    const updated: Book = {
      ...existing,
      ...dto,
      id // Захист від перезапису ідентифікатора
    };

    this.books.set(id, updated);
    await this.persist();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.books.delete(id);
    if (existed) {
      await this.persist();
    }
    return existed;
  }
}
```

### 5.3 Контролер книг (Обробка 4 основних методів HTTP)

```typescript
// src/controllers/book.controller.ts
import { Request, Response } from 'express';
import { BookRepository } from '../repositories/book.repository.js';
import { CreateBookDto, UpdateBookDto } from '../models/book.model.js';

const bookRepo = new BookRepository();

/**
 * 1. GET /api/books — Отримання списку книг
 */
export async function getBooks(req: Request, res: Response): Promise<void> {
  const books = await bookRepo.getAll();
  res.status(200).json(books);
}

/**
 * 2. GET /api/books/:id — Отримання книги за ID
 */
export async function getBookById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const book = await bookRepo.getById(id);

  if (!book) {
    res.status(404).json({ error: `Книгу з ID '${id}' не знайдено` });
    return;
  }

  res.status(200).json(book);
}

/**
 * 3. POST /api/books — Створення нової книги
 */
export async function createBook(req: Request, res: Response): Promise<void> {
  const body = req.body as Partial<CreateBookDto>;

  // Валідація вхідних даних
  if (!body.title || !body.isbn || !body.authors || !Array.isArray(body.authors) || !body.publisher || !body.date) {
    res.status(400).json({
      error: "Некоректне тіло запиту. Поля 'title', 'isbn', 'authors' (масив), 'publisher' та 'date' є обов'язковими"
    });
    return;
  }

  const created = await bookRepo.create({
    isbn: body.isbn,
    title: body.title,
    authors: body.authors,
    publisher: body.publisher,
    date: body.date
  });

  res.status(201).json(created);
}

/**
 * 4. PUT /api/books/:id — Повне або часткове оновлення книги
 */
export async function updateBook(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const updateData = req.body as UpdateBookDto;

  const updated = await bookRepo.update(id, updateData);

  if (!updated) {
    res.status(404).json({ error: `Неможливо оновити: книгу з ID '${id}' не знайдено` });
    return;
  }

  res.status(200).json(updated);
}

/**
 * 5. DELETE /api/books/:id — Видалення книги
 */
export async function deleteBook(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const deleted = await bookRepo.delete(id);

  if (!deleted) {
    res.status(404).json({ error: `Неможливо видалити: книгу з ID '${id}' не знайдено` });
    return;
  }

  // 204 No Content
  res.status(204).send();
}
```

---

## 6. Збирання веб-сервера (`src/index.ts`)

Об'єднаємо всі маршрути, проміжне ПЗ (middleware) для JSON-парсингу та підтримку CORS у головному файлі сервера:

```typescript
// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import { proxyNbuRates } from './controllers/nbu-proxy.controller.js';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from './controllers/book.controller.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware 1: Парсинг тіла запиту у форматі JSON
app.use(express.json());

// Middleware 2: Базовий CORS Middleware для дозволу запитів від клієнтських SPA
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Middleware 3: Просте логування вхідних запитів
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Маршрути Proxy для подолання CORS ---
app.get('/api/proxy/nbu', proxyNbuRates);

// --- Маршрути CRUD REST API для Book ---
app.get('/api/books', getBooks);
app.get('/api/books/:id', getBookById);
app.post('/api/books', createBook);
app.put('/api/books/:id', updateBook);
app.delete('/api/books/:id', deleteBook);

// Базовий маршрут стану
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    message: 'Express + TypeScript Server працює успішно!'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(` Сервер успішно запущено на http://localhost:${PORT}`);
  console.log(` NBU Proxy: http://localhost:${PORT}/api/proxy/nbu?start=20220115&end=20220131&valcode=usd`);
  console.log(` Books API: http://localhost:${PORT}/api/books`);
});
```

---

## 7. Приклади тестування через cURL або REST-клієнт

### 1. Перевірка NBU Proxy (без помилок CORS у браузері)
```bash
curl -X GET "http://localhost:3000/api/proxy/nbu?start=20220115&end=20220131&valcode=usd"
```

### 2. Створення книги (POST)
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "978-0131103627",
    "title": "The C Programming Language",
    "authors": ["Brian W. Kernighan", "Dennis M. Ritchie"],
    "publisher": "Prentice Hall",
    "date": "1988-04-01"
  }'
```

### 3. Отримання всіх книг (GET)
```bash
curl -X GET http://localhost:3000/api/books
```

### 4. Оновлення книги за ID (PUT)
```bash
curl -X PUT http://localhost:3000/api/books/<BOOK_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The C Programming Language (2nd Edition)"
  }'
```

### 5. Видалення книги за ID (DELETE)
```bash
curl -X DELETE http://localhost:3000/api/books/<BOOK_ID>
```

---

## 8. Підсумкова шпаргалка

| Механізм / Патерн | Що робить | Чому важливо знати |
| :--- | :--- | :--- |
| **Libuv Event Loop** | Керує фазами черг асинхронних подій | Дозволяє обробляти тисячі підключень без блокування одного головного потоку. |
| **`node:fs/promises`** | Асинхронний ввід-вивід файлів через Promise | Не блокує Call Stack при читанні або збереженні локальних файлів бази. |
| **API Reverse-Proxy** | Перенаправляє запити від сервера до стороннього API | Обходить блокування браузером за політикою CORS завдяки моделі server-to-server. |
| **REST Семантика** | GET (читання), POST (створення), PUT (оновлення), DELETE (видалення) | Загальноприйнятий стандарт взаємодії між клієнтом (SPA/Mobile) та бекендом. |