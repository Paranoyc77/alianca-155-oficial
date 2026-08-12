CREATE TABLE `equipe_contatos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(100) NOT NULL,
	`foto` text,
	`numeroContato` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `equipe_contatos_id` PRIMARY KEY(`id`)
);
