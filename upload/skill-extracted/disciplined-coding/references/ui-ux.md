# UI and UX

Generated interfaces look generic because the model fills every design decision you did not make with the statistically most common answer. They also look finished while missing everything that is not the happy path: states, keyboard access, labels, error recovery. This file covers both: avoiding the generic look, and meeting the floor of UX and accessibility that generated UI usually fails.

If a dedicated frontend-design or visual-design skill is available, read it as well for aesthetic direction. This file is the floor underneath it.

Contents: existing projects first, deciding before drawing, defaults that read as slop, states, forms, accessibility floor, copy, visual craft, verification, final critique.

## Existing project: inherit, do not invent

When the repo already has a UI, its design system is the brief. Reuse its tokens, components, icon set, spacing scale, fonts and copy voice. Do not add a new font, color, UI library or icon family. Look at two or three existing screens before building a new one. The anti-generic guidance below applies to greenfield work and to requests like "make this look good".

## Decide before drawing (greenfield)

Before any code, write a plan of 8 to 10 lines:

- Subject, audience, and the primary job of this screen. If the brief does not say, propose one and confirm.
- Palette: 4 to 6 named hex values, with a reason tied to the subject.
- Type: one or two families and their roles; a size scale; line length under about 75 characters.
- Layout: one sentence, plus alignment (left-aligned body text by default).
- The one memorable element. Everything else stays quiet.

Then check the plan against this: if you would have produced the same plan for any similar prompt, change the parts that came from habit. Say what you changed.

## Defaults that read as slop

These are tells when they appear without a reason in the brief. Any of them can be right for a specific product; none should be the unexamined default.

- Purple, indigo or blue-to-purple gradients; gradient text; floating gradient orbs
- Glass or frosted cards; the same soft gray shadow and the same corner radius on everything
- Content chopped into identical rounded cards; a row of three equal feature cards with icons
- Centered hero, big headline, two buttons, a row of big stats
- An unchosen font. Inter or Roboto is fine when the project uses it on purpose; the tell is that nobody decided
- Emoji used as icons or bullets
- A tracked-out ALL-CAPS eyebrow label over every heading
- Numbered markers (01, 02, 03) on content that is not a sequence
- Fade-and-slide-up on every section; hover lift on every card
- A dark theme nobody asked for
- Invented testimonials, customer logos, statistics, "10,000+ users", lorem ipsum
- "Get started ->" on every button; a three-tier pricing table with the middle plan highlighted when the brief has no pricing
- A card around everything. Use spacing, alignment and type to group before reaching for boxes

Instead, make decisions from the subject: its materials, vocabulary and users. Use real content or clearly realistic sample content. Spend boldness in one place and keep the rest disciplined. Cutting an element often improves a page more than adding one.

## States

Generated components render the happy path only. Build all of these:

Screen or data level:
- Loading: a skeleton or indicator that shows what is loading
- Empty: what this view is, why it is empty, and the next action
- Error: what happened, what to do about it, a retry
- Partial, permission-denied and offline, when they can occur

Control level:
- Default, hover, active, focus-visible, disabled, loading

## Forms

- A visible label for every field; a placeholder is not a label
- The right `type`, `inputmode` and `autocomplete` values
- Validate on blur and on submit, not on every keystroke
- Error text next to the field, linked with `aria-describedby`, with `aria-invalid` set
- On a failed submit, move focus to the first error or to a summary
- Keep what the user typed after an error
- Disable the submit control while pending, to prevent double submission
- Confirm success visibly
- Destructive actions state the specific consequence, and offer undo where possible

## Accessibility floor (WCAG 2.2 AA)

- Semantic elements: `button` for actions, `a` for navigation, real headings in order, landmarks. No `div` with `onClick`.
- Icon-only buttons and links have an accessible name (`aria-label` or visually hidden text).
- Images have meaningful `alt`, or empty `alt` when decorative.
- Contrast at least 4.5:1 for body text, 3:1 for large text and for UI components and borders.
- Visible focus on every interactive element. Never `outline: none` without a replacement.
- The whole interface works by keyboard, with a logical focus order.
- Dialogs trap focus, close on Escape, and return focus to the trigger. Prefer native `<dialog>` or a maintained primitive.
- Color is never the only signal (errors, status, required fields).
- Respect `prefers-reduced-motion`.
- Set the page `lang`. Announce toasts with `role="status"` or `role="alert"`.
- Targets at least 24 by 24 CSS pixels (WCAG 2.2 minimum); 44 pixels for primary touch targets is the safer practice.
- Layout survives 200% zoom and a 320 px viewport without losing content.
- For tabs, menus, comboboxes, dialogs and similar widgets, use mature primitives (native elements, Radix, React Aria, Headless UI) instead of hand-rolling keyboard behavior.

## Copy

- Say what the thing is or does, in the user's words rather than the system's: "Notifications", not "Webhook config".
- Buttons name the outcome: "Save changes", not "Submit". Keep one name per action through the flow: the "Publish" button leads to a "Published" message.
- Errors explain what happened and how to fix it. No "Oops!", no apologizing, no vague "Something went wrong".
- Empty states invite an action.
- Sentence case. No exclamation marks, no emoji, no superlatives, no filler like "Welcome to the future of...".
- Use one term per concept across the interface.

## Visual craft

- One type scale, used consistently. Hierarchy comes from size, weight and space before color and boxes.
- Space from a scale (4 or 8 px base). Align to a consistent grid.
- Fewer containers. Do not wrap everything in a card.
- Motion only to explain a change (opening, confirming, moving), around 150 to 250 ms, and off under reduced motion. No decorative entrances.
- Icons from the project's icon set, one family, one stroke weight.
- Images are real or absent. No stock-looking filler.
- Responsive from the narrowest case: check at 375, 768 and 1280 px widths. No horizontal scroll.

## Verification (required for any UI change)

Code that compiles is not a working interface.

1. Run it and render it. If a browser tool (Playwright, Puppeteer, a browser MCP) is available, take screenshots at 375 px and 1280 px and look at them.
2. Check the console for errors and warnings.
3. Walk the keyboard path: Tab through every control, operate each with Enter or Space, open and close every dialog.
4. Trigger each state: throttle or block the network for loading and error, use empty data, force an error response.
5. Run an automated accessibility check if one is available (axe via `@axe-core/playwright` or `@axe-core/cli`). It finds only part of the problems, so steps 3 and 4 are still manual.
6. If you cannot render the UI, say it was not visually verified.

## Final critique

Remove one thing. Then ask: would someone recognize this as belonging to this specific product, or could it be any product? If any, find the part that came from habit and replace it with a decision.
