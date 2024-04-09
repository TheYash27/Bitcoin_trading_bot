require('dotenv').config();

const ccxt = require('ccxt');

const binance = new ccxt.binance({
    APIKey: process.env.BINANCE_API_KEY,
    APISecret: process.env.BINANCE_API_SECRET
});

const coinbasepro = new ccxt.coinbasepro({
    APIKey: process.env.COINBASE_PRO_API_KEY,
    APISecret: process.env.COINBASE_PRO_API_SECRET
});

const symbol = "BTC/USD";
const type = "limit";
const tradeAmount = "0.01";
const profitThreshold = 20; //USD

const checkArbitrageOpportunity = async () => {
    const binanceOrderBook = await binance.fetchOrderBook(symbol);
    console.log(binanceOrderBook);

    const coinbaseProOrderBook = await coinbasepro.fetchOrderBook(symbol);
    console.log(coinbaseProOrderBook);
    
    const binanceBestAsk = binanceOrderBook.asks[0][0];
    const binanceBestBid = binanceOrderBook.bids[0][0];
    const coinbaseProBestAsk = coinbaseProOrderBook.asks[0][0];
    const coinbaseProBestBid = coinbaseProOrderBook.bids[0][0];

    console.log("Lowest Ask Price on Binance is: ", binanceBestAsk);
    console.log("Highest Bid Price on Binance is: ", binanceBestBid);
    console.log("Lowest Ask Price on Coinbase Pro is: ", coinbaseProBestAsk);
    console.log("Highest Bid Price on Coinbase Pro is: ", coinbaseProBestBid);

    if ((binanceBestBid - coinbaseProBestAsk) >= profitThreshold) {
        console.log(`Congratulations! Arbitrage opportunity found to buy at ${coinbaseProBestAsk} and sell at ${binanceBestBid}!`);
        try {
            const buyOrderOnCoinbasePro = await coinbasepro.createOrder(symbol, type, "buy", tradeAmount, coinbaseProBestAsk);
            const sellOrderOnBinance = await binance.createOrder(symbol, type, "sell", tradeAmount, binanceBestBid);
        } catch (er) {
            console.error(er);
        }
    } else if ((coinbaseProBestBid - binanceBestAsk) >= profitThreshold) {
        console.log(`Congratulations! Arbitrage opportunity found to buy at ${binanceBestAsk} and sell at ${coinbaseProBestBid}!`);
        try {
            const buyOrderOnBinance = await binance.createOrder(symbol, type, "buy", tradeAmount, binanceBestAsk);
            const sellOrderOnCoinbasePro = await coinbasepro.createOrder(symbol, type, "sell", tradeAmount, coinbaseProBestBid);
        } catch (er) {
            console.error(er);
        }
    }
}