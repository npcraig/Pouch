# Pouch 📖

An open-source read-later app inspired by Pocket, built with modern web technologies.

## Features

- 🔖 Save articles and links to read later
- 📱 Responsive design that works on all devices
- 🏷️ Tag and categorize your saved articles
- 🔍 Search through your saved content
- ✅ Mark articles as read/unread
- 🌓 Dark/light mode support
- 👤 User authentication and personal libraries
- 📄 Article text extraction and clean reading view

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pouch
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend development server (port 5173).

### Usage

1. Open http://localhost:5173 in your browser
2. Create an account or log in
3. Start saving articles by pasting URLs
4. Organize with tags and enjoy reading later!

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/articles` - Get user's articles
- `POST /api/articles` - Save new article
- `PUT /api/articles/:id` - Update article (mark as read, add tags)
- `DELETE /api/articles/:id` - Delete article

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. 