const ProxyChain = require('proxy-chain');



function startServer({
    email = "cesar.a.cavalcanti@gmail.com",
    port = 5200,
    megabytes = 100,
    internalProxy = "192.168.15.36:6001",
    userUsername = "user3012",
    userPassword = "password3012"

}) {

    let bandwidthUsedByClosedConnectionsInBytes = 0;
    let bandWidthUsedByActiveConnectionsInBytes = 0;

    let bandwidthLimitInMegabytes = megabytes;
    let bandwidthLimitInBytes = bandwidthLimitInMegabytes * Math.pow(1024, 2);


    const server = new ProxyChain.Server({
        port,
        host: '0.0.0.0',
        verbose: false,
        prepareRequestFunction: ({ request, username, password, hostname, port, isHttp, connectionId }) => {
            if (bandwidthUsedByClosedConnectionsInBytes + bandWidthUsedByActiveConnectionsInBytes >= bandwidthLimitInBytes) {
                server.closeConnections();
                throw new ProxyChain.RequestError('Quota exceeded!', 200);
            }
            return {
                requestAuthentication: username !== userUsername || password !== userPassword,
                upstreamProxyUrl: `http://rapz:senha123@${internalProxy}`,
                failMsg: 'Bad username or password, please try again.',
                customTag: { email },
            };
        },
    });

    server.listen(() => {
        console.log(`Proxy server is listening on port ${server.port}`);
    });

    server.on('connectionClosed', ({ connectionId, stats }) => {
        let targetTxBytes = stats?.trgTxBytes || 0;
        let targetRxBytes = stats?.trgRxBytes || 0;
        bandwidthUsedByClosedConnectionsInBytes += targetTxBytes + targetRxBytes;
    });


    server.on('requestFailed', ({ request, error }) => {
        console.error(error);
    });



    function checkBytesUsed() {
        let ids = server.getConnectionIds();

        let connectionsStats = ids.map(e => server.getConnectionStats(e));
        let inUseConnectionsInBytes = connectionsStats.map(stats => [stats?.trgTxBytes || 0 + stats?.trgRxBytes || 0].flat()).flat().reduce((a, b) => a + b, 0);
        bandWidthUsedByActiveConnectionsInBytes = inUseConnectionsInBytes;

        let userUsedBytes = bandwidthUsedByClosedConnectionsInBytes + bandWidthUsedByActiveConnectionsInBytes;

        console.log((userUsedBytes / Math.pow(1024, 2)).toFixed(1) + "MB / " + bandwidthLimitInMegabytes + "MB", ` (${((userUsedBytes / Math.pow(1024, 2) / bandwidthLimitInMegabytes * 100) || 0).toFixed(1)}%)`);
    }

    let intervalUpdateStuff = setInterval(() => {
        checkBytesUsed()
    }, 3000)
}


startServer({
    email: "cesar.a.cavalcanti@gmail.com",
    port: 5200,
    megabytes: 1000,
    internalProxy: "192.168.15.36:6001",
    userUsername: "user3012",
    userPassword: "password3012"
});