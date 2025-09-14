# Order Management Application Design Guidelines

## Design Approach
**Reference-Based Approach**: Apple-inspired liquid glass aesthetic with modern minimalista design, emphasizing clean typography, subtle shadows, and frosted glass effects for a premium feel.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: Turquoise primary (180 85% 45%), White backgrounds (0 0% 98%)
- Dark Mode: Deep turquoise (180 75% 35%), Dark gray backgrounds (220 15% 12%)

**Supporting Colors:**
- Success: Green (120 60% 45%) for paid orders
- Warning: Orange (35 85% 55%) for pending payments
- Error: Red (0 70% 50%) for overdue items
- Neutral grays: (220 10% 65%) for secondary text

### B. Typography
**Primary Font**: SF Pro Display (Apple system font) or Inter as fallback
- Headers: 600 weight, 1.5rem to 2.5rem sizes
- Body text: 400 weight, 0.875rem to 1rem
- Captions: 500 weight, 0.75rem for metadata

### C. Layout System
**Spacing**: Tailwind units of 2, 4, 6, 8, and 12 for consistent rhythm
- Card padding: p-6
- Section margins: m-8
- Element spacing: gap-4
- Component margins: mb-6

### D. Component Library

**Order Cards**: 
- Frosted glass effect with backdrop-blur-md
- Subtle border (1px) with border-opacity-20
- Rounded corners (rounded-xl)
- Hover elevation with shadow-lg transition

**Navigation**:
- Clean top navigation with glass morphism
- Sticky positioning with backdrop blur
- Minimal icon usage (Heroicons)

**Data Displays**:
- Status badges with colored backgrounds
- Progress indicators for order cycles
- Expandable sections for detailed information

**Forms & Inputs**:
- Clean input fields with subtle borders
- File upload area with drag-and-drop styling
- Search bar with glass effect

**Interactive Elements**:
- Google Maps integration with custom markers
- Filter dropdowns with glass styling
- Expandable card sections

### E. Visual Treatments

**Glass Morphism Effects**:
- Frosted glass backgrounds on cards and navigation
- Subtle transparency (bg-opacity-80)
- Backdrop blur for depth

**Hierarchy**:
- Order value rankings prominently displayed
- Payment status clearly indicated with color coding
- Delivery type (pickup vs delivery) visually distinct

**Responsive Design**:
- Card grid layout (1-2-3 columns based on screen size)
- Mobile-first approach with touch-friendly targets
- Collapsible sidebar for filters on smaller screens

## Key Features Integration

**Excel Import Interface**:
- Drag-and-drop upload area with glass styling
- Progress indicators during processing
- Success/error states with appropriate coloring

**Order Visualization**:
- Card-based layout showing all 27 data points
- Expandable sections for billing, customer, and delivery details
- Clear visual separation between data categories

**Interactive Maps**:
- Google Maps with custom turquoise markers
- Pickup locations vs delivery addresses differentiated
- Clean overlay information windows

**Status Indicators**:
- Payment status badges (green for paid, orange for pending)
- Delivery type icons (home vs store pickup)
- Approval date timestamps with relative time display

The design should feel premium and Apple-like while maintaining excellent usability for order management tasks.