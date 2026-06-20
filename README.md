# JobHunter AI

Smart AI-powered job search application for Data Analytics and Data Science professionals. Upload your resume, find matching jobs, generate tailored cover letters, and track your applications — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

## Features

- **AI Resume Parser** — Paste your resume and AI automatically extracts skills, experience, and education
- **Smart Job Search** — Search for Data Analytics & Data Science roles across LinkedIn, Indeed, Glassdoor, and more
- **Application Tracker** — Track jobs from Saved → Applied → Interviewing → Offered/Rejected with a visual dashboard
- **AI Cover Letters** — Generate personalized, job-specific cover letters with one click
- **In-App Notifications** — Get alerts when you save jobs or update application statuses
- **Job Preferences** — Configure your ideal job titles, locations, salary, and work type

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Vercel Postgres (Neon)
- **AI**: OpenAI GPT-4o-mini
- **Web Search**: Serper.dev
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.3+
- [OpenAI API key](https://platform.openai.com/api-keys) (for AI features)
- [Serper API key](https://serper.dev) (for job search, 2500 free searches)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Usmile85/jobhunter-ai.git
cd jobhunter-ai

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description | Get it |
|----------|----------|-------------|--------|
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key for AI features | [platform.openai.com](https://platform.openai.com/api-keys) |
| `SERPER_API_KEY` | ✅ Yes | Serper API key for web search | [serper.dev](https://serper.dev) |
| `POSTGRES_URL` | Auto | Vercel Postgres connection string | Auto-configured on Vercel |

## Deploy on Vercel (Free)

### Step 1: Set up Vercel Postgres Database

1. Go to your project on [vercel.com](https://vercel.com)
2. Go to **Storage** tab
3. Click **Create Database** → Select **Postgres (Neon)** → Use free tier
4. This automatically sets the `POSTGRES_URL` environment variable

### Step 2: Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `SERPER_API_KEY` = your Serper API key

### Step 3: Deploy

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Click **Deploy**

### Step 4: Initialize the Database

After deployment, visit: `https://your-app.vercel.app/api/init-db`

This creates the database tables automatically. You only need to do this once.

## Usage

1. **Resume Tab** — Paste your resume text and click "Parse with AI" to extract your skills and experience
2. **Find Jobs** — Enter keywords (e.g., "data analyst"), location, and job type, then click Search
3. **Save Jobs** — Click the "Save" button on any job listing to add it to your tracker
4. **Applications Tab** — Track saved jobs, update statuses, and generate AI cover letters
5. **Settings** — Configure your job search preferences for better results

## API Costs

This app uses two external APIs:

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| OpenAI (GPT-4o-mini) | ~$5 free credit | $0.15 per 1M input tokens |
| Serper.dev | 2,500 free searches | $50/month for 50k searches |

Typical usage: ~$0.01 per resume parse, ~$0.02 per job search, ~$0.01 per cover letter.

## License

MIT
