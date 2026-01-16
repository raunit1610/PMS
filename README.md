# 📊 Personal Management System (PMS)

A comprehensive full-stack web application for managing your personal life in one place. Built with modern technologies to help you organize tasks, manage finances, keep a diary, store important links, and track your daily activities.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-9.0.1-47A248?logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)

## ✨ Features

### 🔐 Authentication System
- Secure user registration and login
- Password recovery functionality
- Session management with localStorage
- User profile management

### 💰 Money Management
- Track income and expenses
- Bank account management
- Monthly financial summaries
- Transaction history
- Expense categorization

### ✅ Task Management
- Create and organize tasks
- Track task completion status
- Task prioritization
- Deadline management

### 📝 To-Do Lists
- Create multiple to-do lists
- Mark items as complete
- Organize daily tasks
- Quick task management

### 📔 Daily Diary
- Personal journal entries
- Date-based organization
- Rich text entries
- Privacy-focused storage

### 🔐 Links Vault
- Secure link storage
- Organize important URLs
- Categorized link management
- Quick access to saved links

### 📊 Dashboard
- Overview of all activities
- Quick statistics and insights
- Recent activity tracking
- Unified navigation

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library
- **Vite 7.2.4** - Fast build tool and dev server
- **React Router DOM 7.10.1** - Client-side routing
- **Axios 1.13.2** - HTTP client for API calls
- **CSS3** - Modern styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express 5.2.1** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 9.0.1** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Deployment
- **Vercel** - Serverless deployment platform

## 📁 Project Structure

```
PMS/
├── Backend/
│   ├── api/
│   │   └── index.js              # Express server entry point
│   ├── assets/
│   │   ├── connectionDB.js       # MongoDB connection
│   │   └── routes/               # API route handlers
│   │       ├── AuthRouter.js
│   │       ├── DiaryRouter.js
│   │       ├── MoneyRouter.js
│   │       ├── TaskRouter.js
│   │       ├── TodoRouter.js
│   │       └── VaultRouter.js
│   ├── controllers/              # Business logic
│   │   ├── Auth.js
│   │   ├── Diary.js
│   │   ├── Money.js
│   │   ├── Task.js
│   │   ├── Todo.js
│   │   └── Vault.js
│   ├── models/                   # MongoDB schemas
│   │   ├── Auth.js
│   │   ├── BankAccount.js
│   │   ├── Diary.js
│   │   ├── MoneyDetail.js
│   │   ├── ProfessionalD.js
│   │   ├── Task.js
│   │   ├── Todo.js
│   │   └── Vault.js
│   ├── package.json
│   └── vercel.json              # Vercel configuration
│
└── Frontend/
    └── pms-app/
        ├── src/
        │   ├── Components/
        │   │   ├── Authentication/    # Login, Signup, ForgotPassword
        │   │   ├── Daily Diary/
        │   │   ├── Home/              # Dashboard
        │   │   ├── Links Vault/
        │   │   ├── Money Management/
        │   │   ├── Profile/
        │   │   ├── Task Management/
        │   │   └── To-Do Lists/
        │   ├── Utility/               # Reusable components
        │   │   ├── Elements/
        │   │   └── Styles/
        │   ├── App.jsx
        │   ├── main.jsx
        │   └── index.css
        ├── package.json
        └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB** database (local or cloud instance like MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Deployment/PMS
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend/pms-app
   npm install
   ```

### Configuration

1. **Backend Environment Variables**

   Create a `.env` file in the `Backend` directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   VERCEL=false
   ```

   For MongoDB Atlas:
   - Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get your connection string
   - Replace `<password>` and `<dbname>` in the connection string

2. **Frontend Environment Variables**

   Create a `.env` file in the `Frontend/pms-app` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

   For production:
   ```env
   VITE_API_BASE_URL=https://your-backend-api.vercel.app
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm start
   # or for development with auto-reload
   npm run dev
   ```
   Backend will run on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd Frontend/pms-app
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` to access the application

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/forgotPassword` - Password recovery

### Money Management
- `GET /feature/money/money` - Get financial transactions
- `POST /feature/money/money` - Add transaction
- `GET /feature/money/bank` - Get bank accounts
- `POST /feature/money/bank` - Add bank account

### Task Management
- `GET /feature/tasks` - Get all tasks
- `POST /feature/tasks` - Create a task
- `PUT /feature/tasks/:id` - Update a task
- `DELETE /feature/tasks/:id` - Delete a task

### To-Do Lists
- `GET /feature/todos` - Get all todos
- `POST /feature/todos` - Create a todo
- `PUT /feature/todos/:id` - Update a todo
- `DELETE /feature/todos/:id` - Delete a todo

### Diary
- `GET /feature/diary` - Get diary entries
- `POST /feature/diary` - Create diary entry
- `PUT /feature/diary/:id` - Update diary entry
- `DELETE /feature/diary/:id` - Delete diary entry

### Vault (Links)
- `GET /feature/vaults` - Get all vaults
- `POST /feature/vaults` - Create a vault
- `GET /feature/vaults/:id/items` - Get vault items
- `POST /feature/vaults/:id/items` - Add item to vault

## 🌐 Deployment

### Deploying Backend to Vercel

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm i -g vercel
   ```

2. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add environment variables:
     - `MONGODB_URI`
     - `CORS_ORIGIN` (your frontend URL)

### Deploying Frontend to Vercel

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend/pms-app
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - `VITE_API_BASE_URL` (your backend API URL)

### Alternative: Deploy Frontend to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to Netlify**

3. **Set environment variables in Netlify dashboard**

## 🧪 Development

### Available Scripts




**Backend:**
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- The project uses ESLint for code quality
- Follow React best practices
- Use functional components with hooks
- Maintain consistent code formatting

## 🔒 Security Considerations

- Environment variables are used for sensitive data
- CORS is configured for secure cross-origin requests
- Passwords should be hashed (ensure backend implements this)
- Consider implementing JWT tokens for authentication
- Validate and sanitize all user inputs

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/raunit1610)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the robust database solution
- Vercel for seamless deployment
- All contributors and users of this project

---

**Made with ❤️ using React and Node.js**

