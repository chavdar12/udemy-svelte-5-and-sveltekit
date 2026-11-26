<script lang="ts">
    import BuyButton from '#lib/components/BuyButton.svelte';
    import Hero from '#lib/components/Hero.svelte';
</script>

<Hero>
    <h1>The payment did not go through</h1>
    <p>Nothing was charged. Check your payment details and try again.</p>
    <BuyButton>Try again</BuyButton>
</Hero>
