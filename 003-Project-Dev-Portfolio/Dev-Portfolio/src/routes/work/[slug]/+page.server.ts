import { error } from '@sveltejs/kit';
import { sanity, toProject } from '#lib/server/sanity.ts';
import type { SanityProject } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    // GROQ parameters, never string interpolation
    const raw = await sanity().fetch<SanityProject | null>(
        '*[_type == "project" && slug == $slug][0]',
        {
            slug: params.slug,
        },
    );
    if (!raw) error(404, 'Project not found');
    return { project: toProject(raw) };
};
