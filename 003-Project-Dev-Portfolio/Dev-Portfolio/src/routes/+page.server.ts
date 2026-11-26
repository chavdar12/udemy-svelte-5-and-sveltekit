import { fail } from '@sveltejs/kit';
import { sendContactMail } from '#lib/server/mail.ts';
import { sanity, toProject } from '#lib/server/sanity.ts';
import type { Experience, SanityProject, Skill } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const [experience, projects, skills] = await Promise.all([
        sanity().fetch<Experience[]>('*[_type == "experience"] | order(startDate desc)'),
        sanity().fetch<SanityProject[]>('*[_type == "project"] | order(dateAccomplished desc)'),
        sanity().fetch<Skill[] | null>('*[_type == "skills"][0].list'),
    ]);
    return { experience, projects: projects.map(toProject), skills: skills ?? [] };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions: Actions = {
    contact: async ({ request }) => {
        const form = await request.formData();
        const value = (key: string) => String(form.get(key) ?? '').trim();
        const contact = { name: value('name'), email: value('email'), message: value('message') };

        const errors: Partial<Record<keyof typeof contact, string>> = {};
        if (!contact.name || contact.name.length > 100)
            errors.name = 'Enter your name (up to 100 characters).';
        if (!EMAIL.test(contact.email) || contact.email.length > 254)
            errors.email = 'Enter a valid email.';
        if (contact.message.length < 10 || contact.message.length > 5000)
            errors.message = 'Write between 10 and 5000 characters.';
        if (Object.keys(errors).length) return fail(400, { ...contact, errors });

        try {
            await sendContactMail(contact);
        } catch (e) {
            console.error(e);
            return fail(502, {
                ...contact,
                errors: { form: 'Could not send the message, try again later.' },
            });
        }
        return { sent: true };
    },
};
