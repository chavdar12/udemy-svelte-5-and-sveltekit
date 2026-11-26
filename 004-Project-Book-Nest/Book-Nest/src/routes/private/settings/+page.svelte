<script lang="ts">
    import type { PageProps } from './$types';

    let { data, form }: PageProps = $props();
    const errors: Record<string, string | undefined> = $derived(
        form && 'errors' in form ? (form.errors ?? {}) : {},
    );
</script>

<main>
    <h1>Settings</h1>
    <h2>Profile</h2>
    {#if form && 'saved' in form}<p role="status">Saved.</p>{/if}
    <form method="POST" action="?/updateName">
        <label
            >Name <input
                name="name"
                value={data.user?.name ?? ''}
                required
                maxlength="100"
            /></label
        >
        {#if errors.name}<p class="error">{errors.name}</p>{/if}
        <button>Save</button>
    </form>

    <h2>Delete account</h2>
    <p>This deletes your account and every book in it. It cannot be undone.</p>
    <form method="POST" action="?/deleteAccount">
        <label>Type DELETE to confirm <input name="confirm" autocomplete="off" /></label>
        {#if errors.confirm}<p class="error">{errors.confirm}</p>{/if}
        <button class="danger">Delete my account</button>
    </form>
    {#if errors.form}<p class="error" role="alert">{errors.form}</p>{/if}
</main>

<style>
    h2 {
        margin: 32px 0 12px;
    }

    .danger {
        background: var(--accent);
    }
</style>
