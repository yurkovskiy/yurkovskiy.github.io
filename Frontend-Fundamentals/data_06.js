// data.js
export const checklistData = [
    { 
        id: 1, 
        task: "0. Fast Review Previous Session", 
        completed: false,
        subitems: [
            { id: 101, task: "Responsive / Adaptive Web Design", completed: false },
            { id: 102, task: "Flex Box", completed: false }
        ]
    },
    { 
        id: 2, 
        task: "1. CSS Grid Layout", 
        completed: false,
        subitems: [
            { id: 201, task: "Grid Layout purpose and features", completed: false },
            { id: 202, task: "Grid Cell, Grid Line, Grid Track, Grid Area", completed: false },
            { id: 203, task: "Fr measurement unit, repeating, properties: grid-*-gap, ", completed: false },
            { id: 204, task: "Flex vs Grid", completed: false }
        ]
    },
    { 
        id: 3, 
        task: "2. CSS Libraries / Frameworks",
        completed: false,
        subitems: [
            { id: 301, task: "Bootstrap", completed: false },
            { id: 302, task: "Tailwind CSS", completed: false },
            { id: 303, task: "Bulma / Foundation, .....", completed: false },
        ]
    }
];
