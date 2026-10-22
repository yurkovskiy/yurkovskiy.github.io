# Повний посібник із конфігурації `tsconfig.json`

---

## 1. Роль та призначення `tsconfig.json`

Файл `tsconfig.json` є серцем будь-якого TypeScript-проекту. Його наявність у каталозі визначає цю директорію як кореневу папку проекту TypeScript.

### Основні функції файлу:
1. **Визначення контексту компілятора:** Вказує, які файли входять до проекту, а які слід ігнорувати.
2. **Налаштування поведінки компілятора (`compilerOptions`):** Регулює суворість типізації, цільову версію JavaScript, спосіб резолюції модулів та генерацію вихідних артефактів.
3. **Інтеграція з IDE/редактором коду:** Редактори (VS Code, WebStorm) зчитують цей конфіг для активації IntelliSense, навігації за типами та відображення помилок на льоту.

> **Короткий зміст (Slide Summary):** `tsconfig.json` позначає корінь проекту, визначає файлову структуру для аналізу та задає правила поведінки компілятора й редактора.
> 
> 💬 **Питання для дискусії:** *Чому розробники вважають поганою практикою запускати `tsc` з прямими прапорцями через командний рядок (CLI) замість використання `tsconfig.json` у командній розробці?*

---

## 2. Структура верхнього рівня: Керування файлами

Перед налаштуванням типів компілятор повинен чітко знати, **що саме** йому компілювати.

```json
{
  "compilerOptions": { ... },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"],
  "files": ["src/index.ts"]
}
```

### 2.1 Властивості вибору файлів

* **`include`**: Список шаблонів (glob patterns), які описують файли для включення в проект (наприклад, `["src/**/*"]`).
* **`exclude`**: Список шаблонів, які потрібно виключити з процесу компіляції.
  * *Важливе зауваження:* За замовчуванням TypeScript завжди ігнорує папку `node_modules`, якщо не вказано протилежне.
  * **Підводний камінь:** Якщо файл збігається з шаблоном `exclude`, але імпортується безпосередньо з файлу в `include`, TypeScript **все одно скомпілює його**, щоб не порушити цілісність графа залежностей.
* **`files`**: Список конкретних відносних шляхів до файлів. Має найвищий пріоритет. Корисно для невеликих проектів або для точкового контролю точки входу.
* **`extends`**: Дозволяє успадковувати налаштування з іншого конфігураційного файлу (наприклад, базового конфігу компанії або пресетів `@tsconfig/bases`).

> **Короткий зміст (Slide Summary):** Властивості `include` та `exclude` керують графом компіляції. Проте прямий імпорт файлу обходить обмеження `exclude`.

---

## 3. Деконструкція `compilerOptions`

Секція `compilerOptions` містить десятки прапорців. Розглянемо найважливіші з них, розділені за функціональними блоками.

### 3.1 Модулі та цільове середовище (Module & Target)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

* **`target`**: Визначає, у яку версію стандарту ECMAScript буде скомпільовано ваш код.
  * Сучасні сервери (Node.js 18+ / 20+) та браузери чудово підтримують `ES2022` або `ESNext`.
  * Чим новіший target, тим менше компілятор генерує допоміжного коду (shims/polyfills) для класів, асинхронних функцій чи оператора `??`.
* **`module`**: Формат збірки модульної системи (`CommonJS`, `ES6`, `NodeNext`, `Preserve`).
* **`moduleResolution`**: Алгоритм, за яким компілятор шукає файли за назвою імпорту:
  * `NodeNext`: Сучасний стандарт для Node.js з підтримкою ESM (вимагає вказувати розширення `.js` в імпортах всередині `.ts` файлів).
  * `Bundler`: Спеціальний режим для збирачів (Vite, esbuild, Webpack), які самі вирішують шлях до модулів.
* **`lib`**: Перелік вбудованих декларацій API, доступних у вашому середовищі. Якщо це бекенд на Node.js, `DOM` вказувати не потрібно.

---

### 3.2 Збірка та артефакти (Emit & Paths)

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "noEmit": false,
    "declaration": true,
    "sourceMap": true
  }
}
```

* **`rootDir`**: Коренева папка вихідного коду TypeScript. Дозволяє компілятору дзеркально відтворити структуру директорій у вихідній папці.
* **`outDir`**: Директорія, куди записуються скомпільовані `.js` та `.d.ts` файли.
* **`noEmit`**: Якщо встановити `true`, TypeScript **не створюватиме жодних `.js` файлів**. Застосовується, коли компілятор використовується виключно як Type Checker (наприклад, у зв'язці з Vite, Next.js чи Babel).
* **`declaration` (`.d.ts`)**: Генерує файли типів для бібліотек, щоб інші розробники могли бачити сигнатури типів.
* **`sourceMap`**: Створює файли `.map`, що зв'язують скомпільований JS-код із вихідним TS-кодом для зручного дебагінгу в браузері чи IDE.

---

### 3.3 Сімейство правил `strict`: Чому це критично

Прапорець `"strict": true` вмикає комплексний набір із понад 8 суворих перевірок типу.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Коли `"strict": true` увімкнено, автоматично активуються наступні правила:

| Прапорець | Опис та небезпека відключення |
| :--- | :--- |
| **`noImplicitAny`** | Забороняє змінним або параметрам неявно отримувати тип `any`, якщо тип не вдалося вивести автоматично. Захищає від випадкової втрати типізації. |
| **`strictNullChecks`** | `null` та `undefined` не входять до множини значень інших типів. Змінна типу `string` не може бути `null`, якщо ви явно не вказали `string \| null`. Запобігає більшості помилок `TypeError: Cannot read property...`. |
| **`strictFunctionTypes`** | Вмикає контраваріантність параметрів функцій під час перевірки сумісності функціональних типів. |
| **`strictBindCallApply`** | Перевіряє коректність виклику методів `.bind()`, `.call()`, `.apply()`. |
| **`strictPropertyInitialization`** | Вимагає, щоб поля класу були ініціалізовані або в місці оголошення, або в конструкторі. |
| **`useUnknownInCatchVariables`** | Змінна помилки в блоці `catch (error)` отримує безпечний тип `unknown` замість небезпечного `any`. |

> **Короткий зміст (Slide Summary):** Завжди вмикайте `"strict": true`. Вимкнення суворих перевірок нівелює ключові переваги безпеки типів.
> 
> 💬 **Питання для дискусії:** *Чому правило `useUnknownInCatchVariables` безпечніше за старий підхід, коли помилка в блоці catch автоматично вважалася `any`?*

---

### 3.4 Чистота коду та перевірки якості (Linter-like Rules)

Ці параметри доповнюють лінтер (ESLint) і допомагають підтримувати проект у чистоті:

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,            /* Помилка, якщо локальна змінна оголошена, але не використана */
    "noUnusedParameters": true,        /* Помилка для невикористаних параметрів функцій */
    "noImplicitReturns": true,         /* Вимагає return у всіх гілках коду, якщо хоч одна гілка повертає значення */
    "noFallthroughCasesInSwitch": true, /* Забороняє провалювання в наступний 'case' без break/return */
    "exactOptionalPropertyTypes": true /* Розрізняє відсутність ключа та ключ зі значенням 'undefined' */
  }
}
```

---

### 3.5 Псевдоніми шляхів (Path Mapping)

Для уникнення "пекла відносних імпортів" (`import { foo } from "../../../services/foo"`) налаштовуються аліаси:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

* **Важливо розуміти:** `tsc` самостійно **не переписує** ці шляхи у скомпільованому JS (шлях так і залишиться `@/components/...`). Для виконання такого коду в Node.js безпосередньо потрібен збирач (Vite, Rollup) або утиліти типу `tsconfig-paths`.

---

## 4. Готові сучасні шаблони конфігурацій

### Шаблон А: Сучасний бекенд на Node.js (Pure TypeScript + `tsx` / `Node 22+`)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    
    /* Суворі перевірки */
    "strict": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,
    
    /* Перевірки якості */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,

    /* Інтероперабельність */
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

---

### Шаблон Б: Сучасний фронтенд (React / Vue + Vite)

У проектах із Vite компілятор TS займається виключно валідацією типів, тоді як швидку транспіляцію виконує `esbuild`.

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Режим для бандлерів */
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Суворість */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Аліаси */
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 5. Поширені помилки та підводні камені

1. **Забутий `skipLibCheck: true`:**
   * Без цього компілятор буде ретельно перевіряти типи всередині всіх файлів `.d.ts` у папці `node_modules`. Якщо дві різні бібліотеки мають навіть незначний конфлікт глобальних типів, збірка вашого проекту впаде. Встановлення `skipLibCheck: true` значно прискорює компіляцію.
2. **Розбіжність регістра у назвах файлів (`forceConsistentCasingInFileNames`):**
   * Windows та macOS за замовчуванням нечутливі до регістра символів (`User.ts` та `user.ts` для них однаковий файл), а Linux на CI/CD сервері — чутливий. Без прапорця `forceConsistentCasingInFileNames: true` код збірки працюватиме локально, але впаде на сервері.
3. **Очікування, що `paths` мапить шляхи у фінальному `.js`:**
   * Нагадуйте студентам: `tsconfig.json` лише пояснює TypeScript, де шукати типи. Для реальної заміни шляхів у фінальному бандлі відповідає інструмент збірки.

---

## 6. Практичні завдання та лабораторні вправи

### Вправа 1: Діагностика та налагодження конфігурації

**Ситуація:** Команда перенесла проект на TypeScript. У них є наступний `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES5",
    "module": "commonjs",
    "strict": false
  }
}
```

У коді є функція:
```ts
function parseResponse(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error(err.message);
  }
}
```

**Завдання:** 
1. Які потенційні помилки пропустить компілятор за поточної конфігурації?
2. Перепишіть `tsconfig.json` так, щоб компілятор вимагав явних типів, захищав від `null/undefined` та змушував безпечно обробляти помилку в блоці `catch`.

<details>
<summary>👉 Рішення та пояснення</summary>

**Проблеми початкового коду:**
* `data` має неявний тип `any`.
* `strict: false` вимикає перевірку наявності поля `message` у помилці (`err` за замовчуванням є `any`, хоча в JS можна викинути рядок `throw "помилка"`).
* Функція не повертає значення у блоці `catch` (`noImplicitReturns`).

**Виправлений `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitReturns": true,
    "useUnknownInCatchVariables": true
  }
}
```

**Оновлений код, який вимагатиме компілятор:**
```ts
function parseResponse(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("Невідома помилка");
    }
    return null;
  }
}
```
</details>

---

### Вправа 2: Налаштування Path Aliases для команди

**Завдання:**
У проекті є структура:
```text
my-project/
├── src/
│   ├── components/
│   │   └── Button.ts
│   ├── utils/
│   │   └── formatters.ts
│   └── index.ts
└── tsconfig.json
```

Налаштуйте `tsconfig.json` так, щоб у файлі `index.ts` можна було імпортувати сутності за допомогою:
```ts
import { Button } from "@components/Button";
import { formatDate } from "@utils/formatters";
```

<details>
<summary>👉 Рішення</summary>

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*"]
}
```
</details>

---

## 7. Підсумкова шпаргалка ключових параметрів

| Параметр | Рекомендоване значення | Чому саме так? |
| :--- | :--- | :--- |
| `strict` | `true` | Максимальний захист, унеможливлює помилки типів у runtime. |
| `skipLibCheck` | `true` | Запобігає конфліктам між зовнішніми бібліотеками, прискорює компіляцію. |
| `forceConsistentCasingInFileNames` | `true` | Усуває розбіжності між поведінкою файлових систем Windows/macOS та Linux. |
| `noImplicitOverride` | `true` | Вимагає ключове слово `override` для методів класів-нащадків, полегшуючи рефакторинг. |
| `target` | `ES2022`+ | Менше непотрібного JS-баласту та поліфілів у сучасних середовищах. |
| `moduleResolution` | `NodeNext` або `Bundler` | Сучасний стандартизований резолюшн модулів замість застарілого `node10/classic`. |