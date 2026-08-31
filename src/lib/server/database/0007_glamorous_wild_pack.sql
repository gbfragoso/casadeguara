LOCK TABLE "cadastros", "cadastro_fotos", "emprestimo" IN ACCESS EXCLUSIVE MODE;--> statement-breakpoint
DO $$
DECLARE
	maximum_id bigint;
	minimum_id bigint;
	maximum_photo_id bigint;
	minimum_photo_id bigint;
	maximum_loan_id bigint;
	minimum_loan_id bigint;
	sequence_last bigint;
BEGIN
	SELECT max("idleitor"), min("idleitor") INTO maximum_id, minimum_id FROM "cadastros";
	SELECT max("cadastro_id"), min("cadastro_id") INTO maximum_photo_id, minimum_photo_id FROM "cadastro_fotos";
	SELECT max("leitor"), min("leitor") INTO maximum_loan_id, minimum_loan_id FROM "emprestimo";
	SELECT last_value INTO sequence_last FROM "leitor_idleitor_seq";
	IF COALESCE(maximum_id, 0) > 2147483647 OR COALESCE(minimum_id, 0) < -2147483648
		OR COALESCE(maximum_photo_id, 0) > 2147483647 OR COALESCE(minimum_photo_id, 0) < -2147483648
		OR COALESCE(maximum_loan_id, 0) > 2147483647 OR COALESCE(minimum_loan_id, 0) < -2147483648
		OR sequence_last > 2147483647 OR sequence_last < -2147483648 THEN
		RAISE EXCEPTION 'cadastro identifier exceeds integer capacity';
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "cadastro_fotos" DROP CONSTRAINT IF EXISTS "cadastro_fotos_cadastro_id_cadastros_idleitor_fk";--> statement-breakpoint
ALTER TABLE "cadastros" ALTER COLUMN "idleitor" SET DATA TYPE integer USING "idleitor"::integer;--> statement-breakpoint
ALTER TABLE "cadastros" ALTER COLUMN "idleitor" SET DEFAULT nextval('leitor_idleitor_seq'::regclass);--> statement-breakpoint
ALTER TABLE "cadastro_fotos" ALTER COLUMN "cadastro_id" SET DATA TYPE integer USING "cadastro_id"::integer;--> statement-breakpoint
ALTER TABLE "emprestimo" ALTER COLUMN "leitor" SET DATA TYPE integer USING "leitor"::integer;--> statement-breakpoint
ALTER SEQUENCE "leitor_idleitor_seq" AS integer MAXVALUE 2147483647;--> statement-breakpoint
DO $$
DECLARE
	maximum_id bigint;
	sequence_last bigint;
	sequence_called boolean;
	next_value bigint;
BEGIN
	SELECT COALESCE(max("idleitor"), 0) INTO maximum_id FROM "cadastros";
	SELECT last_value, is_called INTO sequence_last, sequence_called FROM "leitor_idleitor_seq";
	next_value := GREATEST(sequence_last, maximum_id, 1);
	PERFORM setval('leitor_idleitor_seq'::regclass, next_value, sequence_called OR maximum_id > sequence_last);
END $$;--> statement-breakpoint
ALTER TABLE "cadastro_fotos"
	ADD CONSTRAINT "cadastro_fotos_cadastro_id_cadastros_idleitor_fk"
	FOREIGN KEY ("cadastro_id") REFERENCES "public"."cadastros"("idleitor") ON DELETE cascade ON UPDATE no action;
