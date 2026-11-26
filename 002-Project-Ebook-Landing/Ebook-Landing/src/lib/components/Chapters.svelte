<script lang="ts">
    import { chapters } from '#lib/content.ts';

    let selected = $state(0);
</script>

<section>
    <h2>What's inside</h2>
    <div class="chapters">
        <div role="tablist" aria-label="Chapters">
            {#each chapters as chapter, i (chapter.title)}
                <button
                    role="tab"
                    id="tab-{i}"
                    aria-selected={selected === i}
                    aria-controls="chapter-panel"
                    onclick={() => (selected = i)}
                >
                    Chapter {i + 1}: {chapter.title}
                </button>
            {/each}
        </div>
        <div role="tabpanel" id="chapter-panel" aria-labelledby="tab-{selected}">
            <h3>{chapters[selected].title}</h3>
            <p>{chapters[selected].summary}</p>
        </div>
    </div>
</section>

<style>
    .chapters {
        display: grid;
        grid-template-columns: 2fr 3fr;
        gap: 32px;
    }

    [role='tab'] {
        display: block;
        width: 100%;
        padding: 12px;
        border: 0;
        border-bottom: 1px solid #ccc;
        background: none;
        text-align: left;
    }

    [aria-selected='true'] {
        background: var(--ink);
        color: var(--paper);
    }
</style>
