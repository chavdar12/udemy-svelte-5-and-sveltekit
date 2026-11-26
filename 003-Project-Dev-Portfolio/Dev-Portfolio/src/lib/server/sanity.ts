import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { SANITY_DATASET, SANITY_PROJECT_ID } from '$app/env/private';
import type { ContentBlock, Project, SanityProject } from '#lib/types.ts';

let client: SanityClient | undefined;

export const sanity = () =>
    (client ??= createClient({
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        apiVersion: '2026-11-01',
        useCdn: true,
    }));

const TAGS = new Set(['h2', 'h3', 'h4', 'blockquote']);

// flattens Sanity's portable text into blocks the page can render without {@html}
export function toProject(raw: SanityProject): Project {
    const images = createImageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET });
    const content: ContentBlock[] = (raw.content ?? []).map((block, i) =>
        block._type === 'block'
            ? {
                  type: 'text',
                  key: block._key,
                  tag: (TAGS.has(block.style ?? '') ? block.style : 'p') as 'p',
                  text: block.children.map((c) => c.text).join(''),
              }
            : {
                  type: 'image',
                  key: block._key ?? `img-${i}`,
                  url: images.image(block).width(1200).url(),
              },
    );
    return {
        id: raw._id,
        name: raw.name,
        company: raw.company,
        slug: raw.slug,
        dateAccomplished: raw.dateAccomplished,
        stack: raw.stack ?? [],
        imageUrl: images.image(raw.image).width(1200).url(),
        content,
    };
}
