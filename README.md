# Bitburner-Scripts
A collection of scripts written for the game [Bitburner](https://store.steampowered.com/app/1812820/Bitburner/).\
Listed below is the name of each available script and a short description of what it does.\
__Note that all of the scripts listed require that you are using [ns2](https://bitburner.readthedocs.io/en/latest/netscript/netscriptjs.html) instead of [ns1](https://bitburner.readthedocs.io/en/latest/netscript/netscript1.html)__

## hacknet-upgrades.js
___Credit to [u/boz987](https://www.reddit.com/r/Bitburner/comments/71sxly/hacknet_nodes_script_optimalish_calcs/) on Reddit for return on investment math___\
Automatically purchases hacknet servers and upgrades based on a percentage of your current money.\
Takes a single argument `pct` which is the percentage of your money that you would like to spend.\
`pct` is of type integer. The percentage is automatically converted to a decimal for the calculations.\
The script will calculate whether or not buying a server or purchasing an upgrade has a better return on investment.\
If purchasing an upgrade is better, it will then determine which type of upgrade is best for each server and purchase upgrades accordingly.

## buy-servers.js
___Requires `utils.js` to run___\
Automatically purchases 25 servers with the highest amount of RAM possible given the player's current money.\
__Deletes any existing purchased servers at the start__\
All purchased servers follow the same naming format of `pserv + index` so servers will be labeled starting with `pserv-0` through `pserv-24`

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

## startup-hacks.js
___Has been replaced by `hack-manager.js`___\
___Requires `utils.js` to run___\
Scans all available servers in the current bitnode.\
Finds a target server with the highest maximum money.\
Copies `template-hack.js` to all servers (excluding `home`).\
Executes `template-hack.js` on all servers with the following arguments:
- `target`: The server returned from `findTargetServer()`
- `moneyThresh`: 80% of the target server's maximum money
- `securityThresh`: 2x the target server's minimum security level

Keeps 26.4 GB of RAM free on the `home` server.

## template-hack.js
___Can be used on its own given you provide the required arguments when running___\
Continuously hacks, grows, and weakens a server.\
Takes three arguments:
- `target`: The name of the server to hack.
- `moneyThresh`: The minimum amount of money required on the server before hacking.
- `securityThresh`: The minimum amount of security level required on the server before hacking.

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

### findTargetServer
___Will be moved out of `utils.js` and into `startup-hacks.js`___\
___Used in `startup-hacks.js` which has been replaced by `hack-manager.js`___\
Loops through all hackable servers and finds the one with the highest max money.\
Takes two arguments:
- `ns`: The Netscript package.
- `serverList`: Array of servers.

Since `multiscan` returns an array of servers you can assign the result of `multiscan()` to a variable and pass it into the `serverList` argument.

### calcBestRam
___Will possibly be moved out of `utils.js` since it is currently only used in `buy-servers.js`___\
Calculates the highest amount of RAM you can purchase for 25 servers given the players current money.\
Takes one argument:
- `ns`: The Netscript package.

### deletePurchasedServers
___Will possibly be move out of `utils.js` since it is currently only used in `buy-servers.js`___\
Loops through existing purchased servers, kills any active scripts, and then deletes the server.\
Takes one argument:
- `ns`: The Netscript package.
