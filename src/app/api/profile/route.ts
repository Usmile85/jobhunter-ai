import { getProfile, upsertProfile } from '@/lib/db-pg';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/profile - Return the first profile
export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST /api/profile - Create or update the profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, name, email, title, summary } = body;

    const profile = await upsertProfile({
      resumeText,
      name,
      email,
      title,
      summary,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
