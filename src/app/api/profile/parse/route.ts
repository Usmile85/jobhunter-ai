import { upsertProfile } from '@/lib/db-pg';
import { aiChatJSON } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

interface ParsedResume {
  name: string | null;
  email: string | null;
  title: string | null;
  summary: string | null;
  skills: string[];
  experience: Array<{ title: string; company: string; duration: string }>;
  education: Array<{ degree: string; school: string; year: string }>;
}

// POST /api/profile/parse - Parse resume text using OpenAI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'resumeText is required' }, { status: 400 });
    }

    const systemPrompt =
      'You are an expert resume parser. Extract structured data from the resume text. Return ONLY valid JSON with keys: name, email, title, summary, skills (string array), experience (array of objects with title/company/duration), education (array of objects with degree/school/year). If you cannot find a field, use null.';

    const userPrompt = `Parse the following resume and extract structured information:\n\n${resumeText}`;

    const parsed = await aiChatJSON<ParsedResume>(userPrompt, systemPrompt);

    // Save extracted data to Profile table
    const profile = await upsertProfile({
      resumeText,
      name: parsed.name || undefined,
      email: parsed.email || undefined,
      title: parsed.title || undefined,
      summary: parsed.summary || undefined,
      extractedSkills: parsed.skills ? JSON.stringify(parsed.skills) : '[]',
      experience: parsed.experience ? JSON.stringify(parsed.experience) : '[]',
      education: parsed.education ? JSON.stringify(parsed.education) : '[]',
    });

    return NextResponse.json({ profile, parsed });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume. Please check your OpenAI API key and try again.' },
      { status: 500 }
    );
  }
}
