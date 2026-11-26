<script lang="ts">
    import '../app.css';
    import favicon from '#lib/assets/favicon.svg';
    import type { LayoutProps } from './$types';

    let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Book Nest</title>
</svelte:head>

<nav>
    <a href="/" class="logo">Book Nest</a>
    {#if data.user}
        <a href="/private/dashboard">My books</a>
        <a href="/private/scan-shelf">Scan shelf</a>
        <a href="/private/settings">Settings</a>
        <form method="POST" action="/logout"><button>Log out</button></form>
    {:else}
        <a href="/login">Log in</a>
        <a href="/register">Register</a>
    {/if}
</nav>

{@render children()}

<style>
    nav {
        display: flex;
        gap: 20px;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e3dccf;
    }

    .logo {
        margin-right: auto;
        font-weight: 700;
    }

    nav form {
        display: contents;
    }
</style>
