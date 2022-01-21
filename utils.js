/** @param {NS} ns **/
export function multiscan(ns, server) {
	let serverList = [];
	function scanning(server) {
		let currentScan = ns.scan(server);
		currentScan.forEach(server => {
			if (!serverList.includes(server)) {
				serverList.push(server);
				scanning(server);
			}
		})
	}
	scanning(server);
	return serverList;
}

export function gainRootAccess(ns, server) {
	const serverData = ns.getServer(server);

	if (ns.fileExists('brutessh.exe')) {
		ns.brutessh(server);
	}
	if (ns.fileExists('ftpcrack.exe')) {
		ns.ftpcrack(server);
	}
	if (ns.fileExists('relaysmtp.exe')) {
		ns.relaysmtp(server);
	}
	if (ns.fileExists('httpworm.exe')) {
		ns.httpworm(server);
	}
	if (ns.fileExists('sqlinject.exe')) {
		ns.sqlinject(server);
	}
	if (ns.getServerNumPortsRequired(server) <= serverData.openPortCount) {
		ns.nuke(server);
	}
	/* Requires Singularity 4-1
	if (!serverData.backdoorInstalled) {
		ns.installBackdoor(server);
	}
	*/
}

export function findTargetServer(ns, serverList) {
	let serverMoney = [];
	let highestMax = 0;
	let bestServer = '';
	let targetServer = [];

	serverList.forEach(server => {
		serverMoney.push(ns.getServerMaxMoney(server));
	})

	for (let i = 0; i < serverMoney.length; i++) {
		if (serverList[i] != 'home' && ns.getServerRequiredHackingLevel(serverList[i]) <= ns.getHackingLevel()) {
			if (serverMoney[i] > highestMax) {
				highestMax = serverMoney[i];
				bestServer = serverList[i];
			}
		}
	};

	if (bestServer != '') {
		targetServer.push(bestServer);
		targetServer.push(Math.floor(ns.getServerMaxMoney(bestServer) * .80));
		targetServer.push(ns.getServerMinSecurityLevel(bestServer) * 2);
	}

	return targetServer;
}

export function calcBestRam(ns) {
	let ramList = [];
	let affordableRamList = [];
	let i = 2;

	while (ramList.length < 20) {
		let result = Math.pow(2, i);
		ramList.push(result);
		i++;
	}

	ramList.forEach(ram => {
		if ((25 * ns.getPurchasedServerCost(ram)) <= ns.getServerMoneyAvailable('home')) {
			affordableRamList.push(ram);
		}
	})

	const bestRam = ramList[affordableRamList.length - 1];

	return bestRam;
}

export function deletePurchasedServers(ns) {
	const pservers = ns.getPurchasedServers();
	
	pservers.forEach(server => {
		ns.killall(server);
		ns.deleteServer(server);
	});
}