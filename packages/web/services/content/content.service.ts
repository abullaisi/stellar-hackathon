import type { ContentListResponse } from '@komunify/shared';

import { getKomunifyClient } from '@/lib/contracts';

import { API_ENDPOINTS } from '../api/endpoints';
import { ApiHttp } from '../api/http';
import type { DownloadResponse } from './content.types';

export class ContentService {
  /** Public list of REGISTERED content metadata. Never returns a download URL. */
  static list(cursor?: string): Promise<ContentListResponse> {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
    return ApiHttp.get<ContentListResponse>(`${API_ENDPOINTS.content.list}${qs}`);
  }

  static async currentEpoch(): Promise<number> {
    const tx = await getKomunifyClient().current_epoch();
    return tx.result;
  }

  static async hasRead(epoch: number, contentId: bigint, member: string): Promise<boolean> {
    const tx = await getKomunifyClient().has_read({ epoch, content_id: contentId, member });
    return tx.result;
  }

  static async isActive(member: string): Promise<boolean> {
    const tx = await getKomunifyClient().is_active({ member });
    return tx.result;
  }

  /**
   * `record_access(member, content_id)` — require_auth(member), idempotent per
   * (epoch, content, member) (PLAN.md §2 step 3-4). Safe to call even if a read
   * was already recorded; it just costs a fee on retry.
   */
  static async recordAccess(member: string, contentId: bigint) {
    const client = getKomunifyClient(member);
    const assembled = await client.record_access({ member, content_id: contentId });
    return assembled.signAndSend();
  }

  /** The gate — `GET /content/:id/download` (API_SPEC.md §2). */
  static download(contentId: string): Promise<DownloadResponse> {
    return ApiHttp.get<DownloadResponse>(API_ENDPOINTS.content.download(contentId));
  }
}
