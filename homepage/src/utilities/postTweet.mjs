import OAuth from 'oauth-1.0a';
import { createHmac } from 'crypto';
import * as env from 'dotenv';
import getPRContents from './pullRequestDiff.mjs';
import tweet from './tweet.json' assert { type: 'json' };
env.config();



const getTweetText = async () => {
    const prContents = await getPRContents();
    if (prContents.numberOFProjects == 0) return "";
    console.log(prContents);
    const devsNames = prContents.dev.flatMap(dev => dev.githubURL.split('/').pop());
    const tweetText = tweet.text
        .replace('اسم_المبرمج', prContents.dev.flatMap(dev => dev.name).join(' و '))
        .replace('عدد_المشاريع', prContents.numberOFProjects)
        + `https://saudiopensourcecommunity.github.io/SaudiOSS/?search=${devsNames.join(',')}#developers`;
    return tweetText;
}

const sendTweet = async (tweetText) => {
    const myHeaders = new Headers();
    const oauth = OAuth({
        consumer: {
            key: process.env.TWITTER_API_KEY,
            secret: process.env.TWITTER_API_SECRET,
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
            return createHmac('sha1', key).update(base_string).digest('base64');
        },
    });

    const token = {
        key: process.env.TWITTER_ACCESS_TOKEN,
        secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };

    const url = 'https://api.twitter.com/2/tweets';


    const data = {
        text: tweetText,
    };

    const authorization = oauth.toHeader(oauth.authorize({
        url,
        method: 'POST',
    }, token));


    myHeaders.append('Authorization', authorization.Authorization);
    myHeaders.append('Content-Type', 'application/json');


    fetch(url, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        })
}

getTweetText()
    .then(tweetText => {
        if (tweetText.length > 0) {
            sendTweet(tweetText);
        }
        else {
            console.log('No new projects to tweet about');
        }
    }
    )
