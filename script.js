// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const modal = document.getElementById('calculator-modal');
const closeBtn = document.querySelector('.close');
const calculatorContent = document.getElementById('calculator-content');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

// Enhanced User Authentication System
class UserAuth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add logout button to navbar if user is logged in
        this.updateNavbar();
    }

    checkAuthStatus() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            } catch (e) {
                this.logout();
            }
        }
    }

    updateNavbar() {
        const navMenu = document.querySelector('.nav-menu');
        const existingAuthItem = document.querySelector('.nav-auth-item');
        
        if (existingAuthItem) {
            existingAuthItem.remove();
        }

        if (this.currentUser) {
            const authItem = document.createElement('li');
            authItem.className = 'nav-auth-item';
            authItem.innerHTML = `
                <div class="user-menu">
                    <span class="user-name">${this.currentUser.username}</span>
                    <div class="user-dropdown">
                        <a href="user_portal.html" class="nav-link">My Portal</a>
                        <a href="#" onclick="userAuth.logout()" class="nav-link">Logout</a>
                    </div>
                </div>
            `;
            navMenu.appendChild(authItem);
        }
    }

    updateUI() {
        const authContainer = document.getElementById('auth-container');
        const portalLink = document.getElementById('portal-link');
        
        if (this.currentUser) {
            authContainer.style.display = 'none';
            portalLink.style.display = 'inline';
            portalLink.innerHTML = `<i class="fas fa-user"></i> Welcome, ${this.currentUser.username}!`;
            this.updateNavbar();
        } else {
            authContainer.style.display = 'block';
            portalLink.style.display = 'none';
            this.updateNavbar();
        }
    }

    signUp(username, password, email) {
        if (!username || !password || !email) {
            throw new Error('Please fill in all fields.');
        }

        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters long.');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
        }

        // Check if user already exists
        const existingUser = localStorage.getItem(`user_${username}`);
        if (existingUser) {
            throw new Error('Username already exists.');
        }

        // Create user profile
        const userProfile = {
            username: username,
            email: email,
            createdAt: new Date().toISOString(),
            healthData: {
                assessments: [],
                goals: [],
                progress: []
            },
            preferences: {
                notifications: true,
                privacy: 'private'
            }
        };

        // Store user data (in a real app, this would be hashed and stored securely)
        localStorage.setItem(`user_${username}`, JSON.stringify({
            password: password,
            profile: userProfile
        }));

        return true;
    }

    login(username, password) {
        const userData = localStorage.getItem(`user_${username}`);
        if (!userData) {
            throw new Error('Invalid username or password.');
        }

        try {
            const user = JSON.parse(userData);
            if (user.password !== password) {
                throw new Error('Invalid username or password.');
            }

            this.currentUser = user.profile;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUI();
            return true;
        } catch (e) {
            throw new Error('Invalid username or password.');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        window.location.href = 'index.html';
    }

    saveHealthData(data) {
        if (!this.currentUser) {
            throw new Error('User not authenticated.');
        }

        const userData = localStorage.getItem(`user_${this.currentUser.username}`);
        if (userData) {
            const user = JSON.parse(userData);
            user.profile.healthData.assessments.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            
            localStorage.setItem(`user_${this.currentUser.username}`, JSON.stringify(user));
            this.currentUser = user.profile;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    getUserHealthData() {
        if (!this.currentUser) {
            return null;
        }
        return this.currentUser.healthData;
    }

    updateUserProfile(updates) {
        if (!this.currentUser) {
            throw new Error('User not authenticated.');
        }

        const userData = localStorage.getItem(`user_${this.currentUser.username}`);
        if (userData) {
            const user = JSON.parse(userData);
            user.profile = { ...user.profile, ...updates };
            
            localStorage.setItem(`user_${this.currentUser.username}`, JSON.stringify(user));
            this.currentUser = user.profile;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }
}

// Initialize authentication system
const userAuth = new UserAuth();

// Authentication UI functions
function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function showSignUp() {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

function signUp() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const email = document.getElementById('signup-email').value;

    try {
        userAuth.signUp(username, password, email);
        alert('Sign up successful! Please log in.');
        showLogin();
        // Clear form
        document.getElementById('signup-username').value = '';
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-email').value = '';
    } catch (error) {
        alert(error.message);
    }
}

function logIn() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        userAuth.login(username, password);
        alert('Login successful!');
        window.location.href = 'user_portal.html';
    } catch (error) {
        alert(error.message);
    }
}

// Health Assessment Variables
let currentStep = 1;
const totalSteps = 3;

// Navigation between assessment steps
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            document.getElementById(`step-${currentStep}`).classList.remove('active');
            currentStep++;
            document.getElementById(`step-${currentStep}`).classList.add('active');
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
    }
}

// Validate current step before proceeding
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const inputs = currentStepElement.querySelectorAll('input, select');
    
    for (let input of inputs) {
        if (input.hasAttribute('required') && !input.value) {
            alert('Please fill in all required fields before proceeding.');
            return false;
        }
    }
    
    // Additional validation for specific steps
    if (currentStep === 1) {
        const age = document.getElementById('age').value;
        const weight = document.getElementById('weight').value;
        const height = document.getElementById('height').value;
        
        if (age < 1 || age > 120) {
            alert('Please enter a valid age between 1 and 120.');
            return false;
        }
        
        if (weight < 20 || weight > 300) {
            alert('Please enter a valid weight between 20 and 300 kg.');
            return false;
        }
        
        if (height < 100 || height > 250) {
            alert('Please enter a valid height between 100 and 250 cm.');
            return false;
        }
    }
    
    return true;
}

// Generate personalized health recommendations
function generateRecommendations() {
    if (!validateCurrentStep()) {
        return;
    }
    
    // Collect all form data
    const formData = {
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        weight: parseFloat(document.getElementById('weight').value),
        height: parseInt(document.getElementById('height').value),
        activity: document.getElementById('activity').value,
        sleep: document.getElementById('sleep').value,
        stress: document.getElementById('stress').value,
        diet: document.getElementById('diet').value,
        goals: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
        timeline: document.getElementById('timeline').value
    };
    
    // Calculate BMI
    const bmi = calculateBMI(formData.weight, formData.height);
    const bmiCategory = getBMICategory(bmi);
    
    // Generate recommendations based on data
    const recommendations = generateRecommendationsList(formData, bmi, bmiCategory);
    const actionPlan = generateActionPlan(formData, bmi, bmiCategory);
    
    // Display results
    displayResults(bmi, bmiCategory, recommendations, actionPlan);
    
    // Save health data if user is authenticated
    if (userAuth.currentUser) {
        try {
            userAuth.saveHealthData({
                ...formData,
                bmi: bmi,
                bmiCategory: bmiCategory,
                recommendations: recommendations,
                actionPlan: actionPlan
            });
        } catch (error) {
            console.error('Failed to save health data:', error);
        }
    }
    
    // Hide form and show results
    document.querySelector('.assessment-form').style.display = 'none';
    document.getElementById('assessment-results').style.display = 'block';
}

// Calculate BMI
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Get BMI category
function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

// Generate recommendations list
function generateRecommendationsList(data, bmi, bmiCategory) {
    const recommendations = [];
    
    // BMI-based recommendations
    if (bmi < 18.5) {
        recommendations.push('Consider increasing caloric intake with nutrient-dense foods');
        recommendations.push('Focus on strength training to build muscle mass');
        recommendations.push('Consult with a nutritionist for personalized meal planning');
    } else if (bmi >= 25) {
        recommendations.push('Create a caloric deficit through diet and exercise');
        recommendations.push('Increase physical activity to at least 150 minutes per week');
        recommendations.push('Focus on whole foods and portion control');
    }
    
    // Activity level recommendations
    if (data.activity === 'sedentary') {
        recommendations.push('Start with light walking and gradually increase activity');
        recommendations.push('Set a goal of 10,000 steps per day');
        recommendations.push('Consider joining fitness classes or sports activities');
    }
    
    // Sleep recommendations
    if (data.sleep === 'poor' || data.sleep === 'fair') {
        recommendations.push('Establish a consistent sleep schedule');
        recommendations.push('Create a relaxing bedtime routine');
        recommendations.push('Limit screen time before bed');
        recommendations.push('Ensure your bedroom is dark, quiet, and cool');
    }
    
    // Stress management
    if (data.stress === 'high' || data.stress === 'very-high') {
        recommendations.push('Practice daily meditation or deep breathing exercises');
        recommendations.push('Consider yoga or tai chi for stress relief');
        recommendations.push('Set boundaries and learn to say no');
        recommendations.push('Seek professional help if stress becomes overwhelming');
    }
    
    // Goal-specific recommendations
    if (data.goals.includes('weight-loss')) {
        recommendations.push('Track your food intake and physical activity');
        recommendations.push('Aim for a 500-750 calorie daily deficit');
        recommendations.push('Include both cardio and strength training');
    }
    
    if (data.goals.includes('muscle-gain')) {
        recommendations.push('Consume adequate protein (1.6-2.2g per kg body weight)');
        recommendations.push('Focus on progressive overload in strength training');
        recommendations.push('Ensure sufficient rest and recovery between workouts');
    }
    
    if (data.goals.includes('energy')) {
        recommendations.push('Maintain stable blood sugar with regular meals');
        recommendations.push('Stay hydrated throughout the day');
        recommendations.push('Get adequate sleep and manage stress');
    }
    
    return recommendations;
}

// Generate action plan
function generateActionPlan(data, bmi, bmiCategory) {
    const actionPlan = [];
    
    // Weekly goals
    actionPlan.push('Set aside 30 minutes daily for physical activity');
    actionPlan.push('Plan and prepare healthy meals for the week');
    actionPlan.push('Track your progress in a health journal or app');
    
    // Monthly goals
    actionPlan.push('Schedule a follow-up assessment in 4 weeks');
    actionPlan.push('Join a fitness class or find a workout buddy');
    actionPlan.push('Research and try new healthy recipes');
    
    // Long-term goals
    actionPlan.push('Aim for sustainable lifestyle changes rather than quick fixes');
    actionPlan.push('Build a support network of friends and family');
    actionPlan.push('Consider working with health professionals for guidance');
    
    return actionPlan;
}

// Display assessment results
function displayResults(bmi, bmiCategory, recommendations, actionPlan) {
    document.getElementById('bmi-value').textContent = bmi;
    document.getElementById('bmi-category').textContent = bmiCategory;
    
    const recommendationsList = document.getElementById('recommendations-list');
    const actionPlanList = document.getElementById('action-plan-list');
    
    // Display recommendations
    recommendationsList.innerHTML = '<ul>' + 
        recommendations.map(rec => `<li>${rec}</li>`).join('') + 
        '</ul>';
    
    // Display action plan
    actionPlanList.innerHTML = '<ul>' + 
        actionPlan.map(plan => `<li>${plan}</li>`).join('') + 
        '</ul>';
}

// Reset assessment
function resetAssessment() {
    // Reset form
    document.querySelectorAll('input, select').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Reset steps
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
    currentStep = 1;
    
    // Show form and hide results
    document.querySelector('.assessment-form').style.display = 'block';
    document.getElementById('assessment-results').style.display = 'none';
}

// Calculator functionality
function openCalculator(type) {
    modal.style.display = 'block';
    
    if (type === 'bmi') {
        calculatorContent.innerHTML = `
            <h3>BMI Calculator</h3>
            <div class="form-group">
                <label for="calc-weight">Weight (kg)</label>
                <input type="number" id="calc-weight" min="20" max="300" step="0.1" placeholder="Enter weight">
            </div>
            <div class="form-group">
                <label for="calc-height">Height (cm)</label>
                <input type="number" id="calc-height" min="100" max="250" placeholder="Enter height">
            </div>
            <button class="btn btn-primary" onclick="calculateBMIResult()">Calculate BMI</button>
            <div id="bmi-result" style="margin-top: 1rem; display: none;"></div>
        `;
    } else if (type === 'bmr') {
        calculatorContent.innerHTML = `
            <h3>BMR Calculator</h3>
            <div class="form-group">
                <label for="calc-age">Age</label>
                <input type="number" id="calc-age" min="1" max="120" placeholder="Enter age">
            </div>
            <div class="form-group">
                <label for="calc-gender">Gender</label>
                <select id="calc-gender">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <div class="form-group">
                <label for="calc-weight-bmr">Weight (kg)</label>
                <input type="number" id="calc-weight-bmr" min="20" max="300" step="0.1" placeholder="Enter weight">
            </div>
            <div class="form-group">
                <label for="calc-height-bmr">Height (cm)</label>
                <input type="number" id="calc-height-bmr" min="100" max="250" placeholder="Enter height">
            </div>
            <button class="btn btn-primary" onclick="calculateBMRResult()">Calculate BMR</button>
            <div id="bmr-result" style="margin-top: 1rem; display: none;"></div>
        `;
    }
}

// Calculate BMI result
function calculateBMIResult() {
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const height = parseInt(document.getElementById('calc-height').value);
    
    if (weight && height) {
        const bmi = calculateBMI(weight, height);
        const category = getBMICategory(bmi);
        const resultDiv = document.getElementById('bmi-result');
        
        resultDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                <h4>Your BMI Result</h4>
                <p><strong>BMI:</strong> ${bmi}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Interpretation:</strong> ${getBMIInterpretation(category)}</p>
            </div>
        `;
        resultDiv.style.display = 'block';
    } else {
        alert('Please enter both weight and height values.');
    }
}

// Calculate BMR result
function calculateBMRResult() {
    const age = parseInt(document.getElementById('calc-age').value);
    const gender = document.getElementById('calc-gender').value;
    const weight = parseFloat(document.getElementById('calc-weight-bmr').value);
    const height = parseInt(document.getElementById('calc-height-bmr').value);
    
    if (age && gender && weight && height) {
        const bmr = calculateBMR(age, gender, weight, height);
        const resultDiv = document.getElementById('bmr-result');
        
        resultDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                <h4>Your BMR Result</h4>
                <p><strong>Basal Metabolic Rate:</strong> ${bmr} calories/day</p>
                <p><strong>Daily Calorie Needs (Sedentary):</strong> ${Math.round(bmr * 1.2)} calories</p>
                <p><strong>Daily Calorie Needs (Active):</strong> ${Math.round(bmr * 1.55)} calories</p>
            </div>
        `;
        resultDiv.style.display = 'block';
    } else {
        alert('Please fill in all fields.');
    }
}

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(age, gender, weight, height) {
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    return Math.round(bmr);
}

// Get BMI interpretation
function getBMIInterpretation(category) {
    const interpretations = {
        'Underweight': 'You may need to gain weight. Consult with a healthcare provider.',
        'Normal weight': 'Great! You\'re in a healthy weight range. Maintain your current lifestyle.',
        'Overweight': 'Consider lifestyle changes to improve your health. Focus on diet and exercise.',
        'Obese': 'It\'s important to work with healthcare professionals to develop a weight management plan.'
    };
    return interpretations[category] || '';
}

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Resource functions
function showNutritionGuide() {
    alert('Nutrition Guide: This would open a comprehensive guide to healthy eating, meal planning, and nutrition tips.');
}

function showExerciseLibrary() {
    alert('Exercise Library: This would display a collection of workout routines, exercise demonstrations, and fitness tips.');
}

function showMentalWellness() {
    alert('Mental Wellness: This would show resources for stress management, mindfulness practices, and mental health support.');
}

function showSleepGuide() {
    alert('Sleep Guide: This would provide tips for better sleep hygiene, establishing routines, and improving sleep quality.');
}

function openHealthTracker() {
    alert('Health Tracker: This would open an interactive tool for tracking various health metrics and progress over time.');
}

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
        // Add any initialization code here
        console.log('HealthHub website loaded successfully!');
        
        // Add smooth reveal animation for sections
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });

        userAuth.init(); // Initialize user authentication UI
        
        // Add demo data creation for testing
        addDemoDataButton();
    });

    // Function to add demo data button for testing
    function addDemoDataButton() {
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            const demoButton = document.createElement('button');
            demoButton.innerHTML = '<i class="fas fa-magic"></i> Create Demo Account';
            demoButton.style.cssText = `
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                margin-top: 20px;
            `;
            demoButton.onclick = createDemoAccount;
            authContainer.appendChild(demoButton);
        }
    }

    // Function to create a demo account with sample data
    function createDemoAccount() {
        const demoUsername = 'demo_user';
        const demoPassword = 'demo123';
        const demoEmail = 'demo@healthhub.com';
        
        try {
            // Create demo user
            userAuth.signUp(demoUsername, demoPassword, demoEmail);
            
            // Add sample health data
            const userData = localStorage.getItem(`user_${demoUsername}`);
            if (userData) {
                const user = JSON.parse(userData);
                
                // Add sample assessment
                user.profile.healthData.assessments.push({
                    age: 28,
                    gender: 'female',
                    weight: 65,
                    height: 165,
                    activity: 'moderate',
                    sleep: 'good',
                    stress: 'moderate',
                    diet: 'balanced',
                    goals: ['weight-loss', 'energy'],
                    timeline: '3-months',
                    bmi: 23.9,
                    bmiCategory: 'Normal weight',
                    recommendations: [
                        'Maintain current healthy weight',
                        'Continue moderate exercise routine',
                        'Focus on stress management techniques'
                    ],
                    actionPlan: [
                        'Exercise 3-4 times per week',
                        'Practice mindfulness daily',
                        'Maintain balanced diet'
                    ],
                    timestamp: new Date().toISOString(),
                    id: Date.now()
                });
                
                // Add sample goals
                user.profile.healthData.goals.push({
                    title: 'Weight Management',
                    target: 'Maintain 65kg',
                    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                    progress: 75,
                    createdAt: new Date().toISOString()
                });
                
                user.profile.healthData.goals.push({
                    title: 'Fitness Goal',
                    target: 'Run 10km',
                    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                    progress: 40,
                    createdAt: new Date().toISOString()
                });
                
                localStorage.setItem(`user_${demoUsername}`, JSON.stringify(user));
            }
            
            alert('Demo account created successfully!\n\nUsername: demo_user\nPassword: demo123\n\nYou can now log in to see sample data.');
            showLogin();
            
        } catch (error) {
            alert('Demo account already exists! Use:\nUsername: demo_user\nPassword: demo123');
            showLogin();
        }
    }
