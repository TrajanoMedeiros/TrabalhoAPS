-- Script de inicialização do banco PostgreSQL
-- Executado automaticamente na primeira vez que o container sobe

-- Garantir encoding UTF8
SET client_encoding = 'UTF8';

-- Extensões úteis para desenvolvimento Laravel
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
