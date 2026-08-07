// data.js
export const checklistData = [
    {
    id: 1, 
        task: "Events Intro",
        completed: false,
        subitems: [
            { id: 101, task: "Event Definition", completed: false },
            { id: 102, task: "Phases of Event: Capturing / Bubbling", completed: false },
            { id: 103, task: "Event Listeners: addEventListener() / removeEventListener()", completed: false },
            { id: 104, task: "The Event Object", completed: false },
            { id: 105, task: "Default Events", completed: false },
            { id: 106, task: "Cancel Bubbling: stopPropagation()", completed: false },
        ],
    },
    {
    id: 2, 
        task: "Mouse Events", 
        completed: false,
        subitems: [
            { id: 201, task: "click", completed: false },
            { id: 202, task: "dblclick", completed: false },
            { id: 203, task: "mouseup / mousedown", completed: false },
            { id: 204, task: "mouseover / mouseout", completed: false },
            { id: 205, task: "mousemove", completed: false }
        ]
    },
    { 
        id: 3, 
        task: "Keyboard Events", 
        completed: false,
        subitems: [
            {id: 301, task: "keydown / keyup", completed: false },
            {id: 302, task: "keypress", completed: false }
        ]
    },
    {
    id: 4, 
        task: "Load Events", 
        completed: false,
        subitems: [
            { id: 401, task: "DOMContentLoaded", completed: false },
            { id: 402, task: "load", completed: false }
        ]
    },
    {
    id: 5, 
        task: "Timer Functions", 
        completed: false,
        subitems: [
            { id: 501, task: "setTimeout() / clearTimeout()", completed: false },
            { id: 502, task: "setInterval() / clearInterval()", completed: false }
        ]
    },
];
