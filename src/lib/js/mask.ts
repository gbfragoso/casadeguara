export function cpf(cpf: string | null) {
	if (cpf) {
		cpf = cpf.replace(/\D/g, '');
		cpf = cpf.padStart(11, '0');
		cpf = cpf.substring(0, 3) + '.***.***-' + cpf.substring(cpf.length - 2);
		return cpf;
	}
	return null;
}

export function rg(rg: string | null) {
	if (rg) {
		rg = rg.replace(/\D/g, '');
		rg = rg.padStart(10, '0');
		rg = rg.substring(0, 2) + '.***.***-' + rg.substring(rg.length - 2);
		return rg;
	}
	return null;
}
