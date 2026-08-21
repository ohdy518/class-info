import { ConvexHttpClient } from 'convex/browser';
import type { PageServerLoad } from './$types.js';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from "@class-info/backend/convex/_generated/api";

export const load = (async () => {
	const client = new ConvexHttpClient(PUBLIC_CONVEX_URL!);
	const [overview, standingNotices] = await Promise.all([
		client.query(api.notices.overview, {}),
		client.query(api.notices.standingNotices, {}),
	]);
	return { ...overview, standingNotices };
}) satisfies PageServerLoad;
