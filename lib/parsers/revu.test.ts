import assert from 'node:assert/strict';
import test from 'node:test';

import { isRevuCampaignUrl, parseRevuCampaign } from './revu';

test('isRevuCampaignUrl accepts valid revu campaign urls', () => {
  assert.equal(isRevuCampaignUrl('https://www.revu.net/campaign/12345'), true);
  assert.equal(isRevuCampaignUrl('https://www.revu.net/campaign/987654321'), true);
  assert.equal(isRevuCampaignUrl('https://www.revu.net/campaign/42/'), true);
});

test('isRevuCampaignUrl rejects invalid urls', () => {
  assert.equal(isRevuCampaignUrl('https://www.revu.net/campaign/abc'), false);
  assert.equal(isRevuCampaignUrl('https://revu.net/campaign/12345'), false);
  assert.equal(isRevuCampaignUrl('https://www.revu.net/event/12345'), false);
});

test('parseRevuCampaign extracts core fields from a valid html string', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="성수 브런치 체험단" />
        <meta property="og:description" content="서울 성동구 성수이로 12 | 방문형 | 협찬 품목: 브런치 2인 세트 | 리뷰 마감 2026.05.15 | 블로그 인스타 | 가이드라인 #체체 #레뷰" />
      </head>
      <body>
        <section>
          <p>리뷰 마감일 2026.05.15</p>
          <p>채널: 블로그, 인스타</p>
        </section>
      </body>
    </html>
  `;

  const result = parseRevuCampaign(html);

  assert.equal(result.data.platform, 'revu');
  assert.equal(result.data.title, '성수 브런치 체험단');
  assert.equal(result.data.reviewDeadline, '2026-05-15');
  assert.deepEqual(result.data.channels, ['blog', 'instagram']);
  assert.equal(result.data.campaignType, 'visit');
  assert.equal(result.data.location, '서울 성동구 성수이로 12');
  assert.equal(result.isPartial, true);
  assert.ok(result.extractedFields.includes('title'));
  assert.ok(result.extractedFields.includes('channels'));
});

test('parseRevuCampaign marks partial success when only title is found besides platform', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="배송형 디저트 체험단" />
      </head>
      <body></body>
    </html>
  `;

  const result = parseRevuCampaign(html);

  assert.equal(result.data.title, '배송형 디저트 체험단');
  assert.equal(result.data.reviewDeadline, undefined);
  assert.equal(result.isPartial, true);
  assert.deepEqual(result.extractedFields, ['title', 'platform']);
  assert.ok(result.missingFields.includes('reviewDeadline'));
});

test('parseRevuCampaign handles empty html with platform-only extraction', () => {
  const result = parseRevuCampaign('<html></html>');

  assert.deepEqual(result.data, { platform: 'revu' });
  assert.deepEqual(result.extractedFields, ['platform']);
  assert.ok(result.missingFields.includes('title'));
  assert.ok(result.missingFields.includes('reviewDeadline'));
  assert.equal(result.isPartial, false);
});
