export class ChartItem {
	private sum: Number;
	private month: Number;
	private year: Number;

	public constructor(sum: Number, month: Number, year: number) {
		this.sum = sum;
		this.month = month;
		this.year = year;
	}

	public getSum() {
		return this.sum;
	}

	public getMonth() {
		return this.month;
	}

	public getYear() {
		return this.year;
	}

	public toString() {
		return this.sum;
	}
}
