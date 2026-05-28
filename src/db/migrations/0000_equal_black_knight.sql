CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'TODO' NOT NULL,
	`label` text NOT NULL,
	`priority` text DEFAULT 'low' NOT NULL,
	`assignee` text,
	`due_date` integer,
	`created_at` integer,
	`updated_at` integer
);
