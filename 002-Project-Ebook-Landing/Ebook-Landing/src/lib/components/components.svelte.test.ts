import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { goto } from '$app/navigation';
import { chapters, faqs } from '#lib/content.ts';
import BuyButton from './BuyButton.svelte';
import Chapters from './Chapters.svelte';
import Faq from './Faq.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

const label = createRawSnippet(() => ({ render: () => '<span>Buy</span>' }));

afterEach(() => vi.restoreAllMocks());

test('chapters show the selected chapter in the panel', async () => {
    render(Chapters);
    expect(screen.getByRole('tabpanel')).toHaveTextContent(chapters[0].summary);
    await userEvent.click(screen.getByRole('tab', { name: /Chapter 3/ }));
    expect(screen.getByRole('tab', { name: /Chapter 3/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent(chapters[2].summary);
});

test('faq opens one answer at a time and closes it on a second click', async () => {
    render(Faq);
    const [first, second] = screen.getAllByRole('button');
    const answer = (i: number) => screen.getByText(faqs[i].answer);
    expect(answer(0)).not.toBeVisible();

    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(answer(0)).toBeVisible();

    await userEvent.click(second);
    expect(answer(0)).not.toBeVisible();
    expect(answer(1)).toBeVisible();

    await userEvent.click(second);
    expect(answer(1)).not.toBeVisible();
});

test('buy button redirects to the Stripe checkout url', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({ url: 'https://checkout.stripe.test/1' }),
    );
    const assign = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ assign } as never);
    render(BuyButton, { children: label });

    await userEvent.click(screen.getByRole('button', { name: 'Buy' }));
    expect(fetch).toHaveBeenCalledWith('/api/checkout', { method: 'POST' });
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.test/1');
});

test('buy button goes to the failure page when the checkout fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 502 }));
    render(BuyButton, { children: label });

    await userEvent.click(screen.getByRole('button', { name: 'Buy' }));
    expect(goto).toHaveBeenCalledWith('/checkout/failure');
    expect(screen.getByRole('button')).toBeEnabled();
});
