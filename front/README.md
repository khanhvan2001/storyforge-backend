# StoryForge Frontend

Frontend application for StoryForge - AI User Story Generator built with React, Vite, Tailwind CSS, and ShadcnUI.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ShadcnUI** - UI components
- **React Router** - Routing
- **Axios** - HTTP client

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Build

```bash
npm run build
```

## Features

- 🔐 Authentication (Login/Register)
- 📝 Story Management
  - List all stories
  - View story details
  - Generate new stories with AI
- 📎 File Upload Support
  - Upload files (.txt, .md, .pdf, .docx)
  - View attached files with public URLs
- 🔗 Reference Links
  - Add multiple reference links
- 🎨 Modern UI with ShadcnUI components

## Project Structure

```
src/
├── components/     # Reusable components
│   ├── ui/        # ShadcnUI components
│   └── Layout.tsx # Main layout component
├── lib/           # Utilities and API client
│   ├── api.ts     # Axios instance
│   ├── types.ts   # TypeScript types
│   └── utils.ts   # Utility functions
├── pages/         # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Stories.tsx
│   ├── StoryDetail.tsx
│   └── StoryGenerate.tsx
├── App.tsx        # Main app component
├── main.tsx       # Entry point
└── index.css      # Global styles
```
