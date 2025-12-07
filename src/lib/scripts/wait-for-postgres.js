import { exec } from 'node:child_process';

function checkPostgres() {
	exec('docker exec postgres-dev pg_isready --host localhost', (error, stdout) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
		if (stdout?.search('accepting connections') === -1) {
			checkPostgres();
			return;
		}

		console.log('\n🟢 Postgres está pronto e aceitando conexões!\n');
	});
}

process.stdout.write('\n\n🔴 Aguardando Postgres aceitar conexões');
checkPostgres();
