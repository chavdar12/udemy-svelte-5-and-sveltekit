<script lang="ts">
    import type { Experience } from '#lib/types.ts';

    let { jobs }: { jobs: Experience[] } = $props();
</script>

<section>
    <h2>Experience</h2>
    <ul>
        {#each jobs as job (job._id)}
            <li>
                <h3>{job.jobTitle}</h3>
                <p>{job.company}</p>
                <p class="dates">
                    {job.startDate.slice(0, 7)} – {job.endDate?.slice(0, 7) ?? 'present'}
                </p>
            </li>
        {/each}
    </ul>
</section>

<style>
    ul {
        list-style: none;
        padding: 0;
    }

    li {
        padding: 16px 0;
        border-bottom: 1px solid #ddd;
    }

    .dates {
        color: var(--muted);
    }
</style>
