require('dotenv').config({path: '../.env'})

const axios = require('axios')
const coinspot = require('./coinspot')
const readline = require("readline")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const url = process.env.API_URL
const key = process.env.API_KEY
const secret = process.env.API_SECRET

const client = new coinspot(key, secret)

interface Balance {
    aud: number | null,
    coin?: number | null
}

let myAUD: Balance = { aud: null }
let myBTC: Balance = { aud: null }

// GET latest prices
function getLatest() {
    return new Promise(function(resolve, reject) {
        axios.get(url + '/pubapi/v2/latest')
            .then((res: any) => {
                resolve(res.data)
            })
            .catch((e: any) => {
                reject(`Error: ${e.message}`)
            })
    })
}

// GET my account balance
function getBalance() {
    return new Promise(function(resolve, reject) {
        client.balances((e: any, data: any) => {
            resolve(data)
        })
    })
}

// POST market buy order
function placeMarketBuy(coin: string, amount: number, rate: number) {
    return new Promise(function(resolve, reject) {
        client.marketbuy(coin, amount, rate, (e: any, data: any) => {
            console.log(data)
            resolve(data)
        })
    })
}

// POST buy now order
function placeBuyNow(coin: string, amountType: string, amount: number) {
    return new Promise(function(resolve, reject) {
        client.buynow(coin, amountType, amount, (e: any, data: any) => {
            console.log(data)
            resolve(data)
        })
    })
}

function buyNowPrompt(): void {
    let cointype: string
    let amount: number

    rl.question('Coin: ', (coin: string) => {
        cointype = coin.trim().toUpperCase()
        
        rl.question('Amount (AUD): $', (amt: string) => {
            amount = parseFloat(amt)
            placeBuyNow(cointype, 'aud', amount)
            rl.close()
        })
    })
}

function marketBuyPrompt(): void {
    let cointype: string
    let amount: number
    let rate: number

    rl.question('Coin: ', (coin: string) => {
        cointype = coin.trim().toUpperCase()
        
        rl.question('Amount (AUD): $', (amt: string) => {
            amount = parseFloat(amt)

            rl.question('Rate: ', (r: string) => {
                rate = parseFloat(r)
                placeMarketBuy(cointype, amount, rate)
                rl.close()
            })
        })
    })
}

async function main() {
    let latest = await getLatest()
    let balance: any = await getBalance()

    console.log(latest, '\n')

    let account = JSON.parse(balance)

    account.balances.forEach((balance: any) => {
        if (balance['AUD']) {
            myAUD.aud = balance['AUD']['audbalance']
        }

        if (balance['BTC']) {
            myBTC.aud = balance['BTC']['audbalance']
            myBTC.coin = balance['BTC']['balance']
        }
    });

    console.log('MY BALANCE:')
    console.log('AUD', myAUD)
    console.log('BTC', myBTC, '\n')

    console.log('OPTIONS:')
    console.log('1. PLACE BUY NOW')
    console.log('2. PLACE MARKET BUY', '\n')

    rl.question('Select option: ', (answer: string) => {
        switch(answer) {
            case '1':
                buyNowPrompt()
                break
            case '2':
                marketBuyPrompt()
                break
            default:
                rl.close()
        }
    })
}

main()