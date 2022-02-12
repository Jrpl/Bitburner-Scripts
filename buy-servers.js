/** @param {NS} ns **/
function calcBestRam(ns, numServers) {
	let ramList = [];

	let i = 1;
	while (ramList.length < 20) {
		let result = Math.pow(2, i);
		ramList.push(result);
		i++;
	}

	const affordableRamList = ramList.filter(ram => (numServers * ns.getPurchasedServerCost(ram)) <= ns.getServerMoneyAvailable('home'));

	const bestRam = ramList[affordableRamList.length - 1];
	return bestRam;
}

function deletePurchasedServers(ns, numServers, newRam) {
	const pservs = ns.getPurchasedServers();

	let pservObjs = pservs.map(server => {
		return {
			'name': server,
			'ram': ns.getServerMaxRam(server)
		}
	})

	pservObjs.sort((a, b) => {
		return a.ram - b.ram;
	});

	let pservNames = [];
	
	pservObjs.forEach((server, index) => {
		if (ns.getServerMaxRam(server.name) >= newRam) {
			return;
		} else if (index < numServers) {
			ns.killall(server.name);
			ns.deleteServer(server.name);
			return pservNames.push(server.name);
		}
	});

	return pservNames;
}

export async function main(ns, numServers = ns.args[0]) {
	const ram = calcBestRam(ns, numServers);
	const totalServers = ns.getPurchasedServers().length + numServers;
	const maxServers = (ns.getPurchasedServerLimit() < totalServers) ? ns.getPurchasedServerLimit() : totalServers;
	
	if (totalServers > ns.getPurchasedServerLimit()) {
		if (await ns.prompt('The number of servers requested is not available. Do you want to delete existing servers with the smallest ram to make room?')) {
			const pservNames = deletePurchasedServers(ns, totalServers - ns.getPurchasedServerLimit(), ram);

			pservNames.forEach(name => {
				if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
					ns.purchaseServer(name, ram);
				}
			})

			while (ns.getPurchasedServers().length < maxServers) {
				if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
					let host = 'pserv-' + ns.getPurchasedServers().length;
					ns.purchaseServer(host, ram);
				}
			}
		} else {
			return;
		}
	} else {
		while (ns.getPurchasedServers().length < maxServers) {
			if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
				let host = 'pserv-' + ns.getPurchasedServers().length;
				ns.purchaseServer(host, ram);
			}
		}
	}
}