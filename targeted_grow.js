export async function main(ns, threads, time, target) {
	const threads1 = ns.args[0];
	const time1 = ns.args[1];
	const target1 = ns.args[2];

	await ns.sleep(time1);

	await ns.grow(target1 ,{threads: threads1});
}
