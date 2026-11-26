import { groupProblems, validateSchema } from '@sanity/schema/_internal';
import { schemaTypes } from './index.ts';

// the Dev-Portfolio GROQ queries depend on these names
const fields = (type: string) =>
    schemaTypes.find((t) => t.name === type)!.fields.map((f) => f.name);

test('the schema validates without errors, as `sanity schema validate` does', () => {
    const problems = groupProblems(validateSchema(schemaTypes).getTypes()).flatMap(
        (group) => group.problems,
    );
    expect(problems.filter((p) => p.severity === 'error')).toEqual([]);
});

test('a broken type is reported', () => {
    const problems = groupProblems(
        validateSchema([{ name: 'bad', type: 'document', fields: [] }]).getTypes(),
    );
    expect(problems.flatMap((g) => g.problems).some((p) => p.severity === 'error')).toBe(true);
});

test('documents expose the fields the app queries', () => {
    expect(fields('experience')).toEqual(['jobTitle', 'company', 'startDate', 'endDate']);
    expect(fields('project')).toEqual([
        'name',
        'company',
        'slug',
        'image',
        'dateAccomplished',
        'stack',
        'content',
    ]);
    expect(fields('skills')).toEqual(['list']);
});
