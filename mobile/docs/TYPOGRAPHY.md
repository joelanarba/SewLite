# Typography System

This document defines the typography scale for consistent text hierarchy throughout the application.

## Typography Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display` | 32px | 40px | 700 | Hero text, main headers |
| `heading` | 28px | 36px | 700 | Screen headers, section titles |
| `title` | 22px | 30px | 600 | Card titles, subsection headers |
| `body` | 16px | 24px | 400 | Body text, descriptions |
| `caption` | 14px | 20px | 500 | Captions, helper text |
| `small` | 12px | 16px | 400 | Labels, metadata |

## Usage Guidelines

### Display Text
Use `text-display` for hero sections and main app titles:
```jsx
<Text className="text-display text-primary">
  Welcome
</Text>
```

### Headings
Use `text-heading` for screen and section headers:
```jsx
<Text className="text-heading text-primary">
  Customer Profile
</Text>
```

### Titles
Use `text-title` for card titles and subsections:
```jsx
<Text className="text-title text-primary">
  Order Details
</Text>
```

### Body Text
Use `text-body` for main content:
```jsx
<Text className="text-body text-text-primary">
  This is the order description.
</Text>
```

### Captions
Use `text-caption` for helper text:
```jsx
<Text className="text-caption text-text-secondary">
  Last updated 2 hours ago
</Text>
```

### Small Text
Use `text-small` for labels and metadata:
```jsx
<Text className="text-small text-text-light uppercase">
  Status
</Text>
```

## Font Weight Modifiers

The typography tokens include default font weights, but you can override them:

- `font-bold` (700)
- `font-semibold` (600)
- `font-medium` (500)
- `font-normal` (400)

## Examples

```jsx
// Screen header
<Text className="text-heading text-primary uppercase">
  Orders
</Text>

// Card title
<Text className="text-title text-primary">
  Blue Suit
</Text>

// Body content
<Text className="text-body text-text-secondary">
  Ready for pickup on Friday
</Text>

// Label
<Text className="text-small text-text-light uppercase tracking-wider">
  Balance Due
</Text>
```
