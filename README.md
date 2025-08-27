# GitSum
GitSum is a web application designed to help developers manage and analyze their GitHub repositories. It provides features such as project creation, commit tracking, and code summarization using AI models.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Project Management**: Create and manage projects linked to GitHub repositories.
- **Commit Tracking**: Track commits and view commit logs for each project.
- **Code Summarization**: Generate summaries and embeddings for code files using AI models.
- **User Authentication**: Secure user authentication using Clerk.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/mafia-creater/Gitsum.git
    cd gitsum
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following variables:
    ```env
    DATABASE_URL=your_database_url
    GEMINI_API_KEY=your_gemini_api_key
    NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api
    CLERK_API_KEY=your_clerk_api_key
    ```

4. **Run database migrations**:
    ```bash
    npx prisma migrate dev
    ```

5. **Start the development server**:
    ```bash
    npm run dev
    ```

## Usage

1. **Sign Up / Sign In**:
    - Navigate to `/sign-up` to create a new account.
    - Navigate to `/sign-in` to log in to an existing account.

2. **Create a Project**:
    - Go to the `/create` page.
    - Enter the project name, GitHub repository URL, and an optional GitHub token.
    - Click "Create Project" to link the repository and start tracking commits.

3. **View Dashboard**:
    - Navigate to the `/dashboard` page to view project details, commit logs, and ask questions about the project.

## Environment Variables

- `DATABASE_URL`: The URL of your PostgreSQL database.
- `GEMINI_API_KEY`: The API key for the Google Generative AI service.
- `NEXT_PUBLIC_CLERK_FRONTEND_API`: The frontend API key for Clerk.
- `CLERK_API_KEY`: The backend API key for Clerk.

## Project Structure

```plaintext
gitsum/
├── prisma/
│   └── schema.prisma          # Prisma schema file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx
│   │   ├── (protected)/
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── commit-log.tsx
│   │   │   │   └── ask-question-card.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── textarea.tsx
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   ├── use-refetch.ts
│   │   ├── use-project.ts
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── github-loader.ts
│   │   ├── gemini.ts
│   │   └── utils.ts
│   ├── server/
│   │   ├── api/
│   │   │   ├── root.ts
│   │   │   ├── routers/
│   │   │   │   └── project.ts
│   │   │   └── trpc.ts
│   │   └── db.ts
│   ├── styles/
│   │   └── globals.css
│   ├── trpc/
│   │   ├── server.ts
│   │   ├── react.tsx
│   │   └── query-client.ts
│   └── middleware.ts
├── .env
├── [README.md](http://_vscodecontentref_/0)
└── [package.json](http://_vscodecontentref_/1)
```

## API Routes

### Project Router

- **createProject**: Create a new project linked to a GitHub repository.
  - **Endpoint**: `/api/trpc/project.createProject`
  - **Method**: `POST`
  - **Input**:
    ```json
    {
      "name": "string",
      "githubUrl": "string",
      "githubToken": "string (optional)"
    }
    ```
  - **Output**:
    ```json
    {
      "id": "string",
      "name": "string",
      "githubUrl": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
    ```

- **getProjects**: Get a list of projects for the authenticated user.
  - **Endpoint**: `/api/trpc/project.getProjects`
  - **Method**: `GET`
  - **Output**:
    ```json
    [
      {
        "id": "string",
        "name": "string",
        "githubUrl": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
    ```

- **getCommits**: Get a list of commits for a specific project.
  - **Endpoint**: `/api/trpc/project.getCommits`
  - **Method**: `GET`
  - **Input**:
    ```json
    {
      "projectId": "string"
    }
    ```
  - **Output**:
    ```json
    [
      {
        "id": "string",
        "message": "string",
        "author": "string",
        "date": "string",
        "projectId": "string"
      }
    ]
    ```

### Example Usage

```typescript
import { api } from '~/trpc/react';

// Create a new project
const createProject = api.project.createProject.useMutation();
createProject.mutate({
  name: 'My Project',
  githubUrl: 'https://github.com/username/repo',
  githubToken: 'your_github_token',
});

// Get list of projects
const { data: projects } = api.project.getProjects.useQuery();

// Get commits for a project
const { data: commits } = api.project.getCommits.useQuery({ projectId: 'project_id' });

