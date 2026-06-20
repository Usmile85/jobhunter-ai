import { getSavedJobs, createSavedJob } from '@/lib/db-pg';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/jobs/saved - Return all saved jobs
export async function GET() {
  try {
    const savedJobs = await getSavedJobs();
    // Normalize column names for frontend (snake_case → camelCase)
    const normalized = savedJobs.map((job: Record<string, unknown>) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      url: job.url,
      source: job.source,
      salary: job.salary,
      jobType: job.job_type,
      matchScore: job.match_score,
      postedDate: job.posted_date,
      status: job.status,
      notes: job.notes,
      coverLetter: job.cover_letter,
      appliedDate: job.applied_date,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    }));
    return NextResponse.json({ savedJobs: normalized });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

// POST /api/jobs/saved - Save a new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, company, location, description, url, source, salary, jobType, matchScore, postedDate } = body;

    if (!title || !company) {
      return NextResponse.json({ error: 'title and company are required' }, { status: 400 });
    }

    const id = await createSavedJob({
      title,
      company,
      location: location || undefined,
      description: description || undefined,
      url: url || undefined,
      source: source || undefined,
      salary: salary || undefined,
      job_type: jobType || undefined,
      match_score: matchScore || undefined,
      posted_date: postedDate || undefined,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
  }
}
