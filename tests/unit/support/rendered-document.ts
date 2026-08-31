import {
	HTMLAnchorElement,
	HTMLButtonElement,
	HTMLDivElement,
	HTMLInputElement,
	HTMLTableCellElement,
	HTMLTextAreaElement,
	Window,
	type Document as HappyDocument,
} from 'happy-dom';

export const parseRenderedBody = (body: string) => {
	const window = new Window();
	window.document.body.innerHTML = body;
	return window.document;
};

const getElement = (document: HappyDocument, selector: string) => {
	const element = document.querySelector(selector);
	if (!element) throw new Error(`Expected rendered element: ${selector}`);
	return element;
};

export const getRenderedInput = (document: HappyDocument, selector: string) => {
	const element = getElement(document, selector);
	if (!(element instanceof HTMLInputElement)) throw new Error(`Expected input: ${selector}`);
	return element;
};

export const getRenderedTextarea = (document: HappyDocument, selector: string) => {
	const element = getElement(document, selector);
	if (!(element instanceof HTMLTextAreaElement)) throw new Error(`Expected textarea: ${selector}`);
	return element;
};

export const getRenderedButton = (document: HappyDocument, selector: string) => {
	const element = getElement(document, selector);
	if (!(element instanceof HTMLButtonElement)) throw new Error(`Expected button: ${selector}`);
	return element;
};

export const getRenderedAnchor = (document: HappyDocument, selector: string) => {
	const element = getElement(document, selector);
	if (!(element instanceof HTMLAnchorElement)) throw new Error(`Expected anchor: ${selector}`);
	return element;
};

export const getRenderedDiv = (document: HappyDocument, selector: string) => {
	const element = getElement(document, selector);
	if (!(element instanceof HTMLDivElement)) throw new Error(`Expected div: ${selector}`);
	return element;
};

export const getRenderedCell = (document: HappyDocument, selector: string) => {
	const element = getElement(document, selector);
	if (!(element instanceof HTMLTableCellElement)) throw new Error(`Expected table cell: ${selector}`);
	return element;
};
