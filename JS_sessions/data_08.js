export const checklistData = [
  {
    id: 1,
    task: "TypeScript Ecosystem & Runtime Philosophy",
    completed: false,
    subitems: [
      { id: 101, task: "Dynamic vs. Static typing: trade-offs and runtime errors in JavaScript", completed: false },
      { id: 102, task: "TypeScript as a typed superset: design goals and zero runtime overhead", completed: false },
      { id: 103, task: "Compilation pipeline: Type checking, AST parsing, and Type Erasure", completed: false },
      { id: 104, task: "Modern development toolchain: local devDependencies, npx tsc, and tsx/ts-node runtimes", completed: false }
    ],
  },
  {
    id: 2,
    task: "Primitive Data Types & Type Assignment",
    completed: false,
    subitems: [
      { id: 201, task: "Type annotation syntax (: Type) and compile-time error assignment", completed: false },
      { id: 202, task: "Core primitives: number, string, boolean, bigint, symbol", completed: false },
      { id: 203, task: "Nullish semantics: null vs. undefined behavior in TypeScript", completed: false },
      { id: 204, task: "Type safety hazards: the any escape hatch and implicit any penalties", completed: false },
      { id: 205, task: "Safe arbitrary values: unknown vs. any and forced type guards", completed: false }
    ],
  },
  {
    id: 3,
    task: "Composite Types: Objects, Arrays & Tuples",
    completed: false,
    subitems: [
      { id: 301, task: "Object shape typing, excess property checks, and optional properties (?)", completed: false },
      { id: 302, task: "Array typing (T[] vs. Array<T>) and multi-dimensional matrices", completed: false },
      { id: 303, task: "Tuple types: fixed length, positional typing, and push() mutation pitfalls", completed: false },
      { id: 304, task: "Immutable arrays & tuples: readonly modifier and const assertions (as const)", completed: false },
      { id: 305, task: "Array and Object destructuring with strict TypeScript inference", completed: false }
    ],
  },
  {
    id: 4,
    task: "Functions, Control Flow & Terminal Types",
    completed: false,
    subitems: [
      { id: 401, task: "Function signature typing: explicit parameter and return value annotations", completed: false },
      { id: 402, task: "The void type: functions without return values vs. undefined", completed: false },
      { id: 403, task: "The never type: unreachable code, infinite loops, and exhaustive checks", completed: false },
      { id: 404, task: "Optional and default parameters with typing rules", completed: false }
    ],
  },
  {
    id: 5,
    task: "Union Types, Literals & Type Narrowing",
    completed: false,
    subitems: [
      { id: 501, task: "Union types (|) and primitive literal types for restricted domains", completed: false },
      { id: 502, task: "Enums vs. String Literal Unions: runtime footprint and modern best practices", completed: false },
      { id: 503, task: "Type Narrowing mechanics: typeof, truthiness, and equality guards", completed: false },
      { id: 504, task: "Discriminated Unions: common discriminant properties and pattern handling", completed: false },
      { id: 505, task: "Reusable type definitions: type aliases vs. interface basics", completed: false }
    ],
  },
  {
    id: 6,
    task: "tsconfig.json Architecture & Compiler Configuration",
    completed: false,
    subitems: [
      { id: 601, task: "Project root context, tsc --init, and file resolution (include, exclude, files)", completed: false },
      { id: 602, task: "Compilation targets & module formats: target vs. module vs. moduleResolution", completed: false },
      { id: 603, task: "The strict suite: noImplicitAny, strictNullChecks, and strictFunctionTypes", completed: false },
      { id: 604, task: "Build workflows & emit control: noEmit, declaration files (.d.ts), and sourceMap", completed: false },
      { id: 605, task: "Clean imports & module aliasing: baseUrl and paths configuration", completed: false }
    ],
  }
];
