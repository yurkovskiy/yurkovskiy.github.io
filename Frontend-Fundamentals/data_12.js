// data.js
export const checklistData = [
    { 
        id: 1, 
        task: "HTML5 Storages", 
        completed: false,
        subitems: [
            { id: 101, task: "Session Storage", completed: false },
            { id: 102, task: "Local Storage", completed: false }
        ]
        
    },
    { 
        id: 2, 
        task: "Node.js Intro", 
        completed: false,
        subitems: [
            { id: 201, task: "Installation: NVM", completed: false },
            { id: 202, task: "Package management: npm, yarn, ....", completed: false }
        ]
        
    },
    {
        id: 3, 
        task: "Server-Side Development", 
        completed: false,
        subitems: [
            { id: 301, task: "HTTP Module", completed: false },
            { id: 302, task: "Simple Server", completed: false },
            { id: 303, task: "Express.js Introduction", completed: false },
        ]
    },
    {
        id: 4, 
        task: "BONUS!!!", 
        completed: false,
        subitems: [
            { id: 401, task: "Jest JS-Testing Framework", completed: false },
            { id: 402, task: "Playwright", completed: false },
        ]
    },
];
