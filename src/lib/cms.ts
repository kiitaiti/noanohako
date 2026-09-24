/**
 * microCMS クライアント。
 * 環境変数 MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定の場合は
 * src/data/seed-*.json のシードデータでビルドします（ローカル確認・初回デプロイ用）。
 *
 * microCMS 側のAPI設計は docs/microCMS設定.md を参照。
 */
import { createClient, type MicroCMSQueries } from 'microcms-js-sdk';
import seedNews from '../data/seed-news.json';
import seedWorks from '../data/seed-works.json';

export type NewsCategory = 'コラム' | '活動記録' | 'お知らせ' | 'メディア掲載';

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory | string;
  publishedAt: string;
  updatedAt?: string;
  summary?: string;
  body: string; // HTML（microCMS リッチエディタ）
  thumbnail?: { url: string; width: number; height: number };
  externalUrl?: string;
}

export interface WorkItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  updatedAt?: string;
  summary?: string;
  body: string;
  image?: { url: string; width: number; height: number };
}

const domain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;

export const cmsEnabled = Boolean(domain && apiKey);

const client = cmsEnabled
  ? createClient({ serviceDomain: domain, apiKey })
  : null;

async function fetchAll<T>(endpoint: string, queries: MicroCMSQueries = {}): Promise<T[]> {
  if (!client) return [];
  const limit = 100;
  let offset = 0;
  const all: T[] = [];
  // microCMS の上限に合わせてページング
  for (;;) {
    const res = await client.getList<T>({ endpoint, queries: { ...queries, limit, offset } });
    all.push(...res.contents);
    offset += limit;
    if (offset >= res.totalCount) break;
  }
  return all;
}

function normalizeNews(raw: any): NewsItem {
  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    title: raw.title,
    category: Array.isArray(raw.category) ? raw.category[0] : raw.category || 'コラム',
    publishedAt: raw.publishedAt || raw.createdAt,
    updatedAt: raw.updatedAt,
    summary: raw.summary || '',
    body: raw.body || '',
    thumbnail: raw.thumbnail,
    externalUrl: raw.externalUrl || '',
  };
}

function normalizeWork(raw: any): WorkItem {
  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    title: raw.title,
    category: Array.isArray(raw.category) ? raw.category[0] : raw.category || '制作物',
    publishedAt: raw.publishedAt || raw.createdAt,
    updatedAt: raw.updatedAt,
    summary: raw.summary || '',
    body: raw.body || '',
    image: raw.image,
  };
}

const byDateDesc = <T extends { publishedAt: string }>(a: T, b: T) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

export async function getNews(): Promise<NewsItem[]> {
  const items = cmsEnabled
    ? (await fetchAll<any>('column', { orders: '-publishedAt' })).map(normalizeNews)
    : (seedNews as any[]).map(normalizeNews);
  return items.sort(byDateDesc);
}

export async function getWorks(): Promise<WorkItem[]> {
  const items = cmsEnabled
    ? (await fetchAll<any>('works', { orders: '-publishedAt' })).map(normalizeWork)
    : (seedWorks as any[]).map(normalizeWork);
  return items.sort(byDateDesc);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function toISODate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
