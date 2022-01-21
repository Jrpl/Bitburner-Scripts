export async function main(ns, threads, time, target) {
	await ns.sleep(time);
	await ns.grow(target , threads);
}
