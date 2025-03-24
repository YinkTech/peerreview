# Peer Review Application

A modern web application for managing peer reviews, built with React and Vite. The application allows students to submit and review work while providing a seamless user experience.

## Live Demo
Visit the live application at [https://peerreviews.vercel.app/](https://peerreviews.vercel.app/)

## Features

- 🔐 User Authentication
- 👥 Role-based Access Control (Student/Teacher)
- 📝 Review Submission and Management
- 🎨 Modern UI with Dark/Light Mode
- 📱 Responsive Design
- 🔄 Real-time Updates
- 🎯 Interactive Dashboard

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** 
  - TailwindCSS
  - Material UI
  - Framer Motion (Animations)
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **State Management:** React Context
- **Routing:** React Router v7
- **UI Components:** 
  - Material UI
  - React Hot Toast (Notifications)

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context providers
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   ├── config/        # Configuration files
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # Application entry point
│   └── index.css      # Global styles
├── public/            # Static assets
└── [config files]     # Various configuration files
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm run dev
   ```
4. Build for production:
   ```bash
   pnpm run build
   ```

## Available Scripts

- `pnpm install` - Install dependencies
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Lint source files

## Development Guidelines

- Follow the established project structure
- Use TailwindCSS for styling
- Implement responsive design patterns
- Write clean, maintainable code
- Follow React best practices
- Use TypeScript for type safety

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
