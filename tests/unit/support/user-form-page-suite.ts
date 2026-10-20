import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { expect, it } from 'vitest';

import { parseRenderedBody } from './rendered-document';

type PageProps = { data?: unknown; form: unknown };
type UserFormPageOptions = {
	page: Component<never>;
	data?: unknown;
	fields: readonly string[];
	successStatus: number;
	successMessage: string;
};

const NOTIFICATION = '[data-testid="regiao-notificacao"]';
const BAD_REQUEST = 400;

export const renderUserFormPage = (page: Component<never>, props: PageProps) =>
	parseRenderedBody(render(page as Component<PageProps>, { props }).body);

const readNotifications = (page: Component<never>, props: PageProps) =>
	[...renderUserFormPage(page, props).querySelectorAll(NOTIFICATION)].map((element) => element.textContent?.trim());

export const describeUserFormPage = ({ page, data, fields, successStatus, successMessage }: UserFormPageOptions) => {
	it('renders the user form without notifications before submission', () => {
		const document = renderUserFormPage(page, { data, form: null });

		const ids = fields.map((id) => document.querySelector(`form [id="${id}"]`)?.getAttribute('id'));

		expect(ids).toEqual(fields);
		expect(document.querySelector(NOTIFICATION)).toBeNull();
	});

	it('notifies the successful submission', () => {
		const notifications = readNotifications(page, { data, form: { status: successStatus } });

		expect(notifications).toEqual([successMessage]);
	});

	it('notifies the server failure message', () => {
		const notifications = readNotifications(page, {
			data,
			form: { status: BAD_REQUEST, message: 'Usuário já cadastrado' },
		});

		expect(notifications).toEqual(['Usuário já cadastrado']);
	});
};
