// data.js
export const checklistData = [
    {
    id: 1, 
        task: "Back- / Front- remainder",
        completed: false,
        subitems: [
            { id: 101, task: "Back-end (Server-side)", completed: false },
            { id: 102, task: "Front-end (Client-side)", completed: false },
        ],
    },
    {
    id: 2, 
        task: "Asynchronous JavaScript and XML (AJAX)",
        completed: false,
        subitems: [
            { id: 201, task: "Idea (definition). Jessy James Garret Scheme", completed: false },
            { id: 202, task: "XMLHttpRequest (XHR) Object", completed: false },
            { id: 203, task: "XHR methods: open() send()", completed: false },
            { id: 204, task: "XHR readystate Property", completed: false },
            { id: 205, task: "XHR onreadystatechange Event", completed: false },
            { id: 206, task: "XHR responseText and responseXML properties", completed: false }
        ],
    },
    {
    id: 3, 
        task: "Fetch API intro",
        completed: false,
    }
];
