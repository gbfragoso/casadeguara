import type { Page } from '@playwright/test';
import { createName } from './amigo-fraterno-support';
import { openLoanForm, selectLoanOption } from './emprestimos-browser';
import { expect, waitForHydration, type E2EData } from './fixtures';

export { getPdfPageCount } from './amigo-fraterno-support';

const MAX_READER_NAME_LENGTH = 60;
const MAX_BOOK_TITLE_LENGTH = 80;
const MILLIMETERS_PER_INCH = 25.4;
const CSS_PIXELS_PER_INCH = 96;
const LOAN_TERM_DAYS = 14;

type PrintCounterWindow = Window & { __e2ePrintCount?: number };
export type ReceiptLoan = { readerName: string; title: string; tombo: string; bookId: number; readerId: number };

export const millimetersToPixels = (millimeters: number) => (millimeters / MILLIMETERS_PER_INCH) * CSS_PIXELS_PER_INCH;

export const receiptPath = (loanId: number) => `/biblioteca/emprestimos/${loanId}/recibo`;

export const installPrintCounter = (page: Page) =>
	page.addInitScript(() => {
		const counterWindow = window as PrintCounterWindow;
		counterWindow.__e2ePrintCount = 0;
		counterWindow.print = () => {
			counterWindow.__e2ePrintCount = (counterWindow.__e2ePrintCount ?? 0) + 1;
		};
	});

export const readPrintCount = (page: Page) => page.evaluate(() => (window as PrintCounterWindow).__e2ePrintCount ?? 0);

const createLongReader = (e2e: E2EData) => {
	const overheadLength = createName(`-${e2e.token}`).length;
	return e2e.createParticipant('Leitor'.padEnd(MAX_READER_NAME_LENGTH - overheadLength, 'X'));
};

const createLongTitleBook = async (e2e: E2EData) => {
	const catalog = await e2e.createBookCatalog();
	const book = catalog.livros.related;
	const title = `LIVRO LONGO ${e2e.token.toUpperCase()} `.padEnd(MAX_BOOK_TITLE_LENGTH, 'A');
	await e2e.database`update livro set titulo = ${title} where idlivro = ${book.idlivro}`;
	return { ...book, titulo: title };
};

export const prepareReceiptLoan = async (e2e: E2EData): Promise<ReceiptLoan> => {
	const reader = await createLongReader(e2e);
	const book = await createLongTitleBook(e2e);
	return {
		readerName: reader.name,
		readerId: reader.id,
		title: book.titulo,
		tombo: book.tombo,
		bookId: book.idlivro,
	};
};

export const readLoanId = async (e2e: E2EData, loan: ReceiptLoan) => {
	const [row] = await e2e.database<{ idemp: number }[]>`
		select idemp from emprestimo where leitor = ${loan.readerId}
	`;
	if (!row) throw new Error('Empréstimo do recibo não foi gravado.');
	return row.idemp;
};

export const createLoanThroughForm = async (page: Page, e2e: E2EData, loan: ReceiptLoan) => {
	await openLoanForm(page, e2e);
	await selectLoanOption(page.getByRole('combobox', { name: 'Leitor', exact: true }), loan.readerName);
	await selectLoanOption(page.getByRole('combobox', { name: 'Exemplar', exact: true }), loan.tombo);
	await page.getByRole('button', { name: 'Cadastrar' }).click();
	await page.waitForURL(/\/biblioteca\/emprestimos\/\d+\/recibo$/);
	return readLoanId(e2e, loan);
};

export const insertLoan = async (e2e: E2EData, loan: ReceiptLoan) => {
	await e2e.database`
		insert into emprestimo (leitor, exemplar, data_emprestimo, data_devolucao)
		select ${loan.readerId}, idexemplar, current_date, current_date + ${LOAN_TERM_DAYS}::int
		from exemplar where livro = ${loan.bookId}
	`;
	return readLoanId(e2e, loan);
};

export const openReceipt = async (page: Page, e2e: E2EData, role: 'wrongRole' | 'admin' = 'wrongRole') => {
	const loan = await prepareReceiptLoan(e2e);
	const loanId = await insertLoan(e2e, loan);
	await e2e.authenticate(page, role);
	await page.goto(receiptPath(loanId));
	await waitForHydration(page);
	await expect(page.getByRole('button', { name: 'Imprimir recibo' })).toBeVisible();
	return loan;
};
