# 📧 Gmail Integration Guide for Forgot Password System

## 🎯 **What You Need to Do**

### **Step 1: Set Up Gmail App Password**

1. **Go to your Google Account:**
   - Visit: https://myaccount.google.com/
   - Sign in with your Gmail account

2. **Enable 2-Factor Authentication:**
   - Go to Security → 2-Step Verification
   - Enable if not already enabled

3. **Generate App Password:**
   - Go to Security → App passwords
   - Select "Mail" from the dropdown
   - Select your device (or "Other")
   - Click "Generate"
   - **Copy the 16-character password** (you'll only see it once!)

### **Step 2: Create/Update .env File**

Create a `.env` file in your `backend` folder with these variables:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_NAME=Travel Agency
SMTP_FROM_EMAIL=your-email@gmail.com

# Other existing variables...
DATABASE_CLOUD=your_mongodb_connection
JWT_SECRET=your_jwt_secret
# ... etc
```

### **Step 3: Test the Configuration**

Run the test script to verify everything works:

```bash
cd backend
node test-gmail-config.js
```

### **Step 4: Verify Email Works**

1. **Check the test output** - should show ✅ success
2. **Check your Gmail inbox** - you should receive a test email
3. **If successful** - your forgot password system will work!

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Authentication failed" error:**
   - Make sure you're using the **App Password** (16 characters)
   - Not your regular Gmail password
   - 2-Factor Authentication must be enabled

2. **"Less secure app access" error:**
   - Google no longer supports this
   - You **must** use App Passwords

3. **"Invalid credentials" error:**
   - Double-check your email address
   - Make sure the App Password is copied correctly

### **Security Notes:**

- ✅ **App Passwords are secure** - they're specifically for applications
- ✅ **Can be revoked anytime** - from your Google Account settings
- ✅ **No access to your main account** - only for sending emails
- ✅ **Works with 2FA enabled** - actually required for App Passwords

## 🚀 **After Setup**

Once your Gmail is configured:

1. **Users can request password reset** from `/forgot-password`
2. **They'll receive a professional email** with reset link
3. **Click the link** to set new password
4. **System works automatically** - no manual intervention needed

## 📋 **Quick Checklist**

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated (16 characters)
- [ ] `.env` file created with all SMTP variables
- [ ] Test script runs successfully
- [ ] Test email received in inbox
- [ ] Forgot password system tested

## 🎉 **Benefits**

- **Professional email delivery** - users trust Gmail
- **High deliverability** - emails won't go to spam
- **Secure authentication** - using Google's security standards
- **Easy to manage** - can revoke access anytime
- **Free to use** - no additional email service costs

---

**Ready to proceed?** Once you've completed these steps, your forgot password system will be fully functional! 🎯 