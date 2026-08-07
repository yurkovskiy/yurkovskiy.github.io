// data.js
export const checklistData = [
    { 
        id: 1, 
        task: "0. Previous Session Fast Review", 
        completed: false,
    },
    { 
        id: 2, 
        task: "1. Functions", 
        completed: false,
        subitems: [
            { id: 201, task: "Function declaration", completed: false },
            { id: 202, task: "Function expression", completed: false },
            { id: 203, task: "Arrow Functions", completed: false }
        ]
    },
    { 
        id: 3, 
        task: "2. Data Structures", 
        completed: false,
        subitems: [
            { id: 301, task: "Array", completed: false },
            { id: 302, task: "String*", completed: false },
            { id: 303, task: "Object (Hash, Hash Tables)", completed: false }
        ]
    },
    { 
        id: 4, 
        task: "3. Control Flow",
        completed: false,
        subitems: [
            { id: 401, task: "if ... else", completed: false },
            { id: 402, task: "switch ... case", completed: false },
            { id: 403, task: "[Pre-condition cycle]: while()", completed: false },
            { id: 404, task: "[Pre-condition cycle]: for()", completed: false },
            { id: 405, task: "[Post-condition cycle]: do ... while()", completed: false }
        ]
    },
];
