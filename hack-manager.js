/** @param {NS} ns **/
import { multiscan, gainRootAccess } from "utils.js";

function maxElement(arr) {
	let max = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] > max) {
			max = arr[i]
		}
	}

	let maxE = arr.indexOf(max);
	return maxE
}

export function best_target(ns, arr) {
	let list = [];
	let results = [];
	arr.forEach(server => {
		if (!ns.hasRootAccess(server)) {
			gainRootAccess(ns, server);
		}

		if (ns.hasRootAccess(server) && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && server != 'home' && !ns.getPurchasedServers().includes(server)) {
			list.push(server);
		}
	})

	let i = 0;
	list.forEach(target => {
		results[i] = ns.getServerMaxMoney(target);
		i++;
	})

	return list[maxElement(results)];
}

export async function main(ns) {
	while (true) {
		let full_list = multiscan(ns, 'home');

		// finds most profitable server to target
		const hack_target = best_target(ns, full_list);

		// determines threads needed for grow hack and weaken to maintain optimal profit
		const grow_threads = ns.growthAnalyze(hack_target, 2);
		const hack_threads = ns.hackAnalyzeThreads(hack_target, ns.getServerMoneyAvailable(hack_target) / 2);
		const sec_increase = ns.hackAnalyzeSecurity(hack_threads) + ns.growthAnalyzeSecurity(grow_threads);
		let weaken_threads = 1;
		while (ns.weakenAnalyze(weaken_threads) < sec_increase * 1.1) {
			weaken_threads++;
		}

		// determines needed RAM for a cycle of grow weaken hack with determined threads
		const needed_ram = (grow_threads * ns.getScriptRam('targeted-grow.js', 'home') + hack_threads * ns.getScriptRam('targeted-hack.js', 'home') + weaken_threads * ns.getScriptRam('targeted-weaken.js', 'home'));

		// goes through Purchased servers and creates list of servers with enough RAM to utilize 
		// note only Purchased servers are going to reliably have enough RAM
		let purchased_servers = ns.getPurchasedServers();
		let host_servers = [];

		purchased_servers.forEach(server => {
			if (ns.getServerMaxRam(server) >= needed_ram) {
				host_servers.push(server);
			}
		})

		if (ns.getServerMaxRam('home') >= needed_ram) {
			host_servers.push('home');
		}

		if (host_servers == 0) {
			ns.print('Not enough RAM for proper hack cycle current needed is ' + needed_ram);
			return 0
		}

		// prepares target to be hacked uses home to weaken and grow server to required initial conditions
		const initial_growth_amount = .5 * ns.getServerMaxMoney(hack_target) / ns.getServerMoneyAvailable(hack_target);
		let gt = 0;
		if (initial_growth_amount > 1) {
			gt = ns.growthAnalyze(hack_target, initial_growth_amount);
		}

		let wt = 0;
		while (ns.weakenAnalyze(wt) < ns.getServerSecurityLevel(hack_target) + ns.growthAnalyzeSecurity(gt) - ns.getServerMinSecurityLevel(hack_target)) {
			wt++;
		}
		if (wt == 0) {
			wt = 1;
		}

		ns.print(wt + ' ' + gt);

		let prep = 1;
		const prep_RAM = ns.getScriptRam('targeted-grow.js', 'home') * gt + ns.getScriptRam('targeted-weaken.js', 'home') * wt;
		const prep_server = host_servers.find(server => ns.getServerMaxRam(server) - ns.getServerUsedRam(server) >= prep_RAM);
		if (prep_server == null) {
			prep = 0;
		}
		ns.print(prep_server + ' ' + prep);

		if (gt > 1 && prep) {
			ns.exec('targeted-grow.js', prep_server, gt, gt, 0, hack_target);
			ns.exec('targeted-weaken.js', prep_server, wt, wt, hack_target);
			await ns.sleep(ns.getWeakenTime(hack_target) + 1000);
		}

		else if (ns.getServerSecurityLevel(hack_target) > ns.getServerMinSecurityLevel(hack_target) * 1.5 && prep) {
			ns.exec('targeted-weaken.js', prep_server, wt, wt, hack_target);
			await ns.sleep(ns.getWeakenTime(hack_target) + 1000);
		}


		// sets a variable to keep track of time taken executing hacks in the loop
		// if a hack were initiated later than the reset time the first hack would complete changing hack times for every hack following it throwing off the sync
		// most of the time execution time doesn't take that long but this safeguards overly draining a target through desync
		let initial_time = Date.now();
		let k = 0;

		for (let i = 0; i < host_servers.length; i++) {

			let weaken_time = ns.getWeakenTime(hack_target);
			let grow_time = ns.getGrowTime(hack_target);
			let hack_time = ns.getHackTime(hack_target);
			let grow_delay = weaken_time - grow_time - 2;
			let hack_delay = weaken_time - hack_time - 1;

			// assigns a server from the host server list and determines amount of cycles possible
			let server = host_servers[i]
			let n = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / needed_ram);

			// writes needed scripts to host server
			await ns.scp('targeted-grow.js', server);
			await ns.scp('targeted-hack.js', server);
			await ns.scp('targeted-weaken.js', server);

			// loops through a cycle of grow weaken and hack executions on the target
			// each script will complete in order of grow hack weaken 2 milliseconds apart
			while (n > 0) {
				if (Date.now() >= initial_time + ns.getHackTime(hack_target)) {
					while (ns.getServerMaxRam(host_servers[k]) - ns.getServerUsedRam(host_servers[k]) < ns.getScriptRam('targeted-weaken', 'home') * weaken_threads) {
						k++;
						if (k == host_servers.length) {
							k = 0;
							await ns.sleep(10000);
						}
					}
					ns.exec('targeted-weaken.js', host_servers[k], weaken_threads, weaken_threads, hack_target);
					await ns.sleep(weaken_time + 20);
					i = 0;
					initial_time = Date.now();
					break
				}

				ns.exec('targeted-weaken.js', server, weaken_threads, weaken_threads, hack_target, n);
				ns.exec('targeted-grow.js', server, grow_threads, grow_threads, grow_delay, hack_target, n);
				ns.exec('targeted-hack.js', server, hack_threads, hack_threads, hack_delay, hack_target, n);
				await ns.sleep(3);

				n--;
			}

			await ns.sleep(5);
		}

		await ns.sleep(10);
	}
}
