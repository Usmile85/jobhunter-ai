import { getPreferences, upsertPreferences } from '@/lib/db-pg';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/preferences - Return job preferences
export async function GET() {
  try {
    const preference = await getPreferences();
    if (!preference) {
      return NextResponse.json({ preference: null });
    }
    // Normalize for frontend
    const normalized = {
      ...preference,
      jobTitles: (preference as Record<string, unknown>).job_titles,
      locations: (preference as Record<string, unknown>).locations,
      remoteOnly: (preference as Record<string, unknown>).remote_only,
      salaryMin: (preference as Record<string, unknown>).salary_min,
      jobTypes: (preference as Record<string, unknown>).job_types,
    };
    return NextResponse.json({ preference: normalized });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

// POST /api/preferences - Create or update job preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitles, locations, remoteOnly, salaryMin, jobTypes } = body;

    const preference = await upsertPreferences({
      jobTitles: jobTitles ? JSON.stringify(jobTitles) : undefined,
      locations: locations ? JSON.stringify(locations) : undefined,
      remoteOnly,
      salaryMin,
      jobTypes: jobTypes ? JSON.stringify(jobTypes) : undefined,
    });

    return NextResponse.json({ preference });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
