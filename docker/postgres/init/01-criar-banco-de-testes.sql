-- Roda UMA vez, só quando o volume do Postgres é criado do zero.
-- O banco de desenvolvimento (veteran_carclub) já é criado pela própria imagem
-- (POSTGRES_DB). Este script cria o banco isolado usado pelos testes —
-- os testes dão TRUNCATE nas tabelas, então nunca podem tocar no de dev.
CREATE DATABASE veteran_carclub_test OWNER veteran_carclub;
