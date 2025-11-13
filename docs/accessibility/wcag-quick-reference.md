# WCAG 2.1 AA Quick Reference Guide

## Quick Fix Checklist

### High Priority (Critical/Serious)

- [ ] All images have meaningful alt text
- [ ] All form inputs have associated labels
- [ ] Color contrast meets 4.5:1 minimum
- [ ] All functionality available via keyboard
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Page has valid language attribute
- [ ] Headings are properly nested (h1 → h2 → h3)
- [ ] Interactive elements have accessible names
- [ ] Error messages are announced to screen readers

### Medium Priority (Moderate)

- [ ] Skip links provided for main content
- [ ] Landmark regions defined (header, main, nav, footer)
- [ ] Tables have proper headers
- [ ] Lists use proper markup (ul/ol/li)
- [ ] Link text is descriptive
- [ ] Page title is descriptive
- [ ] Document structure is semantic
- [ ] Form validation is accessible

### Low Priority (Minor)

- [ ] HTML lang attribute matches content language
- [ ] Meta viewport doesn't prevent zoom
- [ ] Redundant links are avoided
- [ ] Page doesn't auto-refresh
- [ ] Time limits can be extended

## Component Patterns

### Buttons

```tsx
// ✅ Good - Button with text
<button>Submit</button>

// ✅ Good - Button with icon and label
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// ✅ Good - Button with icon and visible text
<button>
  <Search className="mr-2 h-4 w-4" />
  Search
</button>

// ❌ Bad - Icon-only without label
<button><X /></button>
```

### Form Inputs

```tsx
// ✅ Good - Label with htmlFor
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// ✅ Good - Label wrapping input
<label>
  Email Address
  <input type="email" />
</label>

// ✅ Good - aria-label for hidden label
<input
  type="search"
  aria-label="Search institutions"
  placeholder="Search..."
/>

// ✅ Good - With error message
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email address
  </span>
)}

// ❌ Bad - No label
<input type="email" placeholder="Email" />
```

### Links

```tsx
// ✅ Good - Descriptive text
<a href="/about">Learn more about our services</a>

// ✅ Good - Icon with aria-label
<a href="/profile" aria-label="View your profile">
  <User className="h-4 w-4" />
</a>

// ✅ Good - External link indicator
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Site
  <span className="sr-only">(opens in new tab)</span>
</a>

// ❌ Bad - Generic text
<a href="/more">Click here</a>

// ❌ Bad - Icon only without label
<a href="/profile"><User /></a>
```

### Images

```tsx
// ✅ Good - Descriptive alt
<img src="/logo.png" alt="University Search logo" />

// ✅ Good - Decorative image
<img src="/decoration.png" alt="" role="presentation" />

// ✅ Good - Complex image with description
<figure>
  <img
    src="/chart.png"
    alt="Bar chart showing enrollment trends"
    aria-describedby="chart-desc"
  />
  <figcaption id="chart-desc">
    Enrollment increased by 15% from 2020 to 2024
  </figcaption>
</figure>

// ❌ Bad - Missing alt
<img src="/logo.png" />

// ❌ Bad - Filename as alt
<img src="/hero.png" alt="hero.png" />
```

### Headings

```tsx
// ✅ Good - Proper hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// ✅ Good - Multiple h2s okay
<h1>Products</h1>
<h2>Featured Products</h2>
<h2>All Products</h2>

// ❌ Bad - Skipping levels
<h1>Page Title</h1>
<h3>Section Title</h3>

// ❌ Bad - Multiple h1s
<h1>Page Title</h1>
<h1>Another Title</h1>
```

### Navigation

```tsx
// ✅ Good - Skip link
<a href="#main" className="skip-link">
  Skip to main content
</a>

// ✅ Good - Semantic nav
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/search">Search</a></li>
  </ul>
</nav>

// ✅ Good - Multiple navs
<nav aria-label="Primary navigation">...</nav>
<nav aria-label="Footer navigation">...</nav>

// ✅ Good - Current page indicator
<a href="/search" aria-current="page">Search</a>
```

### Dialogs/Modals

```tsx
// ✅ Good - Accessible dialog
<Dialog
  open={isOpen}
  onClose={onClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <Dialog.Title id="dialog-title">
    Confirm Delete
  </Dialog.Title>
  <Dialog.Description id="dialog-description">
    Are you sure you want to delete this item?
  </Dialog.Description>
  <button onClick={onConfirm}>Confirm</button>
  <button onClick={onClose}>Cancel</button>
</Dialog>
```

### Tables

```tsx
// ✅ Good - Accessible table
<table>
  <caption>Institution Comparison</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Location</th>
      <th scope="col">Enrollment</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">MIT</th>
      <td>Massachusetts</td>
      <td>11,934</td>
    </tr>
  </tbody>
</table>

// ❌ Bad - Divs as table
<div className="table">
  <div className="row">
    <div>Name</div>
    <div>Location</div>
  </div>
</div>
```

### Lists

```tsx
// ✅ Good - Proper list markup
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// ✅ Good - Description list
<dl>
  <dt>Location</dt>
  <dd>California</dd>
  <dt>Type</dt>
  <dd>Public</dd>
</dl>

// ❌ Bad - Divs instead of list
<div>
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Focus Management

```tsx
// ✅ Good - Custom focus styles
<button className="focus-visible:ring-2 focus-visible:ring-blue-500">
  Click me
</button>

// ✅ Good - Focus trap in modal
import { FocusTrap } from '@headlessui/react';

<FocusTrap>
  <div role="dialog">...</div>
</FocusTrap>

// ✅ Good - Programmatic focus
const dialogRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// ❌ Bad - Removing focus outline
<button className="outline-none">Bad</button>
```

### Live Regions

```tsx
// ✅ Good - Announcements
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// ✅ Good - Alert messages
<div role="alert">
  Error: {errorMessage}
</div>

// ✅ Good - Loading states
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : content}
</div>
```

### Screen Reader Only Text

```tsx
// ✅ Good - CSS class for sr-only
<span className="sr-only">
  Current page: Search Results
</span>

// CSS
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Color Contrast Requirements

### Text
- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+/14pt+ bold): 3:1 minimum

### Non-Text
- **UI components**: 3:1 minimum
- **Focus indicators**: 3:1 minimum

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- Chrome DevTools - Coverage tab

## Keyboard Navigation

### Expected Behavior
- **Tab**: Move to next focusable element
- **Shift+Tab**: Move to previous focusable element
- **Enter/Space**: Activate buttons/links
- **Escape**: Close dialogs/menus
- **Arrow Keys**: Navigate within components (menus, tabs, sliders)
- **Home/End**: Jump to first/last item

### Testing
1. Hide your mouse
2. Use only keyboard to navigate
3. Ensure all functionality is accessible
4. Check focus order is logical
5. Verify focus indicators are visible

## Common ARIA Attributes

### Labels
- `aria-label`: String label
- `aria-labelledby`: ID reference
- `aria-describedby`: Additional description

### States
- `aria-expanded`: Collapsible content state
- `aria-selected`: Selection state
- `aria-checked`: Checkbox/radio state
- `aria-disabled`: Disabled state
- `aria-hidden`: Hidden from screen readers
- `aria-current`: Current item in set

### Properties
- `aria-required`: Required form field
- `aria-invalid`: Invalid form field
- `aria-readonly`: Read-only field
- `aria-live`: Dynamic content updates
- `aria-atomic`: Announce entire region
- `aria-busy`: Loading state

### Relationships
- `aria-owns`: Ownership relationship
- `aria-controls`: Controlled element
- `aria-activedescendant`: Active child element

## Testing Checklist

### Automated Testing
- [ ] Run axe-core audit (npm run audit:a11y)
- [ ] Check for TypeScript/ESLint a11y warnings
- [ ] Validate HTML (W3C Validator)

### Manual Testing
- [ ] Test with keyboard only
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test with browser zoom (200%, 400%)
- [ ] Test with high contrast mode
- [ ] Test with dark mode
- [ ] Test on mobile devices
- [ ] Test with slow network

### Screen Reader Testing
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca (free)
- **Mobile**: iOS VoiceOver, Android TalkBack

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
- [Radix UI](https://www.radix-ui.com/) (accessible primitives)
- [shadcn/ui](https://ui.shadcn.com/) (built on Radix)
