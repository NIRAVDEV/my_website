export interface Media {
  id: string;
  src: string;
  type: 'image' | 'video';
}

export interface User {
  username: string;
  mythicalCoins: number;
}
