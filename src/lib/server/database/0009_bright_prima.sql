CREATE TABLE "palestrante_fotos" (
	"palestrante_id" integer PRIMARY KEY NOT NULL,
	"original" "bytea" NOT NULL,
	"quadrada" "bytea" NOT NULL,
	"miniatura" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "palestrantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(60) NOT NULL,
	"nome_busca" varchar(60) NOT NULL,
	"cadastro_id" integer,
	"user_cadastro" varchar(30) NOT NULL,
	"data_cadastro" timestamp with time zone DEFAULT now() NOT NULL,
	"user_alteracao" varchar(30),
	"data_alteracao" timestamp with time zone,
	CONSTRAINT "palestrantes_nome_busca_key" UNIQUE("nome_busca"),
	CONSTRAINT "palestrantes_cadastro_id_key" UNIQUE("cadastro_id")
);
--> statement-breakpoint
CREATE TABLE "palestras" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" date NOT NULL,
	"horario" time NOT NULL,
	"titulo" varchar(120),
	"observacoes" varchar(500),
	"local" varchar(120),
	"palestrante_id" integer,
	"versao" integer DEFAULT 1 NOT NULL,
	"user_cadastro" varchar(30) NOT NULL,
	"data_cadastro" timestamp with time zone DEFAULT now() NOT NULL,
	"user_alteracao" varchar(30),
	"data_alteracao" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "roles" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "palestrante_fotos" ADD CONSTRAINT "palestrante_fotos_palestrante_id_palestrantes_id_fk" FOREIGN KEY ("palestrante_id") REFERENCES "public"."palestrantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "palestrantes" ADD CONSTRAINT "palestrantes_cadastro_id_cadastros_idleitor_fk" FOREIGN KEY ("cadastro_id") REFERENCES "public"."cadastros"("idleitor") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "palestras" ADD CONSTRAINT "palestras_palestrante_id_palestrantes_id_fk" FOREIGN KEY ("palestrante_id") REFERENCES "public"."palestrantes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "palestras_agenda_idx" ON "palestras" USING btree ("data","horario","id");--> statement-breakpoint
CREATE INDEX "palestras_palestrante_id_idx" ON "palestras" USING btree ("palestrante_id");