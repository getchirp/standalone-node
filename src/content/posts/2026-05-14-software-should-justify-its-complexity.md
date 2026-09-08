---
title: "Software should justify its complexity"
description: "Every dependency has to earn its place. Our framework for deciding what gets in - and the long list of things that didn't."
date: 2026-05-14
category: philosophy
author: Chirp Team
tags: [philosophy, architecture, dependencies, complexity]
---

Every software project accumulates complexity. Dependencies, abstractions, configuration layers - each one added for a reason that made sense at the time. The question isn't whether complexity appears; it's whether it earns its keep.

At Chirp, we maintain a living document called "The Justification List." Every significant dependency, abstraction, or architectural decision has to answer three questions. If it can't, it doesn't ship.

## The three questions

**1. What problem does this solve that we actually have?**

This eliminates speculative complexity. "We might need a message queue someday" is not a problem we actually have. "Our build takes 12 minutes and we deploy 8 times a day" is. The distinction matters because solving hypothetical problems creates real maintenance burden.

**2. What would break if we removed it?**

If the answer is "nothing" or "we'd just write 40 lines of vanilla code instead," the dependency doesn't belong. The best dependency is the one you can delete without anyone noticing.

**3. Who maintains this, and what happens when they stop?**

Every external dependency is a bet on someone else's continued interest in maintaining it. Small libraries by solo maintainers are riskier than they appear - one burnout, one job change, and you're the maintainer now.

## Things that didn't make the cut

**A CSS framework.** Tailwind, Bootstrap, and friends solve real problems for large teams building complex UIs. For Chirp, the admin is 400 lines of vanilla CSS. Adding a framework would have been borrowing complexity for a problem we didn't have.

**A state management library.** Redux, Zustand, MobX - all excellent tools. But HTMX keeps state on the server, and the few client-side interactions we have (live search, inline editing) are handled with a dozen lines of vanilla JavaScript. A state library would have been a solution looking for a state problem.

**A component library.** Radix, Headless UI, shadcn - all great. But our admin has 11 interactive components (buttons, inputs, selects, modals, tables, toasts, dropdowns, tabs, toggles, search, pagination). Building them from scratch took two days and gave us exactly the API we wanted. Importing a library would have taken an afternoon and given us someone else's API that we'd spend the next year working around.

**WebSockets for live updates.** HTMX's Server-Sent Events extension handles one-way server-to-client updates in 3 KB. WebSockets would have added a persistent connection per admin user, a connection management layer, and a more complex protocol. For our use case (the server telling the client "this file changed"), SSE is the simpler tool.

**A build tool for the admin.** The admin's JavaScript is 14 KB gzipped. It doesn't need tree-shaking, code splitting, or minification - the browser handles it faster than any build tool could. Skipping the build step means instant restarts during development and one less configuration file to maintain.

## The framework in practice

The Justification List isn't a one-time exercise. We review it before every major release. Dependencies that were justified six months ago might not be today - the problem they solved may have changed, or a simpler alternative may have emerged.

This reverses the default posture of most software teams. Instead of asking "why shouldn't we add this?", we ask "why should we?" The burden of proof is on complexity, not simplicity.

The result: Chirp has fewer dependencies than the average React component library. The codebase is smaller, the build is faster, and when something breaks, there are fewer places to look. Complexity didn't earn its way in - so it isn't here.
