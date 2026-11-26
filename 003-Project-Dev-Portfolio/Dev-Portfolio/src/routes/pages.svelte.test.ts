import { render, screen } from '@testing-library/svelte';
import ContactForm from '#lib/components/ContactForm.svelte';
import HomePage from './+page.svelte';
import WorkPage from './work/[slug]/+page.svelte';

vi.mock('$app/forms', () => ({ enhance: () => ({ destroy() {} }) }));

const project = {
    id: 'p1',
    name: 'Shop',
    company: 'Acme',
    slug: 'shop',
    dateAccomplished: '2026-05-01',
    stack: ['Svelte'],
    imageUrl: 'https://cdn.test/shop.png',
    content: [
        { type: 'text', key: 'a', tag: 'h2', text: 'Goal' },
        { type: 'image', key: 'b', url: 'https://cdn.test/shot.png' },
    ],
};

test('home page links projects and lists experience', () => {
    const data = {
        projects: [project],
        experience: [
            { _id: 'e1', jobTitle: 'Developer', company: 'Acme', startDate: '2024-01-01' },
        ],
        skills: [{ _key: 's1', name: 'Svelte' }],
    };
    render(HomePage, { data, form: null } as never);
    expect(screen.getByRole('link', { name: /Shop/ })).toHaveAttribute('href', '/work/shop');
    expect(screen.getByText('2024-01 – present')).toBeInTheDocument();
    expect(screen.getByText('Svelte')).toBeInTheDocument();
});

test('work page renders the content blocks', () => {
    const { container } = render(WorkPage, { data: { project } } as never);
    expect(screen.getByRole('heading', { level: 1, name: 'Shop' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Goal' })).toBeInTheDocument();
    expect(container.querySelector('img[src="https://cdn.test/shot.png"]')).toBeInTheDocument();
});

test('contact form shows field errors and keeps the input', () => {
    render(ContactForm, {
        form: { name: 'Ana', email: 'x', message: '', errors: { email: 'Enter a valid email.' } },
    });
    expect(screen.getByLabelText('Name')).toHaveValue('Ana');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument();
});

test('contact form thanks the sender once sent', () => {
    render(ContactForm, { form: { sent: true } });
    expect(screen.getByRole('status')).toHaveTextContent('Thanks');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
