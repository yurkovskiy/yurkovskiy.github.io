// data.js
export const checklistData = [
    { 
        id: 1, 
        task: "How the work will be organized", 
        completed: false,
        subitems: [
            { id: 101, task: "Sessions: 2 times per WEEK", completed: false },
            { id: 102, task: "Timing: ~2 hours per SESSION", completed: false },
            { id: 103, task: "Format: Lecture / Practice / Discussions", completed: false },
            { id: 104, task: "Communication: Discord / Zoom / Google Drive", completed: false }
        ],
    },
    { 
        id: 2, 
        task: "What is needed", 
        completed: false,
        subitems: [
            { id: 201, task: "Equipment: PC / Laptop / Any Device for coding", completed: false },
            { id: 202, task: "Mental: Motivation / Working Discipline :)", completed: false },
        ],
    },
    {
        id: 3,
        task: "What tools needed",
        completed: false,
        subitems: [
            { id: 301, task: "Operation System: Linux Family, Windows, macOS", completed: false },
            { id: 302, task: "Editor / IDE: VS Code, Sublime Text, Vim, WebStorm, .....", completed: false },
            { id: 303, task: "Version Control System: git", completed: false },
            { id: 304, task: "Version Control System [Remote / PaaS]: GitHub account", completed: false },
            { id: 305, task: "Neural Networks [AI] account: Claude, Gemini, OpenAI", completed: false }
        ]
    }
];
