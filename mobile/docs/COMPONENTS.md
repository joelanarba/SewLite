# Shared Component Library

This document provides a guide to the shared UI components used in the Tailor mobile application. These components are built on top of React Native and styled with NativeWind (Tailwind CSS).

## Presets

To ensure consistency and reduce prop drilling, we use a set of "preset" components found in `src/components/presets/`.

### Buttons

Located in: `src/components/presets/Buttons.jsx`

All buttons accept the following common props:
- `title` (string): The text to display.
- `onPress` (function): Callback when pressed.
- `loading` (boolean): Shows a spinner if true.
- `disabled` (boolean): Disables interaction and dims the button.
- `icon` (ReactNode): Optional icon to display before the text.
- `className` (string): Additional Tailwind classes for the container.
- `textClassName` (string): Additional Tailwind classes for the text.

#### `PrimaryButton`
The main call-to-action button. Filled with the primary brand color.
```jsx
import { PrimaryButton } from '../components/presets/Buttons';

<PrimaryButton 
  title="Save Changes" 
  onPress={handleSave} 
/>
```

#### `SecondaryButton`
For alternative actions. Filled with the secondary brand color.
```jsx
import { SecondaryButton } from '../components/presets/Buttons';

<SecondaryButton 
  title="View Details" 
  onPress={handleView} 
/>
```

#### `OutlineButton`
Transparent background with a primary color border.
```jsx
import { OutlineButton } from '../components/presets/Buttons';

<OutlineButton 
  title="Cancel" 
  onPress={handleCancel} 
/>
```

#### `GhostButton`
Text only, no background or border. Good for tertiary actions like "Delete".
```jsx
import { GhostButton } from '../components/presets/Buttons';

<GhostButton 
  title="Delete Item" 
  onPress={handleDelete}
  textClassName="text-red-500" 
/>
```

---

### Cards

Located in: `src/components/presets/Cards.jsx`

All cards accept `children` and `className`.

#### `StandardCard`
The default card. White background, rounded corners, shadow.
```jsx
import { StandardCard } from '../components/presets/Cards';

<StandardCard>
  <Text>Content goes here</Text>
</StandardCard>
```

#### `PrimaryCard`
Primary color background. Used for high-emphasis stats.
```jsx
import { PrimaryCard } from '../components/presets/Cards';

<PrimaryCard>
  <Text className="text-white">Total Customers: 100</Text>
</PrimaryCard>
```

#### `SecondaryCard`
Secondary color background. Used for secondary stats.
```jsx
import { SecondaryCard } from '../components/presets/Cards';

<SecondaryCard>
  <Text className="text-primary">New Orders: 5</Text>
</SecondaryCard>
```

#### `BorderedCard`
Standard card with a colored left border accent. Used for list items.
```jsx
import { BorderedCard } from '../components/presets/Cards';

<BorderedCard>
  <Text>Customer Name</Text>
</BorderedCard>
```

#### `GhostCard`
Semi-transparent background, no shadow. Used for empty states.
```jsx
import { GhostCard } from '../components/presets/Cards';

<GhostCard>
  <Text>No items found.</Text>
</GhostCard>
```

---

### Inputs

Located in: `src/components/presets/Inputs.jsx`

All inputs wrap the base `Input` component and accept its props:
- `label` (string): Label text above the input.
- `value` (string): Current value.
- `onChangeText` (function): Callback for text changes.
- `placeholder` (string): Placeholder text.
- `error` (string): Error message to display below.

#### `TextInput`
Standard single-line text input.
```jsx
import { TextInput } from '../components/presets/Inputs';

<TextInput 
  label="Name" 
  value={name} 
  onChangeText={setName} 
/>
```

#### `TextArea`
Multiline input for long text. Defaults to 3 lines.
```jsx
import { TextArea } from '../components/presets/Inputs';

<TextArea 
  label="Notes" 
  value={notes} 
  onChangeText={setNotes} 
/>
```

#### `PhoneInput`
Optimized for phone numbers (numeric keyboard).
```jsx
import { PhoneInput } from '../components/presets/Inputs';

<PhoneInput 
  label="Phone" 
  value={phone} 
  onChangeText={setPhone} 
/>
```

#### `NumberInput`
Optimized for numeric values (numeric keyboard).
```jsx
import { NumberInput } from '../components/presets/Inputs';

<NumberInput 
  label="Price" 
  value={price} 
  onChangeText={setPrice} 
/>
```

#### `SearchInput`
A specialized input with a search icon, used for search bars.
```jsx
import { SearchInput } from '../components/presets/Inputs';

<SearchInput 
  placeholder="Search..." 
  value={search} 
  onChangeText={setSearch} 
/>
```
