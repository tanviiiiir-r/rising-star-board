export function homeHref(search: {
	category?: string;
	board?: string;
	page?: number;
}): string {
	const params = new URLSearchParams();
	if (search.category && search.category !== "all") {
		params.set("category", search.category);
	}
	if (search.board && search.board !== "all_time") {
		params.set("board", search.board);
	}
	if (search.page && search.page > 1) {
		params.set("page", String(search.page));
	}
	const query = params.toString();
	return query ? `/?${query}` : "/";
}
