import { updateSavedJob, deleteSavedJob } from '@/lib/db-pg';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/jobs/saved/[id] - Update a saved job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, coverLetter, appliedDate } = body;

    await updateSavedJob(id, {
      status: status || undefined,
      notes: notes || undefined,
      cover_letter: coverLetter || undefined,
      applied_date: appliedDate || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating saved job:', error);
    return NextResponse.json({ error: 'Failed to update saved job' }, { status: 500 });
  }
}

// DELETE /api/jobs/saved/[id] - Remove a saved job
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSavedJob(id);
    return NextResponse.json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error('Error deleting saved job:', error);
    return NextResponse.json({ error: 'Failed to delete saved job' }, { status: 500 });
  }
}
