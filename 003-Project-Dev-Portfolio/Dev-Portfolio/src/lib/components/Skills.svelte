<script lang="ts">
    import type { Skill } from '#lib/types.ts';

    let { skills }: { skills: Skill[] } = $props();
</script>

{#if skills.length}
    <section>
        <h2>Skills</h2>
        <ul>
            {#each skills as skill (skill._key)}
                <li>
                    {#if skill.iconUrl}<img src={skill.iconUrl} alt="" />{/if}
                    {skill.name}
                </li>
            {/each}
        </ul>
    </section>
{/if}

<style>
    ul {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        list-style: none;
        padding: 0;
    }

    li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 999px;
    }

    img {
        width: 20px;
        height: 20px;
    }
</style>
