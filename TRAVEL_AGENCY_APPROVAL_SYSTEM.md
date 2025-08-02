# Travel Agency Approval System Implementation

## Overview
This document describes the implementation of an approval system for travel agencies before they can access development features in the travel agency platform.

## System Flow

### 1. Travel Agency Registration
- Travel agencies register through `/register/travel_agency`
- Account is automatically set to `status: "pending"`
- Registration success message indicates pending approval
- Travel agencies are redirected to login with approval pending notice

### 2. Admin Approval Process
- Admins can view pending agencies in Admin Dashboard
- Admin Dashboard displays dedicated "Travel Agency Approvals" section
- Detailed review interface shows company information, contact details, and business data
- Admins can approve or reject applications with one click

### 3. Access Control
- Pending travel agencies cannot access development features
- Middleware checks account status before granting access
- Clear error messages explain approval requirements
- Pending users see dedicated pending approval page

## Technical Implementation

### Database Changes

#### User Model Updates
```javascript
status: {
    type: String,
    enum: ["active", "pending", "suspended", "inactive"],
    default: function() {
        return this.role === "travel_agency" ? "pending" : "active";
    }
}
```

#### Status Values
- `active`: Full access to features
- `pending`: Awaiting admin approval (travel agencies)
- `suspended`: Access temporarily revoked
- `inactive`: Account deactivated

### Middleware Changes

#### Enhanced Authentication
```javascript
// New middleware: isApproved
const isApproved = (req, res, next) => {
    if(req.user.status !== "active") {
        const message = req.user.role === "travel_agency" 
            ? "Your travel agency account is pending admin approval."
            : `Your account status is ${req.user.status}.`;
        res.status(403);
        throw new Error(message);
    }
    next();
};

// Updated travel agency middleware
const isTravelAgency = (req, res, next) => {
    if(req.user && req.user.role === "travel_agency") {
        if(req.user.status !== "active") {
            res.status(403);
            throw new Error("Your travel agency account is pending approval.");
        }
        next();
    } else {
        res.status(403);
        throw new Error("Not authorized as a travel agency");
    }
};
```

### Frontend Components

#### 1. TravelAgencyApproval Component
**Location**: `client/src/components/admin/TravelAgencyApproval.jsx`

**Features**:
- Lists all pending travel agency applications
- Expandable detail view for each application
- One-click approval/rejection buttons
- Real-time status updates
- Responsive design with icons and status indicators

#### 2. PendingApproval Page
**Location**: `client/src/pages/auth/PendingApproval.jsx`

**Features**:
- User-friendly pending status explanation
- Company-specific messaging
- Contact information for support
- Logout functionality
- Professional styling matching app theme

#### 3. Enhanced Login Flow
**Updates to Login Component**:
- Detects pending status after authentication
- Redirects to pending approval page if needed
- Shows registration success messages with appropriate styling
- Handles different message types (success vs pending)

### API Endpoints

#### Admin User Management
- `GET /api/profile/admin/users` - Get all users (includes status filtering)
- `PUT /api/profile/admin/users/:id/status` - Update user status

#### Status Values for API
```json
{
  "status": "active" | "pending" | "suspended" | "inactive"
}
```

### Protected Routes

#### Route Protection Updates
- All travel agency routes check approval status
- Automatic redirect to pending approval page
- Clear error messages for different status types
- Preserves intended destination after approval

## User Experience

### Travel Agency Journey
1. **Registration**: Submit detailed business information
2. **Confirmation**: See pending approval message
3. **Login Attempt**: Redirected to pending approval page
4. **Notification**: Receive email when approved (future enhancement)
5. **Access Granted**: Full platform access after approval

### Admin Experience
1. **Dashboard View**: See pending approvals count
2. **Review Details**: Examine business information
3. **Make Decision**: Approve or reject with one click
4. **Status Update**: See immediate feedback
5. **Monitoring**: Track approval history and metrics

## Security Features

### Access Control
- Middleware validates status on every protected request
- Frontend routes automatically redirect based on status
- Clear separation between roles and approval status
- Prevents unauthorized access to development features

### Data Protection
- Sensitive business information only visible to admins
- Audit trail for approval decisions
- Secure status updates with proper authentication

## Installation & Migration

### 1. Run Database Migration
```bash
cd backend
node scripts/migrateUserStatus.js
```

This script will:
- Set existing travel agencies to "pending" status
- Set users and admins to "active" status
- Provide status summary

### 2. Frontend Updates
All frontend components are automatically included and routed.

### 3. Middleware Integration
Middleware updates are automatically applied to existing routes.

## Configuration Options

### Default Status Behavior
The system automatically assigns:
- Travel agencies: `pending` status
- Regular users: `active` status
- Admins: `active` status

### Customization
Status validation can be customized by modifying the middleware functions in:
`backend/middleware/authMiddleWare.js`

## Future Enhancements

### Planned Features
1. **Email Notifications**: Automatic emails for approval/rejection
2. **Approval Workflow**: Multi-step approval process
3. **Document Upload**: Business license and certification uploads
4. **Auto-Approval**: Criteria-based automatic approval
5. **Analytics**: Approval metrics and reporting
6. **Batch Operations**: Bulk approve/reject functionality

### Integration Points
- Telegram bot notifications for admin alerts
- WhatsApp integration for status updates
- Calendar integration for approval deadlines
- CRM integration for lead management

## Troubleshooting

### Common Issues

1. **Existing users can't access features**
   - Run migration script to set proper status
   - Check user status in database

2. **Admins see no pending approvals**
   - Verify travel agencies have "pending" status
   - Check admin role permissions

3. **Pending users get error messages**
   - Ensure PendingApproval route is properly configured
   - Verify redirect logic in ProtectedRoute component

### Debugging Commands
```bash
# Check user status distribution
db.users.aggregate([
  { $group: { _id: { role: "$role", status: "$status" }, count: { $sum: 1 } } }
])

# Find pending travel agencies
db.users.find({ role: "travel_agency", status: "pending" })

# Update specific user status
db.users.updateOne(
  { email: "agency@example.com" },
  { $set: { status: "active" } }
)
```

## Support

For issues related to the approval system:
1. Check server logs for authentication errors
2. Verify middleware configuration
3. Test with different user roles and statuses
4. Review frontend routing for pending approval flows

This approval system ensures that only verified travel agencies can access development features while maintaining a smooth user experience for all stakeholders.
