# Shared Features - Documentation

## Why "Shared" Instead of "Leader" & "Staff"?

### Context
Leader and Staff roles use the **exact same pages**:
- MyOverviewPage
- TaskBoardPage

### Decision: Single Shared Implementation

**Rationale:**
1. **DRY Principle** - Don't Repeat Yourself
2. **Industry Standard** - React/Vue/Angular best practices recommend sharing components
3. **Maintenance** - Fix bugs once, not twice
4. **Bundle Size** - Avoid shipping duplicate code
5. **Testing** - Test once, not twice

### Alternative Considered: Duplicate Folders

```
❌ REJECTED: Duplicate Approach
features/
├── leader/
│   └── MyOverviewPage/ (1000 lines)
└── staff/
    └── MyOverviewPage/ (1000 lines - SAME CODE)
```

**Why Rejected:**
- Code duplication violates DRY
- Maintenance nightmare (fix 2 places every time)
- Bug risk (forget to fix in one place)
- Larger bundle size
- More testing needed

### Chosen Approach: Shared

```
✅ CHOSEN: Shared Approach
features/shared/
└── overview/
    └── MyOverviewPage/ (1000 lines - used by both)
```

**Benefits:**
- Single source of truth
- Fix once, works everywhere
- Industry best practice
- Smaller bundles
- Less testing

## Access Control Strategy

**IMPORTANT:** Folder structure ≠ Security

### 3-Layer Security:

#### 1. Route Level (Frontend)
```javascript
// AppRoutes.jsx
<Route path="/my-overview" element={
  <ProtectedRoute allowedRoles={['leader', 'staff']}>
    <MyOverviewPage />
  </ProtectedRoute>
} />
```

#### 2. Backend API
```javascript
// Backend validates every request
if (!['leader', 'staff'].includes(user.role)) {
  return 403 Forbidden
}
```

#### 3. Component Level (if needed)
```javascript
// MyOverviewPage.jsx
{user.role === 'leader' && <LeaderSpecificSection />}
{user.role === 'staff' && <StaffSpecificSection />}
```

## Real-World Examples

### GitHub (Microsoft)
- Shared pull request UI for contributors & maintainers
- Shared issue tracker for users & developers

### Airbnb
- Shared booking form for guests & hosts
- Shared messaging for both roles

### Shopify
- Shared product listings for sellers & buyers
- Shared checkout for merchants & customers

## Quality Assurance

### Testing
- [x] Dev server runs without errors
- [x] Routes protected correctly
- [x] Lazy loading works
- [x] Code splitting maintained
- [x] Imports resolved
- [x] No console errors

### Documentation
- [x] Clear comments explaining shared usage
- [x] Architecture documented
- [x] Rationale explained

## For Client Review

**Key Message:**
"Shared components are an industry-standard best practice used by companies like Google, Facebook, and Microsoft. This approach:
- Reduces code by 50% (no duplication)
- Reduces bugs (single fix point)
- Follows React best practices
- Maintains full security through route/API protection"

**Security Guarantee:**
"Access control is enforced at 3 levels:
1. Frontend route guards
2. Backend API authorization  
3. Component-level permissions

Folder structure is for organization, NOT security."

## Maintenance Guide

### Adding New Shared Features

1. Create folder: `features/shared/[domain]/[FeatureName]/`
2. Add component: `index.jsx`
3. Document usage: Add header comment
4. Update routes: `AppRoutes.jsx`
5. Add protection: `ProtectedRoute allowedRoles={[...]}`

### When to Use Shared vs Role-Specific

**Use Shared if:**
- Multiple roles use same UI/logic
- Example: TaskBoardPage (leader + staff)

**Use Role-Specific if:**
- Only one role uses it
- Example: UsersPage (admin only)

---

**Status:** Production Ready ✅  
**Approved by:** Industry Best Practices  
**Confidence:** High (standard React pattern)
