import path from 'path';
import express from 'express';
import request from 'request';
import { RESOURCE_HOST, RESOURCE_PROTOCOL, API_TOKEN, IEXCLOUD_API_TOKEN } from '../config';

import render from '../../client';
// import manifest from '../../client/static/build/manifest.json';
import manifest from '../../client/static/build/manifest.json';

const client = require.resolve('../../client');

const router = express.Router();

// Bind /api/* to original API server
router.use('/api', (req, res) => {
  let reqUrl = req.originalUrl.replace(req.baseUrl,'');
  const boundPath = `${RESOURCE_PROTOCOL}://${RESOURCE_HOST}${reqUrl}`;
  console.log(boundPath);
// http://127.0.0.1:3000/api/v1/markets/history?symbol=AAPL&interval=daily

  req.headers ={
    "Accept":"application/json",
    "Authorization":`Bearer ${API_TOKEN}`
    }

  req.pipe(request(boundPath)).pipe(res);
});

router.use('/symbols', (req, res) => {
  let reqUrl = '/beta/ref-data/symbols?'
  const boundPath = `https://cloud.iexapis.com${reqUrl}&token=${IEXCLOUD_API_TOKEN}`;
  console.log(boundPath);
  //https://cloud.iexapis.com/beta/ref-data/symbols?token=YOUR_TOKEN_HERE
  req.pipe(request(boundPath)).pipe(res);
});

// Service worker
router.use('/sw.js', (_, res) => {
  res.sendFile(path.resolve(client, '../../static/build/sw.js'));
});

// Progressive web app
router.use('/manifest.json', ({ i18n }, res) => {
  res.json({
    name: i18n.t('meta.title', { defaultValue: 'Refined Stock Tracker' }),
    short_name: i18n.t('meta.title_short', { defaultValue: 'Rst' }),
    display: 'standalone',
    icons: [
      {
        src: '/android-chrome.png',
        size: '250x250',
        type: 'image/png',
      },
    ],
    start_url: '/activities',
    theme_color: '#F80652',
    background_color: '#C70542',
  });
});

// Server side rendering
router.use(async (req: any, res) => {
  const result = await render({
    manifest,
    i18n: req.i18n,
    location: req.url,
  });

  res.status(result.statusCode);
  res.send(`
  <!DOCTYPE html>\n
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous"> \n
  ${result.staticMarkup}
  `);
});

// router.use('/*', (_, res) => {
//   res.sendFile(path.resolve(staticDir, 'index.html'));
// });

export const routes = router;
