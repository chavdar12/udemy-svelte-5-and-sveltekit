<script lang="ts">
    type Form =
        { values?: Record<string, string>; errors?: Record<string, string> } | null | undefined;

    let { form, register = false }: { form: Form; register?: boolean } = $props();
    const error = (key: string) => form?.errors?.[key];
</script>

<form method="POST">
    {#if register}
        <label
            >Name <input
                name="name"
                value={form?.values?.name ?? ''}
                autocomplete="name"
                required
            /></label
        >
        {#if error('name')}<p class="error">{error('name')}</p>{/if}
    {/if}
    <label>
        Email <input
            name="email"
            type="email"
            value={form?.values?.email ?? ''}
            autocomplete="email"
            required
        />
    </label>
    {#if error('email')}<p class="error">{error('email')}</p>{/if}
    <label>
        Password
        <input
            name="password"
            type="password"
            autocomplete={register ? 'new-password' : 'current-password'}
            required
        />
    </label>
    {#if error('password')}<p class="error">{error('password')}</p>{/if}
    {#if register}
        <label>
            Confirm password <input
                name="passwordConfirm"
                type="password"
                autocomplete="new-password"
                required
            />
        </label>
        {#if error('passwordConfirm')}<p class="error">{error('passwordConfirm')}</p>{/if}
    {/if}
    {#if error('form')}<p class="error" role="alert">{error('form')}</p>{/if}
    <button>{register ? 'Create account' : 'Log in'}</button>
</form>
