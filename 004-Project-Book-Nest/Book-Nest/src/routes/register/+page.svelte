<script lang="ts">
    import AuthForm from '#lib/components/AuthForm.svelte';
    import type { PageProps } from './$types';

    let { form }: PageProps = $props();
</script>

<main>
    <h1>Create an account</h1>
    <AuthForm {form} register />
    <p>Already registered? <a href="/login">Log in</a></p>
</main>
