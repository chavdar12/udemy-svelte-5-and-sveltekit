// @vitest-environment node
import sgMail from '@sendgrid/mail';
import { sanity, toProject } from '#lib/server/sanity.ts';
import type { SanityProject } from '#lib/types.ts';
import { actions, load } from './+page.server';
import { load as loadWork } from './work/[slug]/+page.server';

vi.mock('$app/env/private', () => ({
    SANITY_PROJECT_ID: 'proj1',
    SANITY_DATASET: 'production',
    SENDGRID_API_KEY: 'SG.test',
    MAIL_FROM: 'site@example.com',
    MAIL_TO: 'me@example.com',
}));
vi.mock('@sendgrid/mail', () => ({ default: { setApiKey: vi.fn(), send: vi.fn() } }));

const raw: SanityProject = {
    _id: 'p1',
    name: 'Shop',
    company: 'Acme',
    slug: 'shop',
    dateAccomplished: '2026-05-01',
    image: { _type: 'image', asset: { _ref: 'image-abc123-800x600-png' } },
    content: [
        { _type: 'block', _key: 'a', style: 'h2', children: [{ text: 'Goal' }] },
        { _type: 'block', _key: 'b', style: 'h1', children: [{ text: 'Big ' }, { text: 'title' }] },
        { _type: 'image', _key: 'c', asset: { _ref: 'image-def456-400x300-jpg' } },
    ],
};

const post = (fields: Record<string, string>) => {
    const body = new FormData();
    for (const [k, v] of Object.entries(fields)) body.set(k, v);
    return { request: new Request('http://x/?/contact', { method: 'POST', body }) } as never;
};
const valid = { name: 'Ana', email: 'ana@example.com', message: 'Let us build something.' };

afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(sgMail.send).mockReset();
});

test('toProject builds image urls and only renders allowed text tags', () => {
    const project = toProject(raw);
    expect(project.imageUrl).toBe(
        'https://cdn.sanity.io/images/proj1/production/abc123-800x600.png?w=1200',
    );
    expect(project.stack).toEqual([]);
    expect(project.content).toEqual([
        { type: 'text', key: 'a', tag: 'h2', text: 'Goal' },
        { type: 'text', key: 'b', tag: 'p', text: 'Big title' },
        {
            type: 'image',
            key: 'c',
            url: 'https://cdn.sanity.io/images/proj1/production/def456-400x300.jpg?w=1200',
        },
    ]);
});

test('home page loads experience, projects and skills', async () => {
    const fetch = vi
        .spyOn(sanity(), 'fetch')
        .mockImplementation((async (query: string) =>
            query.includes('experience')
                ? [{ _id: 'e1' }]
                : query.includes('project')
                  ? [raw]
                  : null) as never);
    const data = (await load({} as never)) as Record<string, unknown[]>;
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(data.experience).toEqual([{ _id: 'e1' }]);
    expect(data.projects).toEqual([toProject(raw)]);
    expect(data.skills).toEqual([]);
});

test('work page queries by slug parameter and 404s when missing', async () => {
    const fetch = vi.spyOn(sanity(), 'fetch').mockResolvedValueOnce(raw as never);
    expect(await loadWork({ params: { slug: 'shop' } } as never)).toEqual({
        project: toProject(raw),
    });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('slug == $slug'), { slug: 'shop' });

    fetch.mockResolvedValueOnce(null as never);
    await expect(loadWork({ params: { slug: 'nope' } } as never)).rejects.toMatchObject({
        status: 404,
    });
});

test('contact form rejects invalid input without sending', async () => {
    const result = await actions.contact(post({ name: ' ', email: 'not-an-email', message: 'hi' }));
    expect(result).toMatchObject({
        status: 400,
        data: {
            errors: {
                name: expect.any(String),
                email: expect.any(String),
                message: expect.any(String),
            },
        },
    });
    expect(sgMail.send).not.toHaveBeenCalled();
});

test('contact form sends an escaped email', async () => {
    expect(await actions.contact(post({ ...valid, name: '<script>x</script>' }))).toEqual({
        sent: true,
    });
    const mail = vi.mocked(sgMail.send).mock.calls[0][0] as {
        to: string;
        replyTo: string;
        html: string;
    };
    expect(mail).toMatchObject({ to: 'me@example.com', replyTo: 'ana@example.com' });
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&#60;script&#62;');
});

test('contact form reports a SendGrid failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(sgMail.send).mockRejectedValueOnce(new Error('down'));
    expect(await actions.contact(post(valid))).toMatchObject({
        status: 502,
        data: { errors: { form: expect.any(String) } },
    });
});
