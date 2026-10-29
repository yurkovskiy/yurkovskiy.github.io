export const checklistData = [
  {
    id: 1,
    task: "General Purpose of AJAX & Asynchronous Web Architecture",
    completed: false,
    subitems: [
      { id: 101, task: "Evolution of web requests: synchronous page reload vs. asynchronous AJAX model", completed: false },
      { id: 102, task: "Client-server decoupled architecture and JSON serialization lifecycle", completed: false },
      { id: 103, task: "Static compilation vs. dynamic external boundary: type safety challenges", completed: false },
      { id: 104, task: "Browser network pipelines, CORS fundamentals, and security constraints", completed: false }
    ],
  },
  {
    id: 2,
    task: "XMLHttpRequest (XHR) Deep Dive & TypeScript Wrappers",
    completed: false,
    subitems: [
      { id: 201, task: "XHR lifecycle states (readyState 0-4) and onreadystatechange callbacks", completed: false },
      { id: 202, task: "Upload progress tracking (xhr.upload.onprogress) and binary stream support", completed: false },
      { id: 203, task: "Promisification: wrapping legacy XHR into typed Promise<T> signatures", completed: false },
      { id: 204, task: "XHR error handling: onerror vs. ontimeout vs. HTTP status validation", completed: false }
    ],
  },
  {
    id: 3,
    task: "Modern Fetch API & Execution Mechanics",
    completed: false,
    subitems: [
      { id: 301, task: "Fetch API core architecture: Request, Response, and Headers interfaces", completed: false },
      { id: 302, task: "HTTP failure semantics: why fetch does not reject on 4xx/5xx status codes", completed: false },
      { id: 303, task: "Response consumption methods: response.json(), text(), blob(), and arrayBuffer()", completed: false },
      { id: 304, task: "Request lifecycle control: AbortController and AbortSignal for timeouts & cancellations", completed: false }
    ],
  },
  {
    id: 4,
    task: "Static Typing of External API Contracts",
    completed: false,
    subitems: [
      { id: 401, task: "Contract design: defining robust DTO interfaces and Query/Body params", completed: false },
      { id: 402, task: "Nullable vs. optional fields in API payloads (null vs. undefined)", completed: false },
      { id: 403, task: "The illusion of type safety: response.json() as Promise<any>", completed: false },
      { id: 404, task: "Type assertions (as T) hazards and compile-time boundary leaks", completed: false }
    ],
  },
  {
    id: 5,
    task: "Runtime Boundary Defense & Type Narrowing",
    completed: false,
    subitems: [
      { id: 501, task: "The unknown paradigm: treating incoming network data as unknown", completed: false },
      { id: 502, task: "User-defined Type Guards (value is T) for runtime payload verification", completed: false },
      { id: 503, task: "Array validation guards and deep schema structure checking", completed: false },
      { id: 504, task: "Structural validation libraries vs. custom guards (Zod / Valibot overview)", completed: false }
    ],
  },
  {
    id: 6,
    task: "Enterprise HttpClient Architecture & Resilient Patterns",
    completed: false,
    subitems: [
      { id: 601, task: "Generic HttpClient class implementation with unified error handling", completed: false },
      { id: 602, task: "Custom domain errors: HttpError and ApiValidationError hierarchies", completed: false },
      { id: 603, task: "Query parameter serialization with URL and URLSearchParams", completed: false },
      { id: 604, task: "Request/Response interceptors and automatic retry mechanisms", completed: false }
    ],
  }
];
