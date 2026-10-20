# Deep Dive: JavaScript Concurrency, Microtasks, and Promises

**Lecture & Reference Manual**  
**Target Audience:** Senior Frontend Engineers, Full-Stack Node.js Developers, and System Designers  
**Focus:** Event Loop Architecture, Queue Priority Mechanics, Promise Internals, and Starvation Prevention

---

## Table of Contents
1. [Module 1: The JavaScript Concurrency Architecture](#module-1-the-javascript-concurrency-architecture)
   - 1.1 Single Threading, Run-to-Completion, and the Call Stack
   - 1.2 Memory Heap & Stack Frames
   - 1.3 The Host Environment (Browser Web APIs vs. Node.js Libuv)
2. [Module 2: The Event Loop & Task Queues](#module-2-the-event-loop--task-queues)
   - 2.1 Anatomy of a Loop Turn / Tick
   - 2.2 Macrotask Queue (Task Queue) vs. Microtask Queue
   - 2.3 Detailed Architectural Diagram
   - 2.4 Browser Rendering Pipeline Interleaving
3. [Module 3: Microtasks in Depth](#module-3-microtasks-in-depth)
   - 3.1 Sources: Promises, `queueMicrotask`, `MutationObserver`
   - 3.2 The Microtask Drainage Invariant
   - 3.3 Event Loop Starvation & UI Freezing (The Microtask Trap)
   - 3.4 Node.js Specifics: `process.nextTick()` vs. Standard Microtasks
4. [Module 4: Promises — Architecture and Internal States](#module-4-promises--architecture-and-internal-states)
   - 4.1 The Anatomy of a Promise: States, Reactions, and Fulfill/Reject Handlers
   - 4.2 Promise Reaction Queuing: Why `.then()` is Always Asynchronous
   - 4.3 Promise Chaining Mechanics and Unwrapping (Thenables)
   - 4.4 Error Propagation and Unhandled Rejections
5. [Module 5: Modern Asynchronous Control Flow](#module-5-modern-asynchronous-control-flow)
   - 5.1 `async` / `await` Under the Hood (Generator De-sugar Transformation)
   - 5.2 Combinators Compared: `all`, `allSettled`, `race`, `any`
   - 5.3 Anti-patterns and Real-world Memory Leaks
6. [Module 6: Comprehensive Step-by-Step Execution Walkthroughs](#module-6-comprehensive-step-by-step-execution-walkthroughs)
   - 6.1 The Tricky Multi-Queue Challenge
   - 6.2 Microtask Cascades in DOM Event Listeners
7. [Module 7: Self-Assessment Exercises & Debugging Challenges](#module-7-self-assessment-exercises--debugging-challenges)

---

# Module 1: The JavaScript Concurrency Architecture

### 1.1 Single Threading, Run-to-Completion, and the Call Stack

JavaScript was designed around a **single-threaded, non-blocking, event-driven** runtime. "Single-threaded" means that a single JavaScript agent (an instance of the V8 or JavaScriptCore engine) possesses exactly **one Call Stack** and executes precisely one instruction at a time.

```
       +---------------------------------------------+
       |                  CALL STACK                 |
       |  +---------------------------------------+  |
       |  | computeHash()                         |  |  <-- Stack Frame (Pushed)
       |  +---------------------------------------+  |
       |  | validateCredentials()                 |  |
       |  +---------------------------------------+  |
       |  | handleLogin()                         |  |
       |  +---------------------------------------+  |
       |  | (anonymous / global execution context)|  |
       |  +---------------------------------------+  |
       +---------------------------------------------+
                              |
                     Run-to-Completion
                              v
```

#### The Run-to-Completion Invariant
Whenever a stack frame or sequence of nested frames begins execution, it cannot be interrupted or preempted by another piece of JavaScript code. The function currently on the Call Stack runs to completion until it either returns a value or throws an exception, clearing all active frames off the stack. 

There are no native thread interrupts, mutexes, or condition variables inside pure ECMAScript code execution. Concurrency is achieved not through simultaneous execution of multiple scripts, but through the **Event Loop** dispatching independent units of work when the Call Stack becomes completely empty.

### 1.2 Memory Heap & Stack Frames

- **The Call Stack:** Tracks execution contexts. Each time a function is invoked, a stack frame is allocated containing:
  1. Primitive local variables.
  2. Return addresses for execution resumption.
  3. Context identifiers (`this`, scope pointers, lexical environments).
- **The Memory Heap:** An unstructured memory pool where reference types (Objects, Arrays, Functions, Closures) reside. Pointers on the stack point to addresses inside this heap. Garbage collection (e.g., V8's Generational Scavenge and Mark-Sweep-Compact) runs periodically to reclaim unreferenced heap allocations.

### 1.3 The Host Environment: Web APIs & Libuv

Pure ECMAScript specifies data types, syntax, and execution contexts, but specifies **no timers, networking, file I/O, or thread dispatchers**. These capabilities come from the **Host Environment**:

```
+---------------------------------------------------------------------------+
|                          HOST ENVIRONMENT (Browser / Node)               |
|                                                                           |
|   +-----------------------+      +------------------------------------+   |
|   |       JS ENGINE       |      |             HOST APIs              |   |
|   |       (e.g., V8)      |      |                                    |   |
|   |                       |      |  - DOM Events / MutationObserver   |   |
|   |  +-----------------+  |      |  - fetch / XMLHttpRequest          |   |
|   |  |   Call Stack    |  |      |  - setTimeout / setInterval        |   |
|   |  +-----------------+  |      |  - fs / net / crypto (Node.js)     |   |
|   |  |   Memory Heap   |  |      |                                    |   |
|   |  +-----------------+  |      +------------------------------------+   |
|   +-----------------------+                         |                     |
|              ^                                      | (Dispatches callback|
|              |                                      |  when I/O completes)|
|              |                                      v                     |
|   +-------------------------------------------------------------------+   |
|   |                           EVENT LOOP                              |   |
|   |                                                                   |   |
|   |   [Microtask Queue] <------- Promises, queueMicrotask             |   |
|   |   [Macrotask Queue] <------- Timers, Network I/O, UI Events       |   |
|   +-------------------------------------------------------------------+   |
+---------------------------------------------------------------------------+
```

When you call `setTimeout(callback, 1000)`:
1. The JS Engine registers the timer with the host's background timer infrastructure (C++ timer thread pool or kernel timer).
2. The JS Call Stack completes immediately without waiting.
3. After 1000 ms, the host environment moves the callback into a **Task Queue**.
4. The Event Loop waits until the Call Stack is empty, then picks up the callback and pushes it onto the Call Stack.

---

# Module 2: The Event Loop & Task Queues

### 2.1 Anatomy of a Loop Turn / Tick

The Event Loop is a continuous loop running in the host environment. Its algorithmic workflow adheres to the HTML Living Standard (for browsers) and the Libuv phase architecture (for Node.js).

An abstract browser Event Loop cycle proceeds in this exact sequence:

1. **Select Oldest Macrotask:** Look at the Macrotask (Task) queues. If a macrotask is ready, dequeue it and run it until the Call Stack is empty.
2. **Flush Microtask Queue:** Enter the **Microtask Checkpoint**. Execute *every single* task currently in the Microtask Queue in FIFO order. If a microtask adds *another* microtask to the queue, run that new microtask immediately too. Stay in this loop until the Microtask Queue is completely empty ($0$ items).
3. **Render Opportunities (Browsers only):**
   - Check if the screen requires a repaint (typically aligned with the display refresh rate: $60\text{Hz} = 16.6\text{ms}$, $120\text{Hz} = 8.3\text{ms}$).
   - Run `requestAnimationFrame` (rAF) callbacks.
   - Run CSS style recalculation, layout (reflow), and composite/painting.
4. **Idle & Sleep:** If no tasks or microtasks remain, the thread sleeps until a new task arrives (e.g., an incoming network packet, a mouse click, or a timer tick).

### 2.2 Macrotask Queue vs. Microtask Queue

| Dimension | Macrotask Queue (Task Queue) | Microtask Queue |
| :--- | :--- | :--- |
| **Common Sources** | `setTimeout`, `setInterval`, `setImmediate` (Node), DOM events, UI user inputs, Network I/O. | `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`. |
| **Batch Size per Loop Turn** | Exactly **one** task per cycle before re-checking microtasks and rendering. | **All** microtasks until the queue is completely drained. |
| **Preemption** | Cannot interrupt executing code. Cannot jump ahead of microtasks. | Takes immediate priority as soon as the Call Stack is emptied. |
| **Relationship to Rendering** | Browsers can render between macrotasks. | Browsers **cannot** render until all microtasks finish. |

### 2.3 Detailed Architectural Diagram

```
                     +---------------------------+
                     |    Call Stack Becomes     |
                     |           EMPTY           |
                     +---------------------------+
                                   |
                                   v
                    /-----------------------------\
                   |   Are there any Microtasks    |
                   |      in Microtask Queue?      |
                    \-----------------------------/
                             /              \
                     YES    /                \  NO
                           v                  v
       +-------------------------+     /-----------------------------\
       | Dequeue and execute     |    |   Is it time to render a     |
       | ONE Microtask callback  |    |      frame to the screen?    |
       +-------------------------+     \-----------------------------/
                   |                               /              \
                   |                       YES    /                \  NO
                   +-------+                     v                  v
                           |          +--------------------+  +----------------------+
                           |          | 1. Resize/Scroll   |  | Fetch the NEXT       |
                           |          | 2. rAF callbacks   |  | Macrotask from the   |
                           |          | 3. Layout (Reflow) |  | Macrotask Queue      |
                           |          | 4. Paint           |  +----------------------+
                           |          +--------------------+             |
                           |                     |                       v
                           |                     +--------> +------------------------+
                           |                                | Push Macrotask to      |
                           |                                | Call Stack and RUN     |
                           |                                +------------------------+
                           |                                             |
                           +---------------------------------------------+
```

### 2.4 Browser Rendering Pipeline Interleaving

A critical distinction between microtasks and macrotasks is how they affect the user interface:

- **Macrotasks yield to the renderer.** Because the browser checks for rendering after the microtask checkpoint and after running a single macrotask, scheduling heavy work via chained `setTimeout(..., 0)` permits the browser to interleave UI paint cycles, ensuring animations do not drop frames.
- **Microtasks block the renderer.** Browsers will not update pixels on the screen while the microtask queue is active. If your microtask queue takes $500\text{ms}$ to clear, the user will experience an unresponsive screen (dropped frames and frozen inputs) for half a second.

---

# Module 3: Microtasks in Depth

### 3.1 Sources of Microtasks

There are three primary standard sources of microtasks in modern JavaScript:
1. **Promises:** Callbacks passed to `.then()`, `.catch()`, and `.finally()`.
2. **Explicit dispatch:** The standard `queueMicrotask(fn)` function.
3. **DOM Mutation Observers:** Callbacks triggered when observed DOM nodes change.

```javascript
// 1. Explicit scheduling
queueMicrotask(() => {
  console.log("Explicit microtask dispatched");
});

// 2. Promise reaction scheduling
Promise.resolve("Data").then(result => {
  console.log("Promise reaction microtask:", result);
});

// 3. MutationObserver scheduling (Browser)
if (typeof MutationObserver !== "undefined") {
  const observer = new MutationObserver((mutations) => {
    console.log("DOM mutation microtask executed");
  });
  observer.observe(document.body, { attributes: true });
}
```

### 3.2 The Microtask Drainage Invariant

The ECMAScript specification guarantees that once execution exits the current JavaScript execution context and the stack depth drops to zero, the engine executes the **Microtask Checkpoint**:

$$\text{DrainMicrotasks}() \implies \text{while } (\text{Queue}_{\text{micro}} \neq \emptyset) \ \{ \text{task} = \text{dequeue}();\ \text{run}(\text{task}); \}$$

Notice that if executing a microtask pushes a new microtask onto $\text{Queue}_{\text{micro}}$, the loop condition **remains true**. It will continue processing until everything is cleared.

### 3.3 Event Loop Starvation & UI Freezing (The Microtask Trap)

The following example demonstrates microtask queue starvation:

```javascript
// Schedule a macrotask that intends to log after 0ms
setTimeout(() => {
  console.log("Macrotask executed: This will NEVER print if starved!");
}, 0);

let iteration = 0;

function drainLoopForever() {
  iteration++;
  // Continuous self-enqueueing microtask
  queueMicrotask(() => {
    // This will starve the event loop!
    if (iteration < 1_000_000) {
      drainLoopForever();
    } else {
      console.log("Finally stopped microtask storm.");
    }
  });
}

drainLoopForever();
console.log("Synchronous script evaluation finished.");
```

#### Why does this happen?
The Macrotask (the `setTimeout` callback) sits in the Macrotask Queue. The Event Loop refuses to look at the Macrotask Queue until the Microtask Queue is completely empty. Because every microtask enqueues another microtask, the Call Stack continually empties, triggers the next microtask, and **starves** both timers and UI rendering.

### 3.4 Node.js Specifics: `process.nextTick()` vs. Standard Microtasks

In Node.js, asynchronous processing includes an extra queue that has even higher priority than the standard microtask queue: the **`nextTick` Queue**.

```
Call Stack Clears
       |
       v
[ process.nextTick Queue ]  <--- Highest priority (runs first until empty)
       |
       v
[ Microtask Queue (Promises, queueMicrotask) ] <--- Runs second until empty
       |
       v
[ Libuv Phase Execution (Timers -> I/O -> Check/setImmediate -> Close) ]
```

```javascript
// Example in Node.js runtime
setTimeout(() => console.log("1. Macrotask (Timer)"), 0);

Promise.resolve().then(() => console.log("3. Standard Microtask (Promise)"));

queueMicrotask(() => console.log("4. Standard Microtask (queueMicrotask)"));

process.nextTick(() => console.log("2. NextTick Microtask"));

console.log("0. Synchronous start");

// Output:
// 0. Synchronous start
// 2. NextTick Microtask
// 3. Standard Microtask (Promise)
// 4. Standard Microtask (queueMicrotask)
// 1. Macrotask (Timer)
```

`process.nextTick()` callbacks are maintained in an internal `nextTickQueue` that drains immediately after the current operation finishes, before standard microtasks execute.

---

# Module 4: Promises — Architecture and Internal States

### 4.1 The Anatomy of a Promise: States, Reactions, and Handlers

An ECMAScript Promise is an object that acts as a proxy for a value not necessarily known when the promise is created. Under the ECMAScript specification, an internal Promise contains three hidden internal slots:

1. `[[PromiseState]]`: `"pending"`, `"fulfilled"`, or `"rejected"`.
2. `[[PromiseResult]]`: `undefined` (while pending), the resolution value, or the rejection reason.
3. `[[PromiseFulfillReactions]]` & `[[PromiseRejectReactions]]`: Lists of record objects containing reaction callbacks attached via `.then()`, `.catch()`, or `.finally()`.

```
                  +-----------------------------------+
                  |          PROMISE OBJECT           |
                  |                                   |
                  |  [[PromiseState]]:  "pending"     |
                  |  [[PromiseResult]]: undefined     |
                  |  [[PromiseFulfillReactions]]: []  |
                  |  [[PromiseRejectReactions]]:  []  |
                  +-----------------------------------+
                                    |
                    +---------------+---------------+
                    |                               |
       resolve(value)                               reject(reason)
                    v                               v
    +-------------------------------+   +-------------------------------+
    | [[PromiseState]]: "fulfilled" |   | [[PromiseState]]: "rejected"  |
    | [[PromiseResult]]: value      |   | [[PromiseResult]]: reason     |
    +-------------------------------+   +-------------------------------+
                    |                               |
                    v                               v
    Triggers Microtasks for             Triggers Microtasks for
    [[PromiseFulfillReactions]]         [[PromiseRejectReactions]]
```

#### State Transition Rules
1. A promise can transition from `"pending"` to `"fulfilled"` exactly **once**.
2. A promise can transition from `"pending"` to `"rejected"` exactly **once**.
3. Transitions are **irreversible**. Once a promise is fulfilled or rejected, its state and result are locked. Any future call to `resolve()` or `reject()` is silently ignored.

```javascript
const p = new Promise((resolve, reject) => {
  resolve("First decision");
  reject(new Error("Second decision")); // Ignored!
  resolve("Third decision");            // Ignored!
});

p.then(val => console.log("Resolved with:", val)); // Logs: Resolved with: First decision
```

### 4.2 Promise Reaction Queuing: Why `.then()` is Always Asynchronous

A common misconception is that if a Promise is already fulfilled, its `.then()` callback executes synchronously. **This never happens.** The specification mandates that Promise reactions are always dispatched as microtasks.

```javascript
const resolvedPromise = Promise.resolve("Instant Value");

console.log("Before attaching .then()");

resolvedPromise.then((val) => {
  console.log("Inside callback:", val);
});

console.log("After attaching .then()");

// Console Output:
// Before attaching .then()
// After attaching .then()
// Inside callback: Instant Value
```

#### Why was this designed this way?
This avoids the **"Zälgo" bug**—a condition where an API behaves synchronously under some conditions and asynchronously under others, introducing race conditions into application state flow. Promises guarantee 100% deterministic, asynchronous callback dispatch.

### 4.3 Promise Chaining Mechanics and Unwrapping (Thenables)

Every `.then()` call returns a **brand new Promise**. The state and value of this returned promise depend entirely on the return value of the callback passed into `.then()`:

```
Step 1: Parent Promise resolves with V1.
Step 2: onFulfilled(V1) runs.
Step 3:
   Case A: Returns a raw value R2  --> Child Promise resolves with R2.
   Case B: Throws an Error E        --> Child Promise rejects with E.
   Case C: Returns a Promise P2     --> Child Promise adopts the state & value of P2.
```

```javascript
Promise.resolve(10)
  .then((num) => {
    console.log("Step 1:", num); // 10
    return num * 2;              // Returns raw value (Case A)
  })
  .then((doubled) => {
    console.log("Step 2:", doubled); // 20
    // Returning a new Promise (Case C: Thenable Unwrapping)
    return new Promise((resolve) => {
      setTimeout(() => resolve(doubled + 5), 100);
    });
  })
  .then((finalValue) => {
    console.log("Step 3 (Delayed):", finalValue); // 25
    throw new Error("Failure in pipeline!");      // Case B
  })
  .catch((err) => {
    console.error("Caught downstream error:", err.message);
    return "Recovered"; // Returns raw value, turning next promise into fulfilled!
  })
  .then((recoveryMsg) => {
    console.log("Pipeline resumed successfully:", recoveryMsg);
  });
```

### 4.4 Error Propagation and Unhandled Rejections

Rejections cascade down the promise chain until they encounter the first `.catch()` or `.then(null, onRejected)` handler:

```
Promise.reject("Critical Failure")
   |
   +--> .then(step1)         [SKIPPED]
   |
   +--> .then(step2)         [SKIPPED]
   |
   +--> .catch(errorHandler) [HANDLED HERE]
   |
   +--> .then(step3)         [RESUMES PIPELINE]
```

If an error is thrown and no rejection handler exists in the chain, the host engine emits an **`unhandledrejection`** event:
- In the browser: `window.addEventListener('unhandledrejection', event => ...)`
- In Node.js: `process.on('unhandledRejection', (reason, promise) => ...)`

---

# Module 5: Modern Asynchronous Control Flow

### 5.1 `async` / `await` Under the Hood

The `async` and `await` keywords are syntactic sugar over **Generators** and **Promises**. 

When an `async` function encounters an `await expression`, the following happens:
1. The expression is evaluated and converted into a Promise via `Promise.resolve(expression)`.
2. Execution of the `async` function is **suspended**. Its local execution context is preserved off the Call Stack.
3. A microtask is scheduled to resume the generator when the awaited Promise settles.
4. Control returns to the caller of the `async` function.

```javascript
// Native async/await:
async function fetchUserWorkflow(id) {
  console.log("Starting workflow for:", id);
  const user = await fetchUserData(id);
  console.log("Received user:", user.name);
  return user;
}
```

#### Under-the-Hood Equivalent (De-sugared into Generators & Promises):
```javascript
function fetchUserWorkflowDesugared(id) {
  return new Promise((resolve, reject) => {
    // A Generator maintains local state across yields
    function* generatorFn() {
      console.log("Starting workflow for:", id);
      const user = yield fetchUserData(id);
      console.log("Received user:", user.name);
      return user;
    }

    const iterator = generatorFn();

    // Recursive driver function handling step microtasks
    function step(verb, arg) {
      let result;
      try {
        result = iterator[verb](arg);
      } catch (err) {
        return reject(err);
      }

      const { value, done } = result;

      if (done) {
        return resolve(value);
      } else {
        // Enforce Promise conversion and schedule resumption as a microtask
        return Promise.resolve(value).then(
          (nextVal) => step("next", nextVal),
          (err) => step("throw", err)
        );
      }
    }

    step("next");
  });
}
```

### 5.2 Combinators Compared: `all`, `allSettled`, `race`, `any`

ECMAScript provides four static combinator methods on `Promise`, each designed for specific failure-tolerance strategies:

```
                                PROMISE COMBINATORS
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
    [ AND Logic ]                                                  [ OR Logic ]
         |                                                               |
  +------+------+                                                 +------+------+
  |             |                                                 |             |
all()      allSettled()                                         race()        any()
(All must  (Waits for all;                                      (First to     (First to
 fulfill)   never short-circuits)                                settle wins)  fulfill wins)
```

| Method | Resolution Condition | Rejection Condition | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **`Promise.all([...])`** | Resolves when **all** promises fulfill (returns array of results). | Rejects immediately when **any** promise rejects (short-circuit). | Dependent operations where all parts are required. |
| **`Promise.allSettled([...])`** | Resolves when **all** promises settle (either fulfilled or rejected). | **Never rejects**. Returns array of objects with `{status, value/reason}`. | Bulk independent tasks (e.g., batch analytics pings). |
| **`Promise.race([...])`** | Settles as soon as the **first** promise settles (fulfillment OR rejection). | Rejects if the first settling promise rejects. | Request timeouts and cancellation races. |
| **`Promise.any([...])`** | Resolves as soon as the **first** promise **fulfills**. | Rejects only if **all** promises reject (returns `AggregateError`). | Redundant fallback mirrors (fastest healthy replica). |

```javascript
// Demonstration of error tolerance difference:
const pGood = Promise.resolve("Server A response");
const pBad = Promise.reject("Server B timeout");

// Promise.all rejects immediately:
Promise.all([pGood, pBad])
  .then(console.log)
  .catch((err) => console.log("Promise.all failed:", err)); 
// Output: Promise.all failed: Server B timeout

// Promise.any ignores the rejection and takes the first fulfillment:
Promise.any([pGood, pBad])
  .then((val) => console.log("Promise.any succeeded:", val));
// Output: Promise.any succeeded: Server A response

// Promise.allSettled tracks both outcomes:
Promise.allSettled([pGood, pBad]).then((results) => {
  /*
  [
    { status: 'fulfilled', value: 'Server A response' },
    { status: 'rejected', reason: 'Server B timeout' }
  ]
  */
  console.log("Promise.allSettled output:", results);
});
```

### 5.3 Anti-patterns and Memory Leaks

#### Anti-Pattern 1: The `async` Executor Trap
```javascript
// DANGEROUS: Passing an async callback directly to new Promise()
new Promise(async (resolve, reject) => {
  const result = await asyncOperation();
  if (!result) {
    throw new Error("Validation Failed"); // UNCAUGHT REJECTION!
  }
  resolve(result);
});
```
*Why this fails:* The `Promise` constructor executor is synchronous. If an `async` function inside it throws after an `await`, the error is encapsulated within the unhandled promise generated by the async function itself, completely bypassing the outer `reject` trigger.

#### Anti-Pattern 2: The Unbounded Promise Queue (Memory Leak)
```javascript
// MEMORY LEAK: Holding uncleaned references in arrays
const pendingOperations = [];

function trackJob(promise) {
  pendingOperations.push(promise);
  // Array grows infinitely because resolved promises are never removed from the array!
}
```
*Fix:* Remove the promise from the tracking collection upon settlement via `.finally()`.

---

# Module 6: Comprehensive Execution Walkthroughs

### 6.1 The Tricky Multi-Queue Challenge

Analyze the following piece of JavaScript code:

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => {
    console.log("3");
  });
}, 0);

new Promise((resolve) => {
  console.log("4");
  resolve();
}).then(() => {
  console.log("5");
  setTimeout(() => {
    console.log("6");
  }, 0);
}).then(() => {
  console.log("7");
});

console.log("8");
```

#### Step-by-Step Execution Trace Table

| Step | Call Stack | Microtask Queue | Macrotask Queue | Output Printed |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `console.log("1")` | `[]` | `[]` | `1` |
| **2** | `setTimeout(fn2)` | `[]` | `[fn2]` | |
| **3** | `Promise` executor runs: `console.log("4")` | `[]` | `[fn2]` | `4` |
| **4** | `resolve()` called | `[]` | `[fn2]` | |
| **5** | `.then(fn5)` attached to resolved promise | `[fn5]` | `[fn2]` | |
| **6** | `console.log("8")` | `[fn5]` | `[fn2]` | `8` |
| **7** | *Synchronous Stack Empty! Check Microtasks.* | | | |
| **8** | Run `fn5`: `console.log("5")` | `[]` | `[fn2]` | `5` |
| **9** | Inside `fn5`: `setTimeout(fn6)` | `[]` | `[fn2, fn6]` | |
| **10**| `fn5` finishes, resolving its promise, which triggers `.then(fn7)` | `[fn7]` | `[fn2, fn6]` | |
| **11**| *Microtask Checkpoint not done yet!* Run `fn7`: `console.log("7")` | `[]` | `[fn2, fn6]` | `7` |
| **12**| *Microtasks empty! Loop picks first Macrotask (`fn2`)* | | | |
| **13**| Run `fn2`: `console.log("2")` | `[]` | `[fn6]` | `2` |
| **14**| Inside `fn2`: `Promise.resolve().then(fn3)` | `[fn3]` | `[fn6]` | |
| **15**| *Stack empty! Flush microtasks before next macrotask!* | | | |
| **16**| Run `fn3`: `console.log("3")` | `[]` | `[fn6]` | `3` |
| **17**| *Microtasks empty! Loop picks next Macrotask (`fn6`)* | | | |
| **18**| Run `fn6`: `console.log("6")` | `[]` | `[]` | `6` |

**Final Console Output:**
```text
1
4
8
5
7
2
3
6
```

---

### 6.2 Microtask Cascades in DOM Event Listeners

A classic edge case is the difference between a **user mouse click** and programmatic `.click()`.

```javascript
const button = document.createElement("button");
document.body.appendChild(button);

button.addEventListener("click", () => {
  Promise.resolve().then(() => console.log("Microtask 1"));
  console.log("Listener 1");
});

button.addEventListener("click", () => {
  Promise.resolve().then(() => console.log("Microtask 2"));
  console.log("Listener 2");
});

// Scenario A: Real User Click
// The user clicks the button on the screen.
```
**Output Scenario A (Real User Click):**
```text
Listener 1
Microtask 1
Listener 2
Microtask 2
```
*Why?* The browser dispatches each event handler as an independent task. When Listener 1 finishes, the Call Stack empties completely, triggering a **Microtask Checkpoint** before the browser moves to Listener 2.

```javascript
// Scenario B: Programmatic Dispatch
button.click();
```
**Output Scenario B (Programmatic Dispatch):**
```text
Listener 1
Listener 2
Microtask 1
Microtask 2
```
*Why?* With `.click()`, the Call Stack is not empty when Listener 1 finishes! The stack still contains `button.click()`, which immediately calls Listener 2 synchronously. Because the stack has not emptied, the microtasks cannot execute until both listeners finish!

---

# Module 7: Self-Assessment Exercises & Debugging Challenges

### Exercise 1: Build a Microtask-Based Batcher
Implement a function `batchUpdate(key, value)` that collects multiple state updates within the current synchronous turn and only flushes them to a single handler once in a microtask.

```javascript
class Batcher {
  constructor(flushCallback) {
    this.queue = new Map();
    this.isScheduled = false;
    this.flushCallback = flushCallback;
  }

  set(key, value) {
    this.queue.set(key, value);
    if (!this.isScheduled) {
      this.isScheduled = true;
      // Schedule single microtask flush
      queueMicrotask(() => {
        const snapshot = new Map(this.queue);
        this.queue.clear();
        this.isScheduled = false;
        this.flushCallback(snapshot);
      });
    }
  }
}

// Verification:
const batcher = new Batcher((batchedMap) => {
  console.log("Flushed batch with size:", batchedMap.size);
  console.log("Final name value:", batchedMap.get("name"));
});

batcher.set("name", "Alice");
batcher.set("age", 30);
batcher.set("name", "Bob"); // Overwrites Alice
console.log("Operations queued synchronously");

// Output:
// Operations queued synchronously
// Flushed batch with size: 2
// Final name value: Bob
```

### Exercise 2: Predict the Output
Trace this execution without running it:

```javascript
async function first() {
  console.log("A");
  await second();
  console.log("B");
}

async function second() {
  console.log("C");
}

console.log("D");
first();
console.log("E");
```

<details>
<summary><b>Click to View Solution & Explanation</b></summary>

**Output:**
```text
D
A
C
E
B
```

**Walkthrough:**
1. `console.log("D")` runs synchronously $\rightarrow$ `D`.
2. `first()` is called. `console.log("A")` runs $\rightarrow$ `A`.
3. `second()` is called. `console.log("C")` runs $\rightarrow$ `C`.
4. `second()` resolves. `await` wraps it in a microtask and suspends `first()`.
5. Execution returns to the global frame. `console.log("E")` runs $\rightarrow$ `E`.
6. Call Stack is now empty. The suspended `await` microtask runs, resuming `first()`.
7. `console.log("B")` runs $\rightarrow$ `B`.
</details>

---

## Key Takeaways Checklist
- [ ] JavaScript is single-threaded; execution uses a single call stack with run-to-completion guarantees.
- [ ] The Event Loop prioritizes the **Microtask Queue** over the **Macrotask Queue**.
- [ ] The Microtask Queue is drained completely until empty whenever the Call Stack clears.
- [ ] UI rendering occurs between macrotask cycles, but never during microtask queue drainage.
- [ ] Unbounded microtask recursion starves both rendering and macrotask execution.
- [ ] Promise callbacks are always queued as microtasks, even when attached to already-settled promises.
- [ ] `async`/`await` is syntax sugar for coroutine generators paired with Promise microtasks.