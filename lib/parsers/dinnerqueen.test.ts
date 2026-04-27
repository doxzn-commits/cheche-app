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
        <title>디너의여왕 - [서울 강남] 에르바 23차</title>
        <meta property="og:title" content="디너의여왕 - [서울 강남] 에르바 23차" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>신청 기간</strong></h6>
            <h6><strong>발표 날짜</strong></h6>
            <h6><strong>리뷰 기간</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.27 - 26.05.05</strong></p>
            <p>26.05.06</p>
            <p>26.05.07 - 26.05.21</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">제공 내역</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">2만원 식사체험권</strong></p>
            <div class="qz-wrap qz-container layer-primary-dq-o">
              <p class="qz-body-kr mb-qz-body2-kr color-title">음료 2잔 + 디저트 1개</p>
            </div>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">블로그 키워드</strong></h5>
          <div class="qz-collapse__content">
            <p id="MainKeyword">압구정 맛집, 신사동 맛집</p>
            <p>네이버 블로그는 아래 키워드를 반드시 필수로 포함해야 합니다.</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">리뷰어 미션</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr tb-mr-b0 dis-inline-block">
              캠페인 홍보로 체험하는 만큼 책임감 가지고 성의 있는 리뷰 부탁드립니다.<br />
              <br />
              ▶제목에 브랜드명 포함 부탁드립니다.<br />
              ※ 해시태그 자유롭게 작성해주세요.
            </p>
            <div class="qz-wrap qz-container layer-tertiary mr-t3">
              <ul class="qz-wrap__list">
                <li class="qz-body-kr mb-qz-body2-kr"><span class="color-subtitle"><strong>블로그 작성의 경우 사진 15장 이상</strong> 부탁드립니다.</span></li>
              </ul>
            </div>
          </div>
        </div>
        <p>방문 위치: 서울 강남구 신사동 564-3</p>
        <div id="map-canvas"></div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.platform, 'dinnerqueen');
  assert.equal(result.data.title, '[서울 강남] 에르바 23차');
  assert.equal(result.data.reviewDeadline, '2026-05-21');
  assert.equal(result.data.benefit, '2만원 식사체험권 / 음료 2잔 + 디저트 1개');
  assert.deepEqual(result.data.channels, ['blog']);
  assert.equal(result.data.campaignType, 'visit');
  assert.equal(result.data.location, '서울 강남구 신사동 564-3');
  assert.match(
    result.data.guideline ?? '',
    /^캠페인 홍보로 체험하는 만큼 책임감 가지고 성의 있는 리뷰 부탁드립니다\./u
  );
  assert.match(result.data.guideline ?? '', /\n▶제목에 브랜드명 포함 부탁드립니다\./u);
});

test('parseDinnerqueenCampaign parses a delivery campaign', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="디너의여왕 - [자연누리] 훈제오리 4차" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>신청 기간</strong></h6>
            <h6><strong>발표 날짜</strong></h6>
            <h6><strong>리뷰 기간</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.27 - 26.05.03</strong></p>
            <p>26.05.04</p>
            <p>26.05.05 - 26.05.19</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">제공 내역</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">자연누리 훈제오리 400g</strong></p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">블로그 키워드</strong></h5>
          <div class="qz-collapse__content">
            <p id="MainKeyword">훈제오리고기, 오리슬라이스, 자연누리</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">리뷰어 미션</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr">1. 정성 있게 리뷰 작성해주세요.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.title, '[자연누리] 훈제오리 4차');
  assert.equal(result.data.reviewDeadline, '2026-05-19');
  assert.equal(result.data.benefit, '자연누리 훈제오리 400g');
  assert.deepEqual(result.data.channels, ['blog']);
  assert.equal(result.data.campaignType, 'delivery');
  assert.equal(result.data.location, undefined);
  assert.match(result.data.guideline ?? '', /정성 있게 리뷰/u);
});

test('parseDinnerqueenCampaign parses a reward campaign from payback content and point amount', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="디너의여왕 - [구매평][SUKSAN] 홀빈 원두 20차" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>신청 기간</strong></h6>
            <h6><strong>발표 날짜</strong></h6>
            <h6><strong>리뷰 기간</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.24 - 26.05.05</strong></p>
            <p>26.05.06</p>
            <p>26.05.07 - 26.05.21</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">제공 내역</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">에티오피아 시다마 홀빈 원두</strong></p>
            <div class="qz-wrap qz-container layer-primary-dq-o">
              <p class="qz-body-kr mb-qz-body2-kr color-title">구매평 원두타입: 홀빈 원두 / 200g / 25,000원</p>
            </div>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">포인트 지급</strong></h5>
          <div class="qz-collapse__content"><h5>+28,500</h5></div>
        </div>
        <aside id="DetailPointBadge">+28,500</aside>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">구매 링크</strong></h5>
          <div class="qz-collapse__content"><p id="detailProductLink">https://smartstore.naver.com/example/products/2</p></div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">블로그 키워드</strong></h5>
          <div class="qz-collapse__content">
            <p id="MainKeyword">드립백, 커피 원두</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">리뷰어 미션</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr">캠페인 홍보로 체험하는 만큼 책임감 가지고 성의 있는 리뷰 부탁드립니다.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.benefit, '에티오피아 시다마 홀빈 원두 / 구매평 원두타입: 홀빈 원두 / 200g / 25,000원');
  assert.equal(result.data.campaignType, 'reward');
  assert.equal(result.data.pointAmount, 28500);
  assert.deepEqual(result.data.channels, ['blog']);
  assert.equal(result.data.reviewDeadline, '2026-05-21');
});

test('parseDinnerqueenCampaign parses a reward campaign from reporter content', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="디너의여왕 - [기자단] 블라우풀빌라 2차" />
      </head>
      <body>
        <div class="qz-row mb-dis-none">
          <div class="qz-col pc3">
            <h6><strong>신청 기간</strong></h6>
            <h6><strong>발표 날짜</strong></h6>
            <h6><strong>리뷰 기간</strong></h6>
          </div>
          <div class="qz-col pc9">
            <p><strong>26.04.24 - 26.05.05</strong></p>
            <p>26.05.06</p>
            <p>26.05.07 - 26.05.21</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">제공 내역</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">★5,000 포인트 지급</strong></p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">포인트 지급</strong></h5>
          <div class="qz-collapse__content"><h5>+5,000</h5></div>
        </div>
        <aside id="DetailPointBadge">+5,000</aside>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">블로그 키워드</strong></h5>
          <div class="qz-collapse__content">
            <p id="MainKeyword">여수 풀빌라 독채, 여수 오션뷰 펜션</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">리뷰어 미션</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr">가이드에 맞게 문맥이 매끄럽도록 정성스러운 리뷰 부탁 드립니다.</p>
            <div class="qz-wrap qz-container layer-tertiary mr-t3">
              <ul class="qz-wrap__list">
                <li class="qz-body-kr mb-qz-body2-kr"><span class="color-subtitle">직접 체험한 것처럼 보여지는 표현은 사용불가합니다.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.title, '[기자단] 블라우풀빌라 2차');
  assert.equal(result.data.benefit, '★5,000 포인트 지급');
  assert.equal(result.data.campaignType, 'reward');
  assert.equal(result.data.pointAmount, 5000);
  assert.deepEqual(result.data.channels, ['blog']);
  assert.match(result.data.guideline ?? '', /직접 체험한 것처럼/u);
});

test('parseDinnerqueenCampaign parses an instagram visit campaign benefit and reviewer mission', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="디너의여왕 - [경기 부천][릴스] 아구아구 11차" />
      </head>
      <body>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">제공 내역</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr"><strong class="w-600">아구찜 소 사이즈 제공</strong></p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">매장 정보 링크</strong></h5>
          <div class="qz-collapse__content">
            <p id="detailPlaceLink">https://naver.me/xWTLLJxY</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">방문 및 예약</strong></h5>
          <div class="qz-collapse__content">
            <p>방문 위치: 경기 부천시 원미구 중동 1125</p>
            <div id="map-canvas"></div>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">인스타 해시태그</strong></h5>
          <div class="qz-collapse__content">
            <p id="SubKeyword">#협찬 #부천아구찜</p>
            <p>인스타그램은 아래 해시태그를 반드시 필수로 포함해야 합니다.</p>
          </div>
        </div>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">리뷰어 미션</strong></h5>
          <div class="qz-collapse__content">
            <div class="qz-wrap mr-b2 qz-container layer-red">
              <p class="qz-body-kr mb-qz-body2-kr color-title"><strong>- 릴스 촬영/편집 미션</strong></p>
              <div class="pd-l2 mb-pd-l1">
                <ol class="qz-wrap__list">
                  <li class="qz-body-kr mb-qz-body2-kr color-title"><span>분량: 30초~50초 내외</span></li>
                  <li class="qz-body-kr mb-qz-body2-kr color-title">나레이션 OR 자막 필수</li>
                </ol>
              </div>
            </div>
            <p class="qz-body-kr mb-qz-body2-kr tb-mr-b0 dis-inline-block">
              영수증(방문자리뷰) 필수인 캠페인 입니다.<br />
              릴스 체험단 리뷰어 미션<br />
              ★해시태그(아구아구)필수
            </p>
            <div class="qz-wrap qz-container layer-tertiary mr-t3">
              <ul class="qz-wrap__list">
                <li class="qz-body-kr mb-qz-body2-kr"><span class="color-subtitle"><strong>콘텐츠 미션을 꼭 준수하여 제작</strong>해 주시길 부탁드립니다.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.benefit, '아구찜 소 사이즈 제공');
  assert.deepEqual(result.data.channels, ['instagram']);
  assert.equal(result.data.campaignType, 'visit');
  assert.equal(result.data.location, '경기 부천시 원미구 중동 1125');
  assert.match(result.data.guideline ?? '', /^- 릴스 촬영\/편집 미션/u);
  assert.match(result.data.guideline ?? '', /\n분량: 30초~50초 내외/u);
  assert.match(result.data.guideline ?? '', /\n★해시태그\(아구아구\)필수/u);
  assert.doesNotMatch(
    result.data.guideline ?? '',
    /인스타그램은 아래 해시태그를 반드시 필수로 포함해야 합니다\./u
  );
});

test('parseDinnerqueenCampaign supports partial success when some fields are missing', () => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="디너의여왕 - [경기 부천][릴스] 아구아구 11차" />
      </head>
      <body>
        <div class="qz-collapse qz-row">
          <h5><strong class="qz-h6-kr">리뷰어 미션</strong></h5>
          <div class="qz-collapse__content">
            <p class="qz-body-kr mb-qz-body2-kr">리뷰어 미션 본문</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = parseDinnerqueenCampaign(html);

  assert.equal(result.data.title, '[경기 부천][릴스] 아구아구 11차');
  assert.equal(result.data.guideline, '리뷰어 미션 본문');
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
