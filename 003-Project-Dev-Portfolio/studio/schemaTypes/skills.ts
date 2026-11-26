import { defineArrayMember, defineField, defineType } from 'sanity';

// a single document holding the ordered list of skills
export const skills = defineType({
    name: 'skills',
    title: 'Skills',
    type: 'document',
    fields: [
        defineField({
            name: 'list',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'skill',
                    fields: [
                        defineField({
                            name: 'name',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({ name: 'iconUrl', title: 'Icon URL', type: 'url' }),
                    ],
                }),
            ],
        }),
    ],
});
