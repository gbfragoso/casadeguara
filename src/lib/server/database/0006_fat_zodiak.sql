CREATE TABLE "cadastro_fotos" (
	"cadastro_id" smallint PRIMARY KEY NOT NULL,
	"original" "bytea" NOT NULL,
	"cartao" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cadastro_fotos" ADD CONSTRAINT "cadastro_fotos_cadastro_id_cadastros_idleitor_fk" FOREIGN KEY ("cadastro_id") REFERENCES "public"."cadastros"("idleitor") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "cadastro_fotos" ("cadastro_id", "original", "cartao")
SELECT "idleitor", "foto", "foto"
FROM "cadastros"
WHERE "foto" IS NOT NULL;--> statement-breakpoint
DO $$ BEGIN
	IF (SELECT count(*) FROM "cadastros" WHERE "foto" IS NOT NULL)
		<> (SELECT count(*) FROM "cadastro_fotos") OR EXISTS (
			SELECT 1
			FROM "cadastros" c
			LEFT JOIN "cadastro_fotos" f ON f."cadastro_id" = c."idleitor"
			WHERE c."foto" IS NOT NULL
				AND (f."cadastro_id" IS NULL
					OR f."original" IS DISTINCT FROM c."foto"
					OR f."cartao" IS DISTINCT FROM c."foto")
		) THEN RAISE EXCEPTION 'photo migration reconciliation failed';
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "cadastros" DROP COLUMN "foto";
