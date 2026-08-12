CREATE TABLE `site_visitas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_visitas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usuarios_online` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usuarios_online_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuarios_online_sessionId_unique` UNIQUE(`sessionId`)
);
