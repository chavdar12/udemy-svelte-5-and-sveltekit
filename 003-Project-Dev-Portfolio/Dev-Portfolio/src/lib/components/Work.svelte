<script lang="ts">
    import type { Project } from '#lib/types.ts';

    let { projects }: { projects: Project[] } = $props();
</script>

<section id="work">
    <h2>My work</h2>
    <div class="grid">
        {#each projects as project (project.id)}
            <a class="card" href="/work/{project.slug}">
                <img src={project.imageUrl} alt="" />
                <h3>{project.name}</h3>
                <p>{project.company}</p>
            </a>
        {:else}
            <p>No projects yet.</p>
        {/each}
    </div>
</section>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
    }

    .card {
        color: inherit;
        text-decoration: none;
    }

    .card p {
        color: var(--muted);
    }
</style>
