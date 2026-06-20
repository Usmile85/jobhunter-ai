import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET /api/init-db - Initialize database tables
export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS profile (
        id TEXT PRIMARY KEY,
        resume_text TEXT,
        name TEXT,
        email TEXT,
        title TEXT,
        summary TEXT,
        extracted_skills TEXT DEFAULT '[]',
        experience TEXT DEFAULT '[]',
        education TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS saved_job (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        description TEXT,
        url TEXT,
        source TEXT,
        salary TEXT,
        job_type TEXT,
        match_score FLOAT,
        posted_date TEXT,
        status TEXT DEFAULT 'saved',
        notes TEXT,
        cover_letter TEXT,
        applied_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notification (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        read BOOLEAN DEFAULT false,
        job_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS job_preference (
        id TEXT PRIMARY KEY,
        job_titles TEXT DEFAULT '[]',
        locations TEXT DEFAULT '[]',
        remote_only BOOLEAN DEFAULT false,
        salary_min INTEGER,
        job_types TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return NextResponse.json({ success: true, message: 'Database tables created successfully' });
  } catch (error) {
    console.error('Error creating tables:', error);
    return NextResponse.json(
      { error: 'Failed to create tables', details: String(error) },
      { status: 500 }
    );
  }
}
