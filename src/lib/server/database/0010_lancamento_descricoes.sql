CREATE TABLE "lancamento_descricoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"idlancamento" integer NOT NULL,
	"descricao_anterior" varchar(200) NOT NULL,
	"descricao_nova" varchar(200) NOT NULL,
	"user_alteracao" varchar(30) NOT NULL,
	"data_alteracao" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lancamento_descricoes" ADD CONSTRAINT "lancamento_descricoes_idlancamento_lancamentos_idlancamento_fk" FOREIGN KEY ("idlancamento") REFERENCES "public"."lancamentos"("idlancamento") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lancamento_descricoes_lancamento_data_idx" ON "lancamento_descricoes" USING btree ("idlancamento","data_alteracao" desc);--> statement-breakpoint
CREATE OR REPLACE FUNCTION "lancamentos_immutability_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'lancamentos are immutable';
	END IF;
	IF EXISTS (SELECT 1 FROM "estornos" WHERE "idlancamento" = OLD."idlancamento")
		OR NEW."idlancamento" IS DISTINCT FROM OLD."idlancamento"
		OR NEW."tipo" IS DISTINCT FROM OLD."tipo"
		OR NEW."valor" IS DISTINCT FROM OLD."valor"
		OR NEW."data_lancamento" IS DISTINCT FROM OLD."data_lancamento"
		OR NEW."idcontraparte" IS DISTINCT FROM OLD."idcontraparte"
		OR NEW."uuid_recibo" IS DISTINCT FROM OLD."uuid_recibo"
		OR NEW."data_registro" IS DISTINCT FROM OLD."data_registro"
		OR NEW."user_cadastro" IS DISTINCT FROM OLD."user_cadastro" THEN
		RAISE EXCEPTION 'lancamentos are immutable except for deposit confirmation and description correction';
	END IF;
	IF OLD."tipo" = 'entrada' AND OLD."depositado" IS FALSE AND NEW."depositado" IS TRUE
		AND NEW."descricao" IS NOT DISTINCT FROM OLD."descricao"
		AND NEW."user_alteracao" IS NOT DISTINCT FROM OLD."user_alteracao" THEN
		RETURN NEW;
	END IF;
	IF NEW."depositado" IS NOT DISTINCT FROM OLD."depositado"
		AND NEW."descricao" IS DISTINCT FROM OLD."descricao"
		AND btrim(NEW."descricao") <> ''
		AND btrim(COALESCE(NEW."user_alteracao", '')) <> '' THEN
		RETURN NEW;
	END IF;
	RAISE EXCEPTION 'lancamentos are immutable except for deposit confirmation and description correction';
END;
$$;
--> statement-breakpoint
CREATE FUNCTION "lancamento_descricoes_audit"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	INSERT INTO "lancamento_descricoes" ("idlancamento", "descricao_anterior", "descricao_nova", "user_alteracao")
	VALUES (OLD."idlancamento", OLD."descricao", NEW."descricao", NEW."user_alteracao");
	RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "lancamentos_descricao_audit"
AFTER UPDATE OF "descricao" ON "lancamentos"
FOR EACH ROW WHEN (OLD."descricao" IS DISTINCT FROM NEW."descricao")
EXECUTE FUNCTION "lancamento_descricoes_audit"();
--> statement-breakpoint
CREATE FUNCTION "lancamento_descricoes_immutability_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION 'description history is immutable';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "lancamento_descricoes_immutability_guard"
BEFORE UPDATE OR DELETE ON "lancamento_descricoes"
FOR EACH ROW EXECUTE FUNCTION "lancamento_descricoes_immutability_guard"();
