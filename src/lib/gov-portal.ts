const GOV_PORTAL_WEBHOOK = process.env.GOV_PORTAL_WEBHOOK_URL || '';

export type GovPortalEvent =
  | 'ISSUE_CREATED'
  | 'ISSUE_UPDATED'
  | 'STATUS_CHANGED';

export interface GovPortalPayload {
  event: GovPortalEvent;
  timestamp: string;
  issue: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
    images: string;
    department: string | null;
    upvotes: number;
    reporter: {
      name: string | null;
      email: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
  };
  update?: {
    previousStatus?: string;
    newStatus?: string;
    comment?: string;
    updatedBy?: string;
  };
}

export async function notifyGovPortal(
  payload: GovPortalPayload
): Promise<void> {
  if (!GOV_PORTAL_WEBHOOK) {
    console.log(
      `[GovPortal] GOV_PORTAL_WEBHOOK_URL not set. Skipping notification for ${payload.event}.`
    );
    console.log(`[GovPortal] Payload would be:`, JSON.stringify(payload, null, 2));
    return;
  }

  try {
    const res = await fetch(GOV_PORTAL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(
        `[GovPortal] Gov portal responded with ${res.status}: ${await res.text()}`
      );
    } else {
      console.log(`[GovPortal] Successfully notified gov portal for ${payload.event}`);
    }
  } catch (error) {
    console.error(`[GovPortal] Failed to notify gov portal:`, error);
  }
}
