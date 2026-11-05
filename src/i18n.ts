import { getCollection, type CollectionEntry } from 'astro:content';

export const LANGS = ['en', 'ko'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABEL: Record<Lang, string> = { en: 'EN', ko: '한국어' };
export const HTML_LANG: Record<Lang, string> = { en: 'en', ko: 'ko' };

export const ui = {
  en: {
    siteName: 'Toolbox Notes',
    tagline: 'Small tools, built for convenience.',
    intro:
      'Notes on the little programs I build to make everyday work easier — what they do, how they work, and what I learned making them.',
    latest: 'Latest notes',
    noPosts: 'No posts yet. The first one is on its way.',
    home: 'Home',
    about: 'About',
    privacy: 'Privacy',
    readMore: 'Read',
    backToList: '← All notes',
    published: 'Published',
    updated: 'Updated',
    switchTo: 'Read in',
    notFound: 'Page not found',
    notFoundBody: "This page doesn't exist (or moved).",
    rights: 'All rights reserved.',
  },
  ko: {
    siteName: 'Toolbox Notes',
    tagline: '편하려고 만든 작은 도구들.',
    intro:
      '일상 업무를 조금 더 편하게 만들기 위해 직접 만든 작은 프로그램들에 대한 기록입니다. 무엇을 하는지, 어떻게 동작하는지, 만들면서 배운 점을 정리합니다.',
    latest: '최근 글',
    noPosts: '아직 글이 없습니다. 첫 글을 준비 중이에요.',
    home: '홈',
    about: '소개',
    privacy: '개인정보처리방침',
    readMore: '읽기',
    backToList: '← 전체 글',
    published: '작성',
    updated: '수정',
    switchTo: '다른 언어로 보기',
    notFound: '페이지를 찾을 수 없습니다',
    notFoundBody: '존재하지 않거나 이동된 페이지입니다.',
    rights: 'All rights reserved.',
  },
} as const;

export function t(lang: Lang) {
  return ui[lang];
}

export function formatDate(date: Date, lang: Lang) {
  return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Entry id looks like "en/my-post" → { lang: 'en', slug: 'my-post' } */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

export function postUrl(lang: Lang, slug: string) {
  return `/${lang}/blog/${slug}/`;
}

export async function getPosts(lang?: Lang): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ id, data }) => {
    if (data.draft) return false;
    return lang ? splitId(id).lang === lang : true;
  });
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
