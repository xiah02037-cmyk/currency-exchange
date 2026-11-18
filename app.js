/* Language packs are separate objects. Switching replaces copy in place.
   The theme line is fixed and is not translated.
   fx-lang-manual is the user's choice and is never overwritten by IP.
   fx-lang is the last resolved language, used when a lookup fails. */
(function () {
  "use strict";

  var THEME_LINE = "探索全球货币兑换，根据事实汇率";
  var MANUAL_KEY = "fx-lang-manual";
  var LANG_KEY = "fx-lang";
  /* Mainland China, Hong Kong, Macao, Taiwan. Every other country code uses English. */
  var ZH_REGIONS = { CN: 1, HK: 1, MO: 1, TW: 1 };
  var CODES = ["USD", "EUR", "GBP", "JPY", "CNY", "HKD", "AUD", "CAD", "SGD", "CHF", "KRW", "THB"];
  /* Checklist order: mid-market, spread apart, fees apart, arrival window, lock or refresh.
     1 means the public description usually shows it. These are not prices. */
  var PROVIDERS = [
    { id: "bank", ticks: [0, 0, 1, 1, 0] },
    { id: "airport", ticks: [0, 0, 0, 1, 0] },
    { id: "wise", ticks: [1, 1, 1, 1, 0] },
    { id: "remitly", ticks: [0, 0, 1, 1, 0] },
    { id: "xe", ticks: [1, 0, 0, 0, 0] },
    { id: "page", ticks: [1, 1, 1, 1, 1] }
  ];

  var PACKS = {
    zh: {
      metaTitle: "探索全球货币兑换",
      heroEyebrow: "公开中间价对照",
      heroTitle: "先看清中间价，再决定换不换",
      themeLabel: "主题",
      heroLead: "这一页只放三件能核对的事：公开中间价、价差、到账时间。不报价，也不下一单。",
      demoKicker: "本地演示",
      demoNote: "金额和币种只在这台设备上演算，不会发出兑换请求。",
      amountLabel: "金额",
      fromLabel: "从",
      toLabel: "到",
      scenarioLabel: "用一个假设价差看量级",
      scenarioHint: "下面的百分比是教学情景，用来看价差有多大，不是今日牌价。",
      keepKicker: "仍算在中间价这一侧",
      gapKicker: "情景价差留下的部分",
      gapCaption: "假设价差 {pct}%，金额 {amount} {code}。这不是实时牌价。",
      noQuote: "不计算兑成{name}（{code}）之后的数额。那会变成一条报价，而本页不编造报价。",
      pairLine: "{fromName} {from} → {toName} {to}",
      samePair: "请选择两种不同的货币。同一种货币没有兑换。",
      invalidAmount: "请输入大于 0 的金额，情景才会演算。",
      tooBig: "金额请留在 10 亿以内，这只是演示。",
      claimLine: "这一页的说法：从公开中间价出发，把价差和到账分开写清。",
      explainerTitle: "一眼看完：中间价、价差、到账",
      explainerLead: "汇率不该是一个含糊的数。能核对的，是这三件事彼此分开。",
      arrivalTitle: "到账差在轨道",
      feeTitle: "费用通常藏在三个地方",
      feeBody: "写进汇率的价差、汇出时的手续费、收款行或中间行再扣的一笔。事实页面会把三处都写明，或者标明哪一处未知。",
      lockTitle: "锁汇锁的是时间，不是划算",
      lockBody: "锁汇是一句带截止时间的话：在这之前，价格不变。没有时钟，也没有价格来源，就只是屏幕在刷新。本页不锁汇，也不提供价格。",
      compareTitle: "同一件事，差别在有没有把价格说完",
      compareLead: "银行、机场和常见换汇应用，都用同一张五题清单来看。",
      compareScale: "圆点从左到右对应 1 到 5。数字是点亮了几项。",
      compareFoot: "数字是清单得分，不是牌价，也不是今日价差。条更长，只表示说明更完整，不表示成交更便宜。",
      wallTitle: "货币很多，读法只有一种",
      wallLead: "左右滑动。点一下，只更换这一页上的说明。",
      wallScroller: "货币",
      wallRead: "读作“基准 / 标价”。要换成{name}（{code}），仍然先看公开中间价，再看价差，再看到账窗口。点这一枚不会离开本页。",
      stepsTitle: "三步，都停在这一页",
      pointsTitle: "三句说得大胆、也查得着的话",
      checkLabel: "如何核对",
      safetyTitle: "安全先问：钱是交给谁的",
      safetyBody: "本页不收款、不兑换，也不保存你输入的金额。真要汇出时，先核对机构的法定名称、客户资金是否与公司资金分开、牌照能否在公开监管名录里查到。一个页面如果说不出机构是谁，就不要把钱交给它。",
      faqTitle: "先问清，再相信",
      closing: "本页是说明，不是报价，也不是汇款服务。",
      langTitle: "语言",
      langZh: "中文",
      langEn: "English",
      yes: "有",
      no: "无",
      statusPending: "正在按网络所在地区选择语言。",
      statusIp: "已按网络所在地区选择。你点一次语言之后，我们只保留你的选择。",
      statusManual: "已保存你的选择。刷新后仍用它，地区检测不会改写。",
      statusFallback: "地区检测没有返回。当前语言已留在这台设备上；点选之后也会一直保留。",
      facts: [
        { title: "中间价", tag: "对照的起点", body: "公开市场上买入价和卖出价的中点。银行、机场、应用都该拿它做对照，而不是拿自己的广告做对照。" },
        { title: "价差", tag: "要被点名", body: "你看见的价格离中间价有多远。它可以藏在汇率里面，也可以单独写成一笔费用。" },
        { title: "到账", tag: "不听口号", body: "轨道决定时间。柜台现金按分钟，跨境汇款常常按工作日。比的是同一路线上写明的窗口。" }
      ],
      rails: [
        { name: "柜台现金", when: "分钟", note: "人在现场" },
        { name: "应用付款", when: "看其窗口", note: "以写明的轨道为准" },
        { name: "银行汇款", when: "常按工作日", note: "跨境尤其如此" }
      ],
      pains: [
        "牌价印得很大，也不等于中间价。",
        "手续费写着零，价差可能还在汇率里。",
        "“即时”两个字，要对上轨道和截止时间。"
      ],
      tickNames: ["中间价", "价差分开", "费用分开", "到账窗口", "锁定或刷新"],
      providers: {
        bank: { name: "银行 App", blurb: "常见公开形态：应用里有本行汇率，手续费常常另列，到账多写明工作日。中间价和价差很少分开写，锁汇条件也很少作为对照的一部分。" },
        airport: { name: "机场兑换", blurb: "能当场核对的是现金，按分钟交割。牌价通常不是中间价，价差也很少单独成行。" },
        wise: { name: "Wise", blurb: "其公开说明是：汇率用中间价，费用单独列出，并给出预计到账。价格能保持多久，以发送时页面上的说明为准，所以清单上不代为勾选“锁汇”。" },
        remitly: { name: "Remitly", blurb: "应用会给出汇率和费用，并分成更快与更省两档，档位同时改变价格和到账。标题上的汇率并不总是中间价。" },
        xe: { name: "XE", blurb: "人们打开 XE 换算器，是为了看中间价。换算器不负责把钱送到对方。若使用其汇款产品，费用和到账以那一页写明的为准，这里不代为勾选。" },
        page: { name: "本页", blurb: "五项都写在本页：中间价、价差、费用、到账，以及价格是锁定还是在刷新。最后一项是解释，不是在提供锁汇。本页不报价，也不经手资金。" }
      },
      steps: [
        { title: "写下金额和两种货币", body: "停在本页。这是演示，请求不会送出。" },
        { title: "先找公开中间价", body: "再点名价差和每一笔费用。藏起来的那一笔，也要标明未知。" },
        { title: "读到账时间窗", body: "确认价格是锁定，还是仍在变动。没有截止时间，就不是锁汇。" }
      ],
      points: [
        { title: "速度", body: "快慢是轨道的属性。柜台现金是分钟级，银行跨境常常是工作日，应用则取决于它写明的那一条付款轨道。没有轨道和截止时间的“即时”，不能当成事实。", check: "拿同一路线上、对方写明的到账窗口来比。" },
        { title: "透明", body: "对照从公开中间价开始。离开中间价的部分，是价差或费用，就该有名字。本页把这些词拆开，不把它们揉成一个优惠价。", check: "任何报价都能问：中间价是多少，差在哪里。" },
        { title: "覆盖", body: "常见货币用同一种读法：一个中间价，一段价差，一扇到账窗口。货币墙只切换说明，不打开别的页面。", check: "换一个币种，问题仍然是这三句。" }
      ],
      safetyItems: [
        "法定名称写在页面上了吗？",
        "牌照或注册，能在公开监管名录里查到吗？",
        "客户资金和公司资金，有没有分开说明？",
        "出错的时候找谁，写清了吗？"
      ],
      faqs: [
        { q: "这上面的数字是今天的汇率吗？", a: "不是。情景里的百分比是为了看价差的量级，清单上的数字是说明完整度。本页不拉取、也不展示可成交价格。中间价应当来自公开市场数据，价差和费用以你准备使用的那家机构自己的页面为准。" },
        { q: "什么是中间价？", a: "同一时刻买方报价和卖方报价的中点，也叫市场中间价。它是对照的起点，不是银行承诺卖给你的价格。" },
        { q: "为什么机场很快，仍可能更贵？", a: "现金当场交割，所以快。快是轨道的事实。牌价常常远离中间价，而且价差很少单独写出来。贵不贵，要把牌价拿去和中间价比。" },
        { q: "锁汇是不是表示这个价格划算？", a: "不是。锁汇只表示在写明的时间之前价格不变。被锁住的也可以是一个很宽的价差。先看它离中间价有多远，再看锁到什么时候。" },
        { q: "银行、机场、Wise、Remitly、XE 该怎么比？", a: "用同一张清单，而不是用口号。银行应用通常给出本行汇率、另列费用和工作日到账。机场柜台用现金，快，牌价通常更宽。Wise 公开采用中间价并单列费用。Remitly 用速度分档，档位会同时改价格和到账。XE 的换算器展示中间价，真正汇款时要另看汇款页上的费用和到账。" },
        { q: "本页会收到我的金额吗？", a: "不会。金额和币种只在你的浏览器里演算，没有订单，也没有我们的服务器。" },
        { q: "语言是怎么选的？", a: "第一次打开时，浏览器会请求一个公开的 IP 地区接口，只用来判断国家或地区。中国内地、香港、澳门、台湾显示中文，其他地区显示英文。接口失败时，沿用这台设备上已经保存的语言。你一旦点选语言，这个选择会留在本地，之后的地区结果不会改写它。" }
      ],
      currencies: {
        USD: { name: "美元", where: "美国，也是最常见的计价货币之一" },
        EUR: { name: "欧元", where: "欧元区" },
        GBP: { name: "英镑", where: "英国" },
        JPY: { name: "日元", where: "日本" },
        CNY: { name: "人民币", where: "中国内地" },
        HKD: { name: "港元", where: "中国香港" },
        AUD: { name: "澳元", where: "澳大利亚" },
        CAD: { name: "加元", where: "加拿大" },
        SGD: { name: "新加坡元", where: "新加坡" },
        CHF: { name: "瑞士法郎", where: "瑞士" },
        KRW: { name: "韩元", where: "韩国" },
        THB: { name: "泰铢", where: "泰国" }
      }
    },
    en: {
      metaTitle: "Explore factual currency exchange",
      heroEyebrow: "A public mid-market reading",
      heroTitle: "Read the mid-market before you exchange",
      themeLabel: "Theme",
      heroLead: "This page keeps three checkable facts in view: the public mid-market, the spread, and when money arrives. No quote. No order.",
      demoKicker: "On this device",
      demoNote: "The amount and currencies stay in this browser. Nothing is sent as an exchange request.",
      amountLabel: "Amount",
      fromLabel: "From",
      toLabel: "To",
      scenarioLabel: "Try a gap, just to see the size",
      scenarioHint: "These percents are a teaching scenario, not today's board rate.",
      keepKicker: "Still on the mid-market side",
      gapKicker: "Held back by the scenario gap",
      gapCaption: "A {pct}% gap on {amount} {code}. Not a live price.",
      noQuote: "The amount in {name} ({code}) is not calculated. That figure would be a quote, and this page does not invent one.",
      pairLine: "{fromName} {from} → {toName} {to}",
      samePair: "Pick two different currencies. A currency does not exchange into itself.",
      invalidAmount: "Enter an amount above zero to run the scenario.",
      tooBig: "Keep the demo under one billion.",
      claimLine: "The claim: start from the public mid-market, and write the spread and the arrival apart from it.",
      explainerTitle: "Mid-market, spread, and arrival",
      explainerLead: "A rate should not be one blurry number. What you can check is these three facts, kept apart.",
      arrivalTitle: "Arrival follows the rail",
      feeTitle: "Fees hide in three places",
      feeBody: "Inside the rate as a spread, as a send fee, or as a fee taken by a receiving or correspondent bank. A factual page names all three, or says which one is unknown.",
      lockTitle: "A lock is a clock, not a bargain",
      lockBody: "A rate lock is a sentence with a deadline: until this time, the price does not move. No clock and no source means the screen is only refreshing. This page does not lock a rate and does not offer one.",
      compareTitle: "The same exchange. Said in full, or not.",
      compareLead: "Bank apps, airport counters, and the usual FX apps are read against one five-point checklist.",
      compareScale: "Dots run left to right, matching 1 through 5. The number is how many are lit.",
      compareFoot: "The numbers are checklist scores, not board rates and not today's spread. A longer bar means a fuller explanation, not a cheaper trade.",
      wallTitle: "Many currencies, one way to read them",
      wallLead: "Swipe sideways. A tap only changes the note on this page.",
      wallScroller: "Currencies",
      wallRead: "Read a pair as base / quote. To move into {name} ({code}), start from the public mid-market, then the spread, then the arrival window. Tapping this does not leave the page.",
      stepsTitle: "Three checks, all on this page",
      pointsTitle: "Three claims you can actually check",
      checkLabel: "How to check",
      safetyTitle: "Safety starts with who holds the money",
      safetyBody: "This page does not take money, exchange it, or store the amount you type. Before you send funds anywhere else, check the firm's legal name, whether client money is kept apart, and whether a license can be found on a public register. If a page cannot name the firm, do not hand it the money.",
      faqTitle: "Ask these before you trust a rate",
      closing: "An explainer. Not a quote. Not a money-transfer service.",
      langTitle: "Language",
      langZh: "中文",
      langEn: "English",
      yes: "shown",
      no: "not shown",
      statusPending: "Choosing a language from the network region.",
      statusIp: "Chosen from the network region. After you tap a language, only your choice is kept.",
      statusManual: "Your choice is saved on this device. A refresh keeps it, and a region lookup will not replace it.",
      statusFallback: "The region lookup did not answer. This language stays on the device; a tap is kept too.",
      facts: [
        { title: "Mid-market", tag: "The reference", body: "The midpoint of the public buy and sell. Banks, airports, and apps should be compared with it, not with their own advertisement." },
        { title: "Spread", tag: "Name it", body: "How far the price you are shown sits from the mid-market. It can hide inside the rate, or sit on the page as its own fee." },
        { title: "Arrival", tag: "Not a slogan", body: "The rail sets the time. Counter cash is minutes. Cross-border payments are often counted in business days. Compare the window written for the same route." }
      ],
      rails: [
        { name: "Counter cash", when: "Minutes", note: "You are there" },
        { name: "App payout", when: "Their window", note: "The rail they name" },
        { name: "Bank transfer", when: "Often business days", note: "Especially across borders" }
      ],
      pains: [
        "A large rate on a board is still not the mid-market.",
        "A zero fee can still hide a spread inside the rate.",
        "“Instant” counts only when the rail and the cutoff are written down."
      ],
      tickNames: ["Mid-market", "Spread apart", "Fees apart", "Arrival window", "Lock or refresh"],
      providers: {
        bank: { name: "Bank app", blurb: "The usual public shape: the bank's own rate in the app, a fee often on its own line, and an arrival counted in business days. The mid-market and the spread are rarely written apart, and a lock is rarely part of the comparison." },
        airport: { name: "Airport exchange", blurb: "What you can check on the spot is cash, handed over in minutes. The board rate is usually not the mid-market, and the gap is rarely its own line." },
        wise: { name: "Wise", blurb: "Publicly described as the mid-market rate, a fee on its own line, and an estimated arrival. How long that rate holds is stated on their screen at send time, so this checklist does not tick a lock for them." },
        remitly: { name: "Remitly", blurb: "The app shows a rate and a fee, then splits the transfer into a faster tier and a cheaper tier. The tier changes both the price and the arrival. The headline rate is not always the mid-market." },
        xe: { name: "XE", blurb: "People open the XE converter for a mid-market reference. The converter does not deliver the money. If you use the transfer product, the fee and the arrival are whatever that page states, and they are not ticked here." },
        page: { name: "This page", blurb: "All five are written here: mid-market, spread, fees, arrival, and whether a price is locked or still moving. The last item is an explanation, not a lock this page offers. This page does not quote a price and does not move money." }
      },
      steps: [
        { title: "Write the amount and both currencies", body: "Stay on this page. It is a demo. Nothing is sent." },
        { title: "Find the public mid-market first", body: "Then name the spread and every fee. If one of them is missing, mark it unknown." },
        { title: "Read the arrival window", body: "See whether the price is locked or still moving. No deadline means it is not a lock." }
      ],
      points: [
        { title: "Speed", body: "Speed belongs to the rail. Counter cash is measured in minutes, a cross-border bank payment often in business days, and an app in whatever rail it actually names. “Instant” without a rail and a cutoff is not a fact.", check: "Compare the arrival window that provider prints for the same route." },
        { title: "Transparency", body: "A factual comparison starts at the public mid-market. Whatever leaves that rate is a spread or a fee, and it should have a name. This page keeps those words apart instead of folding them into a special price.", check: "Any quote can be asked: what is the mid-market, and where is the gap?" },
        { title: "Coverage", body: "Common currencies share one reading: one mid-market, one spread, one arrival window. The currency wall only changes the note. It does not open another page.", check: "Change the currency. The three questions stay the same." }
      ],
      safetyItems: [
        "Is the legal name written on the page?",
        "Can the license or registration be found on a public register?",
        "Does it say client money is kept apart from the firm's own?",
        "When something goes wrong, is it clear who you contact?"
      ],
      faqs: [
        { q: "Are the numbers on this page today's rate?", a: "No. The percents are there so a gap has a size you can see, and the checklist numbers measure how much is explained. This page does not fetch or show a price you can trade. The mid-market should come from public market data. The spread and the fees belong to the provider's own page." },
        { q: "What is the mid-market?", a: "The midpoint of the buy quote and the sell quote at the same moment. It is also called the interbank mid-market rate. It is where a comparison starts. It is not the price a bank promises to sell you." },
        { q: "Why can an airport be fast and still cost more?", a: "Cash is handed over on the spot, so it is fast. Fast is a fact about the rail. The board rate is often far from the mid-market, and the gap is rarely written on its own line. Set the board rate next to the mid-market before you decide it is worth it." },
        { q: "Does a rate lock mean the price is a good one?", a: "No. A lock only means the price will not move before the time they write down. A wide spread can be locked too. See how far it sits from the mid-market, then see how long the lock lasts." },
        { q: "How should I compare a bank, an airport, Wise, Remitly, and XE?", a: "Use one checklist, not the slogans. A bank app usually shows the bank's rate, a separate fee, and an arrival in business days. An airport counter is cash, so it is fast, and the board is usually wider. Wise publicly uses the mid-market and lists a fee apart from it. Remitly splits speed into tiers, and the tier changes both the price and the arrival. The XE converter shows the mid-market; a transfer has its own fee and arrival on the transfer page." },
        { q: "Does this page receive the amount I type?", a: "No. The amount and the currencies are worked out in your browser. There is no order and no server of ours." },
        { q: "How is the language chosen?", a: "On a first visit the browser calls a public IP-region service, and only the country or region is used. Mainland China, Hong Kong, Macao, and Taiwan get Chinese. Everywhere else gets English. If the lookup fails, the language already saved on this device stays. Once you tap a language, that choice is stored locally and a later region result will not replace it." }
      ],
      currencies: {
        USD: { name: "US dollar", where: "United States, and a common pricing currency" },
        EUR: { name: "Euro", where: "Euro area" },
        GBP: { name: "Pound sterling", where: "United Kingdom" },
        JPY: { name: "Yen", where: "Japan" },
        CNY: { name: "Renminbi", where: "Mainland China" },
        HKD: { name: "Hong Kong dollar", where: "Hong Kong" },
        AUD: { name: "Australian dollar", where: "Australia" },
        CAD: { name: "Canadian dollar", where: "Canada" },
        SGD: { name: "Singapore dollar", where: "Singapore" },
        CHF: { name: "Swiss franc", where: "Switzerland" },
        KRW: { name: "Won", where: "South Korea" },
        THB: { name: "Baht", where: "Thailand" }
      }
    }
  };

  var state = {
    lang: "",
    source: "pending",
    from: "USD",
    to: "EUR",
    pct: 3,
    wall: "USD",
    openFaq: {}
  };

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var tweens = new WeakMap();
  var compareSeen = false;
  var heroMedia = document.getElementById("heroMedia");
  var scrollQueued = false;

  function reducedMotion() {
    return motionQuery.matches;
  }

  function pack() {
    return PACKS[state.lang] || PACKS.en;
  }

  function fill(str, map) {
    return String(str).replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? String(map[key]) : "";
    });
  }

  function formatAmount(n) {
    var locale = state.lang === "zh" ? "zh-Hans" : "en";
    var rounded = Math.round(n * 100) / 100;
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(rounded);
  }

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function navigatorLang() {
    var n = (navigator.language || "en").toLowerCase();
    return n.indexOf("zh") === 0 ? "zh" : "en";
  }

  function node(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function scoreOf(ticks) {
    return ticks.reduce(function (sum, bit) { return sum + (bit ? 1 : 0); }, 0);
  }

  function readAmount() {
    var raw = document.getElementById("amount").value;
    if (raw == null || String(raw).trim() === "") return { kind: "invalid" };
    var n = Number(raw);
    if (!isFinite(n) || n <= 0) return { kind: "invalid" };
    if (n > 1000000000) return { kind: "big" };
    return { kind: "ok", value: n };
  }

  function currentNumber(el) {
    var text = String(el.textContent || "").replace(/[^\d.-]/g, "");
    var n = Number(text);
    return isFinite(n) ? n : 0;
  }

  function tweenFormatted(el, to, ms) {
    var prev = tweens.get(el);
    if (prev) cancelAnimationFrame(prev);
    if (!(ms > 0)) {
      el.textContent = formatAmount(to);
      return;
    }
    var from = currentNumber(el);
    var t0 = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - t0) / ms);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatAmount(from + (to - from) * eased);
      if (t < 1) tweens.set(el, requestAnimationFrame(frame));
      else tweens.delete(el);
    }
    tweens.set(el, requestAnimationFrame(frame));
  }

  function tweenInteger(el, to, ms) {
    var prev = tweens.get(el);
    if (prev) cancelAnimationFrame(prev);
    if (!(ms > 0)) {
      el.textContent = String(to);
      return;
    }
    var t0 = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - t0) / ms);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(to * eased));
      if (t < 1) tweens.set(el, requestAnimationFrame(frame));
      else tweens.delete(el);
    }
    tweens.set(el, requestAnimationFrame(frame));
  }

  function applyStatic() {
    var copy = pack();
    document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : "en";
    document.documentElement.setAttribute("data-lang", state.lang);
    document.title = copy.metaTitle;
    document.getElementById("themeLine").textContent = THEME_LINE;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (typeof copy[key] === "string") el.textContent = copy[key];
    });
  }

  function fillSelect(select, value) {
    var copy = pack();
    select.replaceChildren();
    CODES.forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code;
      opt.textContent = code + "  " + copy.currencies[code].name;
      select.appendChild(opt);
    });
    select.value = value;
  }

  function syncScenario() {
    document.querySelectorAll(".seg button").forEach(function (btn) {
      var on = Number(btn.getAttribute("data-pct")) === state.pct;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function renderDemo() {
    var copy = pack();
    var from = state.from;
    var to = state.to;
    var fromInfo = copy.currencies[from];
    var toInfo = copy.currencies[to];
    document.getElementById("pairLine").textContent = fill(copy.pairLine, {
      fromName: fromInfo.name,
      from: from,
      toName: toInfo.name,
      to: to
    });
    var math = document.getElementById("mathBlock");
    var same = document.getElementById("sameMsg");
    var amount = readAmount();
    if (from === to) {
      math.hidden = true;
      same.hidden = false;
      same.textContent = copy.samePair;
      return;
    }
    if (amount.kind !== "ok") {
      math.hidden = true;
      same.hidden = false;
      same.textContent = amount.kind === "big" ? copy.tooBig : copy.invalidAmount;
      return;
    }
    math.hidden = false;
    same.hidden = true;
    var gap = amount.value * state.pct / 100;
    var keep = amount.value - gap;
    var ms = reducedMotion() ? 0 : 700;
    tweenFormatted(document.getElementById("keepValue"), keep, ms);
    tweenFormatted(document.getElementById("gapValue"), gap, ms);
    document.getElementById("keepUnit").textContent = from;
    document.getElementById("gapUnit").textContent = from;
    document.getElementById("gapBar").style.width = state.pct + "%";
    document.getElementById("gapCaption").textContent = fill(copy.gapCaption, {
      pct: String(state.pct),
      amount: formatAmount(amount.value),
      code: from
    });
    document.getElementById("noQuote").textContent = fill(copy.noQuote, {
      name: toInfo.name,
      code: to
    });
  }

  function renderFacts() {
    var box = document.getElementById("factList");
    box.replaceChildren();
    pack().facts.forEach(function (fact) {
      var card = node("article", "fact");
      card.appendChild(node("h3", "", fact.title));
      card.appendChild(node("span", "tag", fact.tag));
      card.appendChild(node("p", "", fact.body));
      box.appendChild(card);
    });
  }

  function renderRails() {
    var box = document.getElementById("rails");
    box.replaceChildren();
    pack().rails.forEach(function (rail) {
      var row = node("div", "rail");
      var left = node("div");
      left.appendChild(node("span", "", rail.name));
      left.appendChild(node("small", "", rail.note));
      row.appendChild(left);
      row.appendChild(node("b", "", rail.when));
      box.appendChild(row);
    });
  }

  function renderPains() {
    var list = document.getElementById("pains");
    list.replaceChildren();
    pack().pains.forEach(function (line) {
      list.appendChild(node("li", "", line));
    });
  }

  function renderLegend() {
    var list = document.getElementById("tickLegend");
    list.replaceChildren();
    pack().tickNames.forEach(function (name) {
      list.appendChild(node("li", "", name));
    });
  }

  function renderRows() {
    var copy = pack();
    var box = document.getElementById("rows");
    box.replaceChildren();
    var instant = reducedMotion();
    PROVIDERS.forEach(function (provider) {
      var meta = copy.providers[provider.id];
      var score = scoreOf(provider.ticks);
      var row = node("article", "row" + (provider.id === "page" ? " is-claim" : ""));
      var head = document.createElement("header");
      head.appendChild(node("h3", "", meta.name));
      var scoreEl = node("p", "score");
      var num = node("span", "score-num", instant ? String(score) : "0");
      num.setAttribute("data-to", String(score));
      scoreEl.appendChild(num);
      scoreEl.appendChild(node("span", "score-den", " / 5"));
      head.appendChild(scoreEl);
      row.appendChild(head);
      var bar = node("div", "bar");
      bar.setAttribute("aria-hidden", "true");
      var fillBar = node("span", "bar-fill");
      fillBar.style.setProperty("--p", String(score / 5));
      bar.appendChild(fillBar);
      row.appendChild(bar);
      var dots = node("p", "dots");
      var labelParts = provider.ticks.map(function (bit, index) {
        return copy.tickNames[index] + " " + (bit ? copy.yes : copy.no);
      });
      dots.setAttribute("aria-label", labelParts.join(", "));
      provider.ticks.forEach(function (bit) {
        dots.appendChild(node("span", bit ? "dot on" : "dot"));
      });
      row.appendChild(dots);
      row.appendChild(node("p", "blurb", meta.blurb));
      box.appendChild(row);
    });
  }

  function renderWallChips() {
    var copy = pack();
    var scroller = document.getElementById("wallScroll");
    scroller.setAttribute("aria-label", copy.wallScroller);
    scroller.replaceChildren();
    CODES.forEach(function (code) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("data-code", code);
      btn.appendChild(node("strong", "", code));
      btn.appendChild(node("span", "", copy.currencies[code].name));
      scroller.appendChild(btn);
    });
    syncWall();
  }

  function syncWall() {
    var copy = pack();
    var info = copy.currencies[state.wall];
    document.querySelectorAll("#wallScroll .chip").forEach(function (btn) {
      var on = btn.getAttribute("data-code") === state.wall;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var detail = document.getElementById("wallDetail");
    detail.replaceChildren();
    detail.appendChild(node("p", "wall-code", state.wall));
    detail.appendChild(node("h3", "", info.name));
    detail.appendChild(node("p", "where", info.where));
    detail.appendChild(node("p", "read", fill(copy.wallRead, { name: info.name, code: state.wall })));
    var selected = document.querySelector('#wallScroll .chip.is-on');
    if (selected) revealChip(selected);
  }

  function revealChip(btn) {
    var scroller = document.getElementById("wallScroll");
    var btnRect = btn.getBoundingClientRect();
    var box = scroller.getBoundingClientRect();
    var pad = 36;
    if (btnRect.width === 0) return;
    if (btnRect.left < box.left + 12) {
      scroller.scrollLeft -= (box.left + 12 - btnRect.left);
    } else if (btnRect.right > box.right - pad) {
      scroller.scrollLeft += btnRect.right - (box.right - pad);
    }
  }

  function renderSteps() {
    var list = document.getElementById("stepList");
    list.replaceChildren();
    pack().steps.forEach(function (step, index) {
      var item = node("li", "step");
      item.appendChild(node("div", "step-num", String(index + 1)));
      var text = node("div");
      text.appendChild(node("h3", "", step.title));
      text.appendChild(node("p", "", step.body));
      item.appendChild(text);
      list.appendChild(item);
    });
  }

  function renderPoints() {
    var copy = pack();
    var box = document.getElementById("pointList");
    box.replaceChildren();
    copy.points.forEach(function (point) {
      var card = node("article", "card point");
      card.appendChild(node("h3", "", point.title));
      card.appendChild(node("p", "body", point.body));
      var check = node("p", "check");
      check.appendChild(node("b", "", copy.checkLabel + "  "));
      check.appendChild(document.createTextNode(point.check));
      card.appendChild(check);
      box.appendChild(card);
    });
  }

  function renderSafety() {
    var list = document.getElementById("safetyList");
    list.replaceChildren();
    pack().safetyItems.forEach(function (item) {
      list.appendChild(node("li", "", item));
    });
  }

  function renderFaq() {
    var box = document.getElementById("faqList");
    box.replaceChildren();
    pack().faqs.forEach(function (item, index) {
      var id = String(index);
      var open = !!state.openFaq[id];
      var wrap = node("div", "faq-item" + (open ? " is-open" : ""));
      wrap.setAttribute("data-id", id);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.id = "faq-btn-" + id;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-controls", "faq-panel-" + id);
      var q = node("span", "", item.q);
      btn.appendChild(q);
      btn.appendChild(node("span", "chev"));
      var panel = node("div", "faq-a");
      panel.id = "faq-panel-" + id;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", btn.id);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      var inner = node("div", "faq-a-inner");
      inner.appendChild(node("p", "", item.a));
      panel.appendChild(inner);
      wrap.appendChild(btn);
      wrap.appendChild(panel);
      box.appendChild(wrap);
    });
  }

  function renderLang() {
    var zh = document.getElementById("btnZh");
    var en = document.getElementById("btnEn");
    zh.setAttribute("aria-pressed", state.lang === "zh" ? "true" : "false");
    en.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
    var copy = pack();
    var status = document.getElementById("langStatus");
    if (state.source === "manual") status.textContent = copy.statusManual;
    else if (state.source === "ip") status.textContent = copy.statusIp;
    else if (state.source === "fallback") status.textContent = copy.statusFallback;
    else status.textContent = copy.statusPending;
  }

  function playCompare() {
    var section = document.getElementById("compare");
    var ms = reducedMotion() ? 0 : 900;
    section.querySelectorAll(".score-num").forEach(function (el) {
      tweenInteger(el, Number(el.getAttribute("data-to")) || 0, ms);
    });
    section.classList.remove("is-in");
    if (reducedMotion()) {
      section.classList.add("is-in");
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        section.classList.add("is-in");
      });
    });
  }

  function armCompare() {
    compareSeen = false;
    var section = document.getElementById("compare");
    section.classList.remove("is-in");
    requestAnimationFrame(function () {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 80) {
        compareSeen = true;
        playCompare();
      }
    });
  }

  function apply(lang) {
    var same = state.lang === lang && document.documentElement.getAttribute("data-ready") === "1";
    state.lang = lang;
    if (same) {
      renderLang();
      return;
    }
    applyStatic();
    var fromSelect = document.getElementById("fromCcy");
    var toSelect = document.getElementById("toCcy");
    fillSelect(fromSelect, state.from);
    fillSelect(toSelect, state.to);
    state.from = fromSelect.value;
    state.to = toSelect.value;
    syncScenario();
    renderFacts();
    renderRails();
    renderPains();
    renderLegend();
    renderRows();
    renderWallChips();
    renderSteps();
    renderPoints();
    renderSafety();
    renderFaq();
    renderDemo();
    renderLang();
    document.documentElement.setAttribute("data-ready", "1");
    armCompare();
  }

  function choose(lang) {
    storageSet(MANUAL_KEY, lang);
    storageSet(LANG_KEY, lang);
    state.source = "manual";
    apply(lang);
  }

  function manualNow() {
    var manual = storageGet(MANUAL_KEY);
    if (manual === "zh" || manual === "en") {
      state.source = "manual";
      apply(manual);
      return true;
    }
    return false;
  }

  function codeOf(data) {
    if (!data || typeof data !== "object") return "";
    var candidates = [data.country_code, data.countryCode, data.country];
    for (var i = 0; i < candidates.length; i += 1) {
      var raw = String(candidates[i] || "").trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(raw)) return raw;
    }
    return "";
  }

  function fetchJson(url) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 4500);
    return fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" }
    }).then(function (res) {
      if (!res.ok) throw new Error("status");
      return res.json();
    }).finally(function () {
      clearTimeout(timer);
    });
  }

  function detectCountry() {
    return fetchJson("https://get.geojs.io/v1/ip/country.json").then(function (data) {
      var code = codeOf(data);
      if (!code) throw new Error("shape");
      return code;
    }).catch(function () {
      return fetchJson("https://ipwho.is/").then(function (data) {
        if (data && data.success === false) throw new Error("geo");
        var code = codeOf(data);
        if (!code) throw new Error("shape");
        return code;
      });
    });
  }

  function initLanguage() {
    var manual = storageGet(MANUAL_KEY);
    if (manual === "zh" || manual === "en") {
      state.source = "manual";
      apply(manual);
      return;
    }
    var saved = storageGet(LANG_KEY);
    var first = (saved === "zh" || saved === "en") ? saved : navigatorLang();
    state.source = "pending";
    apply(first);
    detectCountry().then(function (code) {
      if (manualNow()) return;
      var lang = ZH_REGIONS[code] ? "zh" : "en";
      storageSet(LANG_KEY, lang);
      state.source = "ip";
      apply(lang);
    }).catch(function () {
      if (manualNow()) return;
      var again = storageGet(LANG_KEY);
      var lang = (again === "zh" || again === "en") ? again : first;
      storageSet(LANG_KEY, lang);
      state.source = "fallback";
      apply(lang);
    });
  }

  function onScroll() {
    if (reducedMotion()) {
      heroMedia.style.transform = "";
      return;
    }
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var shift = Math.max(-36, Math.min(48, y * 0.12));
      heroMedia.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
      scrollQueued = false;
    });
  }

  function bind() {
    document.getElementById("demoForm").addEventListener("submit", function (event) {
      event.preventDefault();
    });
    document.getElementById("amount").addEventListener("input", renderDemo);
    document.getElementById("fromCcy").addEventListener("change", function (event) {
      state.from = event.target.value;
      renderDemo();
    });
    document.getElementById("toCcy").addEventListener("change", function (event) {
      state.to = event.target.value;
      renderDemo();
    });
    document.querySelector(".seg").addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-pct]");
      if (!btn) return;
      state.pct = Number(btn.getAttribute("data-pct"));
      syncScenario();
      renderDemo();
    });
    document.getElementById("wallScroll").addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-code]");
      if (!btn) return;
      state.wall = btn.getAttribute("data-code");
      syncWall();
    });
    document.getElementById("faqList").addEventListener("click", function (event) {
      var btn = event.target.closest("button");
      if (!btn) return;
      var item = btn.closest(".faq-item");
      var id = item.getAttribute("data-id");
      var open = !state.openFaq[id];
      state.openFaq[id] = open;
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.getElementById("faq-panel-" + id).setAttribute("aria-hidden", open ? "false" : "true");
    });
    document.querySelector(".lang-row").addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-pick]");
      if (!btn) return;
      choose(btn.getAttribute("data-pick"));
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", function () {
        if (reducedMotion()) heroMedia.style.transform = "";
        renderRows();
        if (compareSeen || reducedMotion()) playCompare();
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || compareSeen) return;
        compareSeen = true;
        playCompare();
      });
    }, { threshold: 0.22 });
    io.observe(document.getElementById("compare"));
  }

  bind();
  initLanguage();
})();
