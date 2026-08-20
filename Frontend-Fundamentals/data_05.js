// data.js
export const checklistData = [
    { 
        id: 1, 
        task: "0. Fast Review Previous Session", 
        completed: false,
        subitems: [
            { id: 101, task: "CSS: purpose, selectors, weight of selectors", completed: false },
            { id: 102, task: "Position property", completed: false }
        ]
    },
    { 
        id: 2, 
        task: "1. Responsive Web Design (RWD)", 
        completed: false,
        subitems: [
            { id: 201, task: "Responsive vs Adaptive Web Design ", completed: false },
            { id: 202, task: "CSS Media Queries", completed: false }
        ]
    },
    { 
        id: 3, 
        task: "2. FLEX Box", 
        completed: false,
        subitems: [
            { id: 301, task: "Flex Box purpose and features", completed: false },
            { id: 302, task: "Main- / Cross- axis", completed: false },
            { id: 303, task: "properties: flex-wrap, justify-content, align-self, order", completed: false },
            { id: 304, task: "properties: flex-grow, flex-shrink, flex-direction, gap/flex-gap", completed: false }
        ]
    }
];
