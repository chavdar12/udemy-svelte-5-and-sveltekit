<script lang="ts">
    import AuthForm from '#lib/components/AuthForm.svelte';
    import type { PageProps } from './$types';

    let { form }: PageProps = $props();
</script>

<main>
    <h1>Log in</h1>
    <AuthForm {form} />
    <p>New here? <a href="/register">Create an account</a></p>
</main>
