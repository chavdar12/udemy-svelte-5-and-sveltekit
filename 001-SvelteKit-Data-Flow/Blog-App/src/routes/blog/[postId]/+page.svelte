<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<a href="/blog">← All posts</a>
<article>
    <h1>{data.post.title}</h1>
    <p>{data.post.body}</p>
</article>
