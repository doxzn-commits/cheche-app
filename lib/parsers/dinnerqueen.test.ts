import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isDinnerqueenCampaignUrl,
  parseDinnerqueenCampaign,
} from './dinnerqueen.js';

test('isDinnerqueenCampaignUrl accepts valid dinnerqueen campaign urls', () => {
  assert.equal(isDinnerqueenCampaignUrl('https://dinnerqueen.net/taste/1331045'), true);
  assert.equal(isDinnerqueenCampaignUrl('https://www.dinnerqueen.net/taste/1330799'), true);
  assert.equal(isDinnerqueenCampaignUrl('https://dinnerqueen.net/taste/1328525/'), true);
});

test('isDinnerqueenCampaignUrl rejects invalid urls', () => {
  assert.equal(isDinnerqueenCampaignUrl('https://dinnerqueen.net/taste/abc'), false);
  assert.equal(isDinnerqueenCampaignUrl('https://dinnerqueen.net/event/1331045'), false);
  assert.equal(isDinnerqueenCampaignUrl('https://realdinnerqueen.net/taste/1331045'), false);
});

test('parseDinnerqueenCampaign parses a visit blog campaign', () => {
  const html = `
    <html>
      <head>
        <title>Dinnerqueen - [Seoul Gangnam] Erba 23rd</title>
        <meta property="og:title" content="Dinnerqueen - [Seoul Gangnam] Erba 23rd" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>Apply</strong></h6>
            <h6><strong>Notice</strong></h6>
            <h6><strong>Review</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.27 - 26.05.05</strong></p>
            <p>26.05.06</p>
            <p>26.05.07 - 26.05.21</p>
          </div>
        </div>
        <div class="qz-collapse__content">
          <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">Meal voucher 60,000 KRW</strong></p>
          <div class="qz-wrap qz-container layer-primary-dq-o">
            <p class="qz-body-kr mb-qz-body2-kr color-title">Extra menu cost at your expense, 1 team of 2</p>
          </div>
        </div>
        <div class="qz-collapse__content">
          <p id="MainKeyword">Apgujeong restaurant, Sinsa restaurant</p>
          <p>Blog keyword must be included.</p>
          <ul><li>Keyword mismatch can trigger an edit request.</li></ul>
        </div>
        <p>Visit location: 564-3 Sinsa-dong, Gangnam-gu, Seoul</p>
        <div id="map-canvas"></div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.platform, 'dinnerqueen');
  assert.equal(result.data.title, '[Seoul Gangnam] Erba 23rd');
  assert.equal(result.data.reviewDeadline, '2026-05-21');
  assert.equal(result.data.benefit, 'Meal voucher 60,000 KRW / Extra menu cost at your expense, 1 team of 2');
  assert.deepEqual(result.data.channels, ['blog']);
  assert.equal(result.data.campaignType, 'visit');
  assert.equal(result.data.location, '564-3 Sinsa-dong, Gangnam-gu, Seoul');
  assert.match(result.data.guideline ?? '', /edit request/u);
});

test('parseDinnerqueenCampaign parses a delivery campaign', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="Dinnerqueen - [JarYeonNuri] Smoked Duck 4th" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>Apply</strong></h6>
            <h6><strong>Notice</strong></h6>
            <h6><strong>Review</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.27 - 26.05.03</strong></p>
            <p>26.05.04</p>
            <p>26.05.05 - 26.05.19</p>
          </div>
        </div>
        <div class="qz-collapse__content">
          <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">JarYeonNuri smoked duck 400g</strong></p>
        </div>
        <div class="qz-collapse__content">
          <p id="MainKeyword">smoked duck, sliced duck, jaryeonnuri</p>
          <p>Blog keyword must be included.</p>
        </div>
        <p id="detailProductLink">https://smartstore.naver.com/example/products/1</p>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.title, '[JarYeonNuri] Smoked Duck 4th');
  assert.equal(result.data.reviewDeadline, '2026-05-19');
  assert.equal(result.data.benefit, 'JarYeonNuri smoked duck 400g');
  assert.deepEqual(result.data.channels, ['blog']);
  assert.equal(result.data.campaignType, 'delivery');
  assert.equal(result.data.location, undefined);
});

test('parseDinnerqueenCampaign parses a payback campaign and point amount', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="Dinnerqueen - [Purchase Review][SUKSAN] Whole Bean 20th" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>Apply</strong></h6>
            <h6><strong>Notice</strong></h6>
            <h6><strong>Review</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.24 - 26.05.05</strong></p>
            <p>26.05.06</p>
            <p>26.05.07 - 26.05.21</p>
          </div>
        </div>
        <aside id="DetailPointBadge">+28,500</aside>
        <div class="qz-collapse__content">
          <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">Ethiopian whole bean</strong></p>
          <div class="qz-wrap qz-container layer-primary-dq-o">
            <p class="qz-body-kr mb-qz-body2-kr color-title">Whole bean / 200g / 25,000 KRW</p>
          </div>
        </div>
        <div class="qz-collapse__content">
          <p id="MainKeyword">drip bag, coffee bean</p>
          <p>Blog keyword must be included.</p>
        </div>
        <p id="detailProductLink">https://smartstore.naver.com/example/products/2</p>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.campaignType, 'payback');
  assert.equal(result.data.pointAmount, 28500);
  assert.deepEqual(result.data.channels, ['blog']);
  assert.equal(result.data.reviewDeadline, '2026-05-21');
});

test('parseDinnerqueenCampaign parses a reporter campaign', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="Dinnerqueen - [Reporter] Blau Pool Villa 2nd" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>Apply</strong></h6>
            <h6><strong>Notice</strong></h6>
            <h6><strong>Review</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.24 - 26.05.05</strong></p>
            <p>26.05.06</p>
            <p>26.05.07 - 26.05.21</p>
          </div>
        </div>
        <aside id="DetailPointBadge">+5,000</aside>
        <div class="qz-collapse__content">
          <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">5,000 point payout</strong></p>
        </div>
        <div class="qz-collapse__content">
          <p id="MainKeyword">yeosu villa, ocean view pension</p>
          <p>Write it as an introduction based on the guideline.</p>
        </div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.title, '[Reporter] Blau Pool Villa 2nd');
  assert.equal(result.data.campaignType, 'reporter');
  assert.equal(result.data.pointAmount, 5000);
  assert.deepEqual(result.data.channels, ['blog']);
  assert.match(result.data.guideline ?? '', /guideline/u);
});

test('parseDinnerqueenCampaign supports partial success when some fields are missing', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="Dinnerqueen - [Bucheon][Reels] AguAgu 11th" />
      </head>
      <body>
        <div class="qz-collapse__content">
          <p id="SubKeyword">#ad #bucheon</p>
          <p>Instagram hashtag must be included.</p>
        </div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.title, '[Bucheon][Reels] AguAgu 11th');
  assert.deepEqual(result.data.channels, ['instagram']);
  assert.equal(result.data.reviewDeadline, undefined);
  assert.equal(result.isPartial, true);
  assert.ok(result.extractedFields.includes('title'));
  assert.ok(result.missingFields.includes('reviewDeadline'));
});

test('parseDinnerqueenCampaign handles empty html', () => {
  const result = parseDinnerqueenCampaign('<html></html>');

  assert.deepEqual(result.data, { platform: 'dinnerqueen' });
  assert.deepEqual(result.extractedFields, ['platform']);
  assert.equal(result.isPartial, false);
});
