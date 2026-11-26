<script lang="ts">
    import { faqs } from '#lib/content.ts';

    let open = $state(-1);
</script>

<section>
    <h2>Frequently asked questions</h2>
    {#each faqs as faq, i (faq.question)}
        <div class="faq">
            <button
                aria-expanded={open === i}
                aria-controls="answer-{i}"
                onclick={() => (open = open === i ? -1 : i)}
            >
                {faq.question}
            </button>
            <p id="answer-{i}" hidden={open !== i}>{faq.answer}</p>
        </div>
    {/each}
</section>

<style>
    .faq {
        border-bottom: 1px solid #ccc;
        padding: 12px 0;
    }

    button {
        width: 100%;
        border: 0;
        background: none;
        font-weight: 600;
        text-align: left;
    }

    button::after {
        content: '+';
        float: right;
    }

    [aria-expanded='true']::after {
        content: '−';
    }

    p {
        padding-top: 8px;
    }
</style>
