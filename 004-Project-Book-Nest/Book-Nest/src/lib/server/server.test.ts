import { checkImage, scanShelf } from './scan.ts';
import { parseBook, parseCredentials, parseId } from './validate.ts';

const create = vi.hoisted(() => vi.fn());
vi.mock('openai', () => ({
    default: class {
        responses = { create };
    },
}));
vi.mock('$app/env/private', () => ({ OPENAI_API_KEY: 'sk-test', OPENAI_MODEL: 'test-model' }));

const form = (fields: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(fields)) f.set(k, v);
    return f;
};

test('parseBook accepts a full book and normalises empty fields to null', () => {
    expect(
        parseBook(
            form({
                title: ' Dune ',
                rating: '5',
                genre: 'sci-fi',
                started_reading_on: '2026-01-01',
            }),
        ),
    ).toEqual({
        ok: true,
        data: {
            title: 'Dune',
            author: null,
            genre: 'sci-fi',
            rating: 5,
            started_reading_on: '2026-01-01',
            finished_reading_on: null,
        },
    });
});

test('parseBook rejects bad values', () => {
    const result = parseBook(
        form({
            title: '',
            genre: 'cooking',
            rating: '6',
            started_reading_on: '2026-02-01',
            finished_reading_on: '2026-01-01',
        }),
    );
    expect(result.ok).toBe(false);
    expect(Object.keys(!result.ok ? result.errors : {})).toEqual([
        'title',
        'genre',
        'rating',
        'finished_reading_on',
    ]);
    expect(parseBook(form({ title: 'x', started_reading_on: '2026-13-45' }))).toMatchObject({
        ok: false,
        errors: { started_reading_on: 'Use a valid date.' },
    });
});

test('parseCredentials checks registration and never echoes the password', () => {
    const bad = parseCredentials(
        form({ name: '', email: 'x', password: 'short', passwordConfirm: 'other' }),
        {
            register: true,
        },
    );
    expect(bad).toEqual({
        ok: false,
        values: { name: '', email: 'x' },
        errors: expect.objectContaining({
            name: expect.any(String),
            email: expect.any(String),
            password: expect.any(String),
        }),
    });
    expect(parseCredentials(form({ email: 'a@b.co', password: 'pw' }))).toEqual({
        ok: true,
        data: { name: '', email: 'a@b.co', password: 'pw' },
    });
});

test('parseId only accepts positive integers', () => {
    expect(parseId('42')).toBe(42);
    for (const bad of ['', '-1', '1.5', '1e3', 'abc', '9'.repeat(20), null])
        expect(parseId(bad)).toBeNull();
});

test('checkImage only lets small png/jpeg/webp data urls through', () => {
    expect(checkImage('data:image/png;base64,iVBORw0KGgo=')).toBe(
        'data:image/png;base64,iVBORw0KGgo=',
    );
    expect(checkImage('data:image/svg+xml;base64,PHN2Zz4=')).toBeNull();
    expect(checkImage('https://example.com/shelf.jpg')).toBeNull();
    expect(checkImage(42)).toBeNull();
    expect(checkImage(`data:image/jpeg;base64,${'A'.repeat(7 * 1024 * 1024)}`)).toBeNull();
});

test('scanShelf sends the image and keeps only well-formed books', async () => {
    create.mockResolvedValue({
        output_text: JSON.stringify({
            books: [
                { title: ' Dune ', author: 'Frank Herbert' },
                { title: '', author: null },
                { title: 7 },
                { title: 'Emma', author: null },
            ],
        }),
    });
    expect(await scanShelf('data:image/png;base64,AAAA')).toEqual([
        { title: 'Dune', author: 'Frank Herbert' },
        { title: 'Emma', author: null },
    ]);
    const request = create.mock.calls[0][0];
    expect(request.model).toBe('test-model');
    expect(request.input[0].content[1]).toMatchObject({
        type: 'input_image',
        image_url: 'data:image/png;base64,AAAA',
    });
});
