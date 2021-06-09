# Blockchain Twitter Giveaway by Stakely.io
Fair and transparent Twitter Giveaways by using the Ethereum blockchain.

This code extracts a list of winners that retweeted a specified tweet.
The winners are selected by creating a hash between the Twitter IDs of the users that participated with a retweet and the hash of a specified Ethereum block, sorted by the resulted hash value from low to high.

This code was developed by Stakely.io to organize fair and transparent Twitter giveaways for our staking community.

# Usage
## Dependencies
Node.js 12 or higher is required: https://nodejs.org/en/download/

Clone this repository
```
git clone https://github.com/iicc1/blockchain-twitter-giveaway
```

Enter into the downloaded folder
```
cd blockchain-twitter-giveaway
```

Install the Node.js dependencies
```
npm install
```

## Configurations
Create a `.env` file with the mandatory environment variables.
You can use the file `env.example` as an example.

To use this code you need a Twitter developer account and activate the premium sandbox features. Don't worry, these features are free for non-intensive uses like this one.

Register your account here: https://developer.twitter.com/en/portal/dashboard and create a premium sandbox environment with `dev` as the label.

# Run
Run the giveaway by setting a tweet URL and an Ethereum hash.

The giveaway results are deterministic: winners will always be the same if the same inputs are introduced.
```
node index.js TWEET_URL BLOCK_HEIGHT
```
The program will show five winners. You are supposed to adapt this list to the total number of winners of your specific giveaway, by choosing the winners in order.

The winner list must be filtered manually to match only valid users and kick bot/cheaters.
