import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$app/env/private';

let client: Stripe | undefined;

// created on first use, so tests can import routes before mocking
export const stripe = () => (client ??= new Stripe(STRIPE_SECRET_KEY));
