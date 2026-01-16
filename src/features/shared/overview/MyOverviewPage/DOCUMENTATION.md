// features/shared/overview/MyOverviewPage/index.jsx

/**
 * My Overview Page
 * 
 * USAGE: Shared by LEADER and STAFF roles
 * 
 * ROUTE:
 * - Path: /my-overview
 * - Roles: ['leader', 'staff']
 * - Protected: Yes (via ProtectedRoute middleware)
 * 
 * ACCESS CONTROL:
 * - Frontend: ProtectedRoute checks user.role
 * - Backend: API validates token and role permissions
 * 
 * SECURITY NOTE:
 * This component is in 'shared' because Leader and Staff 
 * use the SAME UI/logic. Access control is enforced by:
 * 1. Route-level protection (ProtectedRoute)
 * 2. Backend API authorization
 * 3. Component-level conditional rendering (if needed)
 * 
 * WHY SHARED?
 * - Avoids code duplication
 * - Single source of truth
 * - Industry best practice (DRY principle)
 * - Easier maintenance and testing
 * 
 * @see AppRoutes.jsx for route configuration
 * @see ProtectedRoute.jsx for access control
 */

// ... existing MyOverviewPage code ...
