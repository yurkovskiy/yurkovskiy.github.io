# Делегування Подій (Event Delegation) та Практикум

## 1. Делегування Подій (Event Delegation)

### 1.1 Що це таке і чому це важливо?

**Делегування подій (Event Delegation)** — це патерн роботи з подіями в DOM, що базується на механізмі **спливання подій (Event Bubbling)**. 

Замість того, щоб вішати окремий обробник на кожен дочірній елемент (що витрачає оперативну пам'ять і вимагає постійного повторного навішування при динамічному додаванні елементів), ми встановлюємо **один єдиний обробник на їхнього спільного батька**.

```
                [Батьківський елемент: <ul>] <─── Обробник події тут!
               ╱            │             ╲
     [Дитина: <li>]   [Дитина: <li>]   [Нова динамічна: <li>]
```

### 1.2 Різниця між `event.target` та `event.currentTarget`

Розуміння цієї різниці є ключовим для реалізації делегування:

| Властивість | Опис | Чи змінюється під час спливання? |
| :--- | :--- | :--- |
| **`event.target`** | Безпосередній елемент, на якому **відбулася дія** (наприклад, по якому фактично клацнули мишкою). | **Ні**, вказує на початкове джерело події. |
| **`event.currentTarget`** (або `this`) | Елемент, на якому **зараз спрацьовує обробник** (тобто елемент, до якого прив'язано `addEventListener`). | **Так**, змінюється в міру підняття події вгору. |

### 1.3 Базовий приклад делегування

Уявімо список покупок:

```html
<ul id="shopping-list">
  <li data-item="apple">Яблука</li>
  <li data-item="bread">Хліб</li>
  <li data-item="milk">Молоко</li>
</ul>
```

```javascript
const list = document.querySelector('#shopping-list');

list.addEventListener('click', (event) => {
  // Перевіряємо, чи клік відбувся саме по <li>
  if (event.target.tagName === 'LI') {
    console.log(`Вибрано пункт: ${event.target.textContent}`);
    console.log(`Ключ товару: ${event.target.dataset.item}`);
    event.target.classList.toggle('completed');
  }
});
```

### 1.4 Обробка вкладених елементів за допомогою `.closest()`

Часто елемент списку містить внутрішні теги (`<span>`, `<strong>`, `<i>`, `<svg>`). Якщо користувач клікне по `<strong>`, простий `event.target.tagName === 'BUTTON'` поверне `false`.

Для вирішення цієї проблеми використовують метод **`Element.closest(selector)`**, який шукає найближчого предка (або сам елемент), що відповідає заданому CSS-селектору:

```html
<div class="card-list">
  <article class="card">
    <h3>Заголовок картки</h3>
    <button class="btn-delete">
      <span class="icon">🗑️</span>
      <strong>Видалити</strong>
    </button>
  </article>
</div>
```

```javascript
const container = document.querySelector('.card-list');

container.addEventListener('click', (e) => {
  // Шукаємо найближчу кнопку .btn-delete від точки кліку вгору по DOM
  const deleteBtn = e.target.closest('.btn-delete');

  // Якщо клік був поза межами будь-якої кнопки .btn-delete всередині контейнера
  if (!deleteBtn || !container.contains(deleteBtn)) return;

  const card = deleteBtn.closest('.card');
  if (card) {
    card.remove();
  }
});
```

---

## 2. Практичні завдання з розв'язками

### Завдання 1: Динамічний інтерактивний список завдань (To-Do List)

**Умова:**
Створіть список завдань, де:
1. Можна додати новий пункт через поле вводу та кнопку.
2. При натисканні на текст завдання воно позначається як виконане (додається клас `done` з перекресленням).
3. При натисканні на кнопку «Видалити» (`<button class="delete">✖</button>`) пункт видаляється з DOM.
4. **Вимога:** Використати делегування подій на контейнері списку (не вішати слухачі на кожну нову кнопку чи рядок окремо).

#### Рішення:

```html
<form id="todo-form">
  <input type="text" id="todo-input" placeholder="Нове завдання..." required />
  <button type="submit">Додати</button>
</form>

<ul id="todo-list">
  <!-- Елементи генеруються динамічно -->
</ul>

<style>
  .done { text-decoration: line-through; opacity: 0.6; }
  .todo-item { display: flex; justify-content: space-between; margin-bottom: 6px; }
</style>
```

```javascript
const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');

// 1. Додавання нового пункту
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.className = 'todo-item';
  li.innerHTML = `
    <span class="text">${text}</span>
    <button type="button" class="btn-remove">✖</button>
  `;

  todoList.append(li);
  input.value = '';
});

// 2. Делегування подій для дій над пунктами
todoList.addEventListener('click', (e) => {
  // Випадок А: Натиснуто кнопку видалення
  const removeBtn = e.target.closest('.btn-remove');
  if (removeBtn) {
    const li = removeBtn.closest('.todo-item');
    li.remove();
    return;
  }

  // Випадок Б: Клік по тексту для перемикання статусу
  const textSpan = e.target.closest('.text');
  if (textSpan) {
    textSpan.classList.toggle('done');
  }
});
```

---

### Завдання 2: Вкладки (Tabs Component) через делегування

**Умова:**
Створіть навігаційну панель із вкладками. При кліку на кнопку вкладки:
1. Вона стає активною (клас `active`).
2. Відповідний блок контенту показується, а інші ховаються.
3. Використайте `data-*` атрибути для зв'язку між кнопкою та контентом.

#### Рішення:

```html
<div class="tabs-nav" id="tabs-header">
  <button class="tab-btn active" data-tab="tab-1">Профіль</button>
  <button class="tab-btn" data-tab="tab-2">Налаштування</button>
  <button class="tab-btn" data-tab="tab-3">Повідомлення</button>
</div>

<div class="tabs-content">
  <div class="tab-pane active" id="tab-1">Вміст профілю користувача...</div>
  <div class="tab-pane" id="tab-2" style="display: none;">Панель налаштувань...</div>
  <div class="tab-pane" id="tab-3" style="display: none;">Нові повідомлення...</div>
</div>
```

```javascript
const tabsHeader = document.querySelector('#tabs-header');
const tabPanes = document.querySelectorAll('.tab-pane');
const tabButtons = tabsHeader.querySelectorAll('.tab-btn');

tabsHeader.addEventListener('click', (e) => {
  const clickedBtn = e.target.closest('.tab-btn');
  if (!clickedBtn) return;

  const targetTabId = clickedBtn.dataset.tab;

  // Оновлюємо активні класи кнопок
  tabButtons.forEach(btn => btn.classList.remove('active'));
  clickedBtn.classList.add('active');

  // Перемикаємо відображення контенту
  tabPanes.forEach(pane => {
    if (pane.id === targetTabId) {
      pane.style.display = 'block';
      pane.classList.add('active');
    } else {
      pane.style.display = 'none';
      pane.classList.remove('active');
    }
  });
});
```

---

### Завдання 3: Панель відстеження URL та Історії (DOM + BOM)

**Умова:**
Створіть інтерактивну плашку, яка відображає поточний `window.location.hash`, а кнопки дозволяють змінювати стан за допомогою `window.history.pushState` без перезавантаження сторінки.

#### Рішення:

```html
<div id="route-controls">
  <button data-path="/home">Головна</button>
  <button data-path="/catalog">Каталог</button>
  <button data-path="/contact">Контакти</button>
  <button id="btn-back">⬅ Назад</button>
</div>
<p>Поточний шлях: <strong id="current-url"></strong></p>
```

```javascript
const controls = document.querySelector('#route-controls');
const display = document.querySelector('#current-url');
const backBtn = document.querySelector('#btn-back');

function updateDisplay() {
  display.textContent = window.location.pathname;
}

// Початкове значення
updateDisplay();

// Делегування переходу за маршрутами
controls.addEventListener('click', (e) => {
  const targetBtn = e.target.closest('button[data-path]');
  if (!targetBtn) return;

  const newPath = targetBtn.dataset.path;
  window.history.pushState({ path: newPath }, '', newPath);
  updateDisplay();
});

// Кнопка назад через BOM History API
backBtn.addEventListener('click', () => {
  window.history.back();
});

// Реагування на переходи користувача стрілками браузера
window.addEventListener('popstate', () => {
  updateDisplay();
});
```

---

## 3. Переваги та обмеження делегування

### Переваги:
1. **Зменшення споживання пам'яті:** Замість сотень слухачів створюється лише один.
2. **Динамічність:** Нові елементи, додані через JS, автоматично підхоплюються обробником без необхідності повторного виклику `addEventListener`.
3. **Менше коду:** Централізована логіка спрощує підтримку та очищення пам'яті.

### Коли делегування не підходить:
* Для подій, які **не спливають** (`blur`, `focus`, `mouseenter`, `mouseleave`).
* Коли обробник дуже ресурсоємний і спрацьовує часто (наприклад, `mousemove` на великій площі).