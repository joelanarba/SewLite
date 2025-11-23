# Spacing System

This document defines the spacing scale for consistent visual rhythm across the application.

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `container` | 16px | Screen edge padding |
| `card` | 20px | Card internal padding |
| `section` | 24px | Section spacing |
| `element` | 12px | Element spacing |
| `tight` | 8px | Tight spacing |

## Usage Guidelines

### Screen Padding
Use `p-container` or `px-container` for screen-level padding:
```jsx
<Screen className="px-container">
```

### Card Padding
Use `p-card` for card internal padding:
```jsx
<StandardCard className="p-card">
```

### Section Spacing
Use `mb-section` or `mt-section` for spacing between major sections:
```jsx
<View className="mb-section">
```

### Element Spacing
Use `mb-element` for spacing between form elements or list items:
```jsx
<TextInput className="mb-element" />
```

### Tight Spacing
Use `gap-tight` or `space-x-tight` for closely related items:
```jsx
<View className="flex-row gap-tight">
```

## Examples

```jsx
// Screen with consistent padding
<Screen className="px-container pt-2">
  <Header />
  
  {/* Section spacing */}
  <View className="mb-section">
    <Text className="text-2xl font-bold mb-element">Orders</Text>
    
    {/* Card with standard padding */}
    <StandardCard className="p-card">
      <Text>Order content</Text>
    </StandardCard>
  </View>
</Screen>
```
