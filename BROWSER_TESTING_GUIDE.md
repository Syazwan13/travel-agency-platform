# 🌐 Browser-Based Testing Guide for Travel Agency Features

## Quick Manual Testing Steps

### **Setup (Already Done)**
- ✅ Backend running on http://localhost:5001
- ✅ Frontend running on http://localhost:5173
- ✅ Test accounts created

## **Test Credentials**
```
Admin Account:
Email: testadmin@test.com
Password: admin123

Travel Agency (Approved):
Email: testagency@test.com  
Password: test123

Travel Agency (Pending): 
Email: info@amitravel.com
Password: [needs password reset or use registration flow]
```

---

## 🎯 **5-Minute Quick Test Scenario**

### **1. Test New Agency Registration (2 minutes)**
1. Go to: http://localhost:5173/register/travel_agency
2. Fill out the registration form:
   - Name: "Quick Test Agency"
   - Email: "quicktest@example.com"
   - Password: "test123"
   - Company Name: "Quick Test Travel Sdn Bhd"
   - Fill other required fields
3. Submit and verify redirection to login with success message

### **2. Test Pending Agency Experience (1 minute)**
1. Login with the newly created account
2. Verify redirection to pending approval page
3. Check the professional waiting message
4. Test logout functionality

### **3. Test Admin Approval (1 minute)**
1. Open new tab: http://localhost:5173/login
2. Login as admin (testadmin@test.com / admin123)
3. Navigate to admin dashboard
4. Look for "Travel Agency Approvals" section
5. Find your new agency and click "Approve"

### **4. Test Approved Agency Access (1 minute)**
1. Go back to first tab
2. Login again with the approved agency
3. Verify access to agency dashboard
4. Check dashboard statistics and interface

---

## 🔧 **Advanced Testing Scenarios**

### **Package Management Testing**
1. As approved travel agency, navigate to package management
2. Test adding a new package
3. Test editing existing packages
4. Verify provider-specific access controls

### **Profile Management Testing**
1. Access profile/settings page
2. Update company information
3. Change contact details
4. Test form validation

### **Admin Management Testing**
1. As admin, view all users
2. Test user status changes
3. View system statistics
4. Test scraping management features

---

## 📱 **Responsive Design Testing**
- Test on different screen sizes
- Verify mobile responsiveness
- Check form usability on tablets

## 🛡️ **Security Testing**
- Try accessing protected routes without authentication
- Test role-based access restrictions
- Verify CSRF protection
- Test session management

---

## 🐛 **Common Issues to Check**

### **Registration Issues**
- Form validation messages
- Email format validation
- Password confirmation matching
- Required field enforcement

### **Authentication Issues**
- Invalid login credentials
- Session timeout handling
- Token expiration
- Cross-tab session sync

### **Authorization Issues**
- Pending agency access restrictions
- Admin-only page protection
- Provider-specific package access
- Role switching verification

### **UI/UX Issues**
- Loading states
- Error message display
- Success notifications
- Navigation consistency

---

## 📊 **Expected Behaviors**

### **For Pending Travel Agencies:**
- ❌ Cannot access dashboard
- ❌ Cannot manage packages
- ✅ Can view pending approval page
- ✅ Can logout
- ✅ Can update basic profile

### **For Approved Travel Agencies:**
- ✅ Full dashboard access
- ✅ Package management
- ✅ Analytics viewing
- ✅ Profile management
- ✅ Inquiry management

### **For Admins:**
- ✅ User management
- ✅ Agency approval
- ✅ System administration
- ✅ Scraping management
- ✅ Analytics overview

---

This testing guide ensures comprehensive validation of all travel agency features in the browser environment.
