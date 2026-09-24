# TasteForge - Page Navigation Map

## Complete Page Structure

### 1. **Home Page** (index.html)
   - Entry point for the application
   - Shows: Guest option, User Sign Up, User Sign In, Owner Sign Up, Owner Sign In buttons
   - Navigation: Links to all auth pages

### 2. **Sign In Pages**
   - **signin_index.html** (Choice Landing Page)
     - Users choose between User or Owner Sign In
     - Shows: User Sign In button, Owner Sign In button, Sign Up links
   
   - **user_signin_index.html** (User Sign In)
     - Email and password login for users
    - Links to: `sign_up_page/user_index.html`, Home, `forgot_password/Forgot_index.html`
   
   - **owner_signin_index.html** (Owner Sign In)
     - Email and password login for restaurant owners
     - Links to: `sign_up_page/Owner_index.html`, Home, `forgot_password/Forgot_index.html`

### 3. **Sign Up Pages**
   - **signup_index.html** (Choice Landing Page)
     - Users choose between User or Owner Sign Up
     - Shows: User Sign Up button, Owner Sign Up button, Sign In links
   
  - **user_index.html** (User Sign Up)
     - User account creation form
    - Links to: `sign_in_page/sign_in_index.html?tab=user`
   
  - **owner_index.html** (Owner Sign Up)
     - Owner account creation form
    - Links to: `sign_in_page/sign_in_index.html?tab=owner`

### 4. **Other Pages**
   - **Forgot_index.html** (Password Recovery)
     - Email-based password reset
    - Links back to: sign_in_index.html or Home

  ## Navigation Flow

  ```
  index.html (Home)
  ├── User Sign Up → sign_up_page/Signup_index.html → sign_up_page/user_index.html
  ├── User Sign In → sign_in_page/sign_in_index.html → sign_in_page/User_Signin_index.html
  ├── Owner Sign Up → sign_up_page/Signup_index.html → sign_up_page/owner_index.html
  └── Owner Sign In → sign_in_page/sign_in_index.html → sign_in_page/Owner_Signin_index.html

  sign_in_page/User_Signin_index.html
  ├── Sign Up → sign_up_page/user_index.html
  ├── Forgot Password → forgot_password/Forgot_index.html

  sign_in_page/Owner_Signin_index.html
  ├── Sign Up → sign_up_page/owner_index.html
  ├── Forgot Password → forgot_password/Forgot_index.html

  sign_up_page/user_index.html
  ├── Sign In → sign_in_page/User_Signin_index.html

  sign_up_page/owner_index.html
  ├── Sign In → sign_in_page/Owner_Signin_index.html
  └── Guest → index.html
  ```

## Navigation Flow

```
index.html (Home)
├── User Sign Up → Sign Up Page/Signup_index.html → Sign Up Page/user_index.html
├── User Sign In → Sign In Page/sign_in_index.html → Sign In Page/User_Signin_index.html
├── User Sign Up → sign_up_page/Signup_index.html → sign_up_page/user_index.html
├── User Sign In → sign_in_page/sign_in_index.html → sign_in_page/User_Signin_index.html
├── Owner Sign Up → sign_up_page/Signup_index.html → sign_up_page/owner_index.html
└── Owner Sign In → sign_in_page/sign_in_index.html → sign_in_page/Owner_Signin_index.html

sign_in_page/User_Signin_index.html
├── Sign Up → sign_up_page/user_index.html
├── Forgot Password → forgot_password/Forgot_index.html

sign_in_page/Owner_Signin_index.html
├── Sign Up → sign_up_page/owner_index.html
├── Forgot Password → forgot_password/Forgot_index.html

sign_up_page/user_index.html
├── Sign In → sign_in_page/User_Signin_index.html

sign_up_page/owner_index.html
├── Sign In → sign_in_page/Owner_Signin_index.html
├── Sign In → Sign In Page/Owner_Signin_index.html
└── Guest → index.html
```

## Key Features
- ✅ Separate User and Owner authentication flows
- ✅ Choice pages for selecting account type
- ✅ Cross-linking between Sign In and Sign Up
- ✅ All pages link back to Home
- ✅ Guest option available
- ✅ Forgot Password flow
- ✅ Logo and navigation consistent across all pages
