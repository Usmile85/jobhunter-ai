import { zaiChatJSON, zaiWebSearch } from '@/lib/z-ai';
import { NextRequest, NextResponse } from 'next/server';

interface JobResult {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  salary: string | null;
  jobType: string;
  postedDate: string | null;
}

// POST /api/jobs/search - Search for jobs using z-ai web search + parsing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location, jobType, numResults } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    // Construct search query
    const searchParts = [query];
    if (location) searchParts.push(location);
    if (jobType) searchParts.push(jobType);
    searchParts.push('site:linkedin.com OR site:indeed.com OR site:glassdoor.com');

    const searchQuery = searchParts.join(' ');
    const num = numResults || 10;

    // Step 1: Web search
    const searchResults = await zaiWebSearch(searchQuery, num);

    // Step 2: Parse search results into structured job objects
    const resultsText = JSON.stringify(searchResults.results || [], null, 2);

    const systemPrompt =
      'Parse these job search results into structured JSON. Return an array of objects with: title, company, location, description (brief), url, source (site name), salary (if found), jobType, postedDate. Return ONLY valid JSON array.';

    const userPrompt = `Parse the following job search results into structured job listings:\n\n${resultsText}`;

    const jobs = await zaiChatJSON<JobResult[]>(userPrompt, systemPrompt);

    return NextResponse.json({ jobs: Array.isArray(jobs) ? jobs : [] });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to search for jobs. Please try again.' },
      { status: 500 }
    );
  }
}
