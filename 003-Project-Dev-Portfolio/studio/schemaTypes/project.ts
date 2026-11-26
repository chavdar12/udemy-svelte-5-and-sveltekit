import { defineArrayMember, defineField, defineType } from 'sanity';

export const project = defineType({
    name: 'project',
    title: 'Project',
    type: 'document',
    fields: [
        defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'company', type: 'string', validation: (rule) => rule.required() }),
        defineField({
            name: 'slug',
            type: 'string',
            description: 'URL ending: /work/<slug>',
            validation: (rule) =>
                rule.required().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
                    name: 'lowercase words joined by dashes',
                }),
        }),
        defineField({
            name: 'image',
            type: 'image',
            options: { hotspot: true },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'dateAccomplished',
            type: 'date',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'stack',
            type: 'array',
            of: [defineArrayMember({ type: 'string' })],
            options: { layout: 'tags' },
        }),
        defineField({
            name: 'content',
            type: 'array',
            of: [defineArrayMember({ type: 'block' }), defineArrayMember({ type: 'image' })],
        }),
    ],
    orderings: [
        { title: 'Newest', name: 'newest', by: [{ field: 'dateAccomplished', direction: 'desc' }] },
    ],
});
