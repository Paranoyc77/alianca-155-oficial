CREATE TABLE `bot_alugueis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planoId` int NOT NULL,
	`planoNome` varchar(100) NOT NULL,
	`compradorNome` varchar(255) NOT NULL,
	`compradorContato` varchar(255) NOT NULL,
	`botTokenOuUser` varchar(255) NOT NULL,
	`statusPagamento` varchar(50) NOT NULL DEFAULT 'pendente',
	`statusBot` varchar(50) NOT NULL DEFAULT 'aguardando_ativacao',
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bot_alugueis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_planos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text NOT NULL,
	`preco` varchar(20) NOT NULL,
	`duracaoDias` int NOT NULL,
	`recursos` text NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bot_planos_id` PRIMARY KEY(`id`)
);
