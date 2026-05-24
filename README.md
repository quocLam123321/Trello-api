# Trello Workspace API

A robust, enterprise-grade backend service powering a real-time Trello-like collaborative task management application. Built on NodeJS, ExpressJS, and MongoDB, this service provides core APIs for authentication, real-time board updates, task ordering, drag-and-drop state persistence, and file uploads.

---

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/) (>=18.x)
- **Framework**: [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework
- **Database**: [MongoDB](https://www.mongodb.com/) - Document-based NoSQL database (native `mongodb` driver)
- **Transpiler**: [Babel](https://babeljs.io/) - For compilation of modern ES6+ JavaScript
- **Real-Time Communication**: [Socket.io](https://socket.io/) - Dynamic duplex event-based communication
- **Validation**: [Joi](https://joi.dev/) - Schema description language and data validator
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **File Storage**: [Cloudinary](https://cloudinary.com/) & [Multer](https://github.com/expressjs/multer)
- **Emails**: [Resend](https://resend.com/) - Modern transactional email platform
- **Linter**: [ESLint](https://eslint.org/) - Code quality and styling consistency

---

## 📂 Project Directory Structure

```text
Trello-api/
├── src/
│   ├── config/          # Environment variables and database connection config
│   ├── controllers/     # Incoming request handlers
│   ├── middlewares/     # Centered error-handling, cors, and authorization logic
│   ├── models/          # Database schemas and MongoDB queries
│   ├── providers/       # Cloud integrations (e.g., Cloudinary, Resend)
│   ├── routes/          # API endpoints definition grouped by version (v1, v2)
│   ├── services/        # Core business and domain logic
│   ├── sockets/         # Socket.io event listeners and emitters
│   ├── utils/           # Formatting, sorting, and algorithmic helper functions
│   └── server.js        # Main entry point establishing DB connection and server listen
├── jsconfig.json        # Path mapping configuration
├── package.json         # Scripts and dependencies configurations
└── .env                 # Environment variables config (local only)
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Yarn](https://yarnpkg.com/) or npm (Yarn recommended)
- [MongoDB](https://www.mongodb.com/) instance running locally or via Atlas Cloud

### 🔧 Installation and Setup

1. **Clone the repository** and navigate to the API directory:
   ```bash
   cd Trello-api
   ```

2. **Install project dependencies**:
   ```bash
   yarn install
   ```
   *(or `npm install`)*

3. **Configure Environment Variables**:
   Copy the example environment file to create your own configuration:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in your details:
   ```env
   MONGODB_URI=mongodb+srv://... or mongodb://localhost:27017
   DATABASE_NAME=trello-workspace-db
   APP_HOST=localhost
   APP_PORT=8017
   
   # Authentication Secrets
   ACCESS_TOKEN_SECRET_SIGNATURE=your_access_token_secret
   ACCESS_TOKEN_LIFE=1h
   REFRESH_TOKEN_SECRET_SIGNATURE=your_refresh_token_secret
   REFRESH_TOKEN_LIFE=14d
   
   # Cloudinary & Resend Integrations
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   RESEND_API_KEY=your_resend_api_key
   ```

> [!NOTE]
> **Important Note on Email Verification:**
> Since the project uses the **free tier of Resend**, verification emails may not be delivered. However, the system is configured to allow you to **log in directly** right after registering, without needing to wait for email activation.

---

## 🏃 Run Scripts

Manage your server environment using the defined scripts:

| Command | Action | Description |
| :--- | :--- | :--- |
| `yarn dev` | **Start Dev Server** | Launches application in DEVELOPMENT mode with hot-reloading (nodemon) and babel-node compilation. |
| `yarn build` | **Production Transpilation** | Cleans up local builds and compiles production-ready JS files using Babel CLI. |
| `yarn production`| **Start Production Server** | Bundles the app and starts the node application from the compiled build folder. |
| `yarn lint` | **Code Linting check** | Checks Javascript styles across files with zero-warning constraints. |

---

## 🔒 Security Practices

- **Centrally Managed Error Handling**: Prevents stack traces leak in production environments.
- **Data Validation**: Strict schema enforcement at the router layer using `Joi`.
- **CORS Config**: Whitelist-based access limits protecting internal API routes.
- **Secure Token Exchanges**: HTTP-only Cookies for secure storage of refresh tokens.
