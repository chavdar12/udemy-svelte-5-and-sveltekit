<script lang="ts">
    import ContactForm from '#lib/components/ContactForm.svelte';
    import Experience from '#lib/components/Experience.svelte';
    import Skills from '#lib/components/Skills.svelte';
    import Work from '#lib/components/Work.svelte';
    import type { PageProps } from './$types';

    let { data, form }: PageProps = $props();
</script>

<section class="hero">
    <h1>I build web apps that people enjoy using.</h1>
    <p>Full-stack developer. Below is some of my recent work.</p>
</section>
<Work projects={data.projects} />
<Experience jobs={data.experience} />
<Skills skills={data.skills} />
<ContactForm {form} />

<style>
    .hero h1 {
        font-size: clamp(2rem, 6vw, 4rem);
        margin-bottom: 16px;
    }
</style>
