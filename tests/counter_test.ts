
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "get-count returns u0 for principals that never called count-up before",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // get the deployer account
        let deployer = accounts.get("deployer")!;

        // fn(contract_name, fn_name, [fn_args], tx-sender)
        let count = chain.callReadOnlyFn('counter', 'get-count', [types.principal(deployer.address)], deployer.address);

        // assert that return res is a uint with a value of 0
        count.result.expectUint(0);
    }
});

Clarinet.test({
    name: "count-up counts up for the tx-sender",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // get the deployer account
        let deployer = accounts.get('deployer')!;

        // mine a block with one transaction
        let block = chain.mineBlock([
            Tx.contractCall('counter', 'count-up', [], deployer.address)
        ])

        // get the first (and only) tx receipt
        let [receipt] = block.receipts;

        // assert that the returned result is a bool true
        receipt.result.expectOk().expectBool(true);

        // get the counter value.
        let count = chain.callReadOnlyFn('counter', 'get-count', [types.principal(deployer.address)], deployer.address);

        count.result.expectUint(1);
    }
});


Clarinet.test({
    name: 'counters are specific to the tx-sender',
    async fn(chain: Chain, accounts: Map<string, Account>){
        // get some accounts
        let deployer = accounts.get('deployer')!;
        let wallet1 = accounts.get('wallet_1')!;
        let wallet2 = accounts.get('wallet_2')!;

        // Mine a few contract calls to count-up
        let block = chain.mineBlock([
            // the deployer calls count-up 0 times

            // wallet 1 calls count-up 1 time
            Tx.contractCall('counter', 'count-up', [], wallet1.address),

            // wallet 2 calls count-up 2 time
            Tx.contractCall('counter', 'count-up', [], wallet2.address),
            Tx.contractCall('counter', 'count-up', [], wallet2.address),
        ]);

        // get and assert the counter value for deployer.
        let deployerCount = chain.callReadOnlyFn('counter', 'get-count', [types.principal(deployer.address)], deployer.address)
        deployerCount.result.expectUint(0);


        let wallet1Count = chain.callReadOnlyFn('counter', 'get-count', [types.principal(wallet1.address)], wallet1.address)
        wallet1Count.result.expectUint(1);

        let wallet2Count = chain.callReadOnlyFn('counter', 'get-count', [types.principal(wallet2.address)], wallet2.address)
        wallet2Count.result.expectUint(2);


    }
})