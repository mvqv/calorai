# Requirements Document

## 1. Application Overview

### 1.1 Name and Description
- **Name**: Calorie Tracking and Nutrition Analysis Application
- **Description**: Mobile application for tracking calorie intake, analyzing macronutrients, and monitoring weight to achieve individual user goals

## 2. Users and Use Cases

### 2.1 Target Users
- People aiming to control weight (weight loss, muscle gain, maintenance)
- Users wanting to track macronutrient balance
- People leading a healthy lifestyle

### 2.2 Primary Use Cases
- Daily tracking of consumed calories and macronutrients
- Planning nutrition according to individual targets
- Analyzing weight and nutrition trends over time
- Quick product addition via search or barcode scanning

## 3. Screen Structure and Functionality

### 3.1 Screen Structure

```
Application
├── Onboarding
│   ├── Welcome Slides (3-4 screens)
│   ├── Login Screen
│   ├── Registration Screen
│   └── Profile Setup Screen
├── Dashboard (Main Screen)
├── Food Diary
│   ├── Meal List
│   └── Add Product
│       ├── Database Search
│       ├── Barcode Scanner
│       └── Photo Recognition (optional)
└── Analytics
    ├── Weight Chart
    └── Calorie Chart
```

### 3.2 Design System

#### 3.2.1 Visual Style
- **Design Style**: Liquid glass (glassmorphism)
- **Primary Color**: Orange (#FF6B35)
- **Background**: Gradient background
- **Cards**: White/transparent glass cards with backdrop-blur effect
- **Interactive Elements**: All buttons, icons, interactive elements in orange
- **Typography**: Clean, minimalist
- **Effects**: Glass effect, blur (backdrop-blur), transparency

#### 3.2.2 UI Language
- All interface texts, labels, buttons, messages in English

### 3.3 Onboarding

#### 3.3.1 Welcome Slides
- 3-4 full-screen slides with high-quality photos of food and fitness
- Modern liquid glass design style
- Each slide contains:
  - High-quality background photo
  - Headline text
  - Description text
  - Progress indicator (dots)
  - \"Next\" button (orange)
  - \"Skip\" button on first slides
- Final slide includes \"Get Started\" button leading to Login/Registration

#### 3.3.2 Authentication System (Supabase Auth)

**Login Screen**
- Email input field
- Password input field
- \"Log In\" button (orange)
- \"Forgot Password?\" link
- \"Don't have an account? Sign Up\" link
- Glass card design with backdrop-blur

**Registration Screen**
- Name input field
- Email input field
- Password input field
- \"Sign Up\" button (orange)
- \"Already have an account? Log In\" link
- Glass card design with backdrop-blur

**Route Protection**
- Unauthenticated users can only access:
  - Onboarding slides
  - Login screen
  - Registration screen
- After successful login:
  - New users → Profile Setup Screen
  - Returning users → Dashboard

**Logout**
- Logout option available in profile/settings
- After logout → redirect to Login screen

#### 3.3.3 Profile Setup Screen
- User data input:
  - Age (years)
  - Weight (kg)
  - Height (cm)
  - Gender (Male/Female)
  - Activity Level (Sedentary, Low, Moderate, High, Very High)
  - Goal (Weight Loss, Muscle Gain, Maintenance)
- Automatic calculation of daily calorie target based on input data
- Display of calculated calorie target
- \"Continue\" button (orange)

### 3.4 Dashboard (Main Screen)

#### 3.4.1 Calorie Progress
- Progress bar showing consumed calories relative to daily target
- Numeric values display:
  - Consumed calories
  - Daily target
  - Remaining calories
- Glass card design with orange accent

#### 3.4.2 Macronutrients (Protein/Fat/Carbs)
- Three circular progress indicators:
  - Protein (grams and percentage of target)
  - Fat (grams and percentage of target)
  - Carbs (grams and percentage of target)
- Glass card design

#### 3.4.3 Quick Access
- Button to Food Diary (orange)
- Button to Analytics (orange)

### 3.5 Food Diary

#### 3.5.1 Meal List
- Categories:
  - Breakfast
  - Lunch
  - Dinner
  - Snacks
- For each meal:
  - List of added products with name, quantity, and calories
  - Total calories and macros per meal
  - \"Add Product\" button (orange)
- Glass card design for each meal section

#### 3.5.2 Add Product

**Database Search**
- Text input field for product name
- Search products in OpenFoodFacts API database
- Display search results with:
  - Product name
  - Calories per 100g
  - Macros per 100g
- Select product from results
- Enter product quantity (grams)
- Automatic calculation of calories and macros for specified quantity
- Select meal type (Breakfast, Lunch, Dinner, Snack)
- Save product to diary

**Barcode Scanner**
- Activate camera for barcode scanning
- Automatic product search by barcode via OpenFoodFacts API
- Display found product information
- Enter quantity and save similar to database search

**Photo Recognition (optional)**
- Upload food photo
- AI-powered product recognition
- Display suggested products and quantities
- User confirmation or correction
- Save to diary

### 3.6 Analytics

#### 3.6.1 Weight Chart
- Line chart showing weight changes over selected period (week/month)
- X-axis: dates
- Y-axis: weight (kg)
- Display current weight and trend (gain/loss)
- Glass card design

#### 3.6.2 Calorie Chart
- Bar chart of calorie consumption over selected period (week/month)
- X-axis: dates
- Y-axis: calories
- Daily target line for comparison
- Display average consumption for period
- Glass card design

## 4. Business Rules and Logic

### 4.1 Daily Calorie Target Calculation

**Mifflin-St Jeor Formula:**

For males:
- BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5

For females:
- BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161

**Activity Coefficients:**
- Sedentary: BMR × 1.2
- Low activity (1-3 days/week): BMR × 1.375
- Moderate activity (3-5 days/week): BMR × 1.55
- High activity (6-7 days/week): BMR × 1.725
- Very high activity (intense training): BMR × 1.9

**Goal Adjustment:**
- Weight loss: daily target - 500 kcal
- Muscle gain: daily target + 500 kcal
- Maintenance: daily target unchanged

### 4.2 Macronutrient Calculation

**Standard Macro Distribution:**
- Protein: 30% of daily calorie target (1g = 4 kcal)
- Fat: 30% of daily calorie target (1g = 9 kcal)
- Carbs: 40% of daily calorie target (1g = 4 kcal)

### 4.3 Data Updates

- Dashboard data updates with each product addition/deletion in diary
- Calorie and macro progress calculated based on all products added for current day
- Weight chart updates when user enters new weight value
- Calorie chart updates daily based on food diary data

### 4.4 Authentication Flow (Supabase Auth)

- User registration creates account in Supabase Auth
- User login validates credentials via Supabase Auth
- Session management handled by Supabase Auth
- Protected routes check authentication status
- New users redirected to Profile Setup after registration
- Returning users redirected to Dashboard after login
- Logout clears session and redirects to Login screen

### 4.5 Data Storage

**Database Structure:**

**Table: users**
- id (primary key)
- email
- created_at

**Table: profiles**
- id (primary key)
- user_id (foreign key to users)
- age
- weight
- height
- gender
- activity_level
- goal
- daily_calorie_target
- protein_target
- fat_target
- carbs_target
- updated_at

**Table: food_items**
- id (primary key)
- name
- calories_per_100g
- protein_per_100g
- fat_per_100g
- carbs_per_100g
- barcode (optional)
- source (OpenFoodFacts API or custom)

**Table: daily_logs**
- id (primary key)
- user_id (foreign key to users)
- date
- total_calories
- total_protein
- total_fat
- total_carbs
- weight (optional, for weight chart)

**Table: log_items**
- id (primary key)
- daily_log_id (foreign key to daily_logs)
- food_item_id (foreign key to food_items)
- meal_type (Breakfast, Lunch, Dinner, Snack)
- quantity_grams
- calories
- protein
- fat
- carbs
- created_at

## 5. Exception Handling and Edge Cases

| Situation | Handling |
|-----------|----------|
| Product not found in OpenFoodFacts | Display message: \"Product not found. Try another search\" |
| Barcode not recognized | Display message: \"Barcode not recognized. Try again or use search\" |
| User did not enter product quantity | Block save button until quantity entered |
| User entered invalid profile data (negative/zero values) | Display error message and block save |
| Insufficient data for charts | Display message: \"Not enough data to display chart\" |
| Daily calorie target exceeded | Progress bar fills completely, remaining calories shown as negative |
| No internet connection during product search | Display message: \"No internet connection. Check your connection\" |
| Photo recognition error (optional) | Display message: \"Could not recognize products. Try another photo or use search\" |
| Invalid login credentials | Display message: \"Invalid email or password\" |
| Email already registered | Display message: \"Email already in use\" |
| Weak password | Display message: \"Password must be at least 6 characters\" |
| Session expired | Redirect to Login screen |

## 6. Acceptance Criteria

1. User views onboarding slides (3-4 screens with high-quality photos) and taps \"Get Started\"
2. User registers by entering name, email, and password on Registration screen
3. User completes Profile Setup by entering age, weight, height, gender, activity level, and goal, then sees calculated daily calorie target
4. User sees Dashboard with calorie progress bar (0 of target) and empty macro circles
5. User opens Food Diary, selects meal (e.g., Breakfast), searches for product via database search, enters quantity, and saves
6. User sees updated data in Food Diary and Dashboard reflecting added product
7. User navigates to Analytics and views weight and calorie charts for the week

## 7. Features Not Implemented in Current Version

- Social features (recipe sharing, communities, activity feed)
- Integration with fitness trackers and smart scales
- Recipes and meal planning
- Notifications and meal reminders
- Data export to files
- Dark theme
- Multi-language support (English only in MVP)
- Advanced analytics (comparison with other users, recommendations)
- Manual product addition with custom parameters
- Editing and deleting added products from diary
- Changing profile data after initial setup
- Password recovery
- OAuth providers (Google, Apple, Facebook login)
- Offline mode
- Water intake tracking
- Exercise tracking