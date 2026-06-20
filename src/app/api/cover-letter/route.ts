import { aiChat } from '@/lib/ai';
import { updateSavedJob } from '@/lib/db-pg';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/cover-letter - Generate a cover letter using OpenAI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, resumeText, jobTitle, company, jobDescription } = body;

    if (!resumeText || !jobTitle || !company || !jobDescription) {
      return NextResponse.json(
        { error: 'resumeText, jobTitle, company, and jobDescription are required' },
        { status: 400 }
      );
    }

    const systemPrompt =
      'You are an expert cover letter writer. Write a compelling, professional cover letter tailored to this specific job. The applicant\'s resume info and job details are provided. Make it concise (3-4 paragraphs), enthusiastic, and highlight relevant skills and experience. Do NOT use placeholders - write as if ready to send.';

    const userPrompt = `Write a cover letter for the following job application:

**Job Title:** ${jobTitle}
**Company:** ${company}
**Job Description:** ${jobDescription}

**Applicant's Resume:**
${resumeText}

Write a complete, professional cover letter ready to send.`;

    const coverLetter = await aiChat(userPrompt, systemPrompt);

    // Save the cover letter to the SavedJob record
    if (jobId) {
      try {
        await updateSavedJob(jobId, { cover_letter: coverLetter });
      } catch (e) {
        console.error('Could not save cover letter to job:', e);
      }
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter. Please check your OpenAI API key.' },
      { status: 500 }
    );
  }
}
