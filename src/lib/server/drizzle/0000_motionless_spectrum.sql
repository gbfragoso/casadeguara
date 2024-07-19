CREATE TABLE IF NOT EXISTS "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" text PRIMARY KEY NOT NULL,
	"password_hash" varchar(2000) NOT NULL,
	"roles" varchar(20) NOT NULL,
	"username" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acervo" (
	"idexemplar" smallint,
	"numero" smallint,
	"tombo" integer,
	"titulo" varchar(80),
	"status" varchar(15)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "acesso" (
	"idacesso" "smallserial" PRIMARY KEY NOT NULL,
	"conteudo" varchar(40)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "autor" (
	"idautor" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"data_cadastro" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "autor_has_livro" (
	"autor" integer NOT NULL,
	"livro" integer NOT NULL,
	CONSTRAINT "pk_autor_livro" PRIMARY KEY("autor","livro")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aviso" (
	"idaviso" "smallserial" PRIMARY KEY NOT NULL,
	"data_cadastro" date DEFAULT CURRENT_DATE,
	"texto" varchar(300) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "configuracao" (
	"idconf" "smallserial" PRIMARY KEY NOT NULL,
	"chave" char(128) NOT NULL,
	"duracao_emprestimo" smallint,
	"duracao_renovacao" smallint,
	"limite_emprestimo" smallint,
	"limite_renovacao" smallint,
	"intervalo_emprestimo" smallint,
	"cobranca" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contribuinte" (
	"idcontribuinte" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(200) NOT NULL,
	"trabalhador" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "editora" (
	"ideditora" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"data_cadastro" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emprestimo" (
	"idemp" serial PRIMARY KEY NOT NULL,
	"leitor" smallint NOT NULL,
	"exemplar" smallint NOT NULL,
	"data_emprestimo" date,
	"data_devolucao" date,
	"cobranca" timestamp,
	"renovacoes" smallint DEFAULT 0,
	"user_emprestimo" smallint,
	"user_devolucao" smallint,
	"data_devolvido" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entradas" (
	"identrada" serial PRIMARY KEY NOT NULL,
	"descricao" varchar(200) NOT NULL,
	"valor" numeric NOT NULL,
	"data_entrada" date DEFAULT now() NOT NULL,
	"idcontribuinte" integer NOT NULL,
	"user_cadastro" smallint,
	"user_alteracao" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exemplar" (
	"idexemplar" "smallserial" PRIMARY KEY NOT NULL,
	"livro" smallint NOT NULL,
	"numero" smallint NOT NULL,
	"status" varchar(15),
	"data_cadastro" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keyword" (
	"idkeyword" "smallserial" PRIMARY KEY NOT NULL,
	"chave" varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leitor" (
	"idleitor" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"email" varchar(60),
	"telefone" varchar(12),
	"celular" varchar(12),
	"logradouro" varchar(80),
	"bairro" varchar(30),
	"complemento" varchar,
	"cep" varchar(11),
	"sexo" varchar(10),
	"data_cadastro" date,
	"trab" boolean DEFAULT false,
	"cidade" varchar,
	"paciente" boolean,
	"incompleto" boolean,
	"status" boolean DEFAULT true,
	"aniversario" char(5),
	"rg" varchar(12),
	"cpf" varchar(15),
	CONSTRAINT "unique_leitor" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "livro" (
	"idlivro" "smallserial" PRIMARY KEY NOT NULL,
	"tombo" varchar(8) NOT NULL,
	"titulo" varchar(80) NOT NULL,
	"editora" integer,
	"data_cadastro" date,
	"serie" smallint,
	"ordem" smallint,
	CONSTRAINT "tombo_unico" UNIQUE("tombo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "livro_has_keyword" (
	"livro" integer NOT NULL,
	"keyword" integer NOT NULL,
	CONSTRAINT "pk_livro_keyword" PRIMARY KEY("livro","keyword")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reserva" (
	"leitor" integer NOT NULL,
	"livro" integer NOT NULL,
	"data_expira" timestamp,
	CONSTRAINT "pk_leitor_exemplar" PRIMARY KEY("leitor","livro")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saidas" (
	"idsaida" serial PRIMARY KEY NOT NULL,
	"descricao" varchar(200) NOT NULL,
	"valor" numeric NOT NULL,
	"data_saida" date DEFAULT now() NOT NULL,
	"user_cadastro" smallint,
	"user_alteracao" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "serie" (
	"idserie" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"data_cadastro" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usuario" (
	"idusuario" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(50),
	"login" varchar(20) NOT NULL,
	"senha" char(128) NOT NULL,
	"tipo" varchar(15),
	"data_cadastro" date,
	"status" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usuario_has_acesso" (
	"usuario" integer NOT NULL,
	"acesso" integer NOT NULL,
	CONSTRAINT "pk_usuario_acesso" PRIMARY KEY("usuario","acesso")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vw_cobrancas" (
	"leitor" varchar(60),
	"email" varchar(60),
	"livros" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "autor_has_livro" ADD CONSTRAINT "autor_has_livro_autor_autor_idautor_fk" FOREIGN KEY ("autor") REFERENCES "public"."autor"("idautor") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "autor_has_livro" ADD CONSTRAINT "autor_has_livro_livro_livro_idlivro_fk" FOREIGN KEY ("livro") REFERENCES "public"."livro"("idlivro") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emprestimo" ADD CONSTRAINT "emprestimo_leitor_leitor_idleitor_fk" FOREIGN KEY ("leitor") REFERENCES "public"."leitor"("idleitor") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emprestimo" ADD CONSTRAINT "emprestimo_exemplar_exemplar_idexemplar_fk" FOREIGN KEY ("exemplar") REFERENCES "public"."exemplar"("idexemplar") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entradas" ADD CONSTRAINT "entradas_idcontribuinte_contribuinte_idcontribuinte_fk" FOREIGN KEY ("idcontribuinte") REFERENCES "public"."contribuinte"("idcontribuinte") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exemplar" ADD CONSTRAINT "exemplar_livro_livro_idlivro_fk" FOREIGN KEY ("livro") REFERENCES "public"."livro"("idlivro") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "livro" ADD CONSTRAINT "livro_editora_editora_ideditora_fk" FOREIGN KEY ("editora") REFERENCES "public"."editora"("ideditora") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "livro" ADD CONSTRAINT "livro_serie_serie_idserie_fk" FOREIGN KEY ("serie") REFERENCES "public"."serie"("idserie") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "livro_has_keyword" ADD CONSTRAINT "livro_has_keyword_livro_livro_idlivro_fk" FOREIGN KEY ("livro") REFERENCES "public"."livro"("idlivro") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "livro_has_keyword" ADD CONSTRAINT "livro_has_keyword_keyword_keyword_idkeyword_fk" FOREIGN KEY ("keyword") REFERENCES "public"."keyword"("idkeyword") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reserva" ADD CONSTRAINT "reserva_leitor_leitor_idleitor_fk" FOREIGN KEY ("leitor") REFERENCES "public"."leitor"("idleitor") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usuario_has_acesso" ADD CONSTRAINT "usuario_has_acesso_usuario_usuario_idusuario_fk" FOREIGN KEY ("usuario") REFERENCES "public"."usuario"("idusuario") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usuario_has_acesso" ADD CONSTRAINT "usuario_has_acesso_acesso_acesso_idacesso_fk" FOREIGN KEY ("acesso") REFERENCES "public"."acesso"("idacesso") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User" USING btree ("username");