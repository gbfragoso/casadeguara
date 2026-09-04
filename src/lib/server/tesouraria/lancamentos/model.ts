import { db } from '$lib/server/database/connection';
import { createLancamento } from './creation';
import { listCounterparts } from './counterparts';
import { getDashboardProjection } from './dashboard';
import { listPendingDeposits } from './cash';
import { confirmLancamentoDeposits } from './deposits';
import { getReceipt } from './receipt';
import { getLancamentoForReversal, reverseLancamento } from './reversal';
import { searchReversals } from './reversal-search';
import { searchLancamentos } from './search';
import type {
	CreateLancamento,
	EstornoPage,
	EstornoSearch,
	LancamentoDatabase,
	LancamentoDetail,
	LancamentoPage,
	LancamentoSearch,
	CounterpartOption,
	CreatedLancamento,
	DashboardProjection,
	CashEntry,
	ReceiptState,
} from './types';

export class LancamentoModel {
	constructor(private readonly database: LancamentoDatabase = db) {}

	search(input: LancamentoSearch): Promise<LancamentoPage> {
		return searchLancamentos(this.database, input);
	}

	listCounterpartOptions(): Promise<CounterpartOption[]> {
		return listCounterparts(this.database);
	}

	create(input: CreateLancamento, actorId: string): Promise<CreatedLancamento> {
		return createLancamento(this.database, input, actorId);
	}

	getForReversal(id: number): Promise<LancamentoDetail | null> {
		return getLancamentoForReversal(this.database, id);
	}

	reverse(id: number, reason: string, actorId: string): Promise<void> {
		return reverseLancamento(this.database, id, reason, actorId);
	}

	searchReversals(input: EstornoSearch): Promise<EstornoPage> {
		return searchReversals(this.database, input);
	}

	getReceipt(uuid: string): Promise<ReceiptState | null> {
		return getReceipt(this.database, uuid);
	}

	getDashboard(today?: Date): Promise<DashboardProjection> {
		return getDashboardProjection(this.database, today);
	}

	listPendingDeposits(): Promise<CashEntry[]> {
		return listPendingDeposits(this.database);
	}

	confirmDeposits(ids: number[], actorId: string): Promise<void> {
		return confirmLancamentoDeposits(this.database, ids, actorId);
	}
}

export const lancamentoModel = new LancamentoModel();
