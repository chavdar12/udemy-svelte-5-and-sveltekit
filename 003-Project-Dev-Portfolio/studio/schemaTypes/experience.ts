import { defineField, defineType } from 'sanity';

export const experience = defineType({
    name: 'experience',
    title: 'Experience',
    type: 'document',
    fields: [
        defineField({ name: 'jobTitle', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'company', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'startDate', type: 'date', validation: (rule) => rule.required() }),
        defineField({
            name: 'endDate',
            type: 'date',
            description: 'Leave empty for your current job',
            validation: (rule) => rule.min(rule.valueOfField('startDate')),
        }),
    ],
    preview: { select: { title: 'jobTitle', subtitle: 'company' } },
});
