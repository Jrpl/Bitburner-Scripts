/** @param {NS} ns **/
export async function main(ns) {
    while (true) {
        let myMoney = ns.getServerMoneyAvailable('home');
 
        function setAllowance(pct) {
            const allowance = myMoney * (pct / 100);
            return allowance;
        }

        if (ns.hacknet.getPurchaseNodeCost() < setAllowance(100)) {
            ns.print('Purchasing new node');
            ns.hacknet.purchaseNode();
            continue;
        }
 
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            let node = ns.hacknet.getNodeStats(i);
            let RoI = [];
            let topRoI = 0;
 
            if (node.level < 200) {
                RoI.push(((node.level + 1) * 1.6) * Math.pow(1.035, (node.ram - 1)) * ((node.cores + 5) / 6) / ns.hacknet.getLevelUpgradeCost(i, 1));
            } else {
                RoI.push(0);
            }
 
            if (node.ram < 64) {
                RoI.push((node.level * 1.6) * Math.pow(1.035, (node.ram * 2) - 1) * ((node.cores + 5) / 6) / ns.hacknet.getRamUpgradeCost(i, 1));
            } else {
                RoI.push(0);
            }
 
            if (node.cores < 16) {
                RoI.push((node.level * 1.6) * Math.pow(1.035, node.ram - 1) * ((node.cores + 6) / 6) / ns.hacknet.getCoreUpgradeCost(i, 1));
            } else {
                RoI.push(0);
            }
 
            RoI.forEach(value => {
                if (value > topRoI) {
                    topRoI = value;
                }
            });
 
            if (topRoI === 0) {
                ns.print("All upgrades maxed on node" + i);
            } else if (topRoI == RoI[0] && ns.hacknet.getLevelUpgradeCost(i, 1) < setAllowance(100)) {
                ns.print('Upgrading Level on Node' + i);
                ns.hacknet.upgradeLevel(i, 1);
            } else if (topRoI == RoI[1] && ns.hacknet.getRamUpgradeCost(i, 1) < setAllowance(100)) {
                ns.print('Upgrading Ram on Node' + i);
                ns.hacknet.upgradeRam(i, 1);
            } else if (topRoI == RoI[2] && ns.hacknet.getCoreUpgradeCost(i, 1) < setAllowance(100)) {
                ns.print('Upgrading Core on Node' + i);
                ns.hacknet.upgradeCore(i, 1);
            }
        }
 
        await ns.sleep(1000);
    }
}