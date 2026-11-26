<script lang="ts">
    import BookForm from '#lib/components/BookForm.svelte';
    import type { PageProps } from './$types';

    let { data, form }: PageProps = $props();
    const status = (book: (typeof data.books)[number]) =>
        book.finished_reading_on ? 'Finished' : book.started_reading_on ? 'Reading' : 'To read';
</script>

<main>
    <h1>My books</h1>
    {#if data.books.length}
        <ul>
            {#each data.books as book (book.id)}
                <li>
                    <a href="/private/books/{book.id}">{book.title}</a>
                    {#if book.author}<span class="muted">by {book.author}</span>{/if}
                    <span class="muted">· {status(book)}</span>
                    {#if book.rating}<span aria-label="{book.rating} of 5 stars"
                            >{'★'.repeat(book.rating)}</span
                        >{/if}
                </li>
            {/each}
        </ul>
    {:else}
        <p>No books yet. Add one below or <a href="/private/scan-shelf">scan your shelf</a>.</p>
    {/if}

    <h2>Add a book</h2>
    {#if form && 'added' in form}<p role="status">Added “{form.added}”.</p>{/if}
    <BookForm
        action="?/add"
        submit="Add book"
        values={form && 'values' in form ? form.values : {}}
        errors={form && 'errors' in form ? form.errors : {}}
    />
</main>

<style>
    ul {
        list-style: none;
        padding: 0;
        margin-bottom: 32px;
    }

    li {
        padding: 10px 0;
        border-bottom: 1px solid #e3dccf;
    }

    .muted {
        color: var(--muted);
    }

    h2 {
        margin-bottom: 12px;
    }
</style>
