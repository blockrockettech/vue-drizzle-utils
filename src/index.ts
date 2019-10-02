/**
 * The package is aiming to add a drizzle interface unless one already exists as there is no typechecking on this
 */
import _ from 'lodash';
import { getNetwork } from '@blockrocket/utils';

function amountValid(amount: string): boolean {
    return amount !== '' && amount !== 'loading' && !isNaN(Number(amount));
}

function networkVersion(drizzleInstance: any) {
    if (drizzleInstance) {
        const {currentProvider} = drizzleInstance.web3;
        if (currentProvider && currentProvider.networkVersion) {
            return currentProvider.networkVersion;
        }
    }
    return 'unknown';
}

export function getNetworkName(drizzleInstance: any): string {
    return drizzleInstance ? getNetwork(networkVersion(drizzleInstance)) : 'unknown';
}

export function getEtherscanBaseUrl(drizzleInstance: any): string {
    const network = drizzleInstance ? getNetworkName(drizzleInstance) : '';
    return _.intersection([network], ['ropsten', 'rinkeby']).length > 0 ?
        `https://${network}.etherscan.io` : 'https://etherscan.io';
}

export function getContractAddressFromTruffleConf(drizzleInstance: any, truffleConf: any): string {
    if (drizzleInstance) {
        const currentNetworkVersion = Number(networkVersion(drizzleInstance));
        const {networks} = truffleConf;
        if (networks[currentNetworkVersion]) {
            const address = networks[currentNetworkVersion].address;
            return address ? address : '';
        }
    }
    return '';
}

export function getEventsByName(contractInstances: any, contractName: string, eventName: string): any[] {
    const allEvents = (contractInstances[contractName] ? contractInstances[contractName].events || [] : []);
    return allEvents.filter((event: any) => {
        return event.event === eventName;
    }).filter((event: any, index: number, self: any) => {
        // remove any duplicates
        return index == self.findIndex((obj: any) => {
            return JSON.stringify(obj) === JSON.stringify(event);
        });
    });
}

export function etherFromWei(drizzleInstance: any, wei: string, defaultTo?: number): number {
    if (drizzleInstance && amountValid(wei)) {
        const utils = drizzleInstance.web3.utils;
        return utils.fromWei(wei, 'ether');
    }

    return defaultTo ? defaultTo : 0;
}

export function weiFromEther(drizzleInstance: any, ether: string, defaultTo?: number): number {
    if (drizzleInstance && amountValid(ether)) {
        const utils = drizzleInstance.web3.utils;
        return utils.toWei(ether, 'ether');
    }
    return defaultTo ? defaultTo : 0;
}

export function addWeiToEther(drizzleInstance: any, wei: string, ether: string): number {
    if (drizzleInstance) {
        const etherConvertedToWei: number = weiFromEther(drizzleInstance, ether);
        const newTotalInWei: number = amountValid(wei) ? Number(etherConvertedToWei) + Number(wei) : etherConvertedToWei;
        return Number(etherFromWei(drizzleInstance, newTotalInWei.toString()));
    }
    return Number(ether);
}