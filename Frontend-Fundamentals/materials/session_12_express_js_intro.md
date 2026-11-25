# Детальний гайд по Express.js

**Express.js** — це мінімалістичний, швидкий та гнучкий вебфреймворк для **Node.js**, який надає базовий набір інструментів для створення вебзастосунків та REST API. Він працює як надбудова над вбудованим у Node.js модулем `http`, приховуючи рутинну низькорівневу роботу із запитами та відповідями.

---

## 1. Встановлення та перший сервер

Щоб розпочати роботу з Express.js, ініціалізуйте Node.js-проєкт та встановіть пакет `express`:

```bash
mkdir my-express-app && cd my-express-app
npm init -y
npm install express
```

Додайте `"type": "module"` у файл `package.json`, щоб використовувати сучасний синтаксис ES-модулів (`import`/`export`).

### Мінімальний сервер (`server.js`)

```javascript
import express from 'express';

const app = express();
const PORT = 3000;

// Обробка GET-запиту на головну сторінку
app.get('/', (req, res) => {
  res.send('Привіт! Це сервер на Express.js');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер працює за адресою http://localhost:${PORT}`);
});
```

Запуск: `node server.js`.

---

## 2. Маршрутизація (Routing)

**Маршрутизація** визначає, як застосунок відповідає на клієнтський запит за певною адресою (URI) та конкретним HTTP-методом (`GET`, `POST`, `PUT`, `DELETE` тощо).

### Основні HTTP-методи

```javascript
// Отримати дані
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Олена' }]);
});

// Створити новий запис
app.post('/api/users', (req, res) => {
  res.status(201).json({ message: 'Користувача створено' });
});

// Оновити дані
app.put('/api/users/:id', (req, res) => {
  res.json({ message: `Користувача ${req.params.id} оновлено` });
});

// Видалити запис
app.delete('/api/users/:id', (req, res) => {
  res.status(204).send();
});
```

### Робота з параметрами запиту (`req`)

1. **Параметри маршруту (`req.params`)** — динамічні сегменти URL (наприклад, `/users/42`):
   ```javascript
   app.get('/users/:userId/posts/:postId', (req, res) => {
     const { userId, postId } = req.params;
     res.send(`Користувач: ${userId}, Пост: ${postId}`);
   });
   ```

2. **Query-параметри (`req.query`)** — параметри після знаку `?` (наприклад, `/search?q=nodejs&limit=10`):
   ```javascript
   app.get('/search', (req, res) => {
     const { q, limit = 5 } = req.query;
     res.json({ query: q, limit: Number(limit) });
   });
   ```

3. **Тіло запиту (`req.body`)** — дані, надіслані у `POST`/`PUT` запитах (потребує підключення `app.use(express.json())`):
   ```javascript
   app.use(express.json());

   app.post('/login', (req, res) => {
     const { email, password } = req.body;
     res.json({ receivedEmail: email });
   });
   ```

---

## 3. Проміжні обробники (Middleware)

**Middleware** — це функції, які мають доступ до об'єкта запиту (`req`), об'єкта відповіді (`res`) та наступної функції в циклі обробки запиту (`next`).

### Як працює `next()`
* Виклик `next()` передає керування наступному middleware або маршруту.
* Якщо не викликати `next()` і не завершити відповідь (`res.send()`, `res.json()`), запит «зависне».

### Види Middleware

```javascript
// 1. Вбудовані middleware
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг HTML-форм
app.use(express.static('public')); // Роздача статичних файлів із папки public

// 2. Власний глобальний middleware (логування)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3. Точковий middleware (перевірка доступу для конкретного маршруту)
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Необхідна авторизація' });
  }
  next();
};

app.get('/profile', requireAuth, (req, res) => {
  res.json({ user: 'Адміністратор' });
});
```

---

## 4. Модульні маршрути (`express.Router`)

Для великих проєктів усі маршрути виносять в окремі файли за допомогою `express.Router()`.

**`routes/courses.routes.js`:**
```javascript
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json([{ id: 1, title: 'Frontend Fundamentals' }]);
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, title: 'Node.js Basics' });
});

export default router;
```

**Підключення у `server.js`:**
```javascript
import express from 'express';
import coursesRouter from './routes/courses.routes.js';

const app = express();

// Усі маршрути з coursesRouter матимуть префікс /api/courses
app.use('/api/courses', coursesRouter);
```

---

## 5. Шаблонізатори (Server-Side Rendering)

Express дозволяє генерувати HTML-сторінки на сервері за допомогою шаблонізаторів (**Handlebars**, **EJS**, **Pug**).

### Приклад підключення `express-handlebars`

```bash
npm install express-handlebars
```

```javascript
import express from 'express';
import { engine } from 'express-handlebars';

const app = express();

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Панель керування',
    users: ['Андрій', 'Марія', 'Олег'],
  });
});
```

---

## 6. Централізована обробка помилок

Обробник помилок в Express завжди приймає **4 аргументи**: `(err, req, res, next)` і розміщується **в самому кінці** файлу після всіх маршрутів.

```javascript
// Маршрут, що генерує помилку
app.get('/api/secret', (req, res, next) => {
  const err = new Error('Доступ до ресурсу заборонено');
  err.status = 403;
  next(err); // Передаємо помилку в централізований обробник
});

// Обробка неіснуючих сторінок (404)
app.use((req, res, next) => {
  const err = new Error('Сторінку не знайдено');
  err.status = 404;
  next(err);
});

// Централізований обробник помилок
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[Error ${status}]:`, err.message);

  res.status(status).json({
    success: false,
    status,
    message: err.message || 'Внутрішня помилка сервера',
  });
});
```

---

## 7. Рекомендована структура Express-проєкту

```text
express-project/
├── package.json
├── server.js              # Точка входу та запуск сервера
├── routes/                # Маршрути (express.Router)
│   └── users.routes.js
├── controllers/           # Логіка обробки запитів
│   └── users.controller.js
├── middlewares/           # Власні middleware (auth, errorHandler, logger)
│   └── error.middleware.js
├── public/                # Статичні файли (CSS, картинки, клієнтський JS)
└── views/                 # HTML-шаблони (якщо використовується SSR)
```