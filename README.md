# GamePlannr MVP

A sports mentorship platform that connects parents with local athlete mentors for in-person training sessions.

## 🚀 Features (Milestone 1 - Auth & Profile Setup)

- ✅ User authentication with email/password
- ✅ Role-based signup (Parent or Mentor)
- ✅ Profile creation and management
- ✅ Role-based dashboards
- ✅ Responsive design
- ✅ Modern UI/UX

## 🛠 Tech Stack

- **Frontend**: React 18, JavaScript
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe (to be integrated in Milestone 4)
- **Styling**: CSS3 with modern design patterns
- **Routing**: React Router DOM

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd gameplannr-mvp
npm install
```

### 2. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to Settings > API
3. Copy your Project URL and anon public key
4. Create a `.env` file in the root directory:

```bash
cp env.example .env
```

5. Update the `.env` file with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Schema Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  sport TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'mentor')),
  bio TEXT,
  phone TEXT,
  experience TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Start the Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## 📱 Application Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── pages/              # Page components
│   ├── HomePage.js     # Landing page
│   ├── SignUpPage.js   # User registration
│   ├── SignInPage.js   # User login
│   ├── DashboardPage.js # Role-based dashboard
│   └── ProfilePage.js  # Profile management
├── utils/              # Utility functions
│   └── supabase.js     # Supabase client configuration
└── styles/             # Additional CSS files
```

## 🎯 User Flow

### For Parents:
1. Visit homepage and browse mentor search (coming in Milestone 2)
2. Sign up with role "Parent"
3. Complete profile with child's information
4. Access parent dashboard
5. Request sessions with mentors (coming in Milestone 3)

### For Mentors:
1. Sign up with role "Mentor"
2. Complete profile with sports experience
3. Access mentor dashboard
4. Receive and respond to session requests (coming in Milestone 3)

## 🔐 Authentication Features

- Email/password authentication via Supabase Auth
- Role-based access control (Parent/Mentor)
- Protected routes
- Automatic redirects based on authentication status
- Profile management with real-time updates

## 🎨 Design Features

- Modern, clean UI design
- Responsive layout for mobile and desktop
- Role-based color schemes
- Intuitive navigation
- Form validation and error handling
- Loading states and success messages

## 📋 Next Milestones

- **Milestone 2**: Mentor Search + Public View
- **Milestone 3**: Session Request Flow
- **Milestone 4**: Stripe Checkout Integration
- **Milestone 5**: Dashboards + Final Testing/Launch

## 🐛 Troubleshooting

### Common Issues:

1. **Supabase connection errors**: Verify your `.env` file has the correct URL and key
2. **Database errors**: Ensure you've run the SQL schema setup
3. **Authentication issues**: Check Supabase Auth settings and email confirmation

### Development Tips:

- Use browser dev tools to inspect network requests
- Check Supabase dashboard for database logs
- Verify environment variables are loaded correctly

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**GamePlannr MVP** - Connecting parents with local sports mentors for personalized training sessions.# GamePlannr
# GamePlannr
# GamePlannr
