# Bitburner-Scripts
A collection of scripts written for the game [Bitburner](https://store.steampowered.com/app/1812820/Bitburner/).\
Listed below is the name of each available script and a short description of what it does.\
__Note that all of the scripts listed require that you are using [ns2](https://bitburner.readthedocs.io/en/latest/netscript/netscriptjs.html) instead of [ns1](https://bitburner.readthedocs.io/en/latest/netscript/netscript1.html)__

## hacknet-upgrades.js
___Credit to [u/boz987](https://www.reddit.com/r/Bitburner/comments/71sxly/hacknet_nodes_script_optimalish_calcs/) on Reddit for return on investment math___\
Purchases the number of requested hacknet nodes and upgrades based on a percentage of your current money.\
The script will calculate whether or not buying a server or purchasing an upgrade has a better return on investment.\
If purchasing an upgrade is better, it will then determine which type of upgrade is best for each server and purchase upgrades accordingly.\
Takes two arguments:
- `pct`: The percentage of your money you want to use as a threshold for buying nodes and upgrades. The percentage is converted to a decimal for the calculations. There are currently no checks in place to see if you are outside the bounds of what is feasible so passing in zero, a negative number, or a number greater than 100, will result in the script not working as intended.
- `maxNodes`: The maximum number of nodes you want to purchase and upgrade.

## buy-servers.js
Purchases the number of servers passed in.\
The RAM purchased for each server is calculated based on the number of servers requested and will be the highest amount you can currently afford.\
Therefore requesting a lower amount of servers will yield more RAM per server, whereas requesting a higher amount of servers will yield less RAM per server.\
If the number of servers you request is more than the number of server slots available, it will ask to delete old servers with the smallest RAM until enough slots are open to create the requested number of servers. Clicking __No__ on this prompt will kill the script.\
If the existing servers are already at the maximum RAM capacity or have more RAM than what will be created, it will not delete them.\
Any number of servers requested after the maximum number of servers has been reached with the maximum storage, will not be created or deleted.\
All purchased servers follow the same naming format of `pserv + index` so servers will be labeled starting with `pserv-0` through `pserv-24`\
Takes one argument:
- `numServers`: The number of servers you would like to purchase.

## hack-manager.js
___Requires `targeted-hack.js`, `targeted-grow.js`, `targeted-weaken.js`, and `utils.js` to run___\
Targets server with the most money that is possible for the player to hack and then continually executes `targeted-hack.js`, `targeted-grow.js`, and `targeted-weaken.js` scripts on that target.\
It is timed so that the hack, grow, and weaken for each cycle finish in order, so as to maintain optimal security level and money amount on the server.\
Part of maintaining this synchrony is only executing this targeted script cycle for the duration of how long the time to hack is.\
Any longer and hacks will initiate after the first hack finishes but before the weaken, increasing the hack time to take longer than accounted for in the initial delay.

## targeted-hack.js
Targets a specific server to hack after an initial delay decided by `hack-manager.js`.\
Takes three arguments:
- `threads`: number of threads to use on hack, calculated to take half of a servers money
- `hack_delay`: time to sleep before initiating hack
- `target`: the server to target for the hack

## targeted-grow.js
Targets a specific server to grow after an initial delay decided by `hack-manager.js`.\
Takes three arguments:
- `threads`: number of threads to use on grow, calculated to double the servers money
- `grow_delay`: time to sleep before initiating grow
- `target`: the server to target for the grow

## targeted-weaken.js
Targets a specific server to weaken decided by `hack-manager.js`.\
Takes two arguments:
- `threads`: number of threads to use on weaken, calculated to decrease security by the amount of increase from `targeted-hack.js`, and `targeted-grow.js`
- `target`: the server to target for the weaken

## utils.js
Contains various utility functions used throughout the other scripts.

### multiscan
A recursive function which finds all available servers starting from the server passed in.\
Takes two arguments:
- `ns`: The Netscript package.
- `server`: Name of the server you want to start from when scanning.

If `home` is passed as the value for `server`, then it will return all available servers in the current bitnode.

### gainRootAccess
Attempts to gain root access of the server passed in.\
Takes two arguments:
- `ns`: The Netscript package.
- `server`: Name of the server you want to attempt to gain root access to.

It will attempt to open as many ports as possible on the server before nuking.\
If the player does not have enough files to open the required number of ports by the end of the function, it does not attempt to nuke.