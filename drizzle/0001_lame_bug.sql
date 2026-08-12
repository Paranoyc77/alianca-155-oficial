CREATE TABLE `app_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_config_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `divulgacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('grupo','canal','site') NOT NULL,
	`link` text NOT NULL,
	`image` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `divulgacoes_id` PRIMARY KEY(`id`)
);
