// data.js
export const checklistData = [
    {
        id: 1,
        task: "0. Fast Review Previous Session",
        completed: false,
        subitems: [
            {
                id: 101,
                task: "CSS: purpose, selectors, weight of selectors",
                completed: false,
            },
            { id: 102, task: "Position property", completed: false },
        ],
    },
    {
        id: 2,
        task: "Foundations of Responsive Web Design (RWD) & Adaptive Layouts",
        completed: false,
        subitems: [
            {
                id: 201,
                task: "The multi-screen dilemma: supporting 320px, 768px, 1024px+ viewports",
                completed: false,
            },
            {
                id: 202,
                task: "Responsive vs. Adaptive design: single reflowing fluid grid vs. distinct device templates",
                completed: false,
            },
            {
                id: 203,
                task: "Core RWD principles: fluid grids, flexible images, and media query breakpoints",
                completed: false,
            },
            {
                id: 204,
                task: 'Viewport meta tag configuration (<meta name="viewport" content="width=device-width, initial-scale=1.0">)',
                completed: false,
            },
        ],
    },
    {
        id: 3,
        task: "CSS Media Types & Declaration Strategies",
        completed: false,
        subitems: [
            {
                id: 301,
                task: "Target media categories: screen, print, all, and legacy types (handheld, tv, projection)",
                completed: false,
            },
            {
                id: 302,
                task: 'Method #1: HTML <link> element with media attribute (<link rel="stylesheet" media="screen" />)',
                completed: false,
            },
            {
                id: 303,
                task: "Method #2: HTML <style> tag scoped with media attribute",
                completed: false,
            },
            {
                id: 304,
                task: "Method #3: CSS @import rule with media targets (@import url(...) screen)",
                completed: false,
            },
            {
                id: 305,
                task: "Method #4: In-file conditional blocks using the @media at-rule",
                completed: false,
            },
        ],
    },
    {
        id: 4,
        task: "CSS Media Queries Syntax & Logical Operators",
        completed: false,
        subitems: [
            {
                id: 401,
                task: "Anatomy of a media query: media type, logical operators, and media feature expressions",
                completed: false,
            },
            {
                id: 402,
                task: "Implicit media type resolution: defaulting to 'all' when omitted",
                completed: false,
            },
            {
                id: 403,
                task: "Combining conditions with the 'and' operator",
                completed: false,
            },
            {
                id: 404,
                task: "Alternative conditions using comma-separated queries ('or' logic)",
                completed: false,
            },
            {
                id: 405,
                task: "Negation rules using the 'not' keyword and evaluation order",
                completed: false,
            },
        ],
    },
    {
        id: 5,
        task: "Media Features & Viewport Characteristics",
        completed: false,
        subitems: [
            {
                id: 501,
                task: "Viewport dimensions: width, height, and min-/max- range prefixes",
                completed: false,
            },
            {
                id: 502,
                task: "Aspect ratio and device orientation: (orientation: portrait | landscape)",
                completed: false,
            },
            {
                id: 503,
                task: "Color depth, resolution (dpi/dppx), and monochrome capabilities",
                completed: false,
            },
            {
                id: 504,
                task: "Display update frequency (update: fast | slow) and scripting detection (scripting: enabled)",
                completed: false,
            },
            {
                id: 505,
                task: "Modern Media Queries Level 4 syntax: range syntax ((width >= 768px)) vs. min-width",
                completed: false,
            },
        ],
    },
    {
        id: 6,
        task: "6. FLEX Box",
        completed: false,
        subitems: [
            { id: 601, task: "Flex Box purpose and features", completed: false },
            { id: 602, task: "Main- / Cross- axis", completed: false },
            {
                id: 603,
                task: "properties: flex-wrap, justify-content, align-self, order",
                completed: false,
            },
            {
                id: 604,
                task: "properties: flex-grow, flex-shrink, flex-direction, gap/flex-gap",
                completed: false,
            },
        ],
    },
];
