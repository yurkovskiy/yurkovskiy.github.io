export const checklistData = [
  {
    id: 1,
    task: "Classes, Encapsulation & Access Modifiers",
    completed: false,
    subitems: [
      { id: 101, task: "Class anatomy: fields, methods, constructor, and readonly modifier", completed: false },
      { id: 102, task: "Access modifiers: public, protected, and TypeScript compile-time private", completed: false },
      { id: 103, task: "Hard privacy: ECMAScript private fields (#field) vs. private keyword", completed: false },
      { id: 104, task: "Parameter properties syntax (concise constructor initialization)", completed: false },
      { id: 105, task: "Accessors (getters / setters) and business invariant validation", completed: false }
    ],
  },
  {
    id: 2,
    task: "Interfaces as Architectural Contracts",
    completed: false,
    subitems: [
      { id: 201, task: "Interface contracts: defining data shapes and method signatures", completed: false },
      { id: 202, task: "Contract implementation: implementing single and multiple interfaces (implements)", completed: false },
      { id: 203, task: "Interface inheritance and composition using the extends keyword", completed: false },
      { id: 204, task: "Structural typing (duck typing) and shape compatibility rules", completed: false },
      { id: 205, task: "Separation of concerns: Interface Segregation Principle (ISP)", completed: false }
    ],
  },
  {
    id: 3,
    task: "Abstract Classes & Classical Inheritance",
    completed: false,
    subitems: [
      { id: 301, task: "Abstract classes anatomy: preventing direct instantiation via new", completed: false },
      { id: 302, task: "Abstract methods vs. concrete methods with default implementations", completed: false },
      { id: 303, task: "Subclassing and super() constructor / method delegating calls", completed: false },
      { id: 304, task: "The Template Method pattern implemented via abstract base classes", completed: false },
      { id: 305, task: "Abstract Class vs. Interface: trade-offs, runtime emit, and use cases", completed: false }
    ],
  },
  {
    id: 4,
    task: "Generics in Object-Oriented Programming",
    completed: false,
    subitems: [
      { id: 401, task: "Generic classes: parameterized types (class Storage<T>)", completed: false },
      { id: 402, task: "Generic constraints: restricting type parameters using extends (T extends Entity)", completed: false },
      { id: 403, task: "Generic interfaces: defining reusable contracts (IRepository<T, ID>)", completed: false },
      { id: 404, task: "Default generic parameters and multiple type arguments", completed: false }
    ],
  },
  {
    id: 5,
    task: "Architectural Patterns & Composition over Inheritance",
    completed: false,
    subitems: [
      { id: 501, task: "Dependency Inversion: depending on interfaces rather than concrete classes", completed: false },
      { id: 502, task: "Generic Repository Pattern: implementing type-safe in-memory/DB stores", completed: false },
      { id: 503, task: "Service Layer pattern: encapsulation of domain and business logic", completed: false },
      { id: 504, task: "Composition over Inheritance: delegating responsibilities via components", completed: false }
    ],
  },
  {
    id: 6,
    task: "Advanced OOP Mechanics & Edge Cases",
    completed: false,
    subitems: [
      { id: 601, task: "Static members (static properties/methods) and factory methods", completed: false },
      { id: 602, task: "Polymorphism and method overriding in derived classes", completed: false },
      { id: 603, task: "Class expressions and anonymous class declarations", completed: false },
      { id: 604, task: "Compile-time type erasure: why interfaces vanish in compiled JS", completed: false }
    ],
  }
];
