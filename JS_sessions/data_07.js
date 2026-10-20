export const checklistData = [
  {
    id: 1,
    task: "JavaScript Concurrency & Runtime Architecture",
    completed: false,
    subitems: [
      { id: 101, task: "Single-threaded model & execution contexts", completed: false },
      { id: 102, task: "Call Stack (LIFO) and Memory Heap mechanics", completed: false },
      { id: 103, task: "Stack frames and Stack Overflow scenarios", completed: false },
      { id: 104, task: "Host environments & offloading: Web APIs vs. Node.js Libuv", completed: false }
    ],
  },
  {
    id: 2,
    task: "The Event Loop Execution Model",
    completed: false,
    subitems: [
      { id: 201, task: "Event Loop turn algorithm and invariant lifecycle", completed: false },
      { id: 202, task: "Task (Macrotask) Queue mechanics & FIFO ordering", completed: false },
      { id: 203, task: "Microtask Queue mechanics and drain-to-empty rule", completed: false },
      { id: 204, task: "Rendering pipeline: Style, Layout, Paint interleaving & 16.6ms window", completed: false },
      { id: 205, task: "requestAnimationFrame vs. setTimeout rendering behavior", completed: false }
    ],
  },
  {
    id: 3,
    task: "Microtasks Deep Dive & Advanced Mechanics",
    completed: false,
    subitems: [
      { id: 301, task: "Sources of microtasks: Promises, queueMicrotask(), MutationObserver", completed: false },
      { id: 302, task: "Explicit scheduling with queueMicrotask() API", completed: false },
      { id: 303, task: "Microtask starvation (Event Loop freeze & thread starvation)", completed: false },
      { id: 304, task: "Node.js specifics: process.nextTick vs. Promise microtasks", completed: false }
    ],
  },
  {
    id: 4,
    task: "JavaScript Promises Internals & Lifecycle",
    completed: false,
    subitems: [
      { id: 401, task: "Promise internal states: [[PromiseState]] and [[PromiseResult]]", completed: false },
      { id: 402, task: "Internal reaction records: [[PromiseFulfillReactions]] & [[PromiseRejectReactions]]", completed: false },
      { id: 403, task: "State immutability after resolution (settled invariant)", completed: false },
      { id: 404, task: "Chaining & unwrapping thenables (Promise Resolution Procedure)", completed: false },
      { id: 405, task: "Error propagation, bubbling, and unhandledrejection events", completed: false }
    ],
  },
  {
    id: 5,
    task: "Promise Combinators & Modern Async Patterns",
    completed: false,
    subitems: [
      { id: 501, task: "Promise.all() (fail-fast behavior and empty array edge case)", completed: false },
      { id: 502, task: "Promise.allSettled() (structure and handling comprehensive results)", completed: false },
      { id: 503, task: "Promise.race() (first settled winner behavior)", completed: false },
      { id: 504, task: "Promise.any() (first fulfilled winner & AggregateError)", completed: false },
      { id: 505, task: "Async/await syntactic sugar and Generator / Coroutine desugaring", completed: false }
    ],
  },
  {
    id: 6,
    task: "Complex Execution Tracing & Edge Cases",
    completed: false,
    subitems: [
      { id: 601, task: "Step-by-step tracing with combined synchronous, micro, and macro tasks", completed: false },
      { id: 602, task: "DOM Event cascade: browser dispatch vs. element.click() stack interleaving", completed: false },
      { id: 603, task: "Common anti-patterns: Explicit Promise Construction Antipattern & broken chains", completed: false }
    ],
  }
];
