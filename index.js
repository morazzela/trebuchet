const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv')
const { ethers } = require('ethers')
const BN = require('bignumber.js')

dotenv.config()

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
})

const fortDecimals = new BN(10).pow(9)

const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
const sale = new ethers.Contract('0xaAF9a29c6BEAa9E3E4715c4698Be8830226454Fa', require('./abis/sale.json'), provider)

client.login(process.env.APP_TOKEN)

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
  const channel = message.channelId
  const content = message.content

  if (content.substr(0, 1) != '!') {
    return
  }

  const command = content.substr(1)

  if (command == 'sale') {
    sendSaleInformations(channel)
  }
});

async function sendSaleInformations (channelId) {
  let sold = await sale.sold()
  sold = new BN(sold.toString())
  let max = await sale.MAX_SOLD()
  max = new BN(max.toString())

  sold = Math.round(sold.div(fortDecimals).toNumber() * 100) / 100
  max = Math.round(max.div(fortDecimals).toNumber() * 100) / 100

  const message = `${sold} / ${max} FORT (${Math.round((sold / max * 100))}%)`

  client.channels.cache.find(chan => chan.id == channelId).send(message)
}
