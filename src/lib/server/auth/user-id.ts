import { randomBytes } from 'node:crypto';

const USER_ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
const USER_ID_LENGTH = 16;

export const generateUserId = () =>
	Array.from(randomBytes(USER_ID_LENGTH), (byte) => USER_ID_ALPHABET[byte % USER_ID_ALPHABET.length]).join('');
