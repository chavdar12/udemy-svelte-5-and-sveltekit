<script lang="ts">
    type Values = Record<string, string | number | null | undefined>;

    let {
        action,
        values = {},
        errors = {},
        submit,
    }: {
        action: string;
        values?: Values;
        errors?: Record<string, string>;
        submit: string;
    } = $props();

    const genres = [
        'fiction',
        'non-fiction',
        'fantasy',
        'sci-fi',
        'mystery',
        'biography',
        'history',
        'other',
    ];
    const value = (key: string) => values[key] ?? '';
</script>

<form method="POST" {action}>
    <label>Title <input name="title" value={value('title')} required maxlength="200" /></label>
    {#if errors.title}<p class="error">{errors.title}</p>{/if}
    <label>Author <input name="author" value={value('author')} maxlength="200" /></label>
    <label>
        Genre
        <select name="genre" value={value('genre')}>
            <option value="">—</option>
            {#each genres as genre (genre)}<option value={genre}>{genre}</option>{/each}
        </select>
    </label>
    {#if errors.genre}<p class="error">{errors.genre}</p>{/if}
    <label>
        Rating
        <select name="rating" value={String(value('rating'))}>
            <option value="">Not rated</option>
            {#each [1, 2, 3, 4, 5] as stars (stars)}<option value={String(stars)}
                    >{'★'.repeat(stars)}</option
                >{/each}
        </select>
    </label>
    {#if errors.rating}<p class="error">{errors.rating}</p>{/if}
    <label
        >Started reading <input
            name="started_reading_on"
            type="date"
            value={value('started_reading_on')}
        /></label
    >
    {#if errors.started_reading_on}<p class="error">{errors.started_reading_on}</p>{/if}
    <label
        >Finished reading <input
            name="finished_reading_on"
            type="date"
            value={value('finished_reading_on')}
        /></label
    >
    {#if errors.finished_reading_on}<p class="error">{errors.finished_reading_on}</p>{/if}
    {#if errors.form}<p class="error" role="alert">{errors.form}</p>{/if}
    <button>{submit}</button>
</form>
