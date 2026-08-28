# Bootstrap in 60 Minutes — Session Plan

**Audience:** Students new to CSS frameworks (basic HTML/CSS knowledge assumed)
**Goal:** Understand *why* Bootstrap exists (philosophy), then get hands-on with the grid, mobile-first thinking, and a responsive navbar with a hamburger menu.
**Format:** Live coding / follow-along. Have a simple `index.html` with the Bootstrap CDN already linked, ready to project.

---

## Timing Overview

| # | Segment | Time |
|---|---------|------|
| 1 | Hook + What problem does Bootstrap solve? | 5 min |
| 2 | The Philosophy of Bootstrap | 10 min |
| 3 | Setup (CDN, boilerplate) | 5 min |
| 4 | The Grid System & Responsive Design | 15 min |
| 5 | Mobile-First, live demo | 10 min |
| 6 | Navbar + Hamburger Menu | 10 min |
| 7 | Quick tour: components & utilities | 3 min |
| 8 | Wrap-up + Q&A | 2 min |

---

## 1. Hook: What Problem Does Bootstrap Solve? (5 min)

Open with a question: *"How long would it take you to build a page that looks good on a phone, a tablet, AND a desktop — with a working navigation menu — from scratch?"*

Show two things side by side:
- A raw, unstyled HTML page (ugly, not responsive).
- The same content styled with Bootstrap (clean, responsive) — resize the browser window live to show it adapt.

**Key line to say:** *"Bootstrap doesn't write your website for you — it gives you a shared vocabulary and pre-built LEGO bricks so you don't reinvent the wheel every time."*

---

## 2. The Philosophy of Bootstrap (10 min)

Present these as the four pillars. Write them on the board/slide as you go.

### a) Mobile-First
Bootstrap's CSS is written *starting* from the smallest screen, then adding rules for bigger screens via `min-width` media queries. This forces developers to think about the essential content first, then progressively enhance — rather than cramming a desktop layout into a phone as an afterthought.

### b) Responsive by Default
Everything (grid, images, navbars, typography) is built to reflow automatically across breakpoints (`sm`, `md`, `lg`, `xl`, `xxl`). You describe *intent* ("this column takes 4/12 on medium screens and up"), not pixel-perfect positioning.

### c) Component-Based / "Don't Reinvent the Wheel"
Common UI patterns (buttons, cards, modals, navbars, alerts) are pre-built, accessible, and cross-browser tested. You compose pages out of these instead of writing CSS from zero.

### d) Utility-First Convenience
Alongside components, Bootstrap ships small, single-purpose utility classes (`d-flex`, `mt-3`, `text-center`, `p-2`) so you can make small styling tweaks directly in HTML without writing custom CSS.

**Discussion prompt (1 min):** *"What's the trade-off of using a framework like this?"* → Guide toward: faster development & consistency, but less unique visual identity and some extra file weight if unused.

---

## 3. Setup (5 min)

Show the minimal boilerplate — no build tools needed, just CDN links.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- This meta tag IS the mobile-first philosophy in one line -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bootstrap Demo</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

  <h1 class="text-center mt-4">Hello, Bootstrap!</h1>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

**Call out explicitly:** the `<meta name="viewport">` tag. Without it, none of the responsive behavior works — it's the bridge between the philosophy and the code.

---

## 4. The Grid System & Responsive Design (15 min)

Explain the mental model first: **12 columns per row.** You decide how many of those 12 columns each element takes, and that number can change per breakpoint.

```html
<div class="container">
  <div class="row">
    <div class="col-12 col-md-4 bg-primary text-white p-3">Column 1</div>
    <div class="col-12 col-md-4 bg-secondary text-white p-3">Column 2</div>
    <div class="col-12 col-md-4 bg-success text-white p-3">Column 3</div>
  </div>
</div>
```

Walk through it out loud:
- `col-12` → "on extra-small screens, take the full width (stack vertically)."
- `col-md-4` → "on medium screens and up, take 4 of 12 columns (three side by side)."

**Live demo:** resize the browser window slowly and watch the columns stack/unstack. This is the single most powerful "aha" moment of the session — spend real time here.

**Breakpoint cheat sheet (show as a table):**

| Breakpoint | Prefix | Min width |
|---|---|---|
| Extra small | *(none)* | <576px |
| Small | `sm` | ≥576px |
| Medium | `md` | ≥768px |
| Large | `lg` | ≥992px |
| Extra large | `xl` | ≥1200px |

---

## 5. Mobile-First, Live Demo (10 min)

Reinforce the philosophy with the grid you just built:

- Start with dev tools in mobile view (or a narrow browser window). Point out: *"The default classes (`col-12`) are what apply here — the base, smallest case."*
- Widen the window / switch to desktop view. Point out: *"Now `col-md-4` kicks in and overrides the layout, because we crossed the `md` breakpoint."*

**Key line:** *"You're not writing 'if desktop, do X.' You're writing rules that apply from a breakpoint upward. That's mobile-first: small screen is the default, bigger screens are the exception you opt into."*

Optional quick contrast: show what a "desktop-first" approach would look like (base styles for desktop, then `max-width` media queries to override for mobile) — just to make the difference concrete.

---

## 6. Navbar + Hamburger Menu (10 min)

This ties everything together: components + responsiveness + mobile-first in one real pattern.

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">MySite</a>

    <!-- The hamburger button: only visible below the "lg" breakpoint -->
    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#navMenu">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
      </ul>
    </div>
  </div>
</nav>
```

Explain the pieces:
- `navbar-expand-lg` → *"Show the full menu on large screens and up; below that, collapse it."* This is mobile-first in action again — collapsed/hamburger is the default (small-screen) state.
- `navbar-toggler` + `data-bs-toggle="collapse"` → Bootstrap's JavaScript (no custom code needed) handles opening/closing.
- `ms-auto` → utility class pushing the nav links to the right.

**Live demo:** resize the window and watch the full menu collapse into the hamburger icon, then click it to show it opens/closes.

---

## 7. Quick Tour: Components & Utilities (3 min)

Flash through a few more building blocks quickly (don't over-explain — just show they exist):

```html
<button class="btn btn-primary">Click me</button>

<div class="card" style="width: 18rem;">
  <div class="card-body">
    <h5 class="card-title">Card Title</h5>
    <p class="card-text">Some quick example text.</p>
  </div>
</div>

<div class="alert alert-warning">This is an alert!</div>
```

**Point out:** all of these are already responsive and accessible out of the box — that's the "don't reinvent the wheel" philosophy paying off.

---

## 8. Wrap-Up + Q&A (2 min)

Recap in one sentence each:
1. **Mobile-first** — design for small screens, scale up.
2. **Grid system** — 12 columns, responsive by breakpoint.
3. **Components** — pre-built, tested UI pieces (like the navbar/hamburger).
4. **Utilities** — small classes for quick styling tweaks.

**Suggested homework/next step:** Give students the boilerplate + grid code and ask them to build a 3-column "About Me" page that stacks on mobile and sits side-by-side on desktop, with a navbar at the top.

---

## Notes for the Instructor

- Keep a browser window with dev tools' device toolbar open the whole session — resizing live is more convincing than any slide.
- If short on time, the segments you can compress are #7 (component tour) and #3 (setup) — the grid (#4) and navbar (#6) are the ones worth protecting.
- Common student confusion point: mixing up `col-md-4` (applies from md *and up*) vs. thinking it only applies *at* md. Clarify with the breakpoint table.

---

# Appendix: Glossary of CSS Classes Used

A quick-reference sheet for every Bootstrap class used in this lesson, grouped by section. Hand this out alongside the plan or keep it open while live-coding.

## Layout / Grid

| Class | What it does |
|---|---|
| `container` | Centers content and adds responsive side padding; width adjusts at each breakpoint. |
| `container-fluid` | Like `container`, but always 100% width at every breakpoint. |
| `row` | A horizontal wrapper for columns; adds negative margin to offset column padding. |
| `col-12` | Column takes all 12 of 12 grid units (full width) — applies from the smallest screen up. |
| `col-md-4` | Column takes 4 of 12 grid units, starting at the `md` breakpoint (≥768px) and up. |

## Spacing Utilities

Bootstrap spacing classes follow the pattern `{property}{sides}-{size}`.
- Property: `m` (margin) or `p` (padding)
- Sides: `t` (top), `b` (bottom), `s` (start/left), `e` (end/right), `x` (left+right), `y` (top+bottom), or none (all sides)
- Size: `0`–`5` (increasing scale) or `auto`

| Class | What it does |
|---|---|
| `p-3` | Padding on all sides, size 3 (1rem / 16px). |
| `mt-4` | Margin-top, size 4 (1.5rem / 24px). |

## Color / Background Utilities

| Class | What it does |
|---|---|
| `bg-primary` | Sets background color to the theme's primary color (blue by default). |
| `bg-secondary` | Sets background color to the theme's secondary color (gray by default). |
| `bg-success` | Sets background color to the theme's "success" color (green by default). |
| `bg-dark` | Sets background color to dark/near-black. |
| `text-white` | Sets text color to white — commonly paired with dark backgrounds for contrast. |

## Text Utilities

| Class | What it does |
|---|---|
| `text-center` | Centers text horizontally. |

## Buttons

| Class | What it does |
|---|---|
| `btn` | Base button class — required on every Bootstrap button; provides padding, border-radius, cursor styling. |
| `btn-primary` | Applies the theme's primary color styling on top of `.btn`. |

## Cards

| Class | What it does |
|---|---|
| `card` | Container with a border, rounded corners, and padding — the base wrapper for card components. |
| `card-body` | Adds internal padding around the card's content. |
| `card-title` | Styles an element (usually a heading) as the card's title (adjusts margin/weight). |
| `card-text` | Removes default bottom margin from paragraphs inside a card for consistent spacing. |

## Alerts

| Class | What it does |
|---|---|
| `alert` | Base alert class — adds padding, border, and rounded corners. |
| `alert-warning` | Applies yellow/warning color scheme on top of `.alert`. |

## Navbar

| Class | What it does |
|---|---|
| `navbar` | Base class for the navigation bar component. |
| `navbar-expand-lg` | Navbar displays full/uncollapsed starting at the `lg` breakpoint (≥992px); below that, it collapses into the hamburger menu. |
| `navbar-dark` | Adjusts navbar text/icon colors for use on a dark background. |
| `navbar-brand` | Styles the site logo/name link in the navbar (larger text, specific spacing). |
| `navbar-toggler` | Styles the hamburger button itself (border, padding, focus state). |
| `navbar-toggler-icon` | The hamburger icon graphic shown inside the toggler button. |
| `navbar-nav` | Styles a `<ul>` as a navbar's list of navigation links (removes bullets, adjusts flex layout). |
| `nav-item` | Wraps each `<li>` in a navbar list; mostly a semantic/spacing hook. |
| `nav-link` | Styles an `<a>` as a navigation link (padding, color, hover state). |
| `collapse` | Marks an element as collapsible — hidden by default, shown when toggled. |
| `navbar-collapse` | Combines with `collapse`; specifically handles the collapsing behavior of navbar content on small screens. |
| `ms-auto` | Margin-start: auto — pushes the element (and everything after it) to the right in a flex container. |

## Bootstrap Data Attributes (not CSS classes, but used alongside them)

| Attribute | What it does |
|---|---|
| `data-bs-toggle="collapse"` | Tells Bootstrap's JavaScript that clicking this element should toggle a collapsible element. |
| `data-bs-target="#navMenu"` | Specifies *which* element (by ID) gets toggled when this button is clicked. |
