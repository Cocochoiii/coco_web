/* ============================================================
   content.js — EDIT EVERYTHING HERE
   All copy, resume data, chat answers, and the tech-graph data
   live in this one file so you never have to dig through components.
   ============================================================ */

/* ---- links (FILL THESE IN) ---- */
export const LINKS = {
  github: 'https://github.com/Cocochoiii',
  // TODO: replace with your real LinkedIn URL
  linkedin: 'https://www.linkedin.com/in/your-handle',
  email: 'choi.coco@northeastern.edu',
  phone: '617-762-8179',
  // TODO: drop a resume.pdf into /public and point this at '/resume.pdf'
  resume: '#',
};

/* ---- hero role rotator ---- */
export const HERO_WORDS = [
  'network infrastructure',
  'distributed systems',
  'traffic engineering',
  'backbone telemetry',
];

/* ---- "What I build" flip cards (left column, center figure, right column) ---- */
export const CARDS_LEFT = [
  {
    no: 'Experience · Network',
    title: 'Amazon · AWS Global Backbone',
    role: 'SDE Intern · 2026',
    blurb:
      'Building traffic-engineering and telemetry tooling for the backbone that carries AWS itself — link-level simulation, path optimization, and failure injection where staying up is the whole job.',
    backTitle: 'Amazon · AWS',
    stats: [
      { label: 'Validation cycle', value: '−60%', w: '60%' },
      { label: 'Link-util variance', value: '−18%', w: '26%' },
      { label: 'Decision loop', value: '12s→3s', w: '75%' },
    ],
    chips: ['Kafka', 'gRPC', 'C++', 'Kubernetes'],
  },
  {
    no: 'Experience · Backend',
    title: 'Mars Inc.',
    role: 'Cloud Engineer Intern · 2022',
    blurb:
      'E-commerce backend and real-time messaging — GraphQL APIs over a high-traffic store and a socket layer holding thousands of live connections, tuned for low latency under load.',
    backTitle: 'Mars Inc.',
    stats: [
      { label: 'Daily active users', value: '5K+', w: '60%' },
      { label: 'Concurrent conns', value: '10K', w: '80%' },
      { label: 'Search latency', value: '−65%', w: '65%' },
    ],
    chips: ['Node.js', 'Redis', 'MongoDB', 'GraphQL'],
  },
  {
    no: 'Research',
    title: 'Northeastern · UbiWell Lab',
    role: 'Graduate Research Assistant · 2025',
    blurb:
      'Health-sensing data platform and real-time research pipelines — high-throughput ingestion services and streaming that stay responsive at millions of data points a day.',
    backTitle: 'UbiWell Lab',
    stats: [
      { label: 'Throughput', value: '2.5M+/day', w: '80%' },
      { label: 'Report time', value: '−85%', w: '85%' },
      { label: 'Event peak', value: '50K/s', w: '70%' },
    ],
    chips: ['Python', 'Kafka', 'PostgreSQL', 'MongoDB'],
  },
];

export const CARDS_RIGHT = [
  {
    no: 'Experience · Data',
    title: 'Volkswagen · Audi',
    role: 'Data Engineer · 2023–24',
    blurb:
      'Connected-vehicle data platform and predictive-maintenance pipelines — large-scale streaming ingestion plus an ETL and warehouse layer that cut batch time and yearly cost.',
    backTitle: 'Volkswagen · Audi',
    stats: [
      { label: 'Throughput', value: '3×', w: '78%' },
      { label: 'Retention', value: '~$2M/yr', w: '70%' },
      { label: 'ETL batch time', value: '−42%', w: '42%' },
    ],
    chips: ['Kafka', 'Spark', 'Snowflake', 'Airflow'],
  },
  {
    no: 'Experience · Ad-tech',
    title: 'WPP · GroupM',
    role: 'Cloud Data Platform Intern · 2022',
    blurb:
      'Server-side ad-event ingestion and identity resolution — a high-volume event pipeline and an identity graph feeding analytics, with query latency cut dramatically.',
    backTitle: 'WPP · GroupM',
    stats: [
      { label: 'Ad events/day', value: '500M+', w: '90%' },
      { label: 'Identity match', value: '92%', w: '92%' },
      { label: 'BI latency', value: '−75%', w: '75%' },
    ],
    chips: ['AWS', 'Spark', 'dbt'],
  },
  {
    no: 'Project · RAG',
    title: 'Personalized News Summarization',
    role: 'Northeastern · 2024–25',
    blurb:
      'Real-time retrieval-augmented summarization — a hybrid retrieval stack (BM25 + dense embeddings + rerank) with LLM observability, designed, built, and tuned end to end.',
    backTitle: 'RAG Platform',
    stats: [
      { label: 'Retrieval nDCG@10', value: '+35%', w: '70%' },
      { label: 'Training time', value: '−67%', w: '67%' },
      { label: 'Compute cost', value: '−$8K/mo', w: '60%' },
    ],
    chips: ['Python', 'PyTorch', 'AWS', 'Prometheus'],
  },
];

/* ---- "By the numbers" ---- */
export const METRICS = [
  { to: 500, suffix: 'M+', label: 'events/day streamed · WPP' },
  { to: 2500, suffix: '+', label: 'backbone interfaces monitored · AWS' },
  { to: 2.5, decimals: 1, suffix: 'M+', label: 'data points/day · UbiWell Lab' },
  { to: 99.95, decimals: 2, suffix: '%', label: 'peak delivery uptime' },
];

/* ---- About ---- */
export const ABOUT = {
  facts: ['Northeastern · MSCS', 'GPA 3.8', 'Amazon · AWS Backbone', 'Boston / San Jose'],
  principles: [
    { b: 'Reliability first.', t: 'The interesting engineering starts when traffic spikes and links fail.' },
    { b: 'Make it legible.', t: 'Clear docs, small reviewable PRs, trade-offs surfaced early.' },
    { b: 'Build to learn.', t: 'Ship something real, then read the source when it breaks.' },
  ],
};

/* ============================================================
   Spline scenes — swap these URLs for your own scenes
   ============================================================ */
export const SPLINE = {
  home: 'https://prod.spline.design/gFVdS-H4gTmJlHSI/scene.splinecode',
  build: 'https://prod.spline.design/VTTUa5BnMQcOogeU/scene.splinecode',
  about: 'https://prod.spline.design/tiyyJBBTxqBgAqRt/scene.splinecode',
};

/* ============================================================
   Ask-me-anything engine data
   To edit answers, change the ANSWERS object.
   ============================================================ */
export const LABEL = {
  who: 'Who are you?', work: 'Where have you worked?', built: 'What have you built?',
  stack: "What's your tech stack?", study: 'Where did you study?', site: 'How did you build this site?',
  drives: 'What drives you?', teams: 'How do you work in teams?', disagree: 'Handling disagreements?',
  failed: 'A time you failed?', leadership: 'Leadership experience?', reach: 'How to reach you?',
  research: 'Tell me about your research', amazon: 'What will you do at Amazon?', why: 'Why infrastructure?',
  goals: 'Where are you headed?', strength: 'Your biggest strength?', learn: 'How do you learn new tech?',
  surprising: 'Something surprising?', proud: 'What are you most proud of?',
};

export const ANSWERS = {
  who: { a: "I'm Coco Choi — a software engineer who builds network infrastructure and distributed systems. I'm finishing my M.S. in Computer Science at Northeastern (GPA 3.8) and joining Amazon's AWS Global Backbone team. I actually started in business and film before moving fully into systems engineering, so I care as much about how a system reads as how it runs.", follow: ['work', 'built', 'drives'] },
  work: { a: "Most recently I'm joining Amazon's AWS Global Backbone as an SDE intern — traffic-engineering tooling and backbone telemetry across thousands of links. Before that: Data Engineer at Volkswagen · Audi in Beijing (Kafka pipelines at 500GB/day, Snowflake + dbt), Cloud Engineer at Mars (Node/GraphQL backends, real-time messaging for 10K concurrent connections), and a Cloud Data Platform intern at WPP · GroupM (500M+ ad events/day and an 80M-profile identity graph).", follow: ['built', 'amazon', 'stack'] },
  built: { a: "A few I'm proud of: at AWS, a Java traffic-replay simulator over 1,200+ backbone links and a weighted-ECMP path solver in C++ that cut link-utilization variance by 18%. My favorite side project is a personalized-news RAG platform — BM25 + bge-large embeddings + Cohere rerank — which lifted retrieval nDCG@10 by 35%. And at Northeastern's UbiWell Lab I built health-sensing pipelines handling 2.5M+ data points a day at p95 under 200ms.", follow: ['stack', 'research', 'proud'] },
  stack: { a: 'For systems work: Python, Java, Go and C++. For data and streaming: Kafka, Spark, Airflow and dbt. For storage: PostgreSQL, MongoDB, Redis and Snowflake. For infrastructure: AWS, Docker and Kubernetes, with Prometheus, Grafana and OpenTelemetry for observability. The Tech Stack section above is interactive — every glowing node is something I\'ve actually shipped with.', follow: ['built', 'learn', 'site'] },
  study: { a: "I'm doing my M.S. in Computer Science at Northeastern (2024–2027, GPA 3.8) — distributed systems, computer networks, databases, cloud computing and machine learning. Before that, a B.A. at Franklin & Marshall, double-majoring in Business and Film & Media. The liberal-arts start is where I learned to frame a problem and tell its story.", follow: ['surprising', 'who', 'reach'] },
  site: { a: "It's a React + Tailwind single-page app — componentized, no UI kit. The 3D characters are Spline scenes; the Tech Stack is an interactive Three.js force-directed graph where every node is a technology; and this chat is a self-contained answer engine. The palette is deep plum with lavender, pink and periwinkle accents, set in Bricolage Grotesque and IBM Plex.", follow: ['stack', 'built', 'reach'] },
  drives: { a: 'Systems that have to stay up under pressure. The interesting engineering starts when traffic spikes and links fail — watching a failover converge in under 200ms, or a pipeline hold steady at hundreds of millions of events a day, is the part that hooks me. I also love making complex systems legible to the people who depend on them.', follow: ['why', 'built', 'goals'] },
  teams: { a: 'I try to be the person who makes the work legible — clear docs, small reviewable PRs, and surfacing trade-offs early rather than late. At Audi I shipped under Agile alongside PMs, UX and eight engineers; on the AWS Backbone team I work closely with network development engineers. My default is to over-communicate context so nobody is left guessing.', follow: ['disagree', 'leadership', 'strength'] },
  disagree: { a: 'I try to separate the decision from the ego: get the data on the table, state my recommendation and the reasoning behind it, and genuinely steelman the other side. If we still disagree after that and a call gets made, I disagree and commit — and move fast. Relitigating a settled decision is expensive for everyone.', follow: ['teams', 'failed', 'leadership'] },
  failed: { a: "Early on I tuned a pipeline hard for throughput and quietly raised data loss under peak load — I'd optimized the wrong metric. The lesson stuck: decide which failure mode you actually care about before you tune, and add the guardrail metric first. Now, asking what could silently go wrong is one of the first things I do.", follow: ['strength', 'drives', 'built'] },
  leadership: { a: "Mine looks like technical leadership — owning a workstream end to end, mentoring teammates on the parts I know well, and writing the doc that gets everyone aligned. I'd rather earn trust by shipping and explaining clearly than lead by title. Often the highest-leverage thing I can do is make a hard problem legible to the rest of the team.", follow: ['teams', 'goals', 'drives'] },
  reach: { a: "Easiest is email — choi.coco@northeastern.edu — and I'm on GitHub at github.com/Cocochoiii. I'm open to Summer 2026 roles (May–Aug). I'd love to hear from you!", follow: ['who', 'work', 'built'] },
  research: { a: "At Northeastern's UbiWell Lab I was a graduate research assistant on health-sensing infrastructure — Django and FastAPI services ingesting 2.5M+ data points a day at p95 under 200ms, plus a Kafka stream handling 50K events a second. I also automated the lab's reporting pipeline, which cut report-generation time by 85%.", follow: ['built', 'stack', 'drives'] },
  amazon: { a: "On the AWS Global Backbone team I'm building traffic-engineering and telemetry tooling: a Java traffic-replay simulator across 1,200+ links on EKS, a weighted-ECMP path solver in C++ with OR-Tools, a Kafka-based gNMI aggregator that cut telemetry latency from 12s to 3s, and failure-injection on FRR that keeps failover under 200ms. The backbone carries AWS itself, so reliability is the whole job.", follow: ['built', 'why', 'stack'] },
  why: { a: "I'm drawn to systems where reliability is the entire game — the backbone, the streaming pipeline, the service that simply cannot go down. The interesting engineering starts when traffic spikes and links fail. Distributed systems and networks scratch that itch better than anything else I've worked on.", follow: ['drives', 'amazon', 'goals'] },
  goals: { a: 'Short term: go deep on network infrastructure and distributed systems at AWS and earn the return offer. Longer term I want to own the reliability of large-scale systems end to end — be the engineer a team trusts when something absolutely has to stay up at scale.', follow: ['amazon', 'drives', 'leadership'] },
  strength: { a: "Making complex systems legible. I'm good at taking something tangled — a flaky pipeline, an unclear failure mode — and turning it into a clean model, a clear doc, and a fix the whole team can reason about. Pair that with a stubborn focus on reliability and that's most of what I bring.", follow: ['teams', 'failed', 'drives'] },
  learn: { a: "I learn by building something real with the tool, then reading the source or the docs when it breaks — that's when the details actually stick. Coming from a non-CS background, I had to get fast at this, so I'm comfortable being dropped into an unfamiliar stack and shipping. Curiosity plus a bias to build.", follow: ['stack', 'surprising', 'drives'] },
  surprising: { a: "My degree is half film and business, not pure CS. I came into engineering through Northeastern's Align program, which is built for career-switchers — and honestly the film-and-business background is exactly why I care so much about how a system is explained, not just how it runs.", follow: ['study', 'who', 'drives'] },
  proud: { a: 'Probably the pivot itself — going from a business-and-film background to shipping infrastructure at Amazon in a few years. On the technical side, the personalized-news RAG platform is the one I keep coming back to: BM25 + bge-large + Cohere rerank, a 35% lift in retrieval quality, built end to end.', follow: ['built', 'surprising', 'goals'] },
};

// free-typed question -> topic (first keyword hit wins; order = specific to generic)
export const ROUTES = [
  ['reach', ['reach', 'contact', 'email', 'hire', 'connect', 'touch', 'linkedin', 'get in', 'hiring']],
  ['amazon', ['amazon', 'backbone', 'aws']],
  ['site', ['this site', 'the site', 'this website', 'build this', 'built this', 'made this', 'this page', 'how was this']],
  ['research', ['research', 'ubiwell', 'grad assistant', 'research assistant']],
  ['proud', ['proud', 'most proud', 'accomplish', 'achievement', 'best work']],
  ['surprising', ['surpris', 'unexpected', 'fun fact', 'outside of work', 'outside work', 'hobby', 'film', 'movie', 'liberal arts', 'non-cs', 'pivot', 'align program', 'career switch']],
  ['goals', ['goal', 'future', 'headed', 'long term', 'long-term', 'aspir', 'return offer', 'ambition', 'where do you see', 'five years']],
  ['strength', ['strength', 'strong suit', 'best at', 'good at', 'superpower', 'greatest']],
  ['learn', ['learn new', 'how do you learn', 'pick up', 'new tech', 'new technolog', 'ramp up', 'up to speed', 'unfamiliar', 'get good at']],
  ['why', ['why network', 'why infra', 'why distributed', 'why systems', 'why backbone', 'networking', 'distributed']],
  ['built', ['built', 'build', 'project', 'portfolio', 'rag', 'simulator', 'ship', 'made', 'creat']],
  ['work', ['work', 'job', 'experience', 'compan', 'audi', 'volkswagen', 'mars', 'wpp', 'groupm', 'intern', 'career', 'employ', 'role', 'worked']],
  ['stack', ['tech', 'stack', 'skill', 'language', 'tool', 'technolog', 'framework', 'program']],
  ['study', ['study', 'studied', 'education', 'school', 'university', 'degree', 'northeastern', 'franklin', 'gpa', 'college', 'major', 'graduat']],
  ['teams', ['team', 'collaborat', 'work with', 'agile', 'colleague', 'coworker']],
  ['disagree', ['disagree', 'conflict', 'argu', 'pushback', 'push back', 'tension', 'debate']],
  ['failed', ['fail', 'mistake', 'wrong', 'setback', 'weakness', 'regret']],
  ['leadership', ['lead', 'mentor', 'manage', 'ownership', 'initiative']],
  ['drives', ['drive', 'motivat', 'passion', ' why', 'love', 'enjoy', 'excite', 'interest', 'care about']],
  ['who', ['who', 'about', 'yourself', 'background', 'introduce', 'tell me about', 'your name', 'bio']],
];

export const TECH_WORDS = ' python java javascript typescript go rust c++ c# kotlin swift ruby sql kafka spark airflow dbt postgresql mysql mongodb redis elasticsearch snowflake dynamodb cassandra memcached aws docker kubernetes jenkins linux pytorch prometheus grafana opentelemetry three.js spline html css bm25 bge-large cohere rag eks frr or-tools gnmi fastapi django flask graphql node.js node/graphql sagemaker redshift kinesis react ecmp ci/cd '
  .split(' ').reduce((o, w) => { if (w) o[w] = 1; return o; }, {});

export const ORG_WORDS = ' amazon audi volkswagen mars wpp groupm northeastern franklin marshall ubiwell choreograph '
  .split(' ').reduce((o, w) => { if (w) o[w] = 1; return o; }, {});

export const THINK = [
  'Preparing a thoughtful response…',
  'Searching through my experience…',
  'Pulling the details together…',
  'Checking my notes…',
];

/* The inline panel starts with the full chip set; the floating widget uses a shorter one. */
export const SUGGEST_FULL = ['who', 'work', 'built', 'stack', 'study', 'site', 'drives', 'teams', 'disagree', 'failed', 'leadership', 'amazon', 'research', 'strength', 'goals', 'reach'];
export const SUGGEST_MINI = ['who', 'work', 'built', 'amazon', 'stack', 'research', 'drives', 'leadership', 'goals', 'reach'];

/* ============================================================
   Tech Stack graph data (categories + colors + tier weighting)
   ============================================================ */
export const CLUSTERS = [
  { color: 0xc2b2ff, items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust', 'Kotlin', 'Swift', 'C#', 'R', 'Ruby', 'SQL'] },
  { color: 0xffb0d0, items: ['Spring Boot', 'Node.js', 'Express', 'Django', 'Flask', 'ASP.NET', 'REST', 'GraphQL', 'gRPC', 'Microservices'] },
  { color: 0x9ec0ff, items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Snowflake', 'DynamoDB', 'Cassandra', 'Memcached', 'Kafka', 'Spark', 'Airflow', 'dbt'] },
  { color: 0xd3b6ff, items: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Linux'] },
  { color: 0xafcbff, items: ['PyTorch', 'Prometheus', 'Grafana', 'OpenTelemetry'] },
];
export const TIER1 = { Python: 1, Java: 1, AWS: 1, Kafka: 1, Kubernetes: 1, Docker: 1, PostgreSQL: 1, Spark: 1, Snowflake: 1, PyTorch: 1 };
export const TIER2 = { JavaScript: 1, TypeScript: 1, 'C++': 1, Go: 1, 'Node.js': 1, 'Spring Boot': 1, gRPC: 1, Redis: 1, MongoDB: 1, Airflow: 1, GraphQL: 1, dbt: 1, Elasticsearch: 1, Microservices: 1 };
