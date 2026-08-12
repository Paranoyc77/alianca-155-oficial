CREATE TABLE `recrutamento_inscricoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`contato` varchar(255) NOT NULL,
	`experiencia` text NOT NULL,
	`motivacao` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recrutamento_inscricoes_id` PRIMARY KEY(`id`)
);
