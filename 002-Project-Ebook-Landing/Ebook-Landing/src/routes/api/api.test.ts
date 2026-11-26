// @vitest-environment node
import sgMail from '@sendgrid/mail';
import { stripe } from '#lib/server/stripe.ts';
import { POST as checkout } from './checkout/+server';
import { POST as webhook } from './stripe-webhook/+server';

const secret = 'whsec_test';
vi.mock('$app/env/private', () => ({
    STRIPE_SECRET_KEY: 'sk_test_x',
    STRIPE_PRICE_ID: 'price_1',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    SENDGRID_API_KEY: 'SG.test',
    MAIL_FROM: 'books@example.com',
    EBOOK_URL: 'https://example.com/book.pdf',
}));
vi.mock('@sendgrid/mail', () => ({ default: { setApiKey: vi.fn(), send: vi.fn() } }));

afterEach(() => vi.restoreAllMocks());

const signed = async (payload: object, sig?: string) => {
    const body = JSON.stringify(payload);
    const header =
        sig ?? (await stripe().webhooks.generateTestHeaderStringAsync({ payload: body, secret }));
    return {
        request: new Request('http://x/api/stripe-webhook', {
            method: 'POST',
            body,
            headers: { 'stripe-signature': header },
        }),
    } as never;
};

const completed = (name: string) => ({
    id: 'evt_1',
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: { customer_details: { email: 'ana@example.com', name } } },
});

test('checkout creates a payment session and returns its url', async () => {
    const create = vi
        .spyOn(stripe().checkout.sessions, 'create')
        .mockResolvedValue({ url: 'https://checkout.stripe.test/1' } as never);
    const res = await checkout({ url: new URL('http://shop.test/api/checkout') } as never);

    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.test/1' });
    expect(create).toHaveBeenCalledWith({
        mode: 'payment',
        line_items: [{ price: 'price_1', quantity: 1 }],
        success_url: 'http://shop.test/checkout/success',
        cancel_url: 'http://shop.test/checkout/failure',
    });
});

test('checkout answers 502 when Stripe fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(stripe().checkout.sessions, 'create').mockRejectedValue(new Error('down'));
    await expect(checkout({ url: new URL('http://shop.test') } as never)).rejects.toMatchObject({
        status: 502,
    });
});

test('webhook emails the buyer with the name HTML-escaped', async () => {
    const res = await webhook(await signed(completed('<b>Ana</b>')));
    expect(await res.text()).toBe('ok');
    expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'ana@example.com', from: 'books@example.com' }),
    );
    const { html } = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string };
    expect(html).toContain('&#60;b&#62;Ana&#60;/b&#62;');
    expect(html).toContain('https://example.com/book.pdf');
});

test('webhook rejects a request with a bad signature', async () => {
    vi.mocked(sgMail.send).mockClear();
    await expect(webhook(await signed(completed('Ana'), 't=1,v1=bad'))).rejects.toMatchObject({
        status: 400,
    });
    expect(sgMail.send).not.toHaveBeenCalled();
});
