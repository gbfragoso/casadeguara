-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "aviso" (
	"idaviso" "smallserial" PRIMARY KEY NOT NULL,
	"data_cadastro" date DEFAULT now(),
	"texto" varchar(300) NOT NULL,
	"username" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "frequencia" (
	"frequenciaid" serial PRIMARY KEY NOT NULL,
	"trabalhador" integer NOT NULL,
	"data_presenca" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entradas" (
	"identrada" serial PRIMARY KEY NOT NULL,
	"descricao" varchar(200) NOT NULL,
	"valor" numeric NOT NULL,
	"data_entrada" date NOT NULL,
	"idcontribuinte" integer NOT NULL,
	"user_cadastro" varchar(30),
	"user_alteracao" varchar(30),
	"motivo_estorno" varchar(200),
	"user_estorno" varchar(30),
	"data_estorno" date,
	"uuid" varchar(36) NOT NULL,
	"data_registro" date DEFAULT now() NOT NULL,
	"depositado" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "autor" (
	"idautor" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"data_cadastro" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "livro" (
	"idlivro" "smallserial" PRIMARY KEY NOT NULL,
	"tombo" varchar(8) NOT NULL,
	"titulo" varchar(80) NOT NULL,
	"editora" integer,
	"data_cadastro" date DEFAULT now(),
	"serie" smallint,
	"ordem" smallint,
	CONSTRAINT "tombo_unico" UNIQUE("tombo")
);
--> statement-breakpoint
CREATE TABLE "exemplar" (
	"idexemplar" "smallserial" PRIMARY KEY NOT NULL,
	"livro" smallint NOT NULL,
	"numero" smallint NOT NULL,
	"status" varchar(15),
	"data_cadastro" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emprestimo" (
	"idemp" serial PRIMARY KEY NOT NULL,
	"leitor" smallint NOT NULL,
	"exemplar" smallint NOT NULL,
	"data_emprestimo" date,
	"data_devolucao" date,
	"cobranca" timestamp,
	"renovacoes" smallint DEFAULT 0,
	"data_devolvido" date,
	"user_emprestimo" varchar(30),
	"user_devolucao" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "leitor" (
	"idleitor" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"email" varchar(60),
	"telefone" varchar(12),
	"celular" varchar(12),
	"logradouro" varchar(80),
	"bairro" varchar(30),
	"complemento" varchar,
	"cep" varchar(11),
	"data_cadastro" date DEFAULT now(),
	"trab" boolean DEFAULT false,
	"desencarnado" boolean DEFAULT false,
	"frequencia" boolean DEFAULT false,
	"cidade" varchar,
	"incompleto" boolean,
	"status" boolean DEFAULT true,
	"aniversario" date,
	"rg" varchar(12),
	"cpf" varchar(15),
	CONSTRAINT "unique_leitor" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "editora" (
	"ideditora" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"data_cadastro" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "keyword" (
	"idkeyword" "smallserial" PRIMARY KEY NOT NULL,
	"chave" varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saidas" (
	"idsaida" serial PRIMARY KEY NOT NULL,
	"descricao" varchar(200) NOT NULL,
	"valor" numeric NOT NULL,
	"data_saida" date DEFAULT now() NOT NULL,
	"user_cadastro" varchar(30),
	"user_alteracao" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "serie" (
	"idserie" "smallserial" PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"data_cadastro" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"password_hash" varchar(2000) NOT NULL,
	"roles" varchar(50) NOT NULL,
	"username" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pessoas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"email" varchar(60),
	"telefone" varchar(12),
	"celular" varchar(12),
	"logradouro" varchar(80),
	"bairro" varchar(30),
	"complemento" varchar,
	"cep" varchar(11),
	"data_cadastro" date DEFAULT now(),
	"trab" boolean DEFAULT false,
	"cidade" varchar,
	"incompleto" boolean DEFAULT false,
	"status" boolean DEFAULT true,
	"aniversario" date,
	"rg" varchar(12),
	"cpf" varchar(15),
	"desencarnado" boolean DEFAULT false,
	"frequencia" boolean DEFAULT false,
	"user_created" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	"user_updated" varchar(30),
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	CONSTRAINT "unique_pessoa" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "autor_has_livro" (
	"autor" integer NOT NULL,
	"livro" integer NOT NULL,
	CONSTRAINT "pk_autor_livro" PRIMARY KEY("autor","livro")
);
--> statement-breakpoint
CREATE TABLE "livro_has_keyword" (
	"livro" integer NOT NULL,
	"keyword" integer NOT NULL,
	"referencia" varchar(100),
	CONSTRAINT "pk_livro_keyword" PRIMARY KEY("livro","keyword")
);
--> statement-breakpoint
ALTER TABLE "frequencia" ADD CONSTRAINT "frequencia_leitor_fk" FOREIGN KEY ("trabalhador") REFERENCES "public"."leitor"("idleitor") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "entradas" ADD CONSTRAINT "entradas_idcontribuinte_leitor_idleitor_fk" FOREIGN KEY ("idcontribuinte") REFERENCES "public"."leitor"("idleitor") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livro" ADD CONSTRAINT "fk_editora" FOREIGN KEY ("editora") REFERENCES "public"."editora"("ideditora") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livro" ADD CONSTRAINT "fk_serie" FOREIGN KEY ("serie") REFERENCES "public"."serie"("idserie") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exemplar" ADD CONSTRAINT "fk_livro" FOREIGN KEY ("livro") REFERENCES "public"."livro"("idlivro") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emprestimo" ADD CONSTRAINT "fk_exemplar" FOREIGN KEY ("exemplar") REFERENCES "public"."exemplar"("idexemplar") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emprestimo" ADD CONSTRAINT "fk_leitor" FOREIGN KEY ("leitor") REFERENCES "public"."leitor"("idleitor") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "autor_has_livro" ADD CONSTRAINT "fk_autor" FOREIGN KEY ("autor") REFERENCES "public"."autor"("idautor") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autor_has_livro" ADD CONSTRAINT "fk_livro" FOREIGN KEY ("livro") REFERENCES "public"."livro"("idlivro") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livro_has_keyword" ADD CONSTRAINT "fk_keyword" FOREIGN KEY ("keyword") REFERENCES "public"."keyword"("idkeyword") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livro_has_keyword" ADD CONSTRAINT "fk_livro" FOREIGN KEY ("livro") REFERENCES "public"."livro"("idlivro") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "User_username_key" ON "User" USING btree ("username" text_ops);
*/