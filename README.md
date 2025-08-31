# HealthHub - Your Personalized Health Companion

A comprehensive health and wellness platform that provides personalized health assessments, resources, and tracking tools.

## Features

### 🔐 User Authentication System
- **Secure User Registration**: Create accounts with username, email, and password
- **User Login/Logout**: Secure authentication with session management
- **Personal Data Storage**: Each user's health data is stored separately and securely
- **User Profiles**: Personalized user experience with individual health tracking

### 🏥 Health Assessment
- **Multi-step Assessment**: Comprehensive health evaluation in 3 easy steps
- **Personalized Recommendations**: Get tailored health advice based on your data
- **BMI Calculation**: Automatic BMI calculation and categorization
- **Goal Setting**: Set and track health goals with timelines

### 📊 Personal Health Dashboard
- **User Portal**: Access your personal health data anytime
- **Assessment History**: View all your previous health assessments
- **Progress Tracking**: Monitor your health journey over time
- **Health Summary**: Quick overview of your current health status

### 🧮 Health Tools
- **BMI Calculator**: Calculate and interpret your BMI
- **BMR Calculator**: Determine your basal metabolic rate
- **Health Resources**: Access comprehensive health information
- **Interactive Tools**: Engage with various health calculators

### 📱 Modern UI/UX
- **Responsive Design**: Works seamlessly on all devices
- **Beautiful Interface**: Modern, clean design with smooth animations
- **User-Friendly Navigation**: Intuitive navigation and user experience
- **Accessibility**: Designed with accessibility in mind

## How to Use

### 1. Getting Started
1. Open `index.html` in your web browser
2. Click "Sign Up" to create a new account
3. Fill in your username, email, and password
4. Complete your first health assessment

### 2. Health Assessment
1. Navigate to the Health Assessment section
2. Complete the 3-step assessment process:
   - Basic Information (age, gender, weight, height)
   - Lifestyle & Health (activity, sleep, stress, diet)
   - Health Goals (select your wellness objectives)
3. Receive personalized recommendations and action plan

### 3. Accessing Your Portal
1. After login, click "Go to User Portal"
2. View your health summary and assessment history
3. Track your progress and set new goals
4. Access personalized health resources

### 4. Managing Your Account
- **Profile**: View and update your account information
- **Health Data**: Access all your assessment results
- **Goals**: Set and track your health objectives
- **Logout**: Securely sign out when finished

## Technical Details

### Authentication System
- **Local Storage**: User data stored securely in browser localStorage
- **Session Management**: Automatic login state management
- **Data Privacy**: Each user's data is completely isolated
- **Security**: Password validation and user verification

### Data Storage
- **User Profiles**: Complete user information and preferences
- **Health Assessments**: Detailed assessment results with timestamps
- **Progress Tracking**: Historical data for trend analysis
- **Goals Management**: Personal health objectives and progress

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Responsive**: Optimized for all screen sizes
- **Local Storage**: Requires localStorage support
- **JavaScript**: ES6+ features required

## File Structure

```
health_hub/
├── index.html          # Main application page with authentication
├── user_portal.html    # User dashboard and personal data
├── script.js           # Main application logic and authentication
├── styles.css          # Comprehensive styling and responsive design
└── README.md           # This documentation file
```

## Security Features

- **User Isolation**: Each user can only access their own data
- **Session Management**: Secure login/logout functionality
- **Data Validation**: Input validation and sanitization
- **Privacy Protection**: Personal data never shared between users

## Future Enhancements

- **Cloud Storage**: Move from localStorage to secure cloud database
- **Password Hashing**: Implement secure password encryption
- **Two-Factor Authentication**: Enhanced security measures
- **Data Export**: Allow users to download their health data
- **Social Features**: Community support and sharing options
- **Mobile App**: Native mobile application development

## Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Create an Account** using the sign-up form
4. **Complete** your first health assessment
5. **Explore** your personalized health portal

## Support

For questions or support, please refer to the documentation or contact the development team.

---

**Note**: This is a demonstration application. In a production environment, implement proper security measures including server-side validation, secure databases, and encrypted communication.
