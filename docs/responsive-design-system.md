# Responsive Design System

## Overview

This document defines the responsive design system for the University Search application, including breakpoints, layout patterns, and component responsiveness guidelines.

## Tailwind CSS Breakpoints

The application uses Tailwind CSS default breakpoints:

| Breakpoint | Min Width | Max Width | Target Devices          |
|------------|-----------|-----------|-------------------------|
| `xs`       | 0px       | 639px     | Mobile phones (portrait)|
| `sm`       | 640px     | 767px     | Mobile phones (landscape), small tablets |
| `md`       | 768px     | 1023px    | Tablets (portrait)      |
| `lg`       | 1024px    | 1279px    | Tablets (landscape), small laptops |
| `xl`       | 1280px    | 1535px    | Laptops, desktops       |
| `2xl`      | 1536px+   | ∞         | Large desktops, 4K      |

### Usage

```tsx
// Mobile-first approach
<div className="
  w-full           // Mobile: full width
  sm:w-1/2         // Small: half width
  md:w-1/3         // Medium: third width
  lg:w-1/4         // Large: quarter width
">
  Content
</div>
```

## Mobile-First Philosophy

All components are designed mobile-first, meaning:

1. **Base styles** target mobile devices (320px+)
2. **Progressive enhancement** adds complexity for larger screens
3. **Touch-friendly** - minimum 44x44px tap targets
4. **Content priority** - most important content shows first
5. **Performance** - lighter assets for mobile

## Layout Patterns

### 1. Responsive Grid

```tsx
// Auto-responsive grid with min-max
<div className="
  grid
  grid-cols-1           // Mobile: 1 column
  sm:grid-cols-2        // Small: 2 columns
  md:grid-cols-3        // Medium: 3 columns
  lg:grid-cols-4        // Large: 4 columns
  gap-4                 // Consistent gap
">
  {items.map(item => <Card key={item.id}>{...}</Card>)}
</div>
```

###2. Responsive Flexbox

```tsx
// Vertical on mobile, horizontal on desktop
<div className="
  flex
  flex-col              // Mobile: vertical stack
  md:flex-row           // Medium+: horizontal row
  gap-4
">
  <div className="flex-1">Content 1</div>
  <div className="flex-1">Content 2</div>
</div>
```

### 3. Responsive Sidebar

```tsx
// Full-width on mobile, sidebar on desktop
<div className="
  flex
  flex-col              // Mobile: stack vertically
  lg:flex-row           // Large+: sidebar layout
  gap-6
">
  {/* Sidebar */}
  <aside className="
    w-full              // Mobile: full width
    lg:w-64             // Large+: fixed width sidebar
    lg:sticky
    lg:top-4
  ">
    Filters
  </aside>
  
  {/* Main content */}
  <main className="flex-1">
    Content
  </main>
</div>
```

### 4. Responsive Container

```tsx
// Centered container with responsive padding
<div className="
  container           // Max-width container
  mx-auto             // Center horizontally
  px-4                // Mobile: small padding
  sm:px-6             // Small: medium padding
  lg:px-8             // Large: large padding
">
  Content
</div>
```

## Component Responsiveness

### Typography

```tsx
// Responsive text sizes
<h1 className="
  text-2xl            // Mobile: 24px
  sm:text-3xl         // Small: 30px
  md:text-4xl         // Medium: 36px
  lg:text-5xl         // Large: 48px
  font-bold
">
  Heading
</h1>

<p className="
  text-sm             // Mobile: 14px
  md:text-base        // Medium+: 16px
">
  Body text
</p>
```

### Spacing

```tsx
// Responsive spacing
<div className="
  p-4                 // Mobile: 16px padding
  md:p-6              // Medium: 24px padding
  lg:p-8              // Large: 32px padding
  
  mt-2                // Mobile: 8px margin-top
  md:mt-4             // Medium: 16px margin-top
  lg:mt-6             // Large: 24px margin-top
">
  Content
</div>
```

### Buttons

```tsx
// Responsive button sizing
<Button className="
  w-full              // Mobile: full width
  sm:w-auto           // Small+: auto width
  sm:px-6             // Small+: more padding
">
  Action
</Button>
```

### Forms

```tsx
// Responsive form layout
<form className="
  grid
  grid-cols-1         // Mobile: single column
  md:grid-cols-2      // Medium+: two columns
  gap-4
">
  <div className="md:col-span-2">
    <Label htmlFor="name">Full Name</Label>
    <Input id="name" className="w-full" />
  </div>
  
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
  </div>
  
  <div>
    <Label htmlFor="phone">Phone</Label>
    <Input id="phone" type="tel" />
  </div>
</form>
```

### Cards

```tsx
// Responsive card layout
<Card className="
  p-4                 // Mobile: small padding
  md:p-6              // Medium+: larger padding
">
  <CardHeader className="
    flex-col          // Mobile: stack
    sm:flex-row       // Small+: horizontal
    sm:items-center   // Small+: center items
    gap-4
  ">
    <CardTitle className="
      text-lg         // Mobile: smaller
      md:text-xl      // Medium+: larger
    ">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Tables

```tsx
// Responsive table with horizontal scroll on mobile
<div className="
  overflow-x-auto     // Enable horizontal scroll
  -mx-4               // Negative margin on mobile
  sm:mx-0             // Reset on small+
">
  <Table className="min-w-full">
    <TableHeader>...</TableHeader>
    <TableBody>...</TableBody>
  </Table>
</div>

// Alternative: Card-based layout on mobile
<div className="
  block               // Mobile: show as blocks
  md:hidden           // Medium+: hide
">
  {/* Card-based mobile layout */}
  {items.map(item => (
    <Card key={item.id}>
      <CardContent>
        <div>{item.name}</div>
        <div>{item.value}</div>
      </CardContent>
    </Card>
  ))}
</div>

<div className="
  hidden              // Mobile: hide
  md:block            // Medium+: show
">
  {/* Desktop table */}
  <Table>...</Table>
</div>
```

### Navigation

```tsx
// Responsive navigation
<nav className="
  flex
  flex-col            // Mobile: vertical
  md:flex-row         // Medium+: horizontal
  gap-2
  md:gap-4
">
  <Link href="/">Home</Link>
  <Link href="/search">Search</Link>
  <Link href="/compare">Compare</Link>
</nav>
```

## Utility Classes Reference

### Display & Visibility

```tsx
// Show/hide based on breakpoint
hidden sm:block              // Hide on mobile, show on small+
block md:hidden              // Show on mobile, hide on medium+
sm:inline-block              // Inline-block on small+
```

### Flexbox

```tsx
flex flex-col md:flex-row    // Vertical on mobile, horizontal on medium+
flex-wrap                    // Wrap items
justify-between              // Space items
items-center                 // Center items vertically
gap-4 md:gap-6               // Responsive gap
```

### Grid

```tsx
grid grid-cols-1 md:grid-cols-3    // 1 col mobile, 3 cols medium+
gap-4                              // Grid gap
col-span-2                         // Span 2 columns
```

### Sizing

```tsx
w-full sm:w-1/2 lg:w-1/3     // Responsive width
h-auto                       // Auto height
min-h-screen                 // Minimum full viewport height
max-w-7xl                    // Max width constraint
```

### Position

```tsx
relative                     // Relative positioning
absolute                     // Absolute positioning
sticky top-0                 // Sticky header
lg:fixed lg:top-4            // Fixed on large screens
```

## Best Practices

### 1. Mobile-First Approach

Always start with mobile styles, then enhance for larger screens:

```tsx
// ✅ Good - Mobile-first
<div className="p-4 md:p-6 lg:p-8">

// ❌ Bad - Desktop-first
<div className="p-8 md:p-6 sm:p-4">
```

### 2. Touch Targets

Ensure interactive elements are at least 44x44px on mobile:

```tsx
// ✅ Good
<button className="min-h-[44px] min-w-[44px] p-3">
  <Icon className="h-5 w-5" />
</button>

// ❌ Bad
<button className="p-1">
  <Icon className="h-3 w-3" />
</button>
```

### 3. Readable Text

Maintain readable font sizes and line heights:

```tsx
// ✅ Good
<p className="text-base leading-relaxed md:text-lg">

// ❌ Bad  
<p className="text-xs leading-tight">
```

### 4. Consistent Spacing

Use Tailwind's spacing scale consistently:

```tsx
// ✅ Good - Uses 4px increments (4, 8, 12, 16, 24, 32)
<div className="space-y-4 md:space-y-6 lg:space-y-8">

// ❌ Bad - Arbitrary values
<div className="space-y-[13px] md:space-y-[27px]">
```

### 5. Performance

Optimize images and assets for different screen sizes:

```tsx
// ✅ Good - Responsive images
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1920}
  height={1080}
  className="w-full h-auto"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 6. Testing

Test on actual devices, not just browser resize:

- **Physical devices**: iOS, Android, tablets
- **Browser DevTools**: Mobile emulation
- **Multiple orientations**: Portrait and landscape
- **Different browsers**: Chrome, Safari, Firefox, Edge

## Component-Specific Guidelines

### Search Filters

- **Mobile**: Collapsible panel, modal overlay
- **Tablet**: Sidebar with toggle
- **Desktop**: Fixed sidebar

### Institution Cards

- **Mobile**: Full width, vertical stack
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns

### Comparison Table

- **Mobile**: Horizontal scroll or card-based view
- **Tablet**: Reduced columns, smaller text
- **Desktop**: Full table layout

### Forms

- **Mobile**: Single column, full-width inputs
- **Tablet**: 2 columns for related fields
- **Desktop**: Multi-column layout with grouping

## Accessibility Considerations

- **Focus indicators**: Visible at all screen sizes
- **Touch targets**: Minimum 44x44px
- **Zoom support**: Allow up to 200% zoom
- **Orientation**: Support both portrait and landscape
- **Screen readers**: Announce layout changes

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile-First Indexing](https://developers.google.com/search/mobile-sites/mobile-first-indexing)
- [WCAG 2.1 Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)
