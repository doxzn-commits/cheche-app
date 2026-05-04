import assert from 'node:assert/strict';
import test from 'node:test';

import { isGangnamCampaignUrl, parseGangnamCampaign } from './gangnam.js';

test('isGangnamCampaignUrl accepts valid Gangnam campaign urls', () => {
  assert.equal(isGangnamCampaignUrl('https://xn--939au0g4vj8sq.net/cp/?id=2130957'), true);
  assert.equal(isGangnamCampaignUrl('https://www.xn--939au0g4vj8sq.net/cp/?id=2130957'), true);
  assert.equal(isGangnamCampaignUrl('https://강남맛집.net/cp/?id=2130957'), true);
});

test('isGangnamCampaignUrl rejects invalid urls', () => {
  assert.equal(isGangnamCampaignUrl('http://xn--939au0g4vj8sq.net/cp/?id=2130957'), false);
  assert.equal(isGangnamCampaignUrl('https://xn--939au0g4vj8sq.net/cp/2130957'), false);
  assert.equal(isGangnamCampaignUrl('https://xn--939au0g4vj8sq.net/cp/?id=abc'), false);
  assert.equal(isGangnamCampaignUrl('https://fake-xn--939au0g4vj8sq.net/cp/?id=2130957'), false);
});

test('parseGangnamCampaign extracts core fields from a visit blog campaign', () => {
  const html = `
    <html>
      <body>
        <div class="textArea">
          <p class="tit">[서울 성동] 일품백송칼국수</p>
          <p class="sub_tit">
            <a>칼국수 or 설렁탕 중 택 2개 + 손만두 체험권 (2인 기준)</a>
          </p>
          <span class="category">
            <em class="blog">Blog</em>
            <em class="type">방문형</em>
          </span>
        </div>
        <div class="cmp_info">
          <img src="//gangnam-review.net/data/file/cmp/2026/04/07/thumb-cmp_2130957.png" />
          <ul>
            <li><dl><dt>캠페인 신청기간</dt><dd>04.08 ~ 04.14</dd></dl></li>
            <li class="on"><dl><dt>리뷰 등록기간</dt><dd>04.16 ~ 05.06</dd></dl></li>
          </ul>
        </div>
        <div class="tab_01">
          <ul>
            <li>
              <dl>
                <dt>키워드</dt>
                <dd>
                  <div id="key_result">
                    <span>왕십리칼국수</span>
                    <span>왕십리역맛집</span>
                  </div>
                  <p class="info_s">- 키워드는 제목 1회, 본문 3회 이상 추가해 주세요.</p>
                </dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>가이드라인</dt>
                <dd id="cmp_guide">
                  <p>사진을 정성껏 다양하게 찍어 주세요.</p>
                  <p>텍스트 1,000자 이상 서술해주세요.</p>
                </dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>방문 및 예약</dt>
                <dd>
                  최소 방문 2~3일 전 예약필수<br>
                  <div id="cont_map"></div>
                  <div>서울 성동구 행당동 264</div>
                </dd>
              </dl>
            </li>
            <li>
              <dl>
                <dt>리뷰 시 주의사항</dt>
                <dd>예약시간 엄수해주세요<br>대리체험 불가</dd>
              </dl>
            </li>
          </ul>
        </div>
      </body>
    </html>
  `;

  const result = parseGangnamCampaign(html);

  assert.equal(result.data.platform, 'gangnam');
  assert.equal(result.data.title, '[서울 성동] 일품백송칼국수');
  assert.equal(result.data.benefit, '칼국수 or 설렁탕 중 택 2개 + 손만두 체험권 (2인 기준)');
  assert.equal(result.data.reviewDeadline, '2026-05-06');
  assert.deepEqual(result.data.channels, ['blog']);
  assert.equal(result.data.campaignType, 'visit');
  assert.equal(result.data.location, '서울 성동구 행당동 264');
  assert.match(result.data.guideline ?? '', /왕십리칼국수/);
  assert.match(result.data.guideline ?? '', /사진을 정성껏/);
  assert.match(result.data.guideline ?? '', /예약시간 엄수/);
});

test('parseGangnamCampaign handles empty html', () => {
  const result = parseGangnamCampaign('<html></html>');

  assert.deepEqual(result.data, { platform: 'gangnam' });
  assert.deepEqual(result.extractedFields, ['platform']);
});
