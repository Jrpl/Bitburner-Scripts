/** @param {NS} ns **/
import { calcBestRam, deletePurchasedServers } from "utils.js";

export async function main(ns) {
	const ram = calcBestRam(ns);
	deletePurchasedServers(ns);

	while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
		if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
			let host = 'pserv-' + ns.getPurchasedServers().length;
			if (ns.getPurchasedServers().includes(host)) {
				ns.killall(host);
				ns.deleteServer(host);
			}
			ns.purchaseServer(host, ram);
		}

		await ns.sleep(5000);
	}
}