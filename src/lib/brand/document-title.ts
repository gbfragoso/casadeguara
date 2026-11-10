const SYSTEM_NAME = 'Casa de Guará';

export function formatDocumentTitle(...sections: readonly (string | undefined)[]) {
	const named = sections.filter((section): section is string => Boolean(section?.trim()));
	return [...new Set([...named, SYSTEM_NAME])].join(' · ');
}
