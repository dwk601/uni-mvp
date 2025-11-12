# shadcnUI Component Library Setup

## Overview

This project uses **shadcnUI** with **Tailwind CSS 4** for building consistent, accessible UI components. All components follow the "New York" style variant with CSS variables for theming.

## Installed Components

### Core Components
- **Button** (`/components/ui/button.tsx`) - Multiple variants and sizes
- **Card** (`/components/ui/card.tsx`) - Container component with header, content, and footer
- **Table** (`/components/ui/table.tsx`) - Data table with proper semantic HTML
- **Dialog** (`/components/ui/dialog.tsx`) - Modal/popup component

## Configuration

### `components.json`
```json
{
  "style": "new-york",           // Component style variant
  "rsc": true,                   // React Server Components enabled
  "tsx": true,                   // TypeScript JSX
  "tailwind": {
    "cssVariables": true,        // Use CSS custom properties
    "baseColor": "neutral"       // Base color palette
  }
}
```

### Theme System

#### CSS Variables (`app/globals.css`)
The theme uses CSS custom properties defined in `:root` for light mode and `.dark` for dark mode:

**Light Mode Colors:**
- `--background`: oklch(1 0 0) - Pure white
- `--foreground`: oklch(0.145 0 0) - Near black
- `--primary`: oklch(0.205 0 0) - Dark gray
- `--destructive`: oklch(0.577 0.245 27.325) - Red

**Dark Mode Colors:**
- `--background`: oklch(0.145 0 0) - Near black  
- `--foreground`: oklch(0.985 0 0) - Off white
- `--primary`: oklch(0.922 0 0) - Light gray
- `--destructive`: oklch(0.704 0.191 22.216) - Lighter red

#### Theme Provider

Located at `/components/providers/theme-provider.tsx`:

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";

// In layout.tsx
<ThemeProvider defaultTheme="system" storageKey="university-platform-theme">
  {children}
</ThemeProvider>
```

**Features:**
- Three modes: `light`, `dark`, `system`
- Persists user preference in localStorage
- Automatic system theme detection
- Hook for theme control: `useTheme()`

**Usage:**
```tsx
"use client";
import { useTheme } from "@/components/providers/theme-provider";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme("dark")}>
      Switch to Dark Mode
    </button>
  );
}
```

## Component Usage

### Button Component

**Import:**
```tsx
import { Button } from "@/components/ui/button";
```

**Variants:**
- `default` - Primary button (solid background)
- `destructive` - Danger/delete actions (red)
- `outline` - Secondary button (bordered)
- `secondary` - Subtle secondary actions
- `ghost` - Minimal hover effect only
- `link` - Text link appearance

**Sizes:**
- `default` - h-9 (standard)
- `sm` - h-8 (compact)
- `lg` - h-10 (prominent)
- `icon` - size-9 (square)
- `icon-sm` - size-8 (small square)
- `icon-lg` - size-10 (large square)

**Examples:**
```tsx
<Button>Click Me</Button>
<Button variant="destructive" size="lg">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button size="icon"><SearchIcon /></Button>
```

### Card Component

**Import:**
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
```

**Structure:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title Here</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions/info */}
  </CardFooter>
</Card>
```

**Features:**
- Rounded corners (rounded-xl)
- Shadow effect (shadow-sm)
- Proper spacing (gap-6, py-6, px-6)
- Semantic structure

### Table Component

**Import:**
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
```

**Structure:**
```tsx
<Table>
  <TableCaption>Table description</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Features:**
- Responsive design
- Hover effects on rows
- Proper semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- Accessible table structure

### Dialog (Modal) Component

**Import:**
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
```

**Structure:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description or subtitle
      </DialogDescription>
    </DialogHeader>
    {/* Main content here */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Features:**
- Keyboard accessible (Escape to close)
- Focus trap management
- Backdrop click to close
- Smooth animations
- Portal rendering (outside DOM hierarchy)

## Accessibility Features

All components follow WCAG 2.1 Level AA standards:

### Keyboard Navigation
- **Tab** - Navigate between interactive elements
- **Enter/Space** - Activate buttons
- **Escape** - Close dialogs/dropdowns
- **Arrow keys** - Navigate within components

### Screen Reader Support
- Proper ARIA labels (`aria-label`, `aria-labelledby`)
- ARIA roles (`role="dialog"`, `role="button"`)
- Live regions for dynamic content (`aria-live`)
- Hidden decorative elements (`aria-hidden="true"`)

### Focus Management
- Visible focus indicators (ring-ring styles)
- Focus trap in modals
- Return focus after dialog close
- Skip links for navigation

### Color & Contrast
- Minimum 4.5:1 contrast ratio for text
- 3:1 for large text and UI components
- Color not used as only indicator
- Dark mode support with proper contrast

## Testing

Visit `/components-test` to see all components in action:

```bash
npm run dev
# Navigate to http://localhost:3001/components-test
```

**Test Page Features:**
- All component variants displayed
- Interactive theme switcher
- Sample data tables
- Modal dialogs
- Accessibility checklist

## Dependencies

```json
{
  "class-variance-authority": "^0.7.1",  // Variant management
  "clsx": "^2.1.1",                      // Conditional classes
  "lucide-react": "^0.553.0",            // Icon library
  "tailwind-merge": "^3.4.0",            // Merge Tailwind classes
  "@radix-ui/react-dialog": "^1.1.15",   // Dialog primitives
  "@radix-ui/react-slot": "^1.2.4"       // Slot composition
}
```

## Adding More Components

To add additional shadcnUI components:

```bash
npx shadcn@latest add [component-name]
```

**Popular components to consider:**
```bash
npx shadcn@latest add input         # Form input
npx shadcn@latest add select        # Dropdown select
npx shadcn@latest add checkbox      # Checkbox input
npx shadcn@latest add dropdown-menu # Context menu
npx shadcn@latest add tooltip       # Hover tooltips
npx shadcn@latest add badge         # Status badges
npx shadcn@latest add tabs          # Tab navigation
npx shadcn@latest add alert         # Alert messages
```

## Customization

### Modifying Existing Components

Components are yours to customize. They're just TypeScript files in `/components/ui/`:

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        myCustomVariant: "bg-blue-500 text-white",  // Add new variant
      },
    },
  }
);
```

### Creating Custom Variants

Use the `cn()` utility to merge classes:

```tsx
import { cn } from "@/lib/utils";

<Button className={cn("w-full", isActive && "bg-green-500")}>
  Custom Button
</Button>
```

### Theming

Modify CSS variables in `app/globals.css`:

```css
:root {
  --primary: oklch(0.5 0.2 250);  /* Blue primary */
  --radius: 0.5rem;               /* Rounded corners */
}
```

## Best Practices

1. **Use Semantic HTML** - Cards for content, Dialogs for modals, proper heading hierarchy
2. **Consistent Spacing** - Use Tailwind spacing scale (gap-4, p-6, etc.)
3. **Accessible Labels** - Always provide proper labels for form controls
4. **Loading States** - Add disabled states and loading indicators
5. **Error Handling** - Use destructive variant for error states
6. **Responsive Design** - Test on mobile, tablet, desktop
7. **Dark Mode** - Test both light and dark themes

## Resources

- **shadcnUI Docs**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Radix UI**: https://www.radix-ui.com
- **Lucide Icons**: https://lucide.dev

## Next Steps

With the component library set up, you can now:

1. Build the university search interface
2. Create filter components
3. Implement data visualization cards
4. Design the comparison tool
5. Build admin moderation UI

All with consistent, accessible components! 🎉
