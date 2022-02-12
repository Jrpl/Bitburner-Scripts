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