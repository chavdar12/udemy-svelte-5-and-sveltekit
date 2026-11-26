<script lang="ts">
    let books = $state<{ title: string; author: string | null }[] | null>(null);
    let error = $state('');
    let busy = $state(false);

    const readAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });

    async function scan(event: Event) {
        const file = (event.currentTarget as HTMLInputElement).files?.[0];
        if (!file) return;
        books = null;
        error = '';
        if (file.size > 5 * 1024 * 1024) {
            error = 'The photo must be 5 MB or smaller.';
            return;
        }
        busy = true;
        try {
            const res = await fetch('/api/scan-shelf', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ image: await readAsDataUrl(file) }),
            });
            if (!res.ok)
                throw new Error((await res.json().catch(() => null))?.message ?? 'Scan failed');
            books = (await res.json()).books;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Scan failed';
        } finally {
            busy = false;
        }
    }
</script>

<main>
    <h1>Scan your shelf</h1>
    <p>Take a photo of your bookshelf and every readable book is added to your list.</p>
    <label>
        Shelf photo (PNG, JPEG or WebP, up to 5 MB)
        <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onchange={scan}
            disabled={busy}
        />
    </label>
    {#if busy}<p role="status">Reading the spines…</p>{/if}
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if books}
        {#if books.length}
            <p role="status">Added {books.length} books:</p>
            <ul>
                {#each books as book, i (i)}<li>
                        {book.title}{book.author ? ` – ${book.author}` : ''}
                    </li>{/each}
            </ul>
            <a href="/private/dashboard">See all my books</a>
        {:else}
            <p role="status">No books could be read from this photo.</p>
        {/if}
    {/if}
</main>
