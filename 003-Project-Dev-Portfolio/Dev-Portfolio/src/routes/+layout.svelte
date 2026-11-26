<script lang="ts">
    import '../app.css';
    import favicon from '#lib/assets/favicon.svg';
    import type { LayoutProps } from './$types';

    let { children }: LayoutProps = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Portfolio</title>
</svelte:head>

<nav>
    <a href="/">Home</a>
    <a href="/#work">Work</a>
    <a href="/#contact">Contact</a>
</nav>

{@render children()}

<style>
    nav {
        display: flex;
        gap: 24px;
        justify-content: flex-end;
        padding: 16px 24px;
    }
</style>
