/** @param {NS} ns **/
const calcReturn = ({ level, ram, cores }) => {
  return level * 1.6 * Math.pow(1.035, ram - 1) * (cores + 5) / 6
}

const levelRoI = (ns, { level, ram, cores }, index) => {
    const oldRet = calcReturn({ level, ram, cores })
    const newRet = calcReturn({ level: level + 1, ram, cores })

    return (newRet - oldRet) / ns.hacknet.getLevelUpgradeCost(index, 1)
}

const ramRoI = (ns, { level, ram, cores }, index) => {
    const oldRet = calcReturn({ level, ram, cores })
    const newRet = calcReturn({ level, ram: ram * 2, cores })

    return (newRet - oldRet) / ns.hacknet.getRamUpgradeCost(index, 1)
}

const coreRoI = (ns, { level, ram, cores }, index) => {
    const oldRet = calcReturn({ level, ram, cores })
    const newRet = calcReturn({ level , ram, cores: cores + 1 })

    return (newRet - oldRet) / ns.hacknet.getCoreUpgradeCost(index, 1)
}

export async function main(ns, pct = ns.args[0], maxNodes = ns.args[1]) {
    const typeMap = [
      { desc: 'Level', cost: ns.hacknet.getLevelUpgradeCost, upgrade: ns.hacknet.upgradeLevel },
      { desc: 'RAM', cost: ns.hacknet.getRamUpgradeCost, upgrade: ns.hacknet.upgradeRam },
      { desc: 'Cores', cost: ns.hacknet.getCoreUpgradeCost, upgrade: ns.hacknet.upgradeCore }
    ]

    while (true) {
        const allowance = ns.getServerMoneyAvailable('home') * (pct / 100)

        if (ns.hacknet.getPurchaseNodeCost() < allowance && ns.hacknet.numNodes() < maxNodes) {
            ns.print('Purchasing new node')
            ns.hacknet.purchaseNode()
            continue
        }
 
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            const node = ns.hacknet.getNodeStats(i)
            const RoI = [
                node.level < 200 ? levelRoI(ns, node, i) : 0,
                node.ram < 64 ? ramRoI(ns, node, i) : 0,
                node.cores < 16 ? coreRoI(ns, node, i) : 0
            ]
            const topRoI = Math.max(...RoI)
            const { desc, cost, upgrade } = typeMap[RoI.indexOf(topRoI)]
 
            if (i === maxNodes - 1 && topRoI === 0) {
                ns.print('Desired number of nodes reached and upgraded')
                ns.scriptKill(ns.getScriptName(), ns.getHostname())
            } else if (topRoI === 0) {
                ns.print('All upgrades maxed on node ' + i)
            } else if (cost(i, 1) < allowance) {
                ns.print('Upgrading ' + desc + ' on Node ' + i)
                upgrade(i, 1)
            }
        }
 
        await ns.sleep(1)
    }
}
