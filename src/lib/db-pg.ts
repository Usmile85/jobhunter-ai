import { sql } from '@vercel/postgres';

// ============ Profile ============

export async function getProfile() {
  const result = await sql`SELECT * FROM profile LIMIT 1`;
  if (result.rows.length === 0) return null;
  const row = result.rows[0] as Record<string, unknown>;
  return {
    ...row,
    extractedSkills: typeof row.extracted_skills === 'string' ? JSON.parse(row.extracted_skills) : [],
    experience: typeof row.experience === 'string' ? JSON.parse(row.experience) : [],
    education: typeof row.education === 'string' ? JSON.parse(row.education) : [],
  };
}

export async function upsertProfile(data: {
  resumeText?: string;
  name?: string;
  email?: string;
  title?: string;
  summary?: string;
  extractedSkills?: string;
  experience?: string;
  education?: string;
}) {
  const existing = await getProfile();

  if (existing) {
    // Build update with safe parameterized values
    const id = existing.id as string;
    const resumeText = data.resumeText !== undefined ? data.resumeText : (existing.resume_text as string || null);
    const name = data.name !== undefined ? data.name : (existing.name as string || null);
    const email = data.email !== undefined ? data.email : (existing.email as string || null);
    const title = data.title !== undefined ? data.title : (existing.title as string || null);
    const summary = data.summary !== undefined ? data.summary : (existing.summary as string || null);
    const extractedSkills = data.extractedSkills !== undefined ? data.extractedSkills : (typeof existing.extracted_skills === 'string' ? existing.extracted_skills : '[]');
    const experience = data.experience !== undefined ? data.experience : (typeof existing.experience === 'string' ? existing.experience : '[]');
    const education = data.education !== undefined ? data.education : (typeof existing.education === 'string' ? existing.education : '[]');

    await sql`
      UPDATE profile SET
        resume_text = ${resumeText},
        name = ${name},
        email = ${email},
        title = ${title},
        summary = ${summary},
        extracted_skills = ${extractedSkills},
        experience = ${experience},
        education = ${education},
        updated_at = NOW()
      WHERE id = ${id}
    `;
    return getProfile();
  } else {
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO profile (id, resume_text, name, email, title, summary, extracted_skills, experience, education)
      VALUES (${id}, ${data.resumeText || null}, ${data.name || null}, ${data.email || null}, ${data.title || null}, ${data.summary || null}, ${data.extractedSkills || '[]'}, ${data.experience || '[]'}, ${data.education || '[]'})
    `;
    return getProfile();
  }
}

// ============ Saved Jobs ============

export async function getSavedJobs() {
  const result = await sql`SELECT * FROM saved_job ORDER BY created_at DESC`;
  return result.rows;
}

export async function createSavedJob(data: {
  title: string; company: string; location?: string; description?: string;
  url?: string; source?: string; salary?: string; job_type?: string;
  match_score?: number; posted_date?: string;
}) {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO saved_job (id, title, company, location, description, url, source, salary, job_type, match_score, posted_date, status)
    VALUES (${id}, ${data.title}, ${data.company}, ${data.location || null}, ${data.description || null}, ${data.url || null}, ${data.source || null}, ${data.salary || null}, ${data.job_type || null}, ${data.match_score || null}, ${data.posted_date || null}, 'saved')
  `;

  // Create notification
  const msg = `You saved "${data.title}" at ${data.company}${data.location ? ` in ${data.location}` : ''}`;
  await sql`
    INSERT INTO notification (id, title, message, type, job_id)
    VALUES (${crypto.randomUUID()}, 'Job Saved', ${msg}, 'match', ${id})
  `;

  return id;
}

export async function updateSavedJob(id: string, data: {
  status?: string; notes?: string; cover_letter?: string; applied_date?: string;
}) {
  const existing = await sql`SELECT * FROM saved_job WHERE id = ${id}`;
  if (existing.rows.length === 0) throw new Error('Job not found');

  const existingRow = existing.rows[0] as Record<string, unknown>;

  // Build update with all fields (using existing values as defaults)
  const status = data.status !== undefined ? data.status : (existingRow.status as string);
  const notes = data.notes !== undefined ? data.notes : (existingRow.notes as string || null);
  const coverLetter = data.cover_letter !== undefined ? data.cover_letter : (existingRow.cover_letter as string || null);
  const appliedDate = data.applied_date !== undefined
    ? (data.applied_date ? data.applied_date : null)
    : (existingRow.applied_date as string || null);

  await sql`
    UPDATE saved_job SET
      status = ${status},
      notes = ${notes},
      cover_letter = ${coverLetter},
      applied_date = ${appliedDate},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  // Create notification for status changes
  if (data.status && data.status !== existingRow.status) {
    const statusMessages: Record<string, string> = {
      applied: 'Application submitted',
      interviewing: 'Interview stage reached',
      offered: 'Offer received!',
      rejected: 'Application not selected',
      saved: 'Job moved back to saved',
    };
    const jobTitle = existingRow.title as string;
    const jobCompany = existingRow.company as string;
    const notifMsg = `"${jobTitle}" at ${jobCompany} status changed to ${data.status}`;
    const notifType = data.status === 'offered' ? 'alert' : 'application';

    await sql`
      INSERT INTO notification (id, title, message, type, job_id)
      VALUES (${crypto.randomUUID()}, ${statusMessages[data.status] || 'Status Updated'}, ${notifMsg}, ${notifType}, ${id})
    `;
  }
}

export async function deleteSavedJob(id: string) {
  await sql`DELETE FROM saved_job WHERE id = ${id}`;
}

// ============ Notifications ============

export async function getNotifications() {
  const result = await sql`SELECT * FROM notification ORDER BY created_at DESC`;
  return result.rows;
}

export async function markNotificationRead(id: string) {
  await sql`UPDATE notification SET read = true WHERE id = ${id}`;
}

export async function markAllNotificationsRead() {
  await sql`UPDATE notification SET read = true WHERE read = false`;
}

// ============ Preferences ============

export async function getPreferences() {
  const result = await sql`SELECT * FROM job_preference LIMIT 1`;
  if (result.rows.length === 0) return null;
  const row = result.rows[0] as Record<string, unknown>;
  return {
    ...row,
    job_titles: typeof row.job_titles === 'string' ? JSON.parse(row.job_titles) : [],
    locations: typeof row.locations === 'string' ? JSON.parse(row.locations) : [],
    job_types: typeof row.job_types === 'string' ? JSON.parse(row.job_types) : [],
  };
}

export async function upsertPreferences(data: {
  jobTitles?: string; locations?: string; remoteOnly?: boolean;
  salaryMin?: number | null; jobTypes?: string;
}) {
  const existing = await getPreferences();

  if (existing) {
    const id = existing.id as string;
    const jobTitles = data.jobTitles !== undefined ? data.jobTitles : (typeof existing.job_titles === 'string' ? existing.job_titles : JSON.stringify(existing.job_titles));
    const locations = data.locations !== undefined ? data.locations : (typeof existing.locations === 'string' ? existing.locations : JSON.stringify(existing.locations));
    const remoteOnly = data.remoteOnly !== undefined ? data.remoteOnly : (existing.remote_only as boolean);
    const salaryMin = data.salaryMin !== undefined ? data.salaryMin : (existing.salary_min as number | null);
    const jobTypes = data.jobTypes !== undefined ? data.jobTypes : (typeof existing.job_types === 'string' ? existing.job_types : JSON.stringify(existing.job_types));

    await sql`
      UPDATE job_preference SET
        job_titles = ${jobTitles},
        locations = ${locations},
        remote_only = ${remoteOnly},
        salary_min = ${salaryMin},
        job_types = ${jobTypes},
        updated_at = NOW()
      WHERE id = ${id}
    `;
    return getPreferences();
  } else {
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO job_preference (id, job_titles, locations, remote_only, salary_min, job_types)
      VALUES (${id}, ${data.jobTitles || '[]'}, ${data.locations || '[]'}, ${data.remoteOnly ?? false}, ${data.salaryMin || null}, ${data.jobTypes || '[]'})
    `;
    return getPreferences();
  }
}
