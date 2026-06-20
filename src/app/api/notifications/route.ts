import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/db-pg';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications - Return all notifications
export async function GET() {
  try {
    const notifications = await getNotifications();
    // Normalize for frontend
    const normalized = notifications.map((n: Record<string, unknown>) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      jobId: n.job_id,
      createdAt: n.created_at,
    }));
    return NextResponse.json({ notifications: normalized });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      await markAllNotificationsRead();
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (!id) {
      return NextResponse.json({ error: 'id or markAll is required' }, { status: 400 });
    }

    await markNotificationRead(id);
    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
