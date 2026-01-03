# Feedback Admin Portal

The **Feedback Admin Portal** is a modern, responsive Single Page Application (SPA) designed to manage feedback, view analytics, and administer users for the Feedback Management System. It serves as the central hub for District Officers (DO), Field Officers (FO), and Regional Officers (RO) to monitor performance and service quality.

## 🚀 Technology Stack

Built with the latest robust web technologies:

-   **Core Framework**: [React 19](https://react.dev/)
-   **Build Tool**: [Vite 7.2](https://vitejs.dev/) - For lightning-fast development and building.
-   **UI Library**: [Material UI (MUI) v7](https://mui.com/) - For a polished, accessible, and consistent design system.
-   **Routing**: [React Router v7](https://reactrouter.com/) - For declarative client-side routing.
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - For simplified global state management (Authentication).
-   **Data Fetching**: [Axios](https://axios-http.com/) - With interceptors for automatic token handling.
-   **Forms**: [React Hook Form](https://react-hook-form.com/) - For performant and flexible form validation.
-   **Data Visualization**: [Recharts](https://recharts.org/) - For beautiful, composable charts on the dashboard.
-   **Utilities**:
    -   `dayjs`: Date manipulation.
    -   `jspdf` & `jspdf-autotable`: PDF report generation.
    -   `xlsx`: Excel export functionality.

## 📂 Project Structure

```
src/
├── api/            # Centralized API modules (Axios instances & endpoints)
│   ├── authApi.js
│   ├── userApi.js
│   └── ...
├── components/     # Reusable UI components
│   ├── common/     # Generic components (ProtectedRoute, etc.)
│   └── layout/     # App shell components (Sidebar, Topbar)
├── hooks/          # Custom React hooks (useAuth, etc.)
├── pages/          # Main route views
│   ├── Dashboard   # Analytics overview
│   ├── Login       # Authentication page
│   ├── Reports     # Detailed data tables with filters
│   └── UserManagement # Admin panel for user CRUD
├── store/          # Zustand stores (authStore.js)
├── styles/         # Theme configuration (theme.js)
├── utils/          # Helper functions
├── App.jsx         # Root component & Routing setup
└── main.jsx        # Entry point
```

## 🛠️ Setup & Installation

**Prerequisites**:
-   [Node.js](https://nodejs.org/) (v16.x or strictly v18.x recommended)
-   npm or yarn

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd frontend-admin
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root directory (if not present) and configure your backend endpoint:
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api
    VITE_APP_NAME=Feedback Admin Portal
    ```

## 🏃‍♂️ Running the Application

### Development Server
Start the local development server with HMR (Hot Module Replacement):
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

### Production Build
Build the application for deployment:
```bash
npm run build
```
The output will be generated in the `dist/` folder.

### Preview Production Build
Locally preview how the production build will behave:
```bash
npm run preview
```

## ✨ Key Features

-   **Secure Authentication**: JWT-based login system with automatic session management and protected routes.
-   **Role-Based Access Control**:
    -   **Superuser**: Full access to all modules including User Management.
    -   **DO/RO/FO**: scoped access to Dashboards and Reports based on hierarchy.
-   **Interactive Dashboard**:
    -   Real-time statistics cards.
    -   Trend lines for daily complaints.
    -   Distribution pie charts for feedback categories.
-   **Comprehensive Reports**:
    -   Tabular view of all feedback.
    -   Advanced filtering (Date range, Branch, Status).
    -   Export capabilities (PDF & Excel).
-   **User Management**:
    -   Create, Update, Delete users.
    -   Reset passwords.
    -   Assign specific roles and branches.

## 🤝 Contribution

1.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
2.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
3.  Push to the branch (`git push origin feature/AmazingFeature`).
4.  Open a Pull Request.
