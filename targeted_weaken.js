export async function main(ns, threads, target) {

	let threads1 = ns.args[0];
	let target1 = ns.args[1];

	await ns.weaken(target1, {threads: threads1});
	
}
