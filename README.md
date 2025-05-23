# Pouch 📖

An open-source read-later app inspired by Pocket, built with modern web technologies.

## Features

- 🔖 Save articles and links to read later
- 📖 **Clean reading experience** with distraction-free article viewer
- 🎨 **Adjustable font size** for comfortable reading
- 📱 Responsive design that works on all devices
- 🏷️ Tag and categorize your saved articles
- 🔍 Search through your saved content
- ✅ Mark articles as read/unread
- ❤️ Favorite articles for quick access
- 🌓 Dark/light mode support
- 👤 User authentication and personal libraries
- 📄 Article text extraction and clean reading view
- 🚀 **Auto-mark as read** when viewing articles

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
4. **Click "Read Article"** to enjoy a clean, distraction-free reading experience
5. Organize with tags and enjoy reading later!

## Key Features

### 📖 Article Reading Experience
- **Clean, distraction-free interface** - Focus on the content without ads or clutter
- **Adjustable font size** - Customize text size for comfortable reading (12px - 24px)
- **Auto-mark as read** - Articles are automatically marked as read when you view them
- **Responsive design** - Perfect reading experience on desktop, tablet, and mobile
- **Typography optimized** - Beautiful typography with proper line spacing and margins

### 🔖 Article Management
- **One-click saving** - Paste any URL to save articles instantly
- **Smart content extraction** - Automatically extracts title, description, and main content
- **Image support** - Displays article images when available
- **Tag organization** - Add tags to categorize your articles
- **Search functionality** - Find articles by title, description, or content
- **Filter options** - Filter by read/unread status and favorites

### 🎯 User Experience
- **Fast and responsive** - Built with modern React and optimized for performance
- **Intuitive interface** - Clean, Pocket-inspired design
- **Toast notifications** - Helpful feedback for all actions
- **Keyboard shortcuts ready** - Extensible for future keyboard navigation

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/articles` - Get user's articles (with search/filter support)
- `GET /api/articles/:id` - Get single article for reading
- `POST /api/articles` - Save new article
- `PUT /api/articles/:id` - Update article (mark as read, add tags, favorite)
- `DELETE /api/articles/:id` - Delete article

## Project Structure

```
Pouch/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Dashboard, ArticleReader, etc.)
│   │   ├── context/        # React context for state management
│   │   ├── utils/          # API utilities and helpers
│   │   └── types/          # TypeScript type definitions
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Authentication and other middleware
│   │   ├── database/       # Database setup and migrations
│   │   ├── utils/          # Web scraping and utilities
│   │   └── types/          # TypeScript type definitions
├── package.json           # Root package with scripts
├── install.bat            # Windows installation script
└── install.sh             # Unix installation script
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. 