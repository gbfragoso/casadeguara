const isTextEntry = (entry: [string, FormDataEntryValue]): entry is [string, string] => typeof entry[1] === 'string';

export const readFormSearchParams = (form: HTMLFormElement): URLSearchParams =>
	new URLSearchParams([...new FormData(form)].filter(isTextEntry));
