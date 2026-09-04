SELECT pg_advisory_xact_lock(hashtextextended('casadeguara.tesouraria.lancamentos.cutover', 0));
--> statement-breakpoint
LOCK TABLE "entradas", "saidas" IN ACCESS EXCLUSIVE MODE;
--> statement-breakpoint
DO $$
DECLARE
	maximum_entry_id bigint;
	minimum_entry_id bigint;
	output_count bigint;
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "entradas"
		WHERE "uuid" IS NULL
			OR "uuid" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
	) THEN
		RAISE EXCEPTION 'lancamentos migration preflight failed: invalid receipt UUID';
	END IF;
	IF EXISTS (
		SELECT lower("uuid")
		FROM "entradas"
		GROUP BY lower("uuid")
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'lancamentos migration preflight failed: duplicate receipt UUID';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "entradas" e
		LEFT JOIN "cadastros" c ON c."idleitor" = e."idcontribuinte"
		WHERE c."idleitor" IS NULL
	) THEN
		RAISE EXCEPTION 'lancamentos migration preflight failed: missing counterpart';
	END IF;
	IF EXISTS (SELECT 1 FROM "entradas" WHERE "depositado" IS NULL) THEN
		RAISE EXCEPTION 'lancamentos migration preflight failed: null deposit status';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "entradas"
		WHERE ("motivo_estorno" IS NULL OR "user_estorno" IS NULL OR "data_estorno" IS NULL)
			AND ("motivo_estorno" IS NOT NULL OR "user_estorno" IS NOT NULL OR "data_estorno" IS NOT NULL)
	) THEN
		RAISE EXCEPTION 'lancamentos migration preflight failed: incomplete reversal audit';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "entradas"
		WHERE "motivo_estorno" IS NOT NULL
			AND (btrim("motivo_estorno") = '' OR "user_estorno" IS NULL OR btrim("user_estorno") = '')
	) THEN
		RAISE EXCEPTION 'lancamentos migration preflight failed: invalid reversal audit';
	END IF;
	SELECT COALESCE(max("identrada"), 0), COALESCE(min("identrada"), 0)
	INTO maximum_entry_id, minimum_entry_id
	FROM "entradas";
	SELECT count(*) INTO output_count FROM "saidas";
	IF minimum_entry_id < -2147483648 OR maximum_entry_id > 2147483647
		OR output_count > 2147483647 - maximum_entry_id THEN
		RAISE EXCEPTION 'lancamentos migration preflight failed: integer identifier overflow';
	END IF;
END $$;
--> statement-breakpoint
CREATE TYPE "public"."tipo_lancamento" AS ENUM('entrada', 'saida');
--> statement-breakpoint
CREATE TABLE "lancamentos" (
	"idlancamento" serial PRIMARY KEY NOT NULL,
	"tipo" "tipo_lancamento" NOT NULL,
	"descricao" varchar(200) NOT NULL,
	"valor" numeric NOT NULL,
	"data_lancamento" date NOT NULL,
	"idcontraparte" integer,
	"depositado" boolean,
	"uuid_recibo" uuid,
	"data_registro" date,
	"user_cadastro" varchar(30),
	"user_alteracao" varchar(30),
	CONSTRAINT "lancamentos_forma_tipo_ck" CHECK (("tipo" = 'entrada' AND "idcontraparte" IS NOT NULL AND "depositado" IS NOT NULL AND "uuid_recibo" IS NOT NULL) OR ("tipo" = 'saida' AND "depositado" IS NULL AND "uuid_recibo" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "estornos" (
	"idlancamento" integer PRIMARY KEY NOT NULL,
	"motivo" varchar(200) NOT NULL,
	"user_estorno" varchar(30) NOT NULL,
	"data_estorno" date DEFAULT now() NOT NULL,
	CONSTRAINT "estornos_idlancamento_lancamentos_idlancamento_fk" FOREIGN KEY ("idlancamento") REFERENCES "public"."lancamentos"("idlancamento") ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "estornos_data_id_idx" ON "estornos" USING btree ("data_estorno" DESC, "idlancamento" DESC);
--> statement-breakpoint
CREATE INDEX "lancamentos_tipo_data_id_idx" ON "lancamentos" USING btree ("tipo", "data_lancamento" DESC, "idlancamento" DESC);
--> statement-breakpoint
CREATE INDEX "lancamentos_contraparte_data_id_idx" ON "lancamentos" USING btree ("idcontraparte", "data_lancamento" DESC, "idlancamento" DESC);
--> statement-breakpoint
CREATE INDEX "lancamentos_registro_id_idx" ON "lancamentos" USING btree ("data_registro", "idlancamento");
--> statement-breakpoint
CREATE INDEX "lancamentos_caixa_idx" ON "lancamentos" USING btree ("data_lancamento", "idlancamento") WHERE "tipo" = 'entrada' AND "depositado" = false;
--> statement-breakpoint
CREATE UNIQUE INDEX "lancamentos_uuid_recibo_idx" ON "lancamentos" USING btree ("uuid_recibo");
--> statement-breakpoint
DO $$
DECLARE
	maximum_entry_id bigint;
BEGIN
	SELECT COALESCE(max("identrada"), 0) INTO maximum_entry_id FROM "entradas";
	INSERT INTO "lancamentos" (
		"idlancamento", "tipo", "descricao", "valor", "data_lancamento", "idcontraparte",
		"depositado", "uuid_recibo", "data_registro", "user_cadastro", "user_alteracao"
	)
	SELECT
		e."identrada", 'entrada', e."descricao", e."valor", e."data_entrada", e."idcontribuinte",
		e."depositado", e."uuid"::uuid, e."data_registro", e."user_cadastro", e."user_alteracao"
	FROM "entradas" e;
	INSERT INTO "lancamentos" (
		"idlancamento", "tipo", "descricao", "valor", "data_lancamento", "idcontraparte",
		"depositado", "uuid_recibo", "data_registro", "user_cadastro", "user_alteracao"
	)
	SELECT
		(maximum_entry_id + row_number() OVER (ORDER BY s."idsaida"))::integer,
		'saida', s."descricao", s."valor", s."data_saida", NULL, NULL, NULL, NULL,
		s."user_cadastro", s."user_alteracao"
	FROM "saidas" s;
	INSERT INTO "estornos" ("idlancamento", "motivo", "user_estorno", "data_estorno")
	SELECT "identrada", "motivo_estorno", "user_estorno", "data_estorno"
	FROM "entradas"
	WHERE "motivo_estorno" IS NOT NULL;
END $$;
--> statement-breakpoint
DO $$
DECLARE
	maximum_entry_id bigint;
	entry_source_count bigint;
	output_source_count bigint;
	reversal_source_count bigint;
	entry_source_total numeric;
	output_source_total numeric;
	entry_destination_total numeric;
	output_destination_total numeric;
	maximum_destination_id bigint;
BEGIN
	SELECT COALESCE(max("identrada"), 0) INTO maximum_entry_id FROM "entradas";
	SELECT count(*) INTO entry_source_count FROM "entradas";
	SELECT count(*) INTO output_source_count FROM "saidas";
	SELECT count(*) INTO reversal_source_count
	FROM "entradas"
	WHERE "motivo_estorno" IS NOT NULL;
	IF (SELECT count(*) FROM "lancamentos") <> entry_source_count + output_source_count THEN
		RAISE EXCEPTION 'lancamentos migration reconciliation failed: row count';
	END IF;
	IF (SELECT count(*) FROM "estornos") <> reversal_source_count THEN
		RAISE EXCEPTION 'lancamentos migration reconciliation failed: reversal count';
	END IF;
	SELECT COALESCE(sum("valor"), 0::numeric) INTO entry_source_total FROM "entradas";
	SELECT COALESCE(sum("valor"), 0::numeric) INTO output_source_total FROM "saidas";
	SELECT COALESCE(sum("valor"), 0::numeric) INTO entry_destination_total
	FROM "lancamentos" WHERE "tipo" = 'entrada';
	SELECT COALESCE(sum("valor"), 0::numeric) INTO output_destination_total
	FROM "lancamentos" WHERE "tipo" = 'saida';
	IF entry_source_total IS DISTINCT FROM entry_destination_total
		OR output_source_total IS DISTINCT FROM output_destination_total THEN
		RAISE EXCEPTION 'lancamentos migration reconciliation failed: totals';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "entradas" e
		LEFT JOIN "lancamentos" l ON l."idlancamento" = e."identrada"
		WHERE l."idlancamento" IS NULL
			OR l."tipo" <> 'entrada'
			OR l."descricao" IS DISTINCT FROM e."descricao"
			OR l."valor" IS DISTINCT FROM e."valor"
			OR l."data_lancamento" IS DISTINCT FROM e."data_entrada"
			OR l."idcontraparte" IS DISTINCT FROM e."idcontribuinte"
			OR l."depositado" IS DISTINCT FROM e."depositado"
			OR l."uuid_recibo" IS DISTINCT FROM e."uuid"::uuid
			OR l."data_registro" IS DISTINCT FROM e."data_registro"
			OR l."user_cadastro" IS DISTINCT FROM e."user_cadastro"
			OR l."user_alteracao" IS DISTINCT FROM e."user_alteracao"
	) THEN
		RAISE EXCEPTION 'lancamentos migration reconciliation failed: entry data';
	END IF;
	IF EXISTS (
		WITH mapped AS (
			SELECT s.*, maximum_entry_id + row_number() OVER (ORDER BY s."idsaida") AS "new_id"
			FROM "saidas" s
		)
		SELECT 1
		FROM mapped s
		LEFT JOIN "lancamentos" l ON l."idlancamento" = s."new_id"
		WHERE l."idlancamento" IS NULL
			OR l."tipo" <> 'saida'
			OR l."descricao" IS DISTINCT FROM s."descricao"
			OR l."valor" IS DISTINCT FROM s."valor"
			OR l."data_lancamento" IS DISTINCT FROM s."data_saida"
			OR l."idcontraparte" IS NOT NULL
			OR l."depositado" IS NOT NULL
			OR l."uuid_recibo" IS NOT NULL
			OR l."data_registro" IS NOT NULL
			OR l."user_cadastro" IS DISTINCT FROM s."user_cadastro"
			OR l."user_alteracao" IS DISTINCT FROM s."user_alteracao"
	) THEN
		RAISE EXCEPTION 'lancamentos migration reconciliation failed: output data';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "entradas" e
		LEFT JOIN "estornos" r ON r."idlancamento" = e."identrada"
		WHERE e."motivo_estorno" IS NOT NULL
			AND (r."motivo" IS DISTINCT FROM e."motivo_estorno"
				OR r."user_estorno" IS DISTINCT FROM e."user_estorno"
				OR r."data_estorno" IS DISTINCT FROM e."data_estorno")
	) THEN
		RAISE EXCEPTION 'lancamentos migration reconciliation failed: reversal data';
	END IF;
	SELECT COALESCE(max("idlancamento"), 0) INTO maximum_destination_id FROM "lancamentos";
	IF maximum_destination_id = 0 THEN
		PERFORM setval('"lancamentos_idlancamento_seq"'::regclass, 1, false);
	ELSE
		PERFORM setval('"lancamentos_idlancamento_seq"'::regclass, maximum_destination_id, true);
	END IF;
END $$;
--> statement-breakpoint
CREATE FUNCTION "lancamentos_insert_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	IF NEW."data_registro" IS NULL OR NEW."user_cadastro" IS NULL OR btrim(NEW."user_cadastro") = '' THEN
		RAISE EXCEPTION 'new lancamento requires registration audit';
	END IF;
	RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION "lancamentos_immutability_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'lancamentos are immutable';
	END IF;
	IF NOT (
		OLD."tipo" = 'entrada'
		AND NOT EXISTS (SELECT 1 FROM "estornos" WHERE "idlancamento" = OLD."idlancamento")
		AND OLD."depositado" IS FALSE
		AND NEW."depositado" IS TRUE
		AND NEW."idlancamento" IS NOT DISTINCT FROM OLD."idlancamento"
		AND NEW."tipo" IS NOT DISTINCT FROM OLD."tipo"
		AND NEW."descricao" IS NOT DISTINCT FROM OLD."descricao"
		AND NEW."valor" IS NOT DISTINCT FROM OLD."valor"
		AND NEW."data_lancamento" IS NOT DISTINCT FROM OLD."data_lancamento"
		AND NEW."idcontraparte" IS NOT DISTINCT FROM OLD."idcontraparte"
		AND NEW."uuid_recibo" IS NOT DISTINCT FROM OLD."uuid_recibo"
		AND NEW."data_registro" IS NOT DISTINCT FROM OLD."data_registro"
		AND NEW."user_cadastro" IS NOT DISTINCT FROM OLD."user_cadastro"
		AND NEW."user_alteracao" IS NOT DISTINCT FROM OLD."user_alteracao"
	) THEN
		RAISE EXCEPTION 'lancamentos are immutable except for deposit confirmation';
	END IF;
	RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION "estornos_insert_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	IF btrim(NEW."motivo") = '' OR NEW."user_estorno" IS NULL OR btrim(NEW."user_estorno") = '' OR NEW."data_estorno" IS NULL THEN
		RAISE EXCEPTION 'reversal requires complete audit';
	END IF;
	RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION "estornos_immutability_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION 'reversal audit is immutable';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "lancamentos_insert_guard"
BEFORE INSERT ON "lancamentos"
FOR EACH ROW EXECUTE FUNCTION "lancamentos_insert_guard"();
--> statement-breakpoint
CREATE TRIGGER "lancamentos_immutability_guard"
BEFORE UPDATE OR DELETE ON "lancamentos"
FOR EACH ROW EXECUTE FUNCTION "lancamentos_immutability_guard"();
--> statement-breakpoint
CREATE TRIGGER "estornos_insert_guard"
BEFORE INSERT ON "estornos"
FOR EACH ROW EXECUTE FUNCTION "estornos_insert_guard"();
--> statement-breakpoint
CREATE TRIGGER "estornos_immutability_guard"
BEFORE UPDATE OR DELETE ON "estornos"
FOR EACH ROW EXECUTE FUNCTION "estornos_immutability_guard"();
--> statement-breakpoint
DROP TABLE "entradas";
--> statement-breakpoint
DROP TABLE "saidas";
