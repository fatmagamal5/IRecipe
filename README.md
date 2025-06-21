```markdown
# IRecipe 🍲 - A Modern Recipe Sharing Platform

Welcome to IRecipe, a full-featured web application built for food lovers! IRecipe provides a beautiful and intuitive platform for users to discover, create, share, and manage their favorite culinary creations. It comes with a powerful admin panel to ensure the quality and integrity of the content.

---

## ✨ Key Features

### For Users
*   **User Authentication**: Secure and robust user authentication system using JWT and sessions.
*   **Recipe Discovery**: Browse a vast collection of recipes, filter by category, and search for specific dishes.
*   **Detailed Recipe View**: View recipes with comprehensive details including descriptions, images, prep time, cook time, servings, ingredients, step-by-step instructions with timers, and nutritional information.
*   **Create & Manage Recipes**: A user-friendly form allows users to submit their own recipes and manage them from their personal dashboard.
*   **Favorites System**: Users can mark recipes as favorites to easily find them later.
*   **Reviews & Ratings**: Leave comments and ratings on recipes to share your feedback with the community.
*   **User Profile**: A dedicated profile page to manage personal recipes and favorite dishes.

### For Admins
*   **Analytics Dashboard**: A comprehensive dashboard showing key metrics like total users, total recipes, and new content added.
*   **User Management**: Full CRUD (Create, Read, Update, Delete) functionality for all users in the system.
*   **Recipe Management**: Admins can view, edit, and delete any recipe on the platform to maintain content quality.
*   **Review Moderation**: A dedicated panel to approve or reject user-submitted reviews before they are published.
*   **Secure Access**: All admin routes are protected by authentication and authorization middleware to ensure only verified admins can access the panel.

---

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB with Mongoose ODM
*   **Frontend**: EJS (Embedded JavaScript templates), Bootstrap 5 for styling
*   **Authentication**: JSON Web Tokens (JWT), bcryptjs for password hashing, `express-session` and `cookie-parser` for session management.
*   **File Uploads**: `multer` for handling image uploads.
*   **Development**: `nodemon` for live server reloading.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/IRecipe-1.git
    cd IRecipe-1
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Create a `.env` file** in the root directory and add the following environment variables.
    ```env
    # Database Connection
    DB_URL=your_mongodb_connection_string

    # JWT Secret Key
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Start the development server:**
    ```sh
    npm run test
    ```
    This will start the server with `nodemon`, which will automatically restart the application when file changes are detected.

5.  **Open your browser** and navigate to `http://localhost:3000` (or the port you have configured).

---

## 📂 Project Structure

```
IRecipe-1/
├── config/
│   └── db.js           # Database connection configuration
├── controllers/
│   ├── admin.js        # Logic for admin dashboard
│   ├── recipe.js       # Logic for recipe-related operations
│   └── user.js         # Logic for user authentication and management
├── middleware/
│   ├── auth.js         # Authentication and authorization middleware
│   └── multer.js       # Multer configuration for file uploads
├── models/
│   ├── recipe.js       # Recipe schema for MongoDB
│   └── user.js         # User schema for MongoDB
├── public/             # Static assets (CSS, JS, images)
├── routes/
│   ├── admin.js        # Routes for the admin panel
│   ├── frontend.js     # Routes for the main website pages
│   ├── recipe.js       # API routes for recipes
│   └── user.js         # API routes for users
├── utils/              # Utility functions
├── views/
│   ├── admin/          # EJS templates for the admin panel
│   ├── partials/       # Reusable EJS partials (nav, footer)
│   └── index.ejs       # Main entry EJS template
├── .env.example        # Example environment file
├── index.js            # Main application entry point
└── package.json        # Project dependencies and scripts
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please feel free to fork the repository and submit a pull request.

---
