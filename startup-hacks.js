/** @param {NS} ns **/
import { gainRootAccess, multiscan, findTargetServer } from "utils.js";

async function startHack(ns, props) {
		gainRootAccess(ns, props.target);
		if (props.host === 'home') {
			let threads = Math.floor(ns.getServerMaxRam(props.host) / ns.getScriptRam('template-hack.js', props.host));
			ns.exec('template-hack.js', props.host, threads - 12, props.target, props.moneyThresh, props.securityThresh);
			return;
		}

		if (ns.getServerMaxRam(props.host) < ns.getScriptRam('template-hack.js', 'home')) {
			return;
		}

		if (!ns.hasRootAccess(props.host)) {
			gainRootAccess(ns, props.host);
		}

		await ns.scp('template-hack.js', 'home', props.host);
		let threads = Math.floor(ns.getServerMaxRam(props.host) / ns.getScriptRam('template-hack.js', props.host));
		ns.exec('template-hack.js', props.host, threads, props.target, props.moneyThresh, props.securityThresh);
		ns.print('Starting hack on server: ' + props.host);
		ns.print('Targeting server: ' + props.target);
	}

export async function main(ns) {
	const serverList = multiscan(ns, 'home');
	const target = findTargetServer(ns, serverList);
	let props = {
		'host': '',
		'target': target[0],
		'moneyThresh': target[1],
		'securityThresh': target[2]
	};
	for (let i = 0; i < serverList.length; i++) {
		props.host = serverList[i];
		await startHack(ns, props);
	}
}