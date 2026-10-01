# Homework Project: To-Do List Manager

## Project Overview

Build a console-based JavaScript application that allows users to manage a list of tasks.

The project is designed to reinforce the following topics:

- Arrays
- Objects
- Loops
- Functions
- Scope
- JSON
- Array methods (`push`, `splice`, `find`, `filter`, `map`)

---

# Functional Requirements

## Data Structure

Store tasks in an array.

Example:

```js
const tasks = [
  {
    id: 1,
    title: 'Learn Closures',
    completed: false
  },
  {
    id: 2,
    title: 'Practice Loops',
    completed: true
  }
];
```

Each task must contain:

| Property | Type | Description |
|----------|------|-------------|
| id | number | Unique identifier |
| title | string | Task description |
| completed | boolean | Completion status |

---

# Core Features

## 1. Add Task

Create a function:

```js
addTask(title)
```

Requirements:

- Create a new task object.
- Generate a unique id.
- Set `completed` to `false`.
- Add the task to the array.

Example:

```js
addTask('Learn Arrays');
```

Result:

```js
{
  id: 3,
  title: 'Learn Arrays',
  completed: false
}
```

---

## 2. Display All Tasks

Create:

```js
showTasks()
```

Output example:

```text
[ ] 1 - Learn Arrays
[x] 2 - Practice Functions
[ ] 3 - Learn Closures
```

Rules:

- Use loops.
- Show task status.
- Show task id.

---

## 3. Mark Task as Completed

Create:

```js
markCompleted(id)
```

Example:

```js
markCompleted(2);
```

Expected result:

```js
{
  id: 2,
  title: 'Practice Functions',
  completed: true
}
```

---

## 4. Remove Task

Create:

```js
removeTask(id)
```

Requirements:

- Find the task.
- Remove it from the array.
- Display a confirmation message.

---

## 5. Search Tasks

Create:

```js
findTask(keyword)
```

Example:

```js
findTask('loop');
```

Expected behavior:

Return all matching tasks.

---

## 6. Count Tasks

Create:

```js
countTasks()
```

Example output:

```text
Total tasks: 5
```

---

## 7. Count Completed Tasks

Create:

```js
countCompletedTasks()
```

Example output:

```text
Completed tasks: 3
```

---

# JSON Requirement

Implement export and import functionality.

## Export

```js
exportTasks()
```

Use:

```js
JSON.stringify(tasks, null, 2)
```

## Import

```js
importTasks(jsonString)
```

Use:

```js
JSON.parse(jsonString)
```

---

# Validation Rules

Students must validate input.

### Invalid Title

Reject:

```js
''
' '
```

### Invalid ID

Reject:

```js
removeTask(999);
```

if the task does not exist.

---

# Suggested Application Flow

```text
1. Add Task
2. Show Tasks
3. Complete Task
4. Remove Task
5. Search Task
6. Count Tasks
7. Export JSON
8. Exit
```

---

# Minimum Acceptance Criteria

To pass the assignment a student must:

- Implement all core functions.
- Use arrays and objects correctly.
- Use at least one loop.
- Use at least three functions.
- Use JSON methods.
- Handle invalid input.
- Demonstrate the application with at least 5 tasks.

---

# Bonus Challenges

## Level 1

Add task priorities:

```js
{
  id: 1,
  title: 'Learn Closures',
  completed: false,
  priority: 'high'
}
```

## Level 2

Add due dates:

```js
{
  dueDate: '2026-10-15'
}
```

## Level 3

Sort tasks:

```js
sortByName()
sortByPriority()
```

## Level 4

Show statistics:

```text
Total Tasks: 10
Completed: 7
Open: 3
Completion Rate: 70%
```

---

# Deliverables

Students must submit:

1. JavaScript source file.
2. Screenshots of program execution.
3. Short README describing:
   - Application purpose
   - Implemented features
   - Challenges encountered
   - Lessons learned

---

# Estimated Effort

- Basic implementation: 2-3 hours
- With validation: 3-4 hours
- With bonus tasks: 5-8 hours
