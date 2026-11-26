import { render, screen } from '@testing-library/svelte';
import BlogPage from './blog/+page.svelte';
import PostPage from './blog/[postId]/+page.svelte';

test('blog page links every post', () => {
    const posts = [
        { id: 1, title: 'First', body: '' },
        { id: 2, title: 'Second', body: '' },
    ];
    render(BlogPage, { data: { posts } } as never);
    expect(screen.getByRole('link', { name: 'Second' })).toHaveAttribute('href', '/blog/2');
});

test('post page renders the loaded post', () => {
    render(PostPage, { data: { post: { id: 1, title: 'First', body: 'Hello' } } } as never);
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
});
