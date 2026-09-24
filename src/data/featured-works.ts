/**
 * トップ（ヒーロー直下）に並べる実績。
 * ここは microCMS の更新に影響されない固定リストです。差し替えはこのファイルを編集して再デプロイ。
 * `slug` は /works/{slug}/ の実績ページに対応（microCMS の slug と一致させる。未登録ならシードから生成）。
 */
import snsInfluencer from '../assets/works/sns-influencer.jpg';
import gameCommentary1 from '../assets/works/game-commentary-1.jpg';
import newsYoutube from '../assets/works/news-youtube.jpg';
import gameCommentary2 from '../assets/works/game-commentary-2.jpg';
import vtuberVideo from '../assets/works/vtuber-video.jpg';

export const featuredWorks = [
  { slug: 'sns-influencer', title: 'インフルエンサーSNS運営', category: 'SNS運用', image: snsInfluencer },
  { slug: 'game-commentary-1', title: 'ゲーム実況者動画作成', category: '動画編集', image: gameCommentary1 },
  { slug: 'news-youtube', title: 'ニュース系YouTubeチャンネル運営', category: 'YouTube運営', image: newsYoutube },
  { slug: 'game-commentary-2', title: 'ゲーム実況者動画作成', category: '動画編集', image: gameCommentary2 },
  { slug: 'vtuber-video', title: 'Vtuber動画作成', category: '動画編集', image: vtuberVideo },
];
