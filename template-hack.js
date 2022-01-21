/** @param {NS} ns **/
export async function main(ns) {
	const target = ns.args[0];
	const moneyThresh = ns.args[1];
	const securityThresh = ns.args[2];

	while(true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			await ns.grow(target);
		} else {
			await ns.hack(target);
		}
	}
}