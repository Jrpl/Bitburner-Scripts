export async function main(ns, threads, target) {
	await ns.weaken(target, threads);
}
