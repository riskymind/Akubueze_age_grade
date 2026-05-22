# Auth UI - Sign In, Register & Sign Out

## Requirements

### Bottom Of Sidebar
- Display user name
- Dropdown/up on avatar click with "Sign out" link
- Clicking on the icon should go to "/profile"

## Notes

### Avatar Logic

- generate initials from name (e.g., "Opara Kelechi" → "OK")

### Initials Component

Create a reusable avatar component that handles both cases.

## Testing

1. Go to `/sign-in` - verify custom page renders
3. Sign in with email/password - verify flow works
4. Verify avatar shows in top bar (initials)
5. Click avatar - verify dropdown appears
6. Click "Sign out" - verify logout and redirect
