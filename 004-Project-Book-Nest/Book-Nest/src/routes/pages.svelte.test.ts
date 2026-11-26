import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import BookForm from '#lib/components/BookForm.svelte';
import Dashboard from './private/dashboard/+page.svelte';
import ScanShelf from './private/scan-shelf/+page.svelte';

afterEach(() => vi.restoreAllMocks());

test('dashboard lists books with their reading status and links', () => {
    const books = [
        {
            id: 1,
            title: 'Dune',
            author: 'Frank Herbert',
            genre: null,
            rating: 5,
            started_reading_on: '2026-01-01',
            finished_reading_on: '2026-02-01',
        },
        {
            id: 2,
            title: 'Emma',
            author: null,
            genre: null,
            rating: null,
            started_reading_on: '2026-03-01',
            finished_reading_on: null,
        },
    ];
    render(Dashboard, { data: { books, user: null }, form: null } as never);
    expect(screen.getByRole('link', { name: 'Dune' })).toHaveAttribute('href', '/private/books/1');
    expect(screen.getByText('· Finished')).toBeInTheDocument();
    expect(screen.getByText('· Reading')).toBeInTheDocument();
    expect(screen.getByLabelText('5 of 5 stars')).toBeInTheDocument();
});

test('book form keeps the entered values and shows errors', () => {
    render(BookForm, {
        action: '?/add',
        submit: 'Add',
        values: { title: 'Dune', rating: '3' },
        errors: { title: 'Too long' },
    });
    expect(screen.getByLabelText('Title')).toHaveValue('Dune');
    expect(screen.getByLabelText('Rating')).toHaveValue('3');
    expect(screen.getByText('Too long')).toBeInTheDocument();
});

test('scan page uploads the photo and lists the books it added', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({ books: [{ title: 'Dune', author: 'Frank Herbert' }] }),
    );
    render(ScanShelf);
    await userEvent.upload(
        screen.getByLabelText(/Shelf photo/),
        new File(['img'], 'shelf.png', { type: 'image/png' }),
    );

    expect(await screen.findByText('Added 1 books:')).toBeInTheDocument();
    expect(screen.getByText('Dune – Frank Herbert')).toBeInTheDocument();
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.image).toMatch(/^data:image\/png;base64,/);
});

test('scan page rejects photos over 5 MB before uploading', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(ScanShelf);
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText(/Shelf photo/), big);
    expect(screen.getByRole('alert')).toHaveTextContent('5 MB');
    expect(fetch).not.toHaveBeenCalled();
});
