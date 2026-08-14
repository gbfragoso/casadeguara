type LoadingSetter = (loading: boolean) => void;

export const runWithLoading = async (update: () => Promise<void>, setLoading: LoadingSetter) => {
	setLoading(true);

	try {
		await update();
	} finally {
		setLoading(false);
	}
};
