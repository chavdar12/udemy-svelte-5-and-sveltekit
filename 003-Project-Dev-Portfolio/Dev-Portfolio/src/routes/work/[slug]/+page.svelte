<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    let project = $derived(data.project);
</script>

<svelte:head><title>{project.name}</title></svelte:head>

<main>
    <p class="company">{project.company}</p>
    <h1>{project.name}</h1>
    <img src={project.imageUrl} alt="" />
    <div class="layout">
        <aside>
            <h2>Date</h2>
            <p>{project.dateAccomplished.slice(0, 7)}</p>
            <h2>Stack</h2>
            <ul>
                {#each project.stack as tech (tech)}<li>{tech}</li>{/each}
            </ul>
        </aside>
        <article>
            {#each project.content as block (block.key)}
                {#if block.type === 'text'}
                    <svelte:element this={block.tag}>{block.text}</svelte:element>
                {:else}
                    <img src={block.url} alt="" />
                {/if}
            {/each}
        </article>
    </div>
</main>

<style>
    .company {
        color: var(--muted);
    }

    .layout {
        display: grid;
        grid-template-columns: 1fr 3fr;
        gap: 32px;
        margin-top: 32px;
    }

    article > :global(*) {
        margin-bottom: 16px;
    }

    @media (max-width: 720px) {
        .layout {
            grid-template-columns: 1fr;
        }
    }
</style>
