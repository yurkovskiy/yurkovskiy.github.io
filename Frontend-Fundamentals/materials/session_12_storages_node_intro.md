# Конспект заняття: Web Storage, Node.js, основи бекенду та тестування

Цей конспект охоплює ключові теми сучасного веброзроблення: роботу зі сховищами браузера, знайомство з середовищем виконання Node.js, створення простих серверів та огляд інструментів для тестування.

---

## 1. HTML5 Storages (Вебсховища)

**Web Storage API** надає механізми, за допомогою яких браузери можуть безпечно зберігати пари «ключ — значення» (key-value) у набагато зручніший спосіб, ніж використання файлів `cookie`. Обидва сховища прив'язані до конкретного джерела (`origin`: протокол + домен + порт), а дані в них зберігаються виключно у вигляді **рядків (String)**.

### Основні методи (спільні для обох сховищ):
* `setItem(key, value)` — зберегти пару ключ/значення.
* `getItem(key)` — отримати дані за ключем.
* `removeItem(key)` — видалити дані за ключем.
* `clear()` — повністю очистити сховище.
* `key(index)` — отримати назву ключа за його порядковим номером.
* `length` — властивість, що повертає кількість збережених елементів.

### 1.1. Session Storage (`sessionStorage`)
* **Час життя:** Дані зберігаються лише протягом поточної сесії сторінки (поки відкрита вкладка браузера).
* **Особливості:** Перезавантаження сторінки зберігає дані, але закриття вкладки або вікна повністю їх видаляє. Різні вкладки з однією і тією ж сторінкою мають різні екземпляри `sessionStorage`.
* **Обсяг:** Зазвичай до 5 МБ.

```javascript
// Збереження даних у sessionStorage
sessionStorage.setItem('currentStep', '2');

// Отримання даних
const step = sessionStorage.getItem('currentStep');
console.log(step); // '2'

// Видалення конкретного елемента
sessionStorage.removeItem('currentStep');
```

### 1.2. Local Storage (`localStorage`)
* **Час життя:** Дані не мають терміну придатності. Вони залишаються навіть після закриття браузера та перезавантаження комп'ютера.
* **Особливості:** Дані доступні для всіх вкладок і вікон у межах одного `origin`. Видалити їх можна лише через JavaScript або очистивши кеш/дані сайту в налаштуваннях браузера.
* **Обсяг:** Зазвичай 5–10 МБ (залежно від браузера).

Оскільки сховища приймають лише рядки, для збереження об'єктів чи масивів використовують `JSON.stringify()` та `JSON.parse()`.

```javascript
const userSettings = {
    theme: 'dark',
    notifications: true,
    fontSize: 16
};

// Збереження об'єкта (перетворення у JSON-рядок)
localStorage.setItem('settings', JSON.stringify(userSettings));

// Отримання та розпарсювання назад в об'єкт
const savedData = localStorage.getItem('settings');
if (savedData) {
    const parsedSettings = JSON.parse(savedData);
    console.log(parsedSettings.theme); // 'dark'
}

// Повне очищення localStorage
// localStorage.clear();
```

---

## 2. Node.js Intro (Вступ до Node.js)

**Node.js** — це кросплатформне середовище виконання JavaScript із відкритим кодом, побудоване на рушії **V8** (від Google Chrome). Воно дозволяє виконувати JS-код поза межами браузера — наприклад, на сервері або в консолі.

### 2.1. Встановлення: NVM (Node Version Manager)
Розробникам часто доводиться працювати з різними проєктами, які вимагають різних версій Node.js. **NVM** — це утиліта, яка дозволяє легко встановлювати кілька версій Node.js і миттєво перемикатися між ними.

*Для Windows зазвичай використовують `nvm-windows`, для macOS та Linux — оригінальний `nvm`.*

```bash
# Перевірити версію NVM
nvm --version

# Встановити останню стабільну (LTS) версію Node.js
nvm install --lts

# Встановити конкретну версію
nvm install 20.11.0

# Переглянути список встановлених версій
nvm list

# Перемкнутися на конкретну версію
nvm use 20.11.0
```

### 2.2. Менеджери пакетів: npm, yarn, pnpm
Менеджери пакетів допомагають встановлювати, оновлювати та керувати сторонніми бібліотеками (залежностями) у вашому проєкті.

1. **npm (Node Package Manager):** Встановлюється автоматично разом із Node.js. Найпопулярніший стандартний інструмент.
2. **Yarn:** Створений компанією Meta (Facebook) для вирішення проблем зі швидкістю та безпекою старіших версій npm.
3. **pnpm:** Сучасний менеджер пакетів, який економить місце на диску, зберігаючи пакети в одному глобальному сховищі та створюючи жорсткі посилання (hard links) для проєктів.

#### Основні команди (на прикладі npm та yarn):

| Дія | npm | yarn |
| :--- | :--- | :--- |
| Ініціалізація проєкту (`package.json`) | `npm init -y` | `yarn init -y` |
| Встановити всі залежності з `package.json` | `npm install` (або `npm i`) | `yarn` (або `yarn install`) |
| Встановити пакет у `dependencies` | `npm install express` | `yarn add express` |
| Встановити пакет для розробки (`devDependencies`) | `npm install -D jest` | `yarn add -D jest` |
| Видалити пакет | `npm uninstall express` | `yarn remove express` |
| Запустити скрипт із `package.json` | `npm run dev` | `yarn dev` |

---

## 3. Server-Side Development (Серверна розробка)

Серверна частина (Backend) відповідає за обробку запитів від клієнта (фронтенду), роботу з базами даних, авторизацію та бізнес-логіку.

### 3.1. Вбудований модуль `http`
Node.js має вбудовані модулі, які не потрібно встановлювати через npm. Модуль `http` дозволяє створювати вебсервери та обробляти HTTP-запити й відповіді на низькому рівні.

### 3.2. Простий сервер на чистому Node.js
Створіть файл `server.js` та запустіть його командою `node server.js`:

```javascript
// Підключаємо вбудований модуль http
const http = require('http');

const PORT = 3000;
const HOST = 'localhost';

// Створюємо сервер
const server = http.createServer((req, res) => {
    // Встановлюємо заголовки відповіді (статус 200 та тип контенту)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Проста маршрутизація (Routing)
    if (req.url === '/' && req.method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'Вітаємо на головній сторінці!' }));
    } else if (req.url === '/about' && req.method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({ info: 'Це простий сервер на Node.js' }));
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Сторінку не знайдено' }));
    }
});

// Запускаємо прослуховування порту
server.listen(PORT, HOST, () => {
    console.log(`Сервер запущено за адресою http://${HOST}:${PORT}`);
});
```

### 3.3. Вступ до Express.js
Писати складну маршрутизацію та обробляти дані запитів на чистому модулі `http` незручно. **Express.js** — це мінімалістичний та гнучкий вебфреймворк для Node.js, який значно спрощує створення серверів та REST API.

**Встановлення:**
```bash
npm install express
```

**Приклад сервера на Express.js (`app.js`):**

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware (проміжне ПЗ) для автоматичного парсингу JSON у тілі запиту
app.use(express.json());

// Імітація бази даних
const users = [
    { id: 1, name: 'Олена' },
    { id: 2, name: 'Андрій' }
];

// Обробка GET-запиту (отримати всіх користувачів)
app.get('/api/users', (req, res) => {
    res.status(200).json(users);
});

// Обробка POST-запиту (додати нового користувача)
app.post('/api/users', (req, res) => {
    const newUser = {
        id: users.length + 1,
        name: req.body.name
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.listen(PORT, () => {
    console.log(`Express-сервер працює на http://localhost:${PORT}`);
});
```

---

## 4. БОНУС: Тестування застосунків

Автоматизоване тестування гарантує, що ваш код працює очікувано, а нові зміни не ламають наявний функціонал.

### 4.1. Jest (JS-Testing Framework)
**Jest** — популярний фреймворк від Meta для **модульного (Unit)** та **інтеграційного** тестування. Він чудово підходить для перевірки окремих функцій, утиліт або компонентів.

**Встановлення:**
```bash
npm install --save-dev jest
```
*(У файлі `package.json` потрібно додати `"scripts": { "test": "jest" }`)*

**Приклад тесту (`math.test.js`):**

```javascript
// Функція, яку ми тестуємо
function sum(a, b) {
    return a + b;
}

// Набір тестів
describe('Функція sum', () => {
    test('має правильно додавати два додатні числа', () => {
        expect(sum(2, 3)).toBe(5);
    });

    test('має правильно працювати з від’ємними числами', () => {
        expect(sum(-1, -4)).toBe(-5);
    });
});
```
Запуск тестів: `npm test`.

### 4.2. Playwright (End-to-End тестування)
**Playwright** — сучасний інструмент від Microsoft для **E2E (наскрізного)** тестування. Він дозволяє програмно керувати реальними браузерами (Chromium, Firefox, WebKit), імітуючи дії справжнього користувача: кліки, заповнення форм, переходи по сторінках.

**Ініціалізація в проєкті:**
```bash
npm init playwright@latest
```

**Приклад E2E тесту (`example.spec.js`):**

```javascript
const { test, expect } = require('@playwright/test');

test('перевірка заголовка та пошуку на сайті', async ({ page }) => {
    // 1. Відкриваємо вебсторінку
    await page.goto('https://playwright.dev/');

    // 2. Перевіряємо, чи містить title сторінки слово "Playwright"
    await expect(page).toHaveTitle(/Playwright/);

    // 3. Знаходимо кнопку "Get started" і клікаємо по ній
    const getStarted = page.getByRole('link', { name: 'Get started' });
    await getStarted.click();

    // 4. Перевіряємо, що після кліку відображається заголовок "Installation"
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
```
Запуск тестів: `npx playwright test`.