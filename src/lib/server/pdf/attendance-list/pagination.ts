export const paginateRows = <Row>(rows: Row[], firstCapacity: number, nextCapacity: number): Row[][] => {
	const remainingRows = rows.slice(firstCapacity);
	const nextPageCount = Math.ceil(remainingRows.length / nextCapacity);
	const nextPages = Array.from({ length: nextPageCount }, (_, index) =>
		remainingRows.slice(index * nextCapacity, (index + 1) * nextCapacity),
	);
	return [rows.slice(0, firstCapacity), ...nextPages];
};
