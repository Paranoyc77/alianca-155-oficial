ALTER TABLE `divulgacoes` ADD `prioridade` enum('normal','vip','premium') DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `divulgacoes` DROP COLUMN `updatedAt`;