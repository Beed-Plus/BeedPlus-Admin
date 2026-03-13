import { apiFetch } from './api'

export const emailApi = {
  /**
   * POST /api/email/send  (admin auth)
   * body: { recipientMode, category, userIds, subject, message }
   * recipientMode: 'all' | 'approved' | 'pending' | 'category' | 'selected'
   */
  sendBulkEmail: ({ recipientMode, category, userIds, subject, message }, token) =>
    apiFetch('/api/email/send', {
      method: 'POST',
      body: { recipientMode, category, userIds, subject, message },
      token,
    }),
}
