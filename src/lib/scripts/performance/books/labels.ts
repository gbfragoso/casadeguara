const GROUP_COUNT = 10;

const pad = (value: number, length: number) => String(value).padStart(length, '0');
const group = (id: number) => pad(((id - 1) % GROUP_COUNT) + 1, 4);

export const bookTitle = (id: number) => `Título Grupo ${group(id)} Livro ${pad(id, 6)}`;
export const authorName = (id: number) => `Autor Grupo ${group(id)} Nome ${pad(id, 6)}`;
export const publisherName = (id: number) => `Editora Grupo ${group(id)} Nome ${pad(id, 6)}`;
export const collectionName = (id: number) => `Coleção Grupo ${group(id)} Nome ${pad(id, 6)}`;
export const keywordName = (id: number) => `Chave Grupo ${group(id)} Item ${pad(id, 6)}`;
