<script lang="ts">
    import BookForm from '#lib/components/BookForm.svelte';
    import type { PageProps } from './$types';

    let { data, form }: PageProps = $props();
</script>

<main>
    <a href="/private/dashboard">← My books</a>
    <h1>{data.book.title}</h1>
    {#if form && 'saved' in form}<p role="status">Saved.</p>{/if}
    <BookForm
        action="?/update"
        submit="Save"
        values={form && 'values' in form ? form.values : data.book}
        errors={form && 'errors' in form ? form.errors : {}}
    />
    <form method="POST" action="?/delete" class="delete">
        <button>Delete this book</button>
    </form>
</main>

<style>
    .delete {
        margin-top: 32px;
    }

    .delete button {
        background: var(--accent);
    }
</style>
