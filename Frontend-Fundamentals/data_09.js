// data.js
export const checklistData = [
    { 
        id: 1, 
        task: "OOP Intro", 
        completed: false,
        subitems: [
            { id: 101, task: "Encapsulation. Inheritance. Polymorphism", completed: false }
        ],
    },
    {
    id: 2, 
        task: "JavaScript Objects", 
        completed: false,
        subitems: [
            { id: 201, task: "access to properties", completed: false },
            { id: 202, task: "methods", completed: false },
            { id: 203, task: "this keyword", completed: false },
            { id: 204, task: "creating objects", completed: false }
        ],
    },
    {
    id: 3, 
        task: "JavaScript Classes", 
        completed: false,
        subitems: [
            { id: 301, task: "Static methods & properties", completed: false },
            { id: 302, task: "Getters / Setters", completed: false },
            { id: 303, task: "Inheritance", completed: false },
            { id: 304, task: "super keyword", completed: false },
            { id: 305, task: "polymorphism", completed: false },
            { id: 306, task: "encapsulation", completed: false },
        ]
    },
    { 
        id: 4, 
        task: "JS Warrior Game", 
        completed: false,
    },
    {
    id: 5, 
        task: "JS Document Object Model", 
        completed: false,
        subitems: [
            { id: 501, task: "Getting DOM Node", completed: false },
            { id: 502, task: "Creating DOM Node", completed: false },
            { id: 503, task: "Adding to the BODY", completed: false }
        ]
    },
];
