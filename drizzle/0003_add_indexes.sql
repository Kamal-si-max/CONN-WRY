CREATE INDEX IF NOT EXISTS post_likes_post_id_user_id_idx ON public.post_likes (postId, userId);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS post_likes_post_id_reaction_idx ON public.post_likes (postId, reaction);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes (userId);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS poll_votes_poll_id_user_id_idx ON public.poll_votes (pollId, userId);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS poll_votes_poll_id_option_id_idx ON public.poll_votes (pollId, optionId);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS poll_votes_option_id_idx ON public.poll_votes (optionId);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS poll_options_poll_id_idx ON public.poll_options (pollId);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS polls_post_id_idx ON public.polls (postId);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts (createdAt DESC);
--> statement-breakpoint
