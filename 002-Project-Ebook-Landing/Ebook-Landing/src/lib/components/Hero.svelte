<script lang="ts">
    import type { Snippet } from 'svelte';
    import { book } from '#lib/content.ts';
    import BuyButton from './BuyButton.svelte';

    // the checkout pages reuse the hero with their own text
    let { children }: { children?: Snippet } = $props();
</script>

<header class="hero">
    <div class="cover" aria-hidden="true">{book.title}</div>
    <div class="text">
        {#if children}
            {@render children()}
        {:else}
            <h1>Finish the side project you keep starting</h1>
            <p>A short, practical guide from idea to the first real users.</p>
            <BuyButton>Get the ebook for {book.price}</BuyButton>
        {/if}
    </div>
</header>

<style>
    .hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 80vh;
    }

    .cover {
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #e2cbff, #deeaff 50%, var(--accent));
        font-size: 3rem;
        font-weight: 800;
        text-align: center;
        padding: 24px;
    }

    .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 24px;
        padding: 48px;
        background: var(--ink);
        color: var(--paper);
    }

    @media (max-width: 720px) {
        .hero {
            grid-template-columns: 1fr;
        }
    }
</style>
