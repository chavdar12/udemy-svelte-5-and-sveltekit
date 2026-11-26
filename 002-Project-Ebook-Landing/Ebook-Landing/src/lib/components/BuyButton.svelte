<script lang="ts">
    import type { Snippet } from 'svelte';
    import { goto } from '$app/navigation';

    let { children }: { children: Snippet } = $props();
    let busy = $state(false);

    async function buy() {
        busy = true;
        try {
            const res = await fetch('/api/checkout', { method: 'POST' });
            if (!res.ok) throw new Error(`Checkout failed (${res.status})`);
            const { url } = await res.json();
            window.location.assign(url);
        } catch {
            busy = false;
            await goto('/checkout/failure');
        }
    }
</script>

<button onclick={buy} disabled={busy}>{@render children()}</button>

<style>
    button {
        padding: 16px 24px;
        border: 2px solid var(--ink);
        background: var(--ink);
        color: var(--paper);
        text-transform: uppercase;
        transition: 0.2s;
    }

    button:hover:not(:disabled) {
        background: var(--paper);
        color: var(--ink);
    }
</style>
