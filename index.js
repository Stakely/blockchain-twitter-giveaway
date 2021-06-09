const path = require('path')
require('dotenv').config({ path: path.join(__dirname, './.env') })
const fetch = require('node-fetch')
const crypto = require('crypto')

const selectWinners = async () => {
  // First parameter: Twitter post url
  const tweetUrl = process.argv[2]
  // Second parameter: Ethereum block height
  const blockHeight = process.argv[3]

  if (!tweetUrl || !blockHeight) {
    console.log('Missing parameters, please inlcude the Tweet URL and the block height')
    return
  }

  // Extract the Tweet ID and the user name from the Tweet URL
  const tweetId = tweetUrl.match(/status\/(\d+)/)[1]
  const giveawayAccount = tweetUrl.match(/.*\/(\S+)\/status\//)[1]

  // Get all the Twitter user IDs that retweeted the post
  const userIds = await getUsersRetweets(giveawayAccount, tweetId)
  // Get the hash of the specified Ethereum block
  const blockHash = await getBlockHashByHeight(blockHeight)

  const results = []
  for (const userId of userIds) {
    // The hash is calculated as a SHA256 hash between the block hash and the Twitter user ID
    const userBlockHash = crypto.createHash('sha256').update(blockHash + userId).digest('hex')
    // Save the pair Twitter user id and the previous hash
    results.push({
      userId: userId,
      userBlockHash: userBlockHash
    })
  }

  // Sort the hashes from low to high
  const sortedResults = results.sort((a, b) => (a.userBlockHash > b.userBlockHash) ? 1 : -1)

  // Select the first 5 users as winners. If the giveaway had less winners, select the top n
  // A manual filter must be applied to check that the users fulfill the requeirments
  for (let i = 0; i < 5; i++) {
    const winner = await getUserProfile(sortedResults[i].userId)
    console.log('WINNER ' + (i + 1) + 'º: https://twitter.com/' + winner)
  }
}

// Gets the Ethereum block hash by a specified block height
const getBlockHashByHeight = async (height) => {
  let blockData = await fetch(process.env.ETHEREUM_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [
        '0x' + height.toString(16),
        false
      ],
      id: 1
    })
  })
  blockData = await blockData.json()

  console.log('> Block hash', blockData.result.hash)
  return blockData.result.hash
}

// Gets the Twitter user IDs that retweeted the giveaway tweet
// This function requires the Premium API Sandbox subscription, which is free
// https://developer.twitter.com/en/account/subscriptions/search-30day
const getUsersRetweets = async (giveawayAccount, tweetId) => {
  const userIds = []

  let nextPage
  while (true) {
    console.log('> Searching tweets')
    let body
    if (nextPage) {
      body = { query: 'retweets_of:' + giveawayAccount, next: nextPage }
    } else {
      body = { query: 'retweets_of:' + giveawayAccount }
    }

    let twitterData = await fetch('https://api.twitter.com/1.1/tweets/search/30day/dev.json', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.TWITTER_BEARER_TOKEN
      },
      body: JSON.stringify(body)
    })
    twitterData = await twitterData.json()

    for (const retweetData of twitterData.results) {
      if (retweetData.retweeted_status.id_str === tweetId) {
        userIds.push(retweetData.user.id_str)
      }
    }
    nextPage = twitterData.next
    if (!nextPage) break
  }

  console.log('> Total retweets', userIds.length)
  return userIds
}

// Gets the Twitter username from a Twitter user ID
// Uses the normal Twitter v2 API
const getUserProfile = async (userId) => {
  let twitterData = await fetch('https://api.twitter.com/2/users/' + userId, {
    headers: {
      Authorization: 'Bearer ' + process.env.TWITTER_BEARER_TOKEN
    }
  })
  twitterData = await twitterData.json()

  return twitterData.data.username
}

selectWinners()
