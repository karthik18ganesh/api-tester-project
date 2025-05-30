# Component Architecture Guide

This guide explains our component organization and which components to use for different scenarios.

## 📁 Directory Structure

```
src/components/
├── UI/                    # Pure UI components (Design System)
├── common/               # Layout & Business Logic components
└── demo/                 # Demo & showcase components
```

## 🎨 UI Components (`/UI/`)

**Use these for**: Pure presentational components, form elements, and reusable UI pieces.

### Available Components:

- **`Button`** - All button variations
- **`Input`** - Form inputs with validation
- **`Card`** - Content containers
- **`Badge`** - Status indicators
- **`LoadingSpinner`** - Loading states
- **`Modal`** - Dialogs and confirmations
- **`SkeletonLoader`** - Skeleton loading states

### Usage Examples:

```jsx
import { Button, Input, Card, Badge, Modal } from '../components/UI';

// Buttons
<Button variant="primary" size="lg" icon={SaveIcon}>Save</Button>
<Button variant="danger" loading={isDeleting}>Delete</Button>

// Inputs
<Input label="Email" type="email" required error={emailError} />

// Cards
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

// Modals
<Modal.Confirmation 
  isOpen={showDelete}
  title="Delete Item"
  message="Are you sure?"
  onConfirm={handleDelete}
  onClose={closeModal}
/>
```

## 🏗️ Common Components (`/common/`)

**Use these for**: Layout components, navigation, and business logic components.

### Layout Components:
- **`Layout`** - Main application layout
- **`Navbar`** - Top navigation bar
- **`Sidebar`** - Side navigation
- **`Breadcrumb`** - Navigation breadcrumbs

### Logic Components:
- **`ProtectedRoute`** - Route authentication
- **`ProjectActivationGuard`** - Project-based access control
- **`ProjectProtectedRoute`** - Project + auth protection

### Legacy Redirects:
- **`Button`** - ❌ Redirects to `UI/Button` (use `UI/Button` directly)
- **`LoadingSpinner`** - ❌ Redirects to `UI/LoadingSpinner` (use `UI/LoadingSpinner` directly)
- **`ConfirmationModal`** - ❌ Redirects to `UI/Modal.Confirmation` (use `UI/Modal` directly)

## 🎯 Best Practices

### ✅ DO:
```jsx
// Use UI components directly
import { Button, Input, Card } from '../components/UI';

// Use common components for layout/logic
import Breadcrumb from '../components/common/Breadcrumb';
import Layout from '../components/common/Layout';
```

### ❌ DON'T:
```jsx
// Don't use legacy redirects
import Button from '../components/common/Button';  // ❌
import { Button } from '../components/UI';         // ✅

// Don't mix UI and business logic
import SomeBusinessComponent from '../components/UI/';  // ❌
```

## 🔄 Migration Guide

If you're updating existing code:

### Old Button Usage:
```jsx
// Before
import Button from '../components/common/Button';
<Button className="custom-class">Click me</Button>

// After  
import { Button } from '../components/UI';
<Button variant="primary" className="custom-class">Click me</Button>
```

### Old Modal Usage:
```jsx
// Before
import ConfirmationModal from '../components/common/ConfirmationModal';
<ConfirmationModal isOpen={true} title="Delete" message="Are you sure?" />

// After
import { Modal } from '../components/UI';
<Modal.Confirmation isOpen={true} title="Delete" message="Are you sure?" />
```

## 🎨 Design System Classes

Our components use standardized CSS classes from `src/styles/design-system.css`:

### Button Variants:
- `btn-primary` - Main actions
- `btn-secondary` - Secondary actions  
- `btn-success` - Success actions
- `btn-danger` - Destructive actions
- `btn-ghost` - Minimal styling

### Form Classes:
- `form-input` - Standard input styling
- `form-label` - Input labels
- `form-error` - Error messages

### Layout Classes:
- `page-container` - Page wrapper
- `page-header` - Page header section
- `card` - Content cards

## 🚀 Component Status

| Component | Status | Location | Use |
|-----------|--------|----------|-----|
| Button | ✅ Standardized | `UI/Button` | All buttons |
| Input | ✅ Standardized | `UI/Input` | Form inputs |
| Card | ✅ Standardized | `UI/Card` | Content containers |
| Badge | ✅ Standardized | `UI/Badge` | Status indicators |
| Modal | ✅ Standardized | `UI/Modal` | Dialogs |
| LoadingSpinner | ✅ Standardized | `UI/LoadingSpinner` | Loading states |
| Breadcrumb | ✅ Enhanced | `common/Breadcrumb` | Navigation |
| Layout | ✅ Current | `common/Layout` | App layout |
| Navbar | ✅ Current | `common/Navbar` | Top nav |
| Sidebar | ✅ Current | `common/Sidebar` | Side nav |

## 📝 Notes

- All UI components follow the design system
- Legacy components redirect to avoid breaking changes
- Use TypeScript-style imports for better tree-shaking
- Components are designed to be accessible and responsive 