# Конспект: JavaScript DOM, BOM та Обробка Подій (Handling Events)

---

## 1. Document Object Model (DOM)

**DOM** — це об'єктно-орієнтоване деревоподібне представлення HTML-документа. Він зв'язує веб-сторінку зі скриптами та дозволяє динамічно змінювати структуру, стиль і вміст сторінки.

```
document (Root)
   └── <html>
        ├── <head>
        │    └── <title>
        └── <body>
             ├── <header>
             └── <main>
```

---

### 1.1 Пошук вузлів DOM: Класичні методи (`getElement(s)By...`)

Ці методи повертають так звані **живі колекції** (`live collections`), які автоматично оновлюються при зміні DOM (окрім `getElementById`).

#### `document.getElementById(id)`
* **Повертає:** Один об'єкт `Element` або `null`, якщо елемент не знайдено.
* **Приклад:**
  ```javascript
  const header = document.getElementById('main-header');
  ```

#### `document.getElementsByClassName(className)`
* **Повертає:** Живу колекцію **`HTMLCollection`** усіх знайдених елементів.
* **Приклад:**
  ```javascript
  const cards = document.getElementsByClassName('card');
  console.log(cards.length);
  // Щоб застосувати методи масиву:
  Array.from(cards).forEach(card => card.classList.add('active'));
  ```

#### `document.getElementsByTagName(tagName)`
* **Повертає:** Живу колекцію **`HTMLCollection`** усіх елементів із заданим тегом (наприклад, `'p'`, `'div'`).
* **Приклад:**
  ```javascript
  const paragraphs = document.getElementsByTagName('p');
  ```

#### `document.getElementsByName(name)`
* **Повертає:** Живий список **`NodeList`** елементів, що мають відповідний атрибут `name` (часто використовується для радіокнопок і форм).
* **Приклад:**
  ```javascript
  const genders = document.getElementsByName('gender');
  ```

---

### 1.2 Сучасні методи пошуку: `querySelector` та `querySelectorAll`

Працюють з будь-якими валідними **CSS-селекторами** (`#id`, `.class`, `tag[attr]`, `:nth-child` тощо).

#### `document.querySelector(cssSelector)`
* **Повертає:** **Перший** знайдений елемент, що відповідає селектору, або `null`.
* Можна викликати не лише на `document`, а й на будь-якому батьківському елементі: `parentElement.querySelector(...)`.
* **Приклад:**
  ```javascript
  const primaryBtn = document.querySelector('.btn.primary');
  const checkedOption = document.querySelector('input[name="theme"]:checked');
  ```

#### `document.querySelectorAll(cssSelector)`
* **Повертає:** **Статичний `NodeList`** усіх знайдених елементів.
* **Особливість:** На відміну від `HTMLCollection`, статичний `NodeList` не змінюється автоматично при подальших змінах DOM і має вбудований метод `.forEach()`.
* **Приклад:**
  ```javascript
  const listItems = document.querySelectorAll('ul.todo-list > li');
  listItems.forEach(item => item.classList.add('checked'));
  ```

| Критерій | `getElementsBy*` | `querySelectorAll` |
| :--- | :--- | :--- |
| **Тип повернення** | `HTMLCollection` / `NodeList` | Статичний `NodeList` |
| **Характер колекції** | Жива (динамічна) | Статична («знімок») |
| **Синтаксис пошуку** | Лише ім'я / клас / тег / ID | Довільний CSS-селектор |
| **Вбудований `.forEach()`** | Ні (потрібен `Array.from()`) | Так |

---

### 1.3 Створення та конфігурація DOM-вузлів

#### Створення елементів
* `document.createElement(tagName)` — створює новий HTML-елемент.
* `document.createTextNode(text)` — створює текстовий вузол.
* `document.createDocumentFragment()` — віртуальний контейнер без обгортки (оптимізує масове додавання елементів, викликаючи лише один reflow/repaint).

```javascript
const article = document.createElement('article');
const titleText = document.createTextNode('Привіт, світ!');
```

#### Робота з атрибутами та властивостями
```javascript
// Методи роботи з атрибутами в HTML-розмітці
article.setAttribute('id', 'post-101');
article.setAttribute('data-category', 'frontend');
console.log(article.getAttribute('data-category')); // "frontend"
console.log(article.hasAttribute('disabled'));       // false
article.removeAttribute('data-category');

// Прямий доступ через властивості об'єкта
article.id = 'post-101';
article.title = 'Підказка до статті';

// Робота з data-* атрибутами (dataset)
article.dataset.authorName = 'Олексій'; // генерує data-author-name="Олексій"

// Класи через властивість classList (рекомендовано)
article.classList.add('post', 'featured');
article.classList.remove('featured');
article.classList.toggle('active');
console.log(article.classList.contains('active')); // true / false

// Інлайн-стилі
article.style.backgroundColor = '#f9fafb';
article.style.padding = '16px';
```

#### Текст і вміст
* `textContent` — безпечний текст; видаляє теги і запобігає XSS-атакам.
* `innerHTML` — парсить і вставляє HTML-код (використовувати обережно через ризик XSS).

---

### 1.4 Вставка створених вузлів у DOM

#### Сучасні гнучкі методи (рекомендовані)
* `parent.append(...nodesOrStrings)` — додає елементи або звичайний текст у **кінець** батьківського елемента. Може приймати кілька аргументів.
* `parent.prepend(...nodesOrStrings)` — додає елементи або рядки на **початок** батьківського елемента.
* `node.before(...nodesOrStrings)` — вставляє сусіда **безпосередньо перед** вказаним `node`.
* `node.after(...nodesOrStrings)` — вставляє сусіда **безпосередньо після** вказаного `node`.

```javascript
const list = document.querySelector('#todo-list');
const newLi = document.createElement('li');
newLi.textContent = 'Вивчити JavaScript';

list.append(newLi); // в кінець
list.prepend('Початок списку: '); // додає текст на початок
```

#### Класичні методи
* `parent.appendChild(childNode)` — додає один вузол у кінець батька (не приймає рядки напряму).
* `parent.insertBefore(newNode, referenceNode)` — вставляє `newNode` перед вузлом `referenceNode`.
* `parent.removeChild(childNode)` — видаляє дочірній вузол.
* `node.remove()` — сучасний прямий спосіб видалення вузла з дерева.

#### Вставка за відносною позицією (`insertAdjacentHTML` / `insertAdjacentElement`)
* `'beforebegin'` — перед самим елементом.
* `'afterbegin'` — всередині елемента, перед першим нащадком.
* `'beforeend'` — всередині елемента, після останнього нащадка.
* `'afterend'` — після самого елемента.

```javascript
const target = document.querySelector('#target');
target.insertAdjacentHTML('beforeend', '<p class="info">Додаткова інформація</p>');
```

---

## 2. Browser Object Model (BOM)

**BOM** надає доступ до середовища браузера поза межами самого документа. Головним об'єктом є `window`. Усі глобальні змінні та функції браузерного JS є властивостями `window`.

```
window
 ├── document (DOM)
 ├── location
 ├── history
 ├── screen
 └── navigator
```

---

### 2.1 Об'єкт `location` (`window.location`)

Містить інформацію про поточну адресу сторінки (URL) та методи для переходу чи оновлення.

#### Властивості розбору URL
Для адреси: `https://example.com:8080/shop/items?category=books#top`
* `location.href` — повний URL.
* `location.protocol` — `'https:'`
* `location.host` — `'example.com:8080'` (хост + порт)
* `location.hostname` — `'example.com'`
* `location.port` — `'8080'`
* `location.pathname` — `'/shop/items'`
* `location.search` — `'?category=books'` (параметри рядка запиту)
* `location.hash` — `'#top'`
* `location.origin` — `'https://example.com:8080'`

#### Методи навігації
* `location.assign(url)` — переходить за новим URL; зберігає поточну сторінку в історії (кнопка «Назад» активна).
* `location.replace(url)` — замінює поточний запис в історії новою адресою (кнопка «Назад» не поверне на попередню сторінку).
* `location.reload()` — перезавантажує поточну сторінку.

```javascript
// Перенаправлення користувача
window.location.href = 'https://developer.mozilla.org';
```

---

### 2.2 Об'єкт `history` (`window.history`)

Дозволяє керувати історією переходів у поточній вкладці.

#### Базова навігація
* `history.length` — кількість записів в історії вкладки.
* `history.back()` — крок назад (аналог `history.go(-1)`).
* `history.forward()` — крок уперед (аналог `history.go(1)`).
* `history.go(n)` — перехід на `n` кроків уперед або назад.

#### Робота в Single Page Applications (SPA)
* `history.pushState(stateObj, '', url)` — додає запис до історії без перезавантаження всієї сторінки.
* `history.replaceState(stateObj, '', url)` — замінює поточний запис без створення нового.

```javascript
const stateData = { page: 'settings', user: 'admin' };
window.history.pushState(stateData, '', '/settings');

// Прослуховування натискань «Назад / Вперед» у браузері
window.addEventListener('popstate', (event) => {
  console.log('Поточний стан (state):', event.state);
});
```

---

### 2.3 Об'єкт `screen` (`window.screen`)

Містить інформацію про фізичний екран монітора користувача.

* `screen.width` та `screen.height` — повна ширина та висота екрана в пікселях.
* `screen.availWidth` та `screen.availHeight` — доступна ширина та висота **за вирахуванням** панелі завдань ОС чи дока.
* `screen.colorDepth` — глибина кольору (зазвичай 24 або 32 біти).
* `screen.orientation` — орієнтація екрана (`type`, `angle`).

```javascript
console.log(`Корисний розмір екрана: ${screen.availWidth}x${screen.availHeight}`);
```

---

### 2.4 Інші важливі об'єкти BOM

#### 1. `navigator`
* `navigator.userAgent` — інформація про браузер і платформу.
* `navigator.language` — обрана мова інтерфейсу (наприклад, `'uk-UA'`).
* `navigator.onLine` — булеве значення (`true`, якщо є підключення до мережі).
* `navigator.clipboard` — асинхронне API для буфера обміну (`writeText()`, `readText()`).

#### 2. Модальні вікна браузера
* `alert('Повідомлення')` — інформаційне вікно з кнопкою «ОК».
* `confirm('Ви впевнені?')` — повертає `true` («ОК») або `false` («Скасувати»).
* `prompt('Введіть значення:', 'за замовчуванням')` — повертає введений рядок або `null`.

#### 3. Таймери
* `setTimeout(fn, ms)` / `clearTimeout(timerId)`
* `setInterval(fn, ms)` / `clearInterval(intervalId)`

---

## 3. Обробка Подій (Handling Events)

Події — це сигнали від браузера про те, що відбулася певна дія (клік, введення тексту, рух курсора, завершення завантаження тощо).

---

### 3.1 Фази життєвого циклу події (Event Flow)

Коли подія трапляється на елементі, вона проходить через три фази:

```
          1. Фаза занурення (Capturing Phase)
         window ───────> document ───────> <body>
                                              │
          2. Фаза цілі (Target Phase)          ▼
                                       <button> (target)
                                              │
          3. Фаза спливання (Bubbling Phase)  ▼
         window <─────── document <─────── <body>
```

1. **Фаза занурення (Capturing phase):** Подія спускається від верхнього рівня (`window`, `document`) вниз до цільового елемента (`target`). За замовчуванням обробники не реагують на цій фазі.
2. **Фаза цілі (Target phase):** Подія досягає безпосереднього елемента, на якому вона відбулася.
3. **Фаза спливання (Bubbling phase):** Подія піднімається вгору від цільового елемента до кореня документа (`window`), викликаючи однойменні обробники на батьківських елементах. **Більшість подій спливають!** (Винятки: `focus`, `blur`, `mouseenter`, `mouseleave`).

---

### 3.2 Метод `addEventListener`

Сучасний і універсальний спосіб підключення обробників подій. Дозволяє призначати кілька різних функцій на одну подію для одного елемента.

```javascript
element.addEventListener(eventType, handlerFunction, optionsOrUseCapture);
```

#### Параметри:
* `eventType` — рядок з назвою події (наприклад, `'click'`, `'keydown'`).
* `handlerFunction` — колбек-функція, яка приймає об'єкт події `event` (`e`).
* `optionsOrUseCapture` — логічне значення або об'єкт опцій:
  * `useCapture` (булеве, за замовчуванням `false`): якщо `true`, обробник спрацює на **фазі занурення** (capturing).
  * `once: true`: видаляє обробник автоматично після першого виконання.
  * `passive: true`: оптимізація прокрутки; гарантує браузеру, що функція не викличе `preventDefault()`.

```javascript
const btn = document.querySelector('#submit-btn');

function handleClick(e) {
  console.log('Клік на:', e.target);
}

btn.addEventListener('click', handleClick);

// Варіант спрацювання на фазі занурення та лише один раз:
btn.addEventListener('click', handleClick, { capture: true, once: true });
```

---

### 3.3 Метод `removeEventListener`

Використовується для видалення призначеного обробника. 

> ⚠️ **Важливо:** Не можна видалити обробник, переданий у вигляді анонімної функції! Посилання на функцію має бути ідентичним.

```javascript
// ❌ НЕ спрацює (різні екземпляри анонімної функції в пам'яті):
btn.addEventListener('click', () => console.log('Hi'));
btn.removeEventListener('click', () => console.log('Hi'));

// ✅ Правильно (використання іменованої функції):
function onCustomClick() {
  console.log('Оброблено');
  btn.removeEventListener('click', onCustomClick); // самовидалення
}

btn.addEventListener('click', onCustomClick);
```

---

### 3.4 Керування поведінкою події: `stopPropagation()` та `preventDefault()`

#### `e.stopPropagation()`
Зупиняє подальший рух події вгору або вниз по дереву DOM (перериває спливання або занурення).

```javascript
const parent = document.querySelector('.card');
const childBtn = document.querySelector('.btn-delete');

parent.addEventListener('click', () => console.log('Клік на картку'));

childBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Запобігає виклику обробника на батьківському елементі .card
  console.log('Клік на кнопку видалення');
});
```

*Додатково:* `e.stopImmediatePropagation()` не лише зупиняє спливання, а й блокує виконання решти обробників цієї ж події на поточному елементі.

#### `e.preventDefault()`
Скасовує **стандартну дію браузера** за замовчуванням (перехід за посиланням, відправка форми, контекстне меню тощо), але **не зупиняє спливання**.

```javascript
const link = document.querySelector('a.external');
const form = document.querySelector('#login-form');

// Запобігаємо переходу за посиланням:
link.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Перехід скасовано. Виконуємо кастомну логіку.');
});

// Запобігаємо перезавантаженню сторінки при сабміті форми:
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // збір даних та відправка через fetch()
});
```

| Метод | Що робить | Вплив на спливання | Вплив на дію за замовчуванням |
| :--- | :--- | :--- | :--- |
| `stopPropagation()` | Перериває рух події по дереву | **Зупиняє** | Не впливає |
| `preventDefault()` | Блокує стандартну поведінку | Не впливає | **Блокує** |

---

### 3.5 Список основних подій миші та клавіатури

#### 1. Події миші (Mouse Events)
* `click` — повний клік лівою кнопкою миші (натиснули і відпустили).
* `dblclick` — подвійний клік.
* `mousedown` — кнопку миші затиснуто над елементом.
* `mouseup` — кнопку миші відпущено.
* `mousemove` — курсор рухається над елементом.
* `contextmenu` — клік правою кнопкою миші (виклик контекстного меню).
* `mouseover` / `mouseout` — курсор заходить на елемент або виходить з нього (**спливають**, реагують на дочірні елементи).
* `mouseenter` / `mouseleave` — курсор заходить або виходить з елемента (**НЕ спливають**, ігнорують внутрішні нащадки; зручні для ховер-ефектів).
* `wheel` — прокручування коліщатка миші.

#### 2. Події клавіатури (Keyboard Events)
* `keydown` — клавішу натиснуто (повторюється при затисканні).
* `keyup` — клавішу відпущено.

> *Примітка:* Подія `keypress` застаріла (`deprecated`) і не рекомендується до використання.

**Ключові властивості об'єкта клавіатурної події (`KeyboardEvent`):**
* `e.key` — значення символу з урахуванням розкладки та регістру (`"Enter"`, `"ArrowUp"`, `"а"`, `"A"`).
* `e.code` — фізичний код клавіші на клавіатурі (`"KeyA"`, `"Digit1"`, `"Space"`, `"Enter"`).
* `e.altKey`, `e.ctrlKey`, `e.shiftKey`, `e.metaKey` — прапорці затиснутих клавіш-модифікаторів.

```javascript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.code === 'KeyS') {
    e.preventDefault(); // блокуємо стандартне збереження сторінки
    console.log('Кастомне збереження!');
  }
});
```

---

### 3.6 Події завантаження документа: `DOMContentLoaded` проти `load`

Ці події сигналізують про різні етапи готовності сторінки:

```
HTML парситься ──> DOM готовий (DOMContentLoaded) ──> Зображення, стилі завантажені (load)
```

#### `DOMContentLoaded`
* **Де викликається:** на об'єкті **`document`**.
* **Коли спрацьовує:** Браузер повністю розпарсив HTML і побудував DOM-дерево. Зовнішні ресурси (зображення, стилі, шрифти, `iframe`) можуть ще завантажуватися.
* **Призначення:** Ідеальне місце для ініціалізації скриптів і пошуку елементів.
```javascript
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM готовий до маніпуляцій!');
});
```

#### `load`
* **Де викликається:** на об'єкті **`window`**.
* **Коли спрацьовує:** Сторінка повністю завантажена включно з усіма зображеннями, стилями, фреймами та ресурсами.
* **Призначення:** Коли для коду критично знати фінальні розміри зображень чи рендеринг шрифтів.
```javascript
window.addEventListener('load', () => {
  console.log('Усі ресурси, картинки та стилі повністю завантажено.');
});
```

#### Пов'язані події життєвого циклу
* `beforeunload` (на `window`) — викликається безпосередньо перед закриттям вкладки (можна запитати користувача про незбережені дані).
* `unload` (на `window`) — користувач остаточно залишає сторінку (використовується для відправки аналітики через `navigator.sendBeacon`).

---

### 3.7 Робота із сенсорними екранами (Touch Events)

Сенсорні пристрої генерують специфічний набір подій `TouchEvent`.

#### Основні тач-події
* `touchstart` — палець торкнувся сенсорної поверхні.
* `touchmove` — палець рухається поверхнею не відриваючись.
* `touchend` — палець відірвано від екрана.
* `touchcancel` — дотик перервано (наприклад, вхідний телефонний дзвінок або вихід за межі сенсора).

#### Списки точок дотику (`TouchList`)
Кожен об'єкт `TouchEvent` містить спеціальні масивоподібні колекції точок дотику:
* `e.touches` — список **усіх** пальців, які зараз знаходяться на екрані.
* `e.targetTouches` — список пальців, які знаходяться на **поточному цільовому елементі**.
* `e.changedTouches` — пальці, чий стан спричинив поточну подію (для `touchend` координати шукають саме тут).

#### Властивості конкретної точки (`Touch`):
* `clientX` / `clientY` — координати дотику відносно вікна перегляду (viewport).
* `pageX` / `pageY` — координати відносно всього документа (з урахуванням скролу).

```javascript
const touchZone = document.querySelector('#touch-box');

touchZone.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  console.log(`Початковий дотик: X=${touch.clientX}, Y=${touch.clientY}`);
});

touchZone.addEventListener('touchmove', (e) => {
  // Запобігаємо стандартній поведінці (наприклад, зумуванню чи скролу сторінки)
  e.preventDefault();
  const touch = e.touches[0];
  console.log(`Рух пальця: X=${touch.clientX}, Y=${touch.clientY}`);
}, { passive: false });
```

---

## 4. Шпаргалка зі швидкими прикладами

```javascript
// 1. Пошук і створення
const container = document.querySelector('#app');
const button = document.createElement('button');
button.className = 'btn btn-primary';
button.textContent = 'Натисни мене';

// 2. Додавання в DOM
container.append(button);

// 3. Обробка подій з контролем спливання
button.addEventListener('click', (event) => {
  event.preventDefault();     // скасовуємо дію за замовчуванням
  event.stopPropagation();    // блокуємо спливання до батьків
  console.log('Подія спрацювала на цільовому елементі:', event.currentTarget);
});

// 4. Готовність DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('Застосунок успішно ініціалізовано');
});
```