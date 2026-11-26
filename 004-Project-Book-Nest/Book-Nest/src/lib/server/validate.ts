export type Fields = Record<string, string>;
export type Result<T> = { ok: true; data: T } | { ok: false; values: Fields; errors: Fields };

export const GENRES = [
    'fiction',
    'non-fiction',
    'fantasy',
    'sci-fi',
    'mystery',
    'biography',
    'history',
    'other',
];

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type BookInput = {
    title: string;
    author: string | null;
    genre: string | null;
    rating: number | null;
    started_reading_on: string | null;
    finished_reading_on: string | null;
};

export function parseBook(form: FormData): Result<BookInput> {
    const values = Object.fromEntries(
        ['title', 'author', 'genre', 'rating', 'started_reading_on', 'finished_reading_on'].map(
            (k) => [k, text(form, k)],
        ),
    );
    const errors: Fields = {};
    if (!values.title || values.title.length > 200)
        errors.title = 'Enter a title (up to 200 characters).';
    if (values.author.length > 200) errors.author = 'Keep the author under 200 characters.';
    if (values.genre && !GENRES.includes(values.genre))
        errors.genre = 'Pick a genre from the list.';
    if (values.rating && !/^[1-5]$/.test(values.rating)) errors.rating = 'Rate from 1 to 5.';
    for (const key of ['started_reading_on', 'finished_reading_on']) {
        if (values[key] && (!DATE.test(values[key]) || Number.isNaN(Date.parse(values[key]))))
            errors[key] = 'Use a valid date.';
    }
    if (
        !errors.started_reading_on &&
        !errors.finished_reading_on &&
        values.started_reading_on &&
        values.finished_reading_on &&
        values.finished_reading_on < values.started_reading_on
    )
        errors.finished_reading_on = 'You cannot finish before you start.';
    if (Object.keys(errors).length) return { ok: false, values, errors };
    return {
        ok: true,
        data: {
            title: values.title,
            author: values.author || null,
            genre: values.genre || null,
            rating: values.rating ? Number(values.rating) : null,
            started_reading_on: values.started_reading_on || null,
            finished_reading_on: values.finished_reading_on || null,
        },
    };
}

export function parseCredentials(form: FormData, { register = false } = {}): Result<Fields> {
    const values = { name: text(form, 'name'), email: text(form, 'email') };
    const password = String(form.get('password') ?? '');
    const errors: Fields = {};
    if (register && (!values.name || values.name.length > 100)) errors.name = 'Enter your name.';
    if (!EMAIL.test(values.email)) errors.email = 'Enter a valid email.';
    if (password.length < (register ? 8 : 1))
        errors.password = register ? 'Use at least 8 characters.' : 'Enter your password.';
    if (register && password !== String(form.get('passwordConfirm') ?? ''))
        errors.passwordConfirm = 'Passwords do not match.';
    // never echo the password back to the page
    return Object.keys(errors).length
        ? { ok: false, values, errors }
        : { ok: true, data: { ...values, password } };
}

export function parseId(value: string | null | undefined): number | null {
    return value && /^\d{1,15}$/.test(value) ? Number(value) : null;
}
