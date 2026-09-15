// data.js
export const checklistData = [
    { 
        id: 1, 
        task: "Debugging", 
        completed: false,
        subitems: [
            { id: 101, task: "JS Debugging techniques", completed: false }
        ],
    },
    {
        id: 2,
        task: "Error types",
        completed: false
    },
    {
        id: 3,
        task: "Errors and Exceptions Handling",
        completed: false,
        subitems: [
            { id: 301, task: "Error Object", completed: false },
            { id: 302, task: "Block: try .. catch", completed: false },
            { id: 303, task: "throw", completed: false },
            { id: 304, task: "Block: try .. catch .. finally", completed: false }
        ]
    },
    {
        id: 4,
        task: "Memory management",
        completed: false
    }
];
