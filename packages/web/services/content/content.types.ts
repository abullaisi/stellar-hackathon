import type { ContentListItem, DownloadResponse } from '@komunify/shared';

export type { ContentListItem, DownloadResponse };

export interface OnChainContent {
  id: bigint;
  creator: string;
  managers: string[];
  active: boolean;
  sha256: Uint8Array;
}
