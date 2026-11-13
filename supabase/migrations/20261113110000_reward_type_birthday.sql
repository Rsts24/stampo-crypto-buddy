-- Birthday treats are a new kind of reward. (Enum values must be added in their own migration.)
alter type public.reward_type add value if not exists 'birthday';
