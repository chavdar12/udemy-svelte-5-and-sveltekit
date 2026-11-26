import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_MODEL } from '$app/env/private';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DATA_URL = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

export type ScannedBook = { title: string; author: string | null };

// a data URL from the browser is untrusted: only small png/jpeg/webp images get through
export function checkImage(input: unknown): string | null {
    if (typeof input !== 'string') return null;
    const match = DATA_URL.exec(input);
    if (!match || (match[2].length * 3) / 4 > MAX_IMAGE_BYTES) return null;
    return input;
}

let client: OpenAI | undefined;
const openai = () => (client ??= new OpenAI({ apiKey: OPENAI_API_KEY }));

export async function scanShelf(image: string): Promise<ScannedBook[]> {
    const response = await openai().responses.create({
        model: OPENAI_MODEL,
        input: [
            {
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: 'List every book whose spine or cover you can read in this photo. Skip any you are unsure about.',
                    },
                    { type: 'input_image', image_url: image, detail: 'high' },
                ],
            },
        ],
        text: {
            format: {
                type: 'json_schema',
                name: 'books',
                strict: true,
                schema: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['books'],
                    properties: {
                        books: {
                            type: 'array',
                            items: {
                                type: 'object',
                                additionalProperties: false,
                                required: ['title', 'author'],
                                properties: {
                                    title: { type: 'string' },
                                    author: { type: ['string', 'null'] },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    // model output is data too: keep only well-formed, reasonably sized entries
    const parsed = JSON.parse(response.output_text) as { books?: unknown };
    if (!Array.isArray(parsed.books)) return [];
    return parsed.books
        .filter(
            (b): b is ScannedBook =>
                typeof b?.title === 'string' &&
                b.title.trim().length > 0 &&
                b.title.length <= 200 &&
                (b.author === null || (typeof b.author === 'string' && b.author.length <= 200)),
        )
        .slice(0, 50)
        .map((b) => ({ title: b.title.trim(), author: b.author?.trim() || null }));
}
