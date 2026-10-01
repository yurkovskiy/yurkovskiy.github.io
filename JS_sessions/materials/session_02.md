# JavaScript Study Guide (Checklist Data 02)

Source topics extracted from data_02.js.

---

# 1. Data Structures: Arrays & Object Literals

## Array: Index

Arrays are ordered collections. Each element has a numeric index starting from `0`.

```js
const fruits = ['apple', 'banana', 'orange'];
console.log(fruits[0]); // apple
console.log(fruits[1]); // banana
```

### Key Points
- First element is at index `0`.
- Last element index is `length - 1`.
- Accessing a non-existing index returns `undefined`.

---

## Array: Length

The `length` property represents the number of elements in the array.

```js
const arr = [10, 20, 30];
console.log(arr.length); // 3
```

### Notes
- Length changes automatically.
- Setting `length` can truncate an array.

```js
arr.length = 2;
console.log(arr); // [10, 20]
```

---

## Array Built-in Methods

### push()
Adds elements to the end.

```js
arr.push(40);
```

### pop()
Removes the last element.

```js
arr.pop();
```

### unshift()
Adds elements to the beginning.

```js
arr.unshift(5);
```

### splice()
Adds, removes, or replaces elements.

```js
arr.splice(1, 1);
```

### includes()
Checks whether a value exists.

```js
arr.includes(20);
```

### sort()
Sorts array elements.

```js
numbers.sort((a, b) => a - b);
```

### map()
Creates a new transformed array.

```js
const doubled = [1,2,3].map(x => x * 2);
```

### Other Important Methods
- filter
- find
- findIndex
- reduce
- some
- every
- slice
- concat
- flat

---

## Object Literals

Objects store data as key-value pairs.

```js
const user = {
  name: 'John',
  age: 30
};
```

### Access Properties

```js
user.name;
user['age'];
```

### Add Properties

```js
user.city = 'Berlin';
```

### Iterate

```js
for (const key in user) {
  console.log(key, user[key]);
}
```

---

## JSON Data Format

JSON (JavaScript Object Notation) is a text format for data exchange.

```json
{
  "name": "John",
  "age": 30
}
```

### Convert Object to JSON

```js
const json = JSON.stringify(user);
```

### Convert JSON to Object

```js
const obj = JSON.parse(json);
```

### Common Use Cases
- APIs
- Configuration files
- Data storage
- Network communication

---

# 2. Loops

## while

Executes while a condition is true.

```js
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
```

### Use When
- Number of iterations is unknown.
- Condition controls execution.

---

## do...while

Runs at least once.

```js
let i = 0;
do {
  console.log(i);
  i++;
} while (i < 5);
```

### Difference from while
The condition is checked after execution.

---

## for

Most common counting loop.

```js
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

### Structure

```js
for (initialization; condition; update) {
}
```

### Best Practices
- Use meaningful variable names.
- Avoid modifying loop counters unexpectedly.

---

# 3. Functions

## Definition and Calling

Functions encapsulate reusable logic.

```js
function greet() {
  console.log('Hello');
}

greet();
```

---

## Parameters

Parameters allow passing data.

```js
function greet(name) {
  return `Hello ${name}`;
}
```

### Default Parameters

```js
function greet(name = 'Guest') {
  return `Hello ${name}`;
}
```

---

## Return Value

Functions can return results.

```js
function add(a, b) {
  return a + b;
}
```

### Important
Code after `return` does not execute.

---

## Scope

Scope determines variable visibility.

### Global Scope

```js
const appName = 'Demo';
```

### Local Scope

```js
function test() {
  const value = 42;
}
```

Variables declared inside functions are inaccessible outside.

---

## Anonymous Functions

Functions without names.

```js
const sayHi = function() {
  console.log('Hi');
};
```

Frequently used with callbacks.

```js
setTimeout(function() {
  console.log('Done');
}, 1000);
```

---

## Recursion

A recursive function calls itself.

```js
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}
```

### Requirements
- Base case
- Recursive step

---

## IIFE

Immediately Invoked Function Expression.

```js
(function() {
  console.log('Executed immediately');
})();
```

### Purpose
- Create isolated scope
- Avoid global pollution

---

## Closures

A closure allows a function to access variables from its outer scope even after the outer function has finished execution.

```js
function createCounter() {
  let count = 0;

  return function() {
    return ++count;
  };
}
```

### Uses
- Data encapsulation
- Function factories
- Private state

---

## Hoisting

JavaScript moves declarations to the top of their scope before execution.

### Function Hoisting

```js
sayHello();

function sayHello() {
  console.log('Hello');
}
```

### Variable Hoisting

```js
console.log(x);
var x = 5;
```

Equivalent to:

```js
var x;
console.log(x);
x = 5;
```

### Important Notes
- `var` is hoisted and initialized with `undefined`.
- `let` and `const` are hoisted but remain in the Temporal Dead Zone until initialization.
- Function declarations are fully hoisted.

---

# Practice Questions

1. What is the difference between an array and an object?
2. When should you use `map()` instead of `for`?
3. What is the difference between `while` and `do...while`?
4. How does function scope work?
5. What problem do closures solve?
6. Why can hoisting lead to bugs?
7. When should recursion be preferred over loops?
8. What is JSON and why is it important?

---

# Recommended javascript.info Articles

- Arrays
- Array Methods
- Objects
- JSON Methods
- Loops: while and for
- Function Basics
- Variable Scope
- Function Expressions
- Recursion and Stack
- Closures
- The Old var

These articles together cover every topic from the checklist.
