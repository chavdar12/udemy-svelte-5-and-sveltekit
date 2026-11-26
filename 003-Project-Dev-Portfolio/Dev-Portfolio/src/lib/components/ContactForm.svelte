<script lang="ts">
    import { enhance } from '$app/forms';

    type Errors = { name?: string; email?: string; message?: string; form?: string };
    type FormState = {
        sent?: boolean;
        name?: string;
        email?: string;
        message?: string;
        errors?: Errors;
    } | null;

    let { form }: { form: FormState } = $props();
    let sending = $state(false);
</script>

<section id="contact">
    <h2>Let's talk</h2>
    {#if form?.sent}
        <p role="status">Thanks for the message. I usually reply within two days.</p>
    {:else}
        <form
            method="POST"
            action="?/contact"
            use:enhance={() => {
                sending = true;
                return async ({ update }) => {
                    await update();
                    sending = false;
                };
            }}
        >
            <label>
                Name
                <input
                    name="name"
                    value={form?.name ?? ''}
                    aria-invalid={!!form?.errors?.name}
                    required
                />
            </label>
            {#if form?.errors?.name}<p class="error">{form.errors.name}</p>{/if}
            <label>
                Email
                <input
                    name="email"
                    type="email"
                    value={form?.email ?? ''}
                    aria-invalid={!!form?.errors?.email}
                    required
                />
            </label>
            {#if form?.errors?.email}<p class="error">{form.errors.email}</p>{/if}
            <label>
                Message
                <textarea name="message" rows="6" aria-invalid={!!form?.errors?.message} required
                    >{form?.message ?? ''}</textarea
                >
            </label>
            {#if form?.errors?.message}<p class="error">{form.errors.message}</p>{/if}
            {#if form?.errors?.form}<p class="error" role="alert">{form.errors.form}</p>{/if}
            <button disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
        </form>
    {/if}
</section>

<style>
    form {
        display: grid;
        gap: 12px;
        max-width: 560px;
    }

    label {
        display: grid;
        gap: 4px;
    }

    input,
    textarea,
    button {
        font: inherit;
        padding: 10px;
    }

    [aria-invalid='true'] {
        border-color: var(--accent);
    }

    .error {
        color: var(--accent);
    }

    button {
        justify-self: start;
        border: 0;
        background: var(--ink);
        color: var(--paper);
        cursor: pointer;
    }
</style>
