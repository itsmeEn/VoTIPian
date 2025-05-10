# Votipian - Online Voting System

Votipian is a full-stack web application for managing and conducting online elections. It provides a secure, user-friendly platform for organizations to run their voting processes efficiently.

## Features

- **User Authentication & Authorization**
  - Secure login and registration
  - Role-based access control (Admin, Voter)
  - JWT-based authentication

- **Election Management**
  - Create and manage elections
  - Set election periods
  - Add multiple positions and candidates
  - Real-time election status

- **Voting System**
  - Secure voting process
  - One vote per user per election
  - Real-time vote counting
  - Position-based voting

- **Results & Analytics**
  - Real-time election results
  - Vote statistics and analytics
  - Position-wise results
  - Winner determination

- **Discussion Forum**
  - Election-related discussions
  - Candidate platforms
  - User interactions

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Chart.js for analytics
- React Router for navigation
- Axios for API calls
- Formik & Yup for form validation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

### DevOps
- Docker for containerization
- Docker Compose for multi-container management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Docker (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/itsmeEn/VoTIPian/tree/master.git
   cd VoTIPian
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` file in server directory
   - Create `.env` file in client directory

4. Run the application:

   Without Docker:
   ```bash
   # Start MongoDB
   net start MongoDB

   # Start backend server
   cd server
   npm run dev

   # Start frontend in another terminal
   cd client
   npm start
   ```

   With Docker:
   ```bash
   # Stop and remove any existing containers
   docker-compose down

   # Remove any cached images
   docker-compose rm -f

   # Build and start the containers
   docker-compose up --build
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

