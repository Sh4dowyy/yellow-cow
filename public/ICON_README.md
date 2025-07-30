# How to Replace the Site Icon

## Quick Guide

To replace the site icon with your own:

1. **Replace the SVG file**: Replace `/public/icon.svg` with your own SVG file
2. **Keep the filename**: Make sure your new file is named `icon.svg`
3. **Recommended size**: 32x32 pixels or scalable SVG

## File Requirements

### SVG Format (Recommended)

- **File name**: `icon.svg`
- **Location**: `/public/icon.svg`
- **Format**: SVG (vector format, scales well)
- **Dimensions**: 32x32 pixels or use viewBox for scalability

### Alternative: PNG/ICO

If you prefer PNG or ICO format, update the metadata in `/app/layout.tsx`:

```typescript
icons: {
  icon: [
    {
      url: '/your-icon.png',  // or '/favicon.ico'
      type: 'image/png',      // or 'image/x-icon'
    }
  ],
  shortcut: '/your-icon.png',
  apple: '/your-icon.png',
},
```

## Current Icon

The current icon is a placeholder design with:

- Blue gradient background
- White building blocks forming an "A" shape
- Small decorative dots

## Tips

- SVG format is recommended for crisp display on all devices
- Make sure your icon is readable at small sizes (16x16 to 32x32 pixels)
- Test your icon in different browsers
- Consider both light and dark themes when designing
