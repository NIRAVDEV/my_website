
export interface Media {
  id: string;
  src: string;
  type: 'image' | 'video';
}

export interface User {
  id: string;
  username: string;
  mythicalCoins: number;
  is_admin: boolean;
}

export interface RedemptionRequest {
  id: string;
  username: string;
  type: 'google_play' | 'upi';
  recipient: string; // email or UPI ID
  amount: number;
  status: 'pending' | 'completed';
  createdAt: number;
  completedAt?: number;
  code?: string; // The redeem code entered by admin
}
