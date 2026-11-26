create table public.books (
    id bigint generated always as identity primary key,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    title text not null check (char_length(title) between 1 and 200),
    author text check (char_length(author) <= 200),
    genre text check (char_length(genre) <= 50),
    rating smallint check (rating between 1 and 5),
    started_reading_on date,
    finished_reading_on date,
    created_at timestamptz not null default now(),
    check (finished_reading_on is null or started_reading_on is null or finished_reading_on >= started_reading_on)
);

create index books_user_id_idx on public.books (user_id);

-- every user only ever sees and changes their own books
alter table public.books enable row level security;

create policy "read own books" on public.books for select to authenticated using ((select auth.uid()) = user_id);
create policy "add own books" on public.books for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own books" on public.books for update to authenticated
    using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own books" on public.books for delete to authenticated using ((select auth.uid()) = user_id);
