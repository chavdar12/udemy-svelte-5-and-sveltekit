<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<h1>Blog</h1>
<ul>
    {#each data.posts as post (post.id)}
        <li><a href="/blog/{post.id}">{post.title}</a></li>
    {/each}
</ul>
