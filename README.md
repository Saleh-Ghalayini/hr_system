# HR-System

## Summary
The **HR-System** is an integrated Human Resource Management and Onboarding platform designed to streamline HR processes using **React** for the frontend and **Laravel** for the backend. This system provides features such as employee management, attendance tracking, payroll integration, performance management, and an AI Agent for intelligent HR assistance. The project is structured into multiple modules, each handled by different team members to ensure efficient and seamless HR functionalities.

## Key Features
- **Employee Management**: Full CRUD operations for employee profiles, including registration and updates.
- **Attendance Tracking**: Clock in/out system with geolocation verification for accurate time tracking.
- **Leave Management**: System to manage leave requests, approvals, and tracking.
- **Payroll Integration**: Automated salary processing, deductions, and tax calculations.
- **Recruitment and Onboarding**: Candidate tracking system with onboarding checklist functionalities.
- **Performance Management**: Regular appraisals, feedback, and goal tracking.
- **Document Management**: Secure repository for employee contracts, certifications, and important documents.
- **Training and Development**: Training portal with courses, certifications, and skill assessments.
- **Benefits Management**: Management of health plans, retirement options, and perks.
- **Compliance and Reporting**: Regulatory compliance tracking and automated reporting.
- **Task Assignment and Project Tracking**: Internal task management for HR-related projects.
- **Dashboard Analytics**: Interactive dashboards for visualizing key HR metrics and KPIs.


## Installation
### Prerequisites
Ensure you have the following installed on your system:
- **Node.js** & npm
- **PHP** & Composer
- **Laravel** framework
- **MySQL** database
- **Git**

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/HR-System.git
   ```
2. Navigate into the project directory:
   ```sh
   cd HR-System
   ```
3. Install backend dependencies:
   ```sh
   cd hr-system-backend
   composer install
   ```
4. Configure environment variables:
   ```sh
   cp .env.example .env
   php artisan key:generate
   ```
   Update the `.env` file with database credentials.
5. Run database migrations:
   ```sh
   php artisan migrate --seed
   ```
6. Start the Laravel server:
   ```sh
   php artisan serve
   ```
7. Install frontend dependencies:
   ```sh
   cd ../frontend
   npm install
   ```
8. Start the React development server:
   ```sh
   npm run dev
   ```

The system should now be running on `http://127.0.0.1:8000` for the frontend and `http://localhost:5173/` for the backend.

## Contributing
If you'd like to contribute to this project, please follow the standard GitHub workflow:
- Fork the repository
- Create a new branch
- Commit your changes
- Open a pull request

## 📂 Project Root (HR-System)
```
HR-System/
├── backend/                   # Laravel Backend
│   ├── app/                   # Application Logic
│   │   ├── Models/            # Eloquent Models
│   │   ├── Http/
│   │   │   ├── Controllers/   # Controllers
│   │   │   ├── Middleware/    # Middleware
│   │   │   ├── Observer/      # Observers
│   │   │   ├── Provider/      # Service Providers
│   ├── database/              # Database Files
│   │   ├── migrations/        # Database Migrations
│   │   ├── seeders/           # Database Seeders
│   ├── routes/                # API Routes
│   │   ├── api.php            # API Endpoints
│   │   ├── web.php            # Web Routes
│   ├── config/                # Configuration Files
│   ├── storage/               # Storage (logs, uploads, etc.)
│   ├── public/                # Public Assets (profile pics, docs)
│   ├── tests/                 # Tests
│   ├── composer.json          # PHP Dependencies
│   ├── artisan                # Artisan CLI
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   ├── pages/              # Page Components
│   │   ├── hooks/              # Custom Hooks
│   │   ├── common/             # Common Components
│   │   ├── context/            # Global Context API
│   │   ├── services/           # API Calls (Axios)
│   │   ├── utils/              # Utility Functions
│   │   ├── assets/             # Images, Icons, Styles
│   │   ├── App.jsx             # Main App Component
│   │   ├── main.jsx            # Entry Point
│   │   ├── layout.jsx          # Layout Component
│   ├── public/                 # Public Files
│   ├── package.json            # JavaScript Dependencies
│   ├── vite.config.js          # Vite Configuration
│
├── docs/                       # Documentation
├── MT-Notes/                   # Notes for projects  
├── README.md                   # Project Documentation
├── .gitignore                  # Git Ignore File
├── .env                        # Environment Variables

```
##  ER Diagram(HR-System)

<img src="hr-system\hr-system-frontend\src\assets\images\ER1.png" width="600">
<img src="hr-system\hr-system-frontend\src\assets\images\ER.png" width="600">
## License
This project is licensed under the **MIT License**.

