import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts live in src/content/blog/en/*.md and src/content/blog/ko/*.md.
// Use the SAME file name in both folders to link a post with its translation.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
