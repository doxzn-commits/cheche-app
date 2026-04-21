'use client';
import { useState, useMemo, useRef, useEffect } from 'react';

// ── Types ──────────────────────────────────────────────
type EventType = 'r' | 'g';
// Phase 2 data-hide: b(선정발표) · y(신청마감) — Phase 1 제외
// type EventType = 'r' | 'g' | 'b' | 'y';

interface CalEvent {
  id: string;
  date: string;
  type: EventType;
  label: string;
  name: string;
  plat: string;
  location: string;
  dday: string;
  amount?: string;
  guideline?: string;
  channels?: string[];
}

// ── Sample Data (ref/체체_앱_최종.html CAL_EVENTS 그대로) ───
/* Phase 1 활성 타입: r(리뷰마감) · g(체험기간) 만 포함
   y(신청마감) · b(선정발표) → data-hide Phase 1 제외 */
const CAL_EVENTS: CalEvent[] = [
  {id:'e2',date:'2026-04-09',type:'r',label:'리뷰 마감',name:'카페투어 강남점 체험',plat:'레뷰',location:'서울 강남구',dday:'D-3',amount:'28,000',guideline:'음료 2잔 + 디저트 1개 무료 제공\n#체체 #카페투어 해시태그 필수\n포스팅 후 URL 제출'},
  {id:'e3',date:'2026-04-12',type:'g',label:'체험 기간',name:'한강뷰 호텔 숙박 체험',plat:'미블',location:'서울 영등포구',dday:'D+2'},
  {id:'e4',date:'2026-04-14',type:'r',label:'리뷰 마감',name:'뷰티 파우더 체험단',plat:'레뷰',location:'전국',dday:'D-1'},
  {id:'e5',date:'2026-04-20',type:'g',label:'체험 기간',name:'강남 피부과 시술 체험',plat:'레뷰',location:'서울 강남구',dday:'D-13'},
  {id:'e7',date:'2026-04-25',type:'r',label:'리뷰 마감',name:'한강뷰 호텔 숙박',plat:'미블',location:'서울 영등포구',dday:'D-18'},
  {id:'e8',date:'2026-04-25',type:'g',label:'체험 기간',name:'패션 여름 신상 체험',plat:'레뷰',location:'전국',dday:'D-18'},
];

// ── Constants ──────────────────────────────────────────
const CHANNELS = ['블로그', '인스타그램', '유튜브', '클립'] as const;
const PLATFORMS = ['레뷰', '미블', '리뷰노트', '강남맛집', '서울오빠', '디너의여왕', '티블', '링블', '놀러와'] as const;
const KO_MONTH = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const DOW_LABELS = ['일','월','화','수','목','금','토'];
const ACTIVE_TYPES = new Set<string>(['r','g']);
const TYPE_COLOR: Record<string, string> = {r:'var(--s-overdue)', g:'var(--s-selected)'};
const TYPE_BG:    Record<string, string> = {r:'var(--s-overdue-bg)', g:'var(--s-selected-bg)'};

// ── Helpers ────────────────────────────────────────────
function mkDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function getTodayStr() {
  const t = new Date();
  return mkDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}
function fmtDate(ds: string) {
  if (!ds) return '';
  const [, m, d] = ds.split('-');
  return `${parseInt(m)}월 ${parseInt(d)}일`;
}
function ddayColor(dday: string) {
  if (!dday || !dday.startsWith('D-')) return 'var(--text-muted)';
  const n = parseInt(dday.slice(2));
  return n <= 3 ? 'var(--s-overdue)' : n <= 7 ? 'var(--s-deadline)' : 'var(--text-muted)';
}
function calcDday(dateStr: string, todayS: string): string {
  if (!dateStr) return '';
  const diff = Math.round((new Date(dateStr).getTime() - new Date(todayS).getTime()) / 86400000);
  if (diff === 0) return 'D-DAY';
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

// ── LogoMark SVG (재사용) ──────────────────────────────
function LogoMark() {
  return (
    <div style={{width:28,height:28,background:'linear-gradient(160deg,#2A52B8 0%,#1C3C82 100%)',borderRadius:8,display:'grid',placeItems:'center',boxShadow:'var(--brand-shadow)',flexShrink:0}}>
      <svg viewBox="0 0 22 22" fill="none" width="16" height="16">
        <rect x="1" y="4" width="16" height="15" rx="3" fill="white" opacity="0.95"/>
        <rect x="5" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
        <rect x="11" y="1.5" width="2" height="5" rx="1" fill="white" opacity="0.8"/>
        <rect x="1" y="8.5" width="16" height="2" fill="#1C3C82" opacity="0.25"/>
        <rect x="17.5" y="5" width="3.5" height="4" rx="1" fill="#E8394A"/>
        <rect x="17.5" y="15" width="3.5" height="4" rx="1" fill="#E8A820"/>
      </svg>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function CalendarPage() {
  const todayStr = getTodayStr();

  // State
  const [year, setYear]           = useState(2026);
  const [month, setMonth]         = useState(3); // 0-indexed (April)
  const [calFilter, setCalFilter] = useState<'all' | EventType>('all');
  const [selDate, setSelDate]     = useState<string | null>(null);
  const [doneSet, setDoneSet]     = useState<Set<string>>(new Set());
  const [events, setEvents]       = useState<CalEvent[]>(CAL_EVENTS);
  const [viewMode, setViewMode]   = useState<'monthly' | 'weekly'>('monthly');

  // Grid row height (동적 계산 — HTML 원본 rowH 로직)
  const [rowH, setRowH] = useState(52);
  const gridWrapRef = useRef<HTMLDivElement>(null);

  // Sheet state
  const [openSheet, setOpenSheet]     = useState<'calSheet' | 'calDaySheet' | 'addCalSheet' | null>(null);
  const [sheetEventId, setSheetEventId] = useState<string | null>(null);
  const [daySheetEvents, setDaySheetEvents] = useState<CalEvent[]>([]);
  const [daySheetDateLabel, setDaySheetDateLabel] = useState('');
  const [editMode, setEditMode]       = useState(false);

  // 스와이프/슬라이드 애니메이션
  const [slideDir, setSlideDir]       = useState<'left' | 'right' | null>(null);
  const touchStartX                   = useRef(0);

  // 일정 등록 탭 ('url' | 'manual')
  const [addTab, setAddTab]           = useState<'url' | 'manual'>('url');
  const [urlParsed, setUrlParsed]     = useState(false);
  const [guidelineText, setGuidelineText] = useState('');
  const [resToggle, setResToggle]     = useState<'예정' | '완료' | '불필요'>('예정');
  const [wkndToggle, setWkndToggle]   = useState<'가능' | '불가' | null>(null);

  // 수기 입력 폼 state
  const [manualName, setManualName]           = useState('');
  const [manualPlatform, setManualPlatform]   = useState('');
  const [manualDeadline, setManualDeadline]   = useState('');
  const [manualExpDate, setManualExpDate]     = useState('');
  const [manualAmount, setManualAmount]       = useState('');
  const [manualLocation, setManualLocation]   = useState('');
  const [manualMemo, setManualMemo]           = useState('');
  const [manualChannels, setManualChannels]   = useState<Set<string>>(new Set());

  // 상세 시트 편집용 state
  const [editChannels, setEditChannels]       = useState<Set<string>>(new Set());
  const [editName, setEditName]               = useState('');
  const [editLocation, setEditLocation]       = useState('');
  const [editAmount, setEditAmount]           = useState('');
  const [editGuideline, setEditGuideline]     = useState('');
  const [editDeadlineDate, setEditDeadlineDate] = useState('');
  const [editExpDate, setEditExpDate]         = useState('');

  // 주간 뷰 오프셋 (0 = 현재 주)
  const [weekOffset, setWeekOffset]   = useState(0);

  // ── rowH 동적 계산 (HTML 원본 JS 로직: getBoundingClientRect → clientHeight) ──
  useEffect(() => {
    // viewMode 전환 시 DOM 업데이트 후 측정 (주간→월간 전환 시 gridWrapRef 재마운트 대기)
    const run = () => {
      const el = gridWrapRef.current;
      if (!el) return;
      const calc = () => {
        const availH = el.clientHeight;
        const first = new Date(year, month, 1).getDay();
        const dim   = new Date(year, month + 1, 0).getDate();
        const weeks = Math.ceil((first + dim) / 7);
        setRowH(Math.max(52, Math.floor(availH / weeks)));
      };
      calc();
      const ro = new ResizeObserver(calc);
      ro.observe(el);
      return () => ro.disconnect();
    };
    // viewMode 변경 시 DOM 커밋 후 재계산
    const timer = setTimeout(run, 50);
    return () => clearTimeout(timer);
  }, [year, month, viewMode]);

  // ── Helpers (use state values) ────────────────────────
  function getFilteredEvents(ds?: string | null) {
    const src = ds ? events.filter(e => e.date === ds) : events;
    return src.filter(e => ACTIVE_TYPES.has(e.type) && (calFilter === 'all' || e.type === calFilter));
  }

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m); setYear(y); setSelDate(null);
  }

  function calDayClick(ds: string) {
    setSelDate(ds);
    const evs = getFilteredEvents(ds);
    if (!evs.length) return;
    const names = [...new Set(evs.map(e => e.name))];
    if (names.length === 1) {
      showCalSheet(evs[0].id);
    } else {
      const [, m, d] = ds.split('-');
      setDaySheetDateLabel(`${parseInt(m)}월 ${parseInt(d)}일 일정`);
      setDaySheetEvents(evs);
      setOpenSheet('calDaySheet');
    }
  }

  function showCalSheet(eventId: string) {
    setEditMode(false);
    setSheetEventId(eventId);
    const ev = events.find(e => e.id === eventId);
    setEditChannels(new Set(ev?.channels ?? []));
    setOpenSheet('calSheet');
  }

  function closeSheet() {
    setOpenSheet(null);
    setEditMode(false);
    setAddTab('url');
    setUrlParsed(false);
    setGuidelineText('');
    setManualName('');
    setManualPlatform('');
    setManualDeadline('');
    setManualExpDate('');
    setManualAmount('');
    setManualLocation('');
    setManualMemo('');
    setManualChannels(new Set());
    setResToggle('예정');
    setWkndToggle(null);
    setEditChannels(new Set());
    setEditName('');
    setEditLocation('');
    setEditAmount('');
    setEditGuideline('');
    setEditDeadlineDate('');
    setEditExpDate('');
  }

  // ── 슬라이드 네비 ─────────────────────────────────────
  function slide(dir: 'left' | 'right', action: () => void) {
    setSlideDir(dir);
    action();
    setTimeout(() => setSlideDir(null), 300);
  }
  const prevMonth = () => slide('right', () => changeMonth(-1));
  const nextMonth = () => slide('left',  () => changeMonth(1));
  const prevWeek  = () => slide('right', () => setWeekOffset(w => w - 1));
  const nextWeek  = () => slide('left',  () => setWeekOffset(w => w + 1));

  // ── 스와이프 터치 핸들러 ──────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent, mode: 'monthly' | 'weekly') {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if      (diff >  50) mode === 'monthly' ? prevMonth() : prevWeek();
    else if (diff < -50) mode === 'monthly' ? nextMonth() : nextWeek();
  }

  function toggleDone() {
    if (!sheetEventId) return;
    const curEv = events.find(e => e.id === sheetEventId);
    if (!curEv) return;
    const allIds = events.filter(e => e.name === curEv.name).map(e => e.id);
    const isNowDone = doneSet.has(sheetEventId);
    setDoneSet(prev => {
      const next = new Set(prev);
      allIds.forEach(id => { isNowDone ? next.delete(id) : next.add(id); });
      return next;
    });
    closeSheet();
  }

  // ── Calendar Cells ────────────────────────────────────
  const cells = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const dim   = new Date(year, month + 1, 0).getDate();
    const prev  = new Date(year, month, 0).getDate();

    const eMap: Record<string, CalEvent[]> = {};
    events.forEach(e => {
      if (!ACTIVE_TYPES.has(e.type)) return;
      if (calFilter !== 'all' && e.type !== calFilter) return;
      if (!eMap[e.date]) eMap[e.date] = [];
      eMap[e.date].push(e);
    });

    const result = [];
    for (let i = 0; i < 42; i++) {
      let d: number, mo = month, yr = year, om = false;
      if (i < first) {
        d = prev - first + i + 1; mo = month - 1;
        if (mo < 0) { mo = 11; yr--; } om = true;
      } else if (i - first + 1 > dim) {
        d = i - first + 1 - dim; mo = month + 1;
        if (mo > 11) { mo = 0; yr++; } om = true;
      } else {
        d = i - first + 1;
      }
      const ds = mkDateStr(yr, mo, d);
      result.push({ d, ds, om, isToday: ds === todayStr, isSel: selDate === ds, dow: i % 7, evs: eMap[ds] || [] });
    }
    return result;
  }, [year, month, calFilter, selDate, todayStr, events]);

  // ── Event Groups for list ─────────────────────────────
  const eventGroups = useMemo(() => {
    const filtered = getFilteredEvents(selDate);
    const groups: Record<string, {name:string;plat:string;location:string;exp:CalEvent|null;deadline:CalEvent|null;firstId:string}> = {};
    filtered.forEach(e => {
      if (!groups[e.name]) groups[e.name] = {name:e.name,plat:e.plat,location:e.location,exp:null,deadline:null,firstId:e.id};
      if (e.type === 'g') groups[e.name].exp = e;
      if (e.type === 'r') { groups[e.name].deadline = e; groups[e.name].firstId = e.id; }
    });
    return Object.values(groups);
  }, [selDate, calFilter]);

  // Sheet event info
  const sheetEvent      = sheetEventId ? events.find(e => e.id === sheetEventId) : null;
  const sheetRelated    = sheetEvent ? events.filter(e => e.name === sheetEvent.name) : [];
  const sheetAllIds     = sheetRelated.map(e => e.id);
  const sheetDeadlineEv = sheetRelated.find(e => e.type === 'r') ?? null;
  const sheetExpEv      = sheetRelated.find(e => e.type === 'g') ?? null;
  const sheetIsDone     = sheetAllIds.length > 0 && sheetAllIds.every(id => doneSet.has(id));

  // Weeks count (skip empty trailing row when month fits in 5 rows)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeksCount = Math.ceil((firstDay + daysInMonth) / 7);

  // ── Weekly view helpers ───────────────────────────────
  // Compute start of week (Monday) from today + weekOffset
  const todayDate = new Date(todayStr);
  const dayOfWeek = todayDate.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() + mondayOffset + weekOffset * 7);
  const weekDays = Array.from({length: 7}, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    return { date: d, ds: mkDateStr(d.getFullYear(), d.getMonth(), d.getDate()), dow: (i + 1) % 7 };
  });
  const weekEventsAll = getFilteredEvents(); // all filtered events
  const weekLabel = (() => {
    const s = weekDays[0].date, e = weekDays[6].date;
    return `${s.getMonth()+1}월 ${s.getDate()}일 – ${e.getDate()}일`;
  })();

  // ── Weekly event list ─────────────────────────────────
  const weekEventsByDay = weekDays.map(wd => ({
    ...wd,
    events: weekEventsAll.filter(e => e.date === wd.ds),
  }));

  // ── 수기 등록 핸들러 ──────────────────────────────────
  function handleAddManual() {
    if (!manualName.trim() || !manualPlatform || !manualDeadline) return;
    const id = `m${Date.now()}`;
    const ch = manualChannels.size > 0 ? [...manualChannels] : undefined;
    const newEvents: CalEvent[] = [{
      id,
      date: manualDeadline,
      type: 'r',
      label: '리뷰 마감',
      name: manualName.trim(),
      plat: manualPlatform,
      location: manualLocation.trim() || '—',
      dday: calcDday(manualDeadline, todayStr),
      amount: manualAmount.trim() || undefined,
      guideline: guidelineText.trim() || undefined,
      channels: ch,
    }];
    if (manualExpDate) {
      newEvents.push({
        id: `${id}_g`,
        date: manualExpDate,
        type: 'g',
        label: '체험 기간',
        name: manualName.trim(),
        plat: manualPlatform,
        location: manualLocation.trim() || '—',
        dday: calcDday(manualExpDate, todayStr),
        amount: manualAmount.trim() || undefined,
        guideline: guidelineText.trim() || undefined,
        channels: ch,
      });
    }
    setEvents(prev => [...prev, ...newEvents]);

    // 수익 페이지 연동: 금액이 있으면 localStorage 에 수익 항목 추가
    const amountNum = parseInt((manualAmount || '').replace(/[^0-9]/g, '')) || 0;
    if (amountNum > 0) {
      const firstCh = manualChannels.size > 0 ? [...manualChannels][0] : '블로그';
      const chAlias: Record<string, string> = { '인스타그램': '인스타', '클립': '블로그 클립' };
      const rev = {
        linkId: id,
        name: manualName.trim(),
        plat: manualPlatform,
        channel: chAlias[firstCh] ?? firstCh,
        date: manualExpDate || manualDeadline,
        goods: amountNum,
        ad: 0,
        emoji: '📝',
      };
      try {
        const raw = localStorage.getItem('cheche_user_revenues');
        const arr = raw ? JSON.parse(raw) : [];
        arr.push(rev);
        localStorage.setItem('cheche_user_revenues', JSON.stringify(arr));
      } catch {}
    }

    const dateObj = new Date(manualDeadline);
    setYear(dateObj.getFullYear());
    setMonth(dateObj.getMonth());
    setSelDate(manualDeadline);
    closeSheet();
  }

  // ── 상세 시트 편집 진입 ────────────────────────────────
  function enterEditMode() {
    if (!sheetEvent) return;
    setEditName(sheetEvent.name);
    setEditLocation(sheetEvent.location);
    setEditAmount(sheetEvent.amount ?? '');
    setEditGuideline(sheetEvent.guideline ?? '');
    setEditDeadlineDate(sheetDeadlineEv?.date ?? '');
    setEditExpDate(sheetExpEv?.date ?? '');
    setEditChannels(new Set(sheetEvent.channels ?? []));
    setEditMode(true);
  }

  // ── 상세 시트 편집 저장 ────────────────────────────────
  function handleSaveEdit() {
    if (!sheetEvent) return;
    const ch = editChannels.size > 0 ? [...editChannels] : undefined;
    const ids = new Set(sheetAllIds);
    const nameTrim = editName.trim() || sheetEvent.name;
    const locTrim  = editLocation.trim() || '—';
    const amtTrim  = editAmount.trim() || undefined;
    const gdTrim   = editGuideline.trim() || undefined;

    const rebuilt: CalEvent[] = [];
    if (editDeadlineDate) {
      rebuilt.push({
        id: sheetDeadlineEv?.id ?? `r${Date.now()}`,
        date: editDeadlineDate,
        type: 'r',
        label: '리뷰 마감',
        name: nameTrim,
        plat: sheetEvent.plat,
        location: locTrim,
        dday: calcDday(editDeadlineDate, todayStr),
        amount: amtTrim,
        guideline: gdTrim,
        channels: ch,
      });
    }
    if (editExpDate) {
      rebuilt.push({
        id: sheetExpEv?.id ?? `g${Date.now()}`,
        date: editExpDate,
        type: 'g',
        label: '체험 기간',
        name: nameTrim,
        plat: sheetEvent.plat,
        location: locTrim,
        dday: calcDday(editExpDate, todayStr),
        amount: amtTrim,
        guideline: gdTrim,
        channels: ch,
      });
    }

    setEvents(prev => [...prev.filter(e => !ids.has(e.id)), ...rebuilt]);

    // 현재 시트가 가리키던 이벤트가 사라진 경우 포인터 갱신
    if (rebuilt.length === 0) {
      setOpenSheet(null);
    } else {
      const sameType = rebuilt.find(e => e.type === sheetEvent.type);
      setSheetEventId((sameType ?? rebuilt[0]).id);
    }

    setEditMode(false);
  }

  // ─────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, position:'relative', overflow:'hidden', background:'var(--bg-card)'}}>

      {/* ── Overlay + Sheets ── */}
      {openSheet && (
        <div
          style={{position:'fixed',inset:0,background:'var(--bg-overlay)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}
          onClick={closeSheet}
        >
          {/* ── calSheet (SCR-012B) 체험 상세 시트 ── */}
          {openSheet === 'calSheet' && sheetEvent && (
            <div
              style={{background:'var(--bg-card)',borderRadius:'var(--r-sheet) var(--r-sheet) 0 0',padding:'12px 20px 32px',width:'100%',maxWidth:393,maxHeight:'88vh',overflowY:'auto',animation:'sheetUp .28s var(--ease-out, ease-out)'}}
              onClick={e => e.stopPropagation()}
            >
              <style>{`@keyframes sheetUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
              {/* handle */}
              <div style={{width:36,height:4,background:'var(--border-strong)',borderRadius:2,margin:'0 auto 18px'}} />

              {/* 상단 액션바: 삭제(좌) / 편집(중) / 닫기(우) */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <button
                  style={{width:32,height:32,background:'var(--bg-chip)',border:'none',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                  onClick={() => {
                    if (!sheetEvent) return;
                    if (!window.confirm(`'${sheetEvent.name}' 일정을 삭제할까요?\n관련된 리뷰 마감·체험 일자가 모두 삭제돼요.`)) return;
                    const idsToRemove = new Set(sheetAllIds);
                    setEvents(prev => prev.filter(e => !idsToRemove.has(e.id)));
                    setDoneSet(prev => {
                      const next = new Set(prev);
                      idsToRemove.forEach(id => next.delete(id));
                      return next;
                    });
                    closeSheet();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--s-overdue)" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
                <button
                  style={{display:'flex',alignItems:'center',gap:5,background:editMode?'var(--brand-light)':'var(--bg-chip)',border:editMode?'1.5px solid var(--brand)':'none',borderRadius:'var(--r-full)',padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700,color:'var(--brand-text)',fontFamily:'var(--font-body)'}}
                  onClick={() => editMode ? setEditMode(false) : enterEditMode()}
                >
                  {editMode ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
                      편집 중
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      편집
                    </>
                  )}
                </button>
                <button style={{width:32,height:32,background:'var(--bg-chip)',border:'none',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={closeSheet}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* 헤더 — 상태 뱃지 + 이름 */}
              <div style={{marginBottom:12}}>
                <div style={{display:'flex',gap:5,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:'var(--r-full)',fontSize:12,fontWeight:700,background:sheetEvent.type==='r'?'var(--s-overdue-bg)':'var(--s-selected-bg)',color:sheetEvent.type==='r'?'var(--s-overdue)':'var(--s-selected)'}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:sheetEvent.type==='r'?'var(--s-overdue)':'var(--s-selected)',flexShrink:0}} />
                    {sheetEvent.label}
                  </span>
                  <span style={{fontSize:11,fontWeight:600,fontFamily:'var(--font-mono)',padding:'3px 9px',borderRadius:'var(--r-full)',background:sheetEvent.type==='r'?'var(--s-overdue-bg)':'var(--s-selected-bg)',color:sheetEvent.type==='r'?'var(--s-overdue)':'var(--s-selected)'}}>
                    {calcDday(sheetEvent.date, todayStr)}
                  </span>
                </div>
                {!editMode ? (
                  <div style={{fontSize:17,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.4px',marginBottom:3}}>{sheetEvent.name}</div>
                ) : (
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{width:'100%',padding:'6px 10px',border:'1.5px solid var(--brand)',borderRadius:'var(--r-md)',fontSize:15,fontWeight:700,fontFamily:'var(--font-body)',background:'var(--bg-input)',color:'var(--text-primary)',outline:'none',marginBottom:3}} />
                )}
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:11,fontWeight:700,color:'var(--brand-text)'}}>{sheetEvent.plat}</span>
                  {!editMode && (
                    <>
                      <span style={{fontSize:11,color:'var(--text-muted)'}}>·</span>
                      <span style={{fontSize:11,color:sheetEvent.channels?.length?'var(--text-muted)':'var(--text-disabled)'}}>
                        {sheetEvent.channels?.length ? sheetEvent.channels.join(', ') : '—'}
                      </span>
                    </>
                  )}
                </div>
                {editMode && (
                  <div style={{marginTop:10}}>
                    <div style={{fontSize:10,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:6}}>채널 <span style={{fontSize:9,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(복수 선택)</span></div>
                    <div style={{display:'flex',gap:6}}>
                      {CHANNELS.map(ch => {
                        const active = editChannels.has(ch);
                        return (
                          <div key={ch} onClick={() => setEditChannels(prev => { const n = new Set(prev); n.has(ch) ? n.delete(ch) : n.add(ch); return n; })}
                            style={{flex:1,height:34,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'var(--r-sm)',border:active?'1.5px solid var(--brand)':'1px solid var(--border-mid)',background:active?'var(--brand-light)':'var(--bg-card)',color:active?'var(--brand-text)':'var(--text-secondary)',fontSize:11,fontWeight:active?700:600,cursor:'pointer',transition:'all 0.15s',userSelect:'none'}}>
                            {ch}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div style={{height:1,background:'var(--border)',marginBottom:12}} />

              {/* 일정 정보 */}
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>일정 정보</div>
              <div style={{background:'var(--bg-card-inner)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',overflow:'hidden',marginBottom:14}}>
                {/* 리뷰 마감일 */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>리뷰 마감일</span>
                  {!editMode ? (
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:sheetDeadlineEv?'var(--s-overdue)':'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{sheetDeadlineEv ? fmtDate(sheetDeadlineEv.date) : '—'}</span>
                      {sheetDeadlineEv && <span style={{fontSize:10,fontWeight:700,color:'var(--s-overdue)',fontFamily:'var(--font-mono)',background:'var(--s-overdue-bg)',padding:'2px 6px',borderRadius:'var(--r-full)'}}>{calcDday(sheetDeadlineEv.date, todayStr)}</span>}
                    </div>
                  ) : (
                    <input type="date" value={editDeadlineDate} onChange={e => setEditDeadlineDate(e.target.value)} style={{fontSize:12,padding:'5px 8px',border:'1.5px solid var(--brand)',borderRadius:'var(--r-sm)',background:'var(--bg-input)',color:'var(--text-primary)',fontFamily:'var(--font-body)',outline:'none',width:140}} />
                  )}
                </div>
                {/* 체험일자 */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>체험일자</span>
                  {!editMode ? (
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:12,fontWeight:600,color:sheetExpEv?'var(--s-selected)':'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{sheetExpEv ? fmtDate(sheetExpEv.date) : '—'}</span>
                      {sheetExpEv && <span style={{fontSize:10,fontWeight:700,color:'var(--s-selected)',fontFamily:'var(--font-mono)',background:'var(--s-selected-bg)',padding:'2px 6px',borderRadius:'var(--r-full)'}}>{calcDday(sheetExpEv.date, todayStr)}</span>}
                    </div>
                  ) : (
                    <input type="date" value={editExpDate} onChange={e => setEditExpDate(e.target.value)} style={{fontSize:12,padding:'5px 8px',border:'1.5px solid var(--brand)',borderRadius:'var(--r-sm)',background:'var(--bg-input)',color:'var(--text-primary)',fontFamily:'var(--font-body)',outline:'none',width:140}} />
                  )}
                </div>
                {/* 위치 */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>위치</span>
                  {!editMode ? (
                    <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>{sheetEvent.location}</span>
                  ) : (
                    <input value={editLocation} onChange={e => setEditLocation(e.target.value)} style={{fontSize:12,padding:'5px 8px',border:'1.5px solid var(--brand)',borderRadius:'var(--r-sm)',background:'var(--bg-input)',color:'var(--text-primary)',fontFamily:'var(--font-body)',outline:'none',width:140}} />
                  )}
                </div>
              </div>

              {/* 협찬 정보 */}
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>협찬 정보</div>
              <div style={{background:'var(--bg-card-inner)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',overflow:'hidden',marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>협찬 품목</span>
                  {!editMode ? (
                    <span style={{fontSize:12,fontWeight:600,color:'var(--text-primary)',textAlign:'right',maxWidth:'55%'}}>음료 2잔 + 디저트 1개</span>
                  ) : (
                    <input defaultValue="음료 2잔 + 디저트 1개" style={{fontSize:12,padding:'5px 8px',border:'1.5px solid var(--brand)',borderRadius:'var(--r-sm)',background:'var(--bg-input)',color:'var(--text-primary)',fontFamily:'var(--font-body)',outline:'none',width:160,textAlign:'right'}} />
                  )}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>협찬 금액</span>
                  {!editMode ? (
                    sheetEvent?.amount ? (
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <span style={{fontSize:13,fontWeight:800,color:'var(--s-selected)',fontFamily:'var(--font-mono)'}}>{sheetEvent.amount}</span>
                        <span style={{fontSize:11,color:'var(--s-selected)',fontWeight:600}}>원</span>
                      </div>
                    ) : (
                      <span style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>—</span>
                    )
                  ) : (
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <input type="text" inputMode="numeric" value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{fontSize:12,padding:'5px 8px',border:'1.5px solid var(--brand)',borderRadius:'var(--r-sm)',background:'var(--bg-input)',color:'var(--text-primary)',fontFamily:'var(--font-mono)',outline:'none',width:100,textAlign:'right'}} />
                      <span style={{fontSize:12,color:'var(--text-muted)'}}>원</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 방문 정보 */}
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>방문 정보</div>
              <div style={{background:'var(--bg-card-inner)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',overflow:'hidden',marginBottom:14}}>
                {/* F-08A 예약 여부 (v1.1) */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>예약 여부</span>
                  {!editMode ? (
                    <span style={{fontSize:12,fontWeight:700,color:'var(--s-applied)'}}>예정</span>
                  ) : (
                    <div style={{display:'flex',gap:5}}>
                      {['예정','완료','불필요'].map(v => (
                        <span key={v} style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:'var(--r-full)',background:v==='예정'?'var(--brand-light)':'var(--bg-card)',border:v==='예정'?'1.5px solid var(--brand)':'1px solid var(--border-mid)',color:v==='예정'?'var(--brand-text)':'var(--text-secondary)',cursor:'pointer'}}>{v}</span>
                      ))}
                    </div>
                  )}
                </div>
                {/* F-08 주말 방문 (v1.1: 기본값 없음, 미선택 허용) */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>주말 방문</span>
                  {!editMode ? (
                    <span style={{fontSize:12,fontWeight:600,color:'var(--text-muted)'}}>—</span>
                  ) : (
                    <div style={{display:'flex',gap:6}}>
                      {['가능','불가'].map(v => (
                        <span key={v} style={{fontSize:11,fontWeight:600,padding:'4px 12px',borderRadius:'var(--r-full)',background:'var(--bg-card)',border:'1px solid var(--border-mid)',color:'var(--text-secondary)',cursor:'pointer'}}>{v}</span>
                      ))}
                    </div>
                  )}
                </div>
                {/* 업주 전화번호 */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px'}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>업주 전화번호</span>
                  {!editMode ? (
                    <a href="tel:02-1234-5678" style={{fontSize:12,fontWeight:700,color:'var(--brand-text)',fontFamily:'var(--font-mono)',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.1 2.2 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.46-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
                      02-1234-5678
                    </a>
                  ) : (
                    <input type="tel" defaultValue="02-1234-5678" style={{fontSize:12,padding:'5px 8px',border:'1.5px solid var(--brand)',borderRadius:'var(--r-sm)',background:'var(--bg-input)',color:'var(--text-primary)',fontFamily:'var(--font-mono)',outline:'none',width:140}} />
                  )}
                </div>
              </div>

              {/* 가이드라인 */}
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>가이드라인</div>
              {!editMode ? (
                <div style={{background:'var(--bg-card-inner)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:'11px 12px',fontSize:12,color:sheetEvent?.guideline?'var(--text-primary)':'var(--text-muted)',lineHeight:1.7,marginBottom:14,whiteSpace:'pre-wrap'}}>
                  {sheetEvent?.guideline || '—'}
                </div>
              ) : (
                <textarea rows={3} value={editGuideline} onChange={e => setEditGuideline(e.target.value)} style={{width:'100%',padding:'11px 12px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--text-primary)',background:'var(--bg-input)',fontFamily:'var(--font-body)',outline:'none',resize:'none',lineHeight:1.7,marginBottom:14}} />
              )}

              {/* 메모 — 항상 즉시 편집 (F-12) */}
              <div style={{fontSize:10,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>메모</div>
              <textarea rows={3} placeholder="주차 가능 여부, 사전 예약 필요 등 자유 입력" defaultValue="주차 가능 · 사전 예약 필수 · 음료 선택 가능"
                style={{width:'100%',padding:'12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--text-primary)',background:'var(--bg-input)',fontFamily:'var(--font-body)',outline:'none',resize:'none',lineHeight:1.7,marginBottom:16}} />

              {/* 편집 모드 저장 버튼 */}
              {editMode && (
                <div style={{marginBottom:8}}>
                  <button className="btn btn-primary" onClick={handleSaveEdit}
                    style={{width:'100%',padding:'13px 22px',borderRadius:'var(--r-md)',fontSize:15,fontWeight:700,background:'var(--brand)',color:'#fff',border:'none',cursor:'pointer',boxShadow:'var(--brand-shadow)'}}>
                    저장하기
                  </button>
                </div>
              )}

              {/* 기본 하단 버튼 */}
              {!editMode && (
                <div style={{display:'flex',gap:8}}>
                  <button onClick={closeSheet}
                    style={{flex:1,padding:'13px 14px',borderRadius:'var(--r-md)',fontSize:13,fontWeight:700,background:'var(--bg-input)',color:'var(--text-primary)',border:'1px solid var(--border-mid)',cursor:'pointer',whiteSpace:'nowrap'}}>
                    플랫폼에서 확인하기
                  </button>
                  <button onClick={toggleDone}
                    style={{flex:1,padding:'13px 14px',borderRadius:'var(--r-md)',fontSize:13,fontWeight:700,background:sheetIsDone?'var(--s-selected)':'var(--brand)',color:'#fff',border:'none',cursor:'pointer',boxShadow:sheetIsDone?'0 4px 14px rgba(0,179,134,0.3)':'var(--brand-shadow)',opacity:sheetIsDone?0.85:1,whiteSpace:'nowrap'}}>
                    {sheetIsDone ? '리뷰 등록 완료 ✓' : '리뷰 완료'}
                  </button>
                </div>
              )}
              <div style={{height:8}} />
            </div>
          )}

          {/* ── calDaySheet 날짜 일정 선택 ── */}
          {openSheet === 'calDaySheet' && (
            <div style={{background:'var(--bg-card)',borderRadius:'var(--r-sheet) var(--r-sheet) 0 0',padding:'12px 20px 32px',width:'100%',maxWidth:393,maxHeight:'88vh',overflowY:'auto',animation:'sheetUp .28s ease-out'}}
              onClick={e => e.stopPropagation()}>
              <div style={{width:36,height:4,background:'var(--border-strong)',borderRadius:2,margin:'0 auto 18px'}} />
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                <div style={{fontSize:17,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.4px',margin:0}}>{daySheetDateLabel}</div>
                <button style={{width:32,height:32,background:'var(--bg-chip)',border:'none',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={closeSheet}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {[...new Set(daySheetEvents.map(e => e.name))].map(name => {
                const ev = daySheetEvents.find(e => e.name === name)!;
                return (
                  <div key={name} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}}
                    onClick={() => { closeSheet(); setTimeout(() => showCalSheet(ev.id), 50); }}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:TYPE_COLOR[ev.type]||'var(--text-muted)',flexShrink:0}} />
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
                      <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{ev.label} · {ev.plat}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── addCalSheet 일정 등록 (SCR-008C) ── */}
          {openSheet === 'addCalSheet' && (
            <div style={{background:'var(--bg-card)',borderRadius:'var(--r-sheet) var(--r-sheet) 0 0',padding:'12px 20px 32px',width:'100%',maxWidth:393,maxHeight:'88vh',overflowY:'auto',animation:'sheetUp .28s ease-out'}}
              onClick={e => e.stopPropagation()}>
              <div style={{width:36,height:4,background:'var(--border-strong)',borderRadius:2,margin:'0 auto 18px'}} />

              {/* 시트 헤더 */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                <div>
                  <div style={{fontSize:18,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.4px'}}>일정 등록</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>선정된 체험단 공고를 등록해요</div>
                </div>
                <button style={{width:36,height:36,borderRadius:'50%',background:'var(--bg-chip)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={closeSheet}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* ① URL 입력 영역 */}
              <div style={{marginBottom:16}}>
                <label style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--text-muted)',fontWeight:600,marginBottom:8,display:'block',letterSpacing:'0.06em',textTransform:'uppercase'}}>공고 URL <span style={{color:'var(--s-overdue)'}}>*</span></label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{flex:1,position:'relative'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    <input
                      placeholder="선정된 체험단 공고 URL 붙여넣기"
                      disabled={addTab === 'manual'}
                      style={{width:'100%',padding:'12px 14px 12px 34px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:13,color:'var(--text-primary)',background:addTab==='manual'?'var(--bg-chip)':'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-body)',opacity:addTab==='manual'?0.4:1,boxSizing:'border-box'}}
                    />
                  </div>
                  {addTab === 'url' && (
                    <button onClick={() => setUrlParsed(true)}
                      style={{height:44,padding:'0 16px',background:'var(--brand)',color:'#fff',border:'none',borderRadius:'var(--r-md)',fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'var(--font-body)',boxShadow:'var(--brand-shadow)',flexShrink:0}}>
                      불러오기
                    </button>
                  )}
                </div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:6,display:'flex',alignItems:'center',gap:4}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  레뷰·강남맛집·미블 등 18개 플랫폼 URL 지원해요
                </div>
              </div>

              {/* 탭 전환 (URL입력 / 수기입력) */}
              <div style={{display:'flex',gap:0,marginBottom:16,borderRadius:'var(--r-md)',overflow:'hidden',border:'1px solid var(--border-mid)',background:'var(--bg-chip)'}}>
                {(['url','manual'] as const).map((tab, i) => {
                  const labels = {url:'URL 입력', manual:'수기 입력'};
                  const isActive = addTab === tab;
                  return (
                    <button key={tab} onClick={() => setAddTab(tab)}
                      style={{flex:1,height:38,fontSize:12,fontWeight:isActive?700:600,fontFamily:'var(--font-body)',cursor:'pointer',border:'none',background:isActive?'var(--bg-card)':'transparent',color:isActive?'var(--brand-text)':'var(--text-muted)',borderRight:i<1?'1px solid var(--border-mid)':'none',transition:'all 0.15s',boxShadow:isActive?'inset 0 -2px 0 var(--brand)':'none'}}>
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              {/* ② 수기 입력 모드 배너 + 필드 */}
              {addTab === 'manual' && (
                <>
                  {/* 직접 입력 모드 배너 */}
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,padding:'10px 14px',background:'var(--brand-xlight)',borderRadius:'var(--r-lg)',border:'1px solid var(--brand-light)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span style={{fontSize:12,color:'var(--brand-text)',fontWeight:700}}>직접 입력 모드 — 아래 항목을 입력해 주세요</span>
                  </div>

                  {/* 구분선 */}
                  <div style={{height:1,background:'var(--border)',margin:'0 -20px 20px'}} />

                  {/* 섹션 헤더 */}
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20}}>
                    <div style={{width:3,height:14,background:'var(--brand)',borderRadius:2,flexShrink:0}} />
                    <span style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.08em',textTransform:'uppercase'}}>운영 정보 입력</span>
                    <div style={{flex:1,height:1,background:'var(--border)'}} />
                    <span style={{fontSize:10,color:'var(--text-muted)'}}>* 필수</span>
                  </div>

                  {/* 캠페인명 */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>캠페인명 <span style={{color:'var(--s-overdue)'}}>*</span></label>
                    <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="예) 카페투어 강남점 체험단" style={{width:'100%',padding:'12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:13,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                  </div>

                  {/* 플랫폼 */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>플랫폼 <span style={{color:'var(--s-overdue)'}}>*</span></label>
                    <select value={manualPlatform} onChange={e => setManualPlatform(e.target.value)}
                      style={{width:'100%',padding:'12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:13,color:manualPlatform?'var(--text-primary)':'var(--text-muted)',background:'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-body)',boxSizing:'border-box',appearance:'none',backgroundImage:'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23999\' stroke-width=\'2\'><polyline points=\'6 9 12 15 18 9\'/></svg>")',backgroundRepeat:'no-repeat',backgroundPosition:'right 14px center',paddingRight:38}}>
                      <option value="" disabled>플랫폼을 선택해 주세요</option>
                      {PLATFORMS.map(p => (
                        <option key={p} value={p} style={{color:'var(--text-primary)'}}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* 채널 */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>채널 <span style={{fontSize:10,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(복수 선택 가능)</span></label>
                    <div style={{display:'flex',gap:8}}>
                      {CHANNELS.map(ch => {
                        const active = manualChannels.has(ch);
                        return (
                          <div key={ch} onClick={() => setManualChannels(prev => { const n = new Set(prev); n.has(ch) ? n.delete(ch) : n.add(ch); return n; })}
                            style={{flex:1,height:40,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'var(--r-md)',border:active?'1.5px solid var(--brand)':'1px solid var(--border-mid)',background:active?'var(--brand-light)':'var(--bg-card)',color:active?'var(--brand-text)':'var(--text-secondary)',fontSize:12,fontWeight:active?700:600,cursor:'pointer',transition:'all 0.15s',userSelect:'none'}}>
                            {ch}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 마감일자 + 체험일자 */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                    <div>
                      <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>마감일자 <span style={{color:'var(--s-overdue)'}}>*</span></label>
                      <input type="date" value={manualDeadline} onChange={e => setManualDeadline(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                    </div>
                    <div>
                      <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>체험일자</label>
                      <input type="date" value={manualExpDate} onChange={e => setManualExpDate(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                    </div>
                  </div>

                  {/* 협찬 금액 */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>협찬 금액 <span style={{fontSize:10,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(선택)</span></label>
                    <div style={{position:'relative'}}>
                      <input type="text" inputMode="numeric" value={manualAmount} onChange={e => setManualAmount(e.target.value)} placeholder="예) 50,000" style={{width:'100%',padding:'12px 36px 12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:13,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-mono)',letterSpacing:'-0.3px',boxSizing:'border-box'}} />
                      <span style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'var(--text-muted)',pointerEvents:'none'}}>원</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginTop:5}}>협찬 상품 시가 기준으로 입력해요</div>
                  </div>

                  {/* 위치 */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>위치</label>
                    <input value={manualLocation} onChange={e => setManualLocation(e.target.value)} placeholder="예) 서울 강남구" style={{width:'100%',padding:'12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:13,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                  </div>

                  {/* 업주 전화번호 */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>업주 전화번호 <span style={{fontSize:10,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(선택)</span></label>
                    <div style={{position:'relative'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.1 2.2 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.46-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
                      <input type="tel" placeholder="예약·방문 문의용" style={{width:'100%',padding:'12px 14px 12px 36px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:13,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',height:44,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                    </div>
                  </div>

                  {/* 예약 여부 (F-08A) */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>예약 여부</label>
                    <div style={{display:'flex',gap:8}}>
                      {(['예정','완료','불필요'] as const).map(v => (
                        <div key={v} onClick={() => setResToggle(v)}
                          style={{flex:1,height:44,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'var(--r-md)',border:resToggle===v?'1.5px solid var(--brand)':'1px solid var(--border-mid)',background:resToggle===v?'var(--brand-light)':'var(--bg-card)',color:resToggle===v?'var(--brand-text)':'var(--text-secondary)',fontSize:13,fontWeight:resToggle===v?700:600,cursor:'pointer',transition:'all 0.15s'}}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 주말 방문 (F-08) */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>주말 방문 <span style={{fontSize:10,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(선택)</span></label>
                    <div style={{display:'flex',gap:8}}>
                      {(['가능','불가'] as const).map(v => (
                        <div key={v} onClick={() => setWkndToggle(prev => prev === v ? null : v)}
                          style={{flex:1,height:44,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'var(--r-md)',border:wkndToggle===v?'1.5px solid var(--brand)':'1px solid var(--border-mid)',background:wkndToggle===v?'var(--brand-light)':'var(--bg-card)',color:wkndToggle===v?'var(--brand-text)':'var(--text-secondary)',fontSize:13,fontWeight:wkndToggle===v?700:600,cursor:'pointer',transition:'all 0.15s'}}>
                          {v}
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginTop:5}}>미선택 시 캘린더에 — 으로 표시돼요</div>
                  </div>

                  {/* 메모 (F-12) */}
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>메모 <span style={{fontSize:10,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(선택)</span></label>
                    <textarea rows={3} value={manualMemo} onChange={e => setManualMemo(e.target.value)} placeholder="주차 가능 여부, 사전 예약 방법, 유의사항 등 자유롭게 입력해요 (최대 200자)"
                      style={{width:'100%',padding:'12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',resize:'none',lineHeight:1.7,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                  </div>

                  {/* 가이드라인 (F-guide) */}
                  <div style={{marginBottom:20}}>
                    <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>가이드라인 <span style={{fontSize:10,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(선택)</span></label>
                    <textarea rows={3}
                      value={guidelineText} onChange={e => setGuidelineText(e.target.value)}
                      placeholder={'예) 음료 2잔 + 디저트 1개 무료 제공\n#해시태그 필수\n포스팅 후 URL 제출'}
                      style={{width:'100%',padding:'12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',resize:'none',lineHeight:1.7,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                    <div style={{fontSize:11,color:'var(--text-muted)',marginTop:5,display:'flex',alignItems:'center',gap:4}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      해시태그·제공 내역·포스팅 조건 등을 자유롭게 적어요
                    </div>
                  </div>
                </>
              )}

              {/* URL 탭: 빈 상태 힌트 + 가이드라인 입력 */}
              {addTab === 'url' && (
                <>
                  <div style={{padding:'28px 0 20px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                    <div style={{fontSize:36,opacity:0.35,marginBottom:2}}>🔗</div>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--text-primary)'}}>URL을 붙여넣어 보세요</div>
                    <div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.7,maxWidth:240}}>선정된 공고 URL을 입력하면<br/>마감일·캠페인명·제공상품·위치<br/>채널·가이드라인을 자동으로 채워드려요</div>
                  </div>
                  {/* 가이드라인 (URL 불러오기 완료 후에만 표시) */}
                  {urlParsed && (
                    <div style={{marginBottom:20}}>
                      <label style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--text-muted)',letterSpacing:'0.06em',textTransform:'uppercase',display:'block',marginBottom:8}}>가이드라인 <span style={{fontSize:10,color:'var(--text-disabled)',fontWeight:400,textTransform:'none'}}>(선택)</span></label>
                      <textarea rows={3}
                        value={guidelineText} onChange={e => setGuidelineText(e.target.value)}
                        placeholder={'예) 음료 2잔 + 디저트 1개 무료 제공\n#해시태그 필수\n포스팅 후 URL 제출'}
                        style={{width:'100%',padding:'12px 14px',border:'1.5px solid var(--border-mid)',borderRadius:'var(--r-md)',fontSize:12,color:'var(--text-primary)',background:'var(--bg-input)',outline:'none',resize:'none',lineHeight:1.7,fontFamily:'var(--font-body)',boxSizing:'border-box'}} />
                      <div style={{fontSize:11,color:'var(--text-muted)',marginTop:5,display:'flex',alignItems:'center',gap:4}}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        해시태그·제공 내역·포스팅 조건 등을 자유롭게 적어요
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* CTA */}
              <button onClick={addTab === 'manual' ? handleAddManual : closeSheet} style={{width:'100%',padding:'13px 22px',borderRadius:'var(--r-md)',fontSize:15,fontWeight:700,background:'var(--brand)',color:'#fff',border:'none',cursor:'pointer',boxShadow:'var(--brand-shadow)',marginTop:4,opacity:addTab==='manual'&&(!manualName.trim()||!manualPlatform||!manualDeadline)?0.5:1}}>
                등록할게요
              </button>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────
          SCR-012  월간 캘린더 뷰
      ──────────────────────────────────── */}
      {viewMode === 'monthly' && (
        <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden',background:'var(--bg-card)'}}>

          {/* 앱 헤더 */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px 10px',background:'var(--bg-card)',flexShrink:0,borderBottom:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <LogoMark />
              <span style={{fontFamily:'var(--font-logo)',fontSize:17,fontWeight:800,letterSpacing:'-0.3px',color:'var(--brand)'}}>cheche</span>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button style={{width:36,height:36,borderRadius:'50%',border:'none',background:'var(--bg-input)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span style={{position:'absolute',top:6,right:6,width:7,height:7,background:'var(--s-overdue)',borderRadius:'50%',border:'1.5px solid var(--bg-card)'}} />
              </button>
              <button style={{width:36,height:36,borderRadius:'50%',border:'none',background:'var(--bg-input)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* 월 네비게이션 */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 14px 4px',flexShrink:0}}>
            <button onClick={prevMonth} style={{width:30,height:30,background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',color:'var(--text-secondary)',fontSize:14,cursor:'pointer',display:'grid',placeItems:'center'}}>‹</button>
            <div style={{fontSize:17,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.5px'}}>{year}. {month + 1}</div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <button onClick={() => setViewMode('weekly')} style={{border:'1.5px solid var(--brand)',color:'var(--brand-text)',background:'var(--brand-light)',fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:'var(--r-full)',cursor:'pointer',fontFamily:'var(--font-body)'}}>주간</button>
              <button onClick={nextMonth} style={{width:30,height:30,background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',color:'var(--text-secondary)',fontSize:14,cursor:'pointer',display:'grid',placeItems:'center'}}>›</button>
            </div>
          </div>

          {/* 필터 칩 */}
          <div style={{display:'flex',gap:5,padding:'2px 14px 6px',overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
            {([['all','전체'], ['r','리뷰마감'], ['g','체험일자']] as [string, string][]).map(([type, label]) => (
              <button key={type}
                onClick={() => { setCalFilter(type as 'all'|EventType); setSelDate(null); }}
                style={{fontSize:11,fontWeight:600,padding:'5px 11px',borderRadius:'var(--r-full)',border:`1px solid ${calFilter===type?'var(--brand)':'var(--border-mid)'}`,background:calFilter===type?'var(--brand-light)':'var(--bg-card)',color:calFilter===type?'var(--brand-text)':'var(--text-secondary)',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,display:'inline-flex',alignItems:'center',gap:4,fontFamily:'var(--font-body)'}}>
                {type === 'r' && <span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'var(--tab-red)'}} />}
                {type === 'g' && <span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'var(--s-selected)'}} />}
                {label}
              </button>
            ))}
            {/* 선정발표(b) · 신청마감(y) — Phase 2, data-hide */}
          </div>

          {/* 요일 헤더 */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'4px 0',flexShrink:0}}>
            {DOW_LABELS.map((d, i) => (
              <span key={i} style={{textAlign:'center',fontSize:11,fontWeight:700,color:i===0?'var(--tab-red)':i===6?'var(--tab-blue)':'var(--text-muted)'}}>{d}</span>
            ))}
          </div>

          {/* 캘린더 그리드 — flex:1로 남은 공간 전부, ref로 rowH 동적 계산 */}
          <div
            ref={gridWrapRef}
            style={{flex:1,overflowY:'auto',scrollbarWidth:'none',animation:slideDir==='right'?'slideInLeft 280ms cubic-bezier(0.16,1,0.3,1)':slideDir==='left'?'slideInRight 280ms cubic-bezier(0.16,1,0.3,1)':'none'}}
            onTouchStart={handleTouchStart}
            onTouchEnd={e => handleTouchEnd(e, 'monthly')}
          >
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',borderLeft:'1px solid var(--border)',width:'100%'}}>
              {cells.slice(0, weeksCount * 7).map((cell, i) => {
                const dnumColor = cell.om ? 'var(--text-disabled)' : cell.dow === 0 ? 'var(--tab-red)' : cell.dow === 6 ? 'var(--tab-blue)' : 'var(--text-primary)';
                const cellDoneAll = cell.evs.length > 0 && cell.evs.every(e => doneSet.has(e.id));

                return (
                  <div key={i}
                    onClick={() => calDayClick(cell.ds)}
                    style={{borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)',padding:'4px 2px 4px',minHeight:rowH,cursor:'pointer',position:'relative',background:cell.isSel?'var(--brand-xlight)':'transparent',boxSizing:'border-box',minWidth:0,overflow:'hidden'}}>
                    {/* 날짜 숫자 */}
                    {cell.isToday ? (
                      <div style={{width:22,height:22,background:'var(--brand)',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,boxShadow:'var(--brand-shadow)',marginBottom:2}}>{cell.d}</div>
                    ) : (
                      <div style={{fontSize:12,fontWeight:500,lineHeight:1,marginBottom:2,color:dnumColor}}>{cell.d}</div>
                    )}
                    {/* 완료 플래그 */}
                    {cellDoneAll && (
                      <div style={{position:'absolute',top:2,right:2,width:14,height:14,background:'var(--s-selected)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2"><polyline points="2 6 5 9 10 3"/></svg>
                      </div>
                    )}
                    {/* 이벤트 칩 (최대 2개 + +N) */}
                    {cell.evs.slice(0, 2).map(ev => (
                      <div key={ev.id} style={{fontSize:10,fontWeight:700,color:TYPE_COLOR[ev.type]||'var(--text-muted)',background:TYPE_BG[ev.type]||'var(--bg-chip)',borderRadius:3,padding:'1px 3px',marginTop:2,lineHeight:1.3,height:18,width:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',boxSizing:'border-box',opacity:doneSet.has(ev.id)?0.38:1}}>
                        {ev.name}
                      </div>
                    ))}
                    {cell.evs.length > 2 && (
                      <div style={{fontSize:9,fontWeight:700,color:'var(--text-muted)',marginTop:1,lineHeight:1}}>+{cell.evs.length - 2}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAB */}
          <button onClick={() => setOpenSheet('addCalSheet')}
            style={{position:'absolute',bottom:72,right:20,width:52,height:52,background:'var(--brand)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(28,60,130,0.38)',cursor:'pointer',zIndex:10,border:'none'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      )}

      {/* ────────────────────────────────────
          SCR-012A  주간 캘린더 뷰
      ──────────────────────────────────── */}
      {viewMode === 'weekly' && (
        <div style={{display:'flex',flexDirection:'column',flex:1,background:'var(--bg-page)',overflow:'hidden'}}>

          {/* 헤더 */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px 10px',background:'var(--bg-card)',flexShrink:0,borderBottom:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <LogoMark />
              <span style={{fontFamily:'var(--font-logo)',fontSize:17,fontWeight:800,letterSpacing:'-0.3px',color:'var(--brand)'}}>cheche</span>
            </div>
            <button onClick={() => setViewMode('monthly')} style={{border:'1.5px solid var(--brand)',color:'var(--brand-text)',background:'var(--brand-light)',fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:'var(--r-full)',cursor:'pointer',fontFamily:'var(--font-body)'}}>월간 보기</button>
          </div>

          {/* 주 네비게이션 */}
          <div style={{background:'var(--bg-card)',borderBottom:'1px solid var(--border)',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px 6px'}}>
              <button onClick={prevWeek} style={{width:32,height:32,background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',color:'var(--text-secondary)',fontSize:14,cursor:'pointer',display:'grid',placeItems:'center'}}>‹</button>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:16,fontWeight:800,color:'var(--text-primary)',letterSpacing:'-0.5px'}}>{weekLabel}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'var(--font-mono)',marginTop:1}}>{year}년</div>
              </div>
              <button onClick={nextWeek} style={{width:32,height:32,background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',color:'var(--text-secondary)',fontSize:14,cursor:'pointer',display:'grid',placeItems:'center'}}>›</button>
            </div>

            {/* 7일 미니 스트립 (월~일) */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'4px 10px 12px',gap:2}}>
              {weekDays.map((wd, i) => {
                const dayLabel = ['월','화','수','목','금','토','일'][i];
                const isToday  = wd.ds === todayStr;
                const hasDot   = weekEventsAll.some(e => e.date === wd.ds);
                const isSun    = i === 6;
                const isSat    = i === 5;
                return (
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <span style={{fontSize:10,fontWeight:isToday?700:600,color:isToday?'var(--brand-text)':isSun?'var(--tab-red)':isSat?'var(--tab-blue)':'var(--text-muted)',letterSpacing:'0.04em'}}>{dayLabel}</span>
                    <div style={{width:30,height:30,borderRadius:'50%',background:isToday?'var(--brand)':'transparent',color:isToday?'#fff':isSun?'var(--tab-red)':isSat?'var(--tab-blue)':'var(--text-primary)',fontSize:13,fontWeight:isToday?800:500,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:isToday?'var(--brand-shadow)':'none'}}>
                      {wd.date.getDate()}
                    </div>
                    <div style={{width:5,height:5,borderRadius:'50%',background:hasDot?'var(--brand)':'transparent'}} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 이벤트 리스트 — scrollable + 스와이프 */}
          <div
            style={{flex:1,overflowY:'auto',scrollbarWidth:'none',padding:'0 14px 16px',animation:slideDir==='right'?'slideInLeft 280ms cubic-bezier(0.16,1,0.3,1)':slideDir==='left'?'slideInRight 280ms cubic-bezier(0.16,1,0.3,1)':'none'}}
            onTouchStart={handleTouchStart}
            onTouchEnd={e => handleTouchEnd(e, 'weekly')}
          >
            {weekEventsByDay.map(({ds, date, dow, events}) => {
              const dayLabel = ['월','화','수','목','금','토','일'][weekDays.findIndex(w => w.ds === ds)];
              const isToday  = ds === todayStr;
              return (
                <div key={ds}>
                  {/* 날짜 헤더 */}
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 2px 8px'}}>
                    <div style={{width:4,height:4,borderRadius:'50%',background:events.length?'var(--tab-red)':isToday?'var(--brand)':'var(--border-mid)'}} />
                    <span style={{fontSize:12,fontWeight:700,color:isToday?'var(--brand-text)':'var(--text-primary)',fontFamily:'var(--font-mono)',letterSpacing:'0.04em'}}>
                      {date.getMonth()+1}월 {date.getDate()}일 ({dayLabel})
                    </span>
                    {isToday && <span style={{fontSize:10,fontWeight:700,color:'var(--brand)',background:'var(--brand-light)',borderRadius:'var(--r-full)',padding:'1px 8px',letterSpacing:'0.04em'}}>오늘</span>}
                    <div style={{flex:1,height:1,background:'var(--border)'}} />
                  </div>
                  {events.length === 0 ? (
                    <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--r-xl)',padding:'14px 16px',display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:'var(--r-sm)',background:'var(--bg-page)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>✅</div>
                      <span style={{fontSize:13,color:'var(--text-muted)'}}>오늘 예정된 일정이 없어요</span>
                    </div>
                  ) : events.map(ev => (
                    <div key={ev.id}
                      onClick={() => showCalSheet(ev.id)}
                      style={{display:'flex',alignItems:'center',gap:11,padding:'11px 14px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',cursor:'pointer',position:'relative',overflow:'hidden',marginBottom:8}}>
                      <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:TYPE_COLOR[ev.type]||'var(--text-muted)'}} />
                      <div style={{width:32,height:32,borderRadius:'var(--r-sm)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14,background:TYPE_BG[ev.type]||'var(--bg-chip)'}}>
                        {ev.type==='r'?'🔴':'🟢'}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,color:'var(--text-muted)',fontWeight:600,marginBottom:1,fontFamily:'var(--font-mono)',letterSpacing:'0.04em',textTransform:'uppercase'}}>{ev.label}</div>
                        <div style={{fontSize:13,fontWeight:700,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ev.name}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)',marginTop:1}}>{ev.plat} · 📍 {ev.location}</div>
                      </div>
                      <span style={{fontSize:11,fontWeight:600,fontFamily:'var(--font-mono)',padding:'3px 9px',borderRadius:'var(--r-full)',flexShrink:0,background:ev.type==='r'?'var(--s-overdue-bg)':'var(--s-applied-bg)',color:ev.type==='r'?'var(--s-overdue)':'var(--s-applied)'}}>
                        {ev.dday}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{height:80}} />
          </div>

          {/* FAB */}
          <button onClick={() => setOpenSheet('addCalSheet')}
            style={{position:'absolute',bottom:72,right:20,width:52,height:52,background:'var(--brand)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(28,60,130,0.38)',cursor:'pointer',zIndex:10,border:'none'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="22" height="22"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
