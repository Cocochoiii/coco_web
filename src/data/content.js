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
  // Drop your PDF into /public as resume.pdf — this then serves at /resume.pdf.
  // (User site at the domain root, so a leading-slash path is correct. If this ever
  //  moves to a project sub-path like user.github.io/repo, use 'resume.pdf' instead.)
  resume: '/resume.pdf',
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
    slug: 'aws-backbone',
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
    slug: 'mars',
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
    slug: 'ubiwell',
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
    slug: 'audi',
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
    slug: 'wpp',
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
    slug: 'rag-news',
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
  audi: 'Your work at Audi?', mars: 'Your work at Mars?', wpp: 'Your work at WPP?',
  rag: 'The news-RAG project?',
};

export const ANSWERS = {
  who: { a: "I'm Coco Choi — a software engineer who builds network infrastructure and distributed systems. I'm finishing my M.S. in Computer Science at Northeastern (GPA 3.8) and joining Amazon's AWS Global Backbone team. I actually started in business and film before moving fully into systems engineering, so I care as much about how a system reads as how it runs.", follow: ['work', 'built', 'drives'] },
  work: { a: "Most recently I'm joining Amazon's AWS Global Backbone as an SDE intern — traffic-engineering tooling and backbone telemetry across thousands of links. Before that: Data Engineer at Volkswagen · Audi in Beijing (Kafka pipelines at 500GB/day, Snowflake + dbt), Cloud Engineer at Mars (Node/GraphQL backends, real-time messaging for 10K concurrent connections), and a Cloud Data Platform intern at WPP · GroupM (500M+ ad events/day and an 80M-profile identity graph).", follow: ['amazon', 'audi', 'mars'] },
  built: { a: "A few I'm proud of: at AWS, a Java traffic-replay simulator over 1,200+ backbone links and a weighted-ECMP path solver in C++ that cut link-utilization variance by 18%. My favorite side project is a personalized-news RAG platform — BM25 + bge-large embeddings + Cohere rerank — which lifted retrieval nDCG@10 by 35%. And at Northeastern's UbiWell Lab I built health-sensing pipelines handling 2.5M+ data points a day at p95 under 200ms.", follow: ['rag', 'research', 'stack'] },
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
  proud: { a: 'Probably the pivot itself — going from a business-and-film background to shipping infrastructure at Amazon in a few years. On the technical side, the personalized-news RAG platform is the one I keep coming back to: BM25 + bge-large + Cohere rerank, a 35% lift in retrieval quality, built end to end.', follow: ['rag', 'surprising', 'goals'] },
  audi: { a: "At Volkswagen · Audi in Beijing I was a full-time Data Engineer on Connected Vehicle & Digital Services (Jan 2023 – Aug 2024). I built Kafka ingestion pulling 500+ GB/day of telemetry from 20,000+ vehicle sensors at 99.9% reliability, then re-architected it with partition sharding and load balancing for 3× throughput and 75% fewer failures. I cut an Airflow + Spark ETL from 6h to 3.5h, moved analytics onto Snowflake + dbt for a 60% query-efficiency gain, and built 15+ PySpark predictive-maintenance models worth roughly $2M a year in savings and a 25% retention lift — all shipped on Docker / Kubernetes / GitHub Actions CI/CD at 90% coverage.", follow: ['mars', 'built', 'stack'] },
  mars: { a: "At Mars in Hong Kong I was a Cloud Engineer intern on Digital Commerce APAC (Jun – Dec 2022). I built a containerized e-commerce backend — Node.js / Express GraphQL with OAuth 2.0 / JWT and RBAC on AWS ECS / Fargate — serving 5,000+ daily users at 99.9% uptime behind $300K of Q1 revenue. The fun part was the real-time layer: Socket.IO + Redis pub/sub + RabbitMQ holding 10K concurrent connections at 2× peak, with token-bucket and sliding-window rate limiting. I also cut MongoDB search latency 65% with geospatial and compound indexes plus a 90%-hit Redis cache.", follow: ['audi', 'wpp', 'stack'] },
  wpp: { a: "At WPP · GroupM (Nexus) in Hong Kong I was a Cloud Data Platform intern (Jan – May 2022). I built ad-event ingestion in Python and Go across 25+ platforms — Meta CAPI, Google Enhanced Conversions, TikTok — moving 500M+ events a day through Kinesis and Glue into Parquet on S3 at 99.95% delivery. I built an identity-resolution graph over 80M+ profiles with Splink and LSH, hitting 92% OneID match under GDPR / CCPA / PIPL, and a Redshift + Spectrum warehouse with 120+ dbt models (Kimball, SCD2) that took query latency from 60s to 15s and cut storage 40%.", follow: ['audi', 'built', 'stack'] },
  rag: { a: "My favorite side project is a personalized-news summarization platform built on RAG (Oct 2024 – Apr 2025). It retrieves across 50K+ articles with a hybrid pipeline — BM25 + bge-large embeddings in pgvector + Cohere rerank — which lifted retrieval nDCG@10 by 35% at 92% faithfulness. I fine-tuned bge-large-en on 120K contrastive pairs (PyTorch + DeepSpeed on SageMaker, 4× A10G), cutting training from 12h to 4h for a 15% accuracy gain, with HyDE and spaCy query expansion. Full observability (Prometheus / Grafana / OpenTelemetry / LangSmith) held a 99.95% SLA while vLLM batching cut inference cost $8K a month and on-call load 60%.", follow: ['built', 'research', 'stack'] },
};

// free-typed question -> topic (first keyword hit wins; order = specific to generic)
export const ROUTES = [
  ['reach', ['reach', 'contact', 'email', 'hire', 'connect', 'touch', 'linkedin', 'get in', 'hiring']],
  ['amazon', ['amazon', 'backbone', 'aws']],
  ['site', ['this site', 'the site', 'this website', 'build this', 'built this', 'made this', 'this page', 'how was this']],
  ['research', ['research', 'ubiwell', 'grad assistant', 'research assistant']],
  ['rag', ['rag', 'news', 'summariz', 'retrieval', 'bge', 'cohere', 'pgvector', 'vector', 'embedding', 'rerank', 'vllm', 'ndcg']],
  ['audi', ['audi', 'volkswagen', ' vw', 'connected vehicle', 'predictive maintenance', 'beijing']],
  ['mars', ['mars', 'digital commerce', 'storefront', 'e-commerce', 'ecommerce', 'rabbitmq', 'socket.io', 'socket']],
  ['wpp', ['wpp', 'groupm', 'group m', 'nexus', 'choreograph', 'identity graph', 'oneid', 'one id', 'ad event', 'ad-event', 'adtech']],
  ['proud', ['proud', 'most proud', 'accomplish', 'achievement', 'best work']],
  ['surprising', ['surpris', 'unexpected', 'fun fact', 'outside of work', 'outside work', 'hobby', 'film', 'movie', 'liberal arts', 'non-cs', 'pivot', 'align program', 'career switch']],
  ['goals', ['goal', 'future', 'headed', 'long term', 'long-term', 'aspir', 'return offer', 'ambition', 'where do you see', 'five years']],
  ['strength', ['strength', 'strong suit', 'best at', 'good at', 'superpower', 'greatest']],
  ['learn', ['learn new', 'how do you learn', 'pick up', 'new tech', 'new technolog', 'ramp up', 'up to speed', 'unfamiliar', 'get good at']],
  ['why', ['why network', 'why infra', 'why distributed', 'why systems', 'why backbone', 'networking', 'distributed']],
  ['built', ['built', 'build', 'project', 'portfolio', 'simulator', 'ship', 'made', 'creat']],
  ['work', ['work', 'job', 'experience', 'compan', 'intern', 'career', 'employ', 'role', 'worked']],
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
export const SUGGEST_FULL = ['who', 'work', 'built', 'stack', 'study', 'site', 'drives', 'teams', 'disagree', 'failed', 'leadership', 'amazon', 'audi', 'mars', 'wpp', 'rag', 'research', 'strength', 'goals', 'reach'];
export const SUGGEST_MINI = ['who', 'work', 'built', 'amazon', 'audi', 'rag', 'stack', 'research', 'goals', 'reach'];

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

/* Flat lookup for project detail routes (/work/:slug) */
export const PROJECTS = [...CARDS_LEFT, ...CARDS_RIGHT];
export function getProject(slug) {
  return PROJECTS.find((pr) => pr.slug === slug) || null;
}

/* ============================================================
   Case-study detail content (resume-grounded) + /about page data
   Keyed by the same slug used for the card layoutId morph.
   ============================================================ */
export const DETAILS = {
  'aws-backbone': {
    role: 'SDE Intern · AWS Global Backbone',
    period: 'Aug 2026 – Dec 2026',
    location: 'Santa Clara, CA',
    overview:
      `AWS's global backbone is the private network that carries AWS itself between regions. I work on the traffic-engineering and telemetry tooling that decides how traffic moves across it — and proves those decisions are safe before they ever ship. When the network you're tuning is the one everything else runs on, staying up isn't a feature, it's the entire job.`,
    highlights: [
      { metric: '−60%', label: 'validation cycle', body: `Built a Java traffic-replay simulator ingesting 14 days of BGP-LS / gNMI snapshots across 1,200+ backbone links on EKS, regression-testing 200+ congestion scenarios against the TE controller and surfacing 4 path-solver corner cases.` },
      { metric: '−18%', label: 'link-utilization variance', body: `Implemented a weighted-ECMP heuristic in C++ for the TE controller path solver with Google OR-Tools, smoothing utilization across 8 regions and 40+ peering edges; gRPC hooks passed 95% lab validation on 500+ TE LSPs.` },
      { metric: '12s → 3s', label: 'decision-loop latency', body: `Engineered a Java / Kafka link-utilization aggregator ingesting gNMI telemetry from 2,500+ backbone interfaces at 5s granularity and published over gRPC, lifting congestion-detection recall by 22%.` },
      { metric: '< 200ms', label: 'FRR failover convergence', body: `Designed a Python / Kubernetes failure-injection harness simulating 30+ link-cut and node-failure scenarios on a containerized SDN-fabric emulator, validating convergence on 95% of 400+ runs and catching 3 race conditions.` },
      { metric: '−35%', label: 'capacity-planning prep', body: `Shipped a what-if dashboard (React + FastAPI on EKS) visualizing TE path decisions across 1,000+ edges and 60+ POPs with OpenTelemetry traces and 8 metric views — adopted by 5 network development engineers.` },
    ],
    stack: [
      { group: 'Languages', items: ['Java', 'C++', 'Python'] },
      { group: 'Streaming & telemetry', items: ['Kafka', 'gNMI', 'gRPC'] },
      { group: 'Infrastructure', items: ['EKS', 'Kubernetes', 'FRR'] },
      { group: 'Tooling', items: ['OR-Tools', 'OpenTelemetry', 'React', 'FastAPI'] },
    ],
  },

  'mars': {
    role: 'Cloud Engineer Intern · Digital Commerce APAC',
    period: 'Jun – Dec 2022',
    location: 'Hong Kong',
    overview:
      `An e-commerce backend and real-time messaging layer for a high-traffic storefront — GraphQL APIs over the catalog and a socket layer holding thousands of live connections, all tuned to stay fast and correct when traffic spikes.`,
    highlights: [
      { metric: '5,000+ DAU', label: 'at 99.9% uptime', body: `Built a containerized backend with Node.js / Express GraphQL, OAuth 2.0 / JWT auth and RBAC on AWS ECS / Fargate, auto-scaling to support $300K in Q1 revenue.` },
      { metric: '10K', label: 'concurrent connections', body: `Scaled real-time messaging with Socket.IO, Redis pub/sub and RabbitMQ; added distributed rate limiting (token bucket + sliding window) and event sourcing to hold steady at 2× baseline peak traffic.` },
      { metric: '−65%', label: 'search latency', body: `Cut MongoDB search latency with Mongoose geospatial and compound indexes plus a Redis cache at a 90% hit rate, and lifted maintainability 30% with OOP design patterns.` },
    ],
    stack: [
      { group: 'Backend', items: ['Node.js', 'Express', 'GraphQL'] },
      { group: 'Data & messaging', items: ['MongoDB', 'Redis', 'RabbitMQ', 'Socket.IO'] },
      { group: 'Cloud & auth', items: ['AWS ECS', 'Fargate', 'OAuth 2.0', 'JWT'] },
    ],
  },

  'ubiwell': {
    role: 'Graduate Research Assistant · UbiWell Lab',
    period: 'May – Oct 2025',
    location: 'Northeastern · Boston, MA',
    overview:
      `A health-sensing data platform and real-time research pipelines — high-throughput ingestion and streaming that stay responsive at millions of data points a day, feeding live dashboards for the lab's researchers.`,
    highlights: [
      { metric: '2.5M+/day', label: 'data points · p95 < 200ms', body: `Designed Python (Django / FastAPI) microservices over PostgreSQL / MongoDB at 99.9% availability, exposing REST (JSON) and gRPC (Protocol Buffers) APIs.` },
      { metric: '8h → 1.2h', label: 'report generation (−85%)', body: `Cut report time through multi-tier caching and algorithm work, and delivered 100+ React / TypeScript dashboards (D3.js, Plotly) with real-time, role-based views for 1,000+ daily research users.` },
      { metric: '50K/s', label: 'event peak', body: `Built fault-tolerant pipelines collecting 500+ hours of patient-monitoring data via APIs and BeautifulSoup / Selenium, integrating a Kafka event-driven architecture and reducing data loss 15%.` },
    ],
    stack: [
      { group: 'Languages', items: ['Python', 'TypeScript'] },
      { group: 'Data & streaming', items: ['PostgreSQL', 'MongoDB', 'Kafka'] },
      { group: 'APIs & frontend', items: ['REST', 'gRPC', 'React', 'D3.js', 'Plotly'] },
    ],
  },

  'audi': {
    role: 'Data Engineer · Connected Vehicle & Digital Services',
    period: 'Jan 2023 – Aug 2024',
    location: 'Volkswagen · Beijing, China',
    overview:
      `A connected-vehicle data platform and predictive-maintenance pipelines — large-scale streaming ingestion from the fleet plus an ETL and warehouse layer that cut batch time and drove real retention dollars.`,
    highlights: [
      { metric: '3×', label: 'ingestion throughput', body: `Ingested 500+ GB/day from 20K+ IoT sensors via Kafka at 99.9% uptime on Spring Boot / Flask microservices, with horizontal sharding and round-robin load balancing that cut ingestion failures 75%.` },
      { metric: '6h → 3.5h', label: 'ETL batch time (−42%)', body: `Designed high-performance ETL with Apache Airflow and Spark Structured Streaming, parallelizing Pandas / NumPy transforms to sub-second latency across 12 teams.` },
      { metric: '~$2M/yr', label: 'retention impact', body: `Built a Snowflake warehouse with dbt (+60% SQL performance) and delivered 15+ PySpark predictive-maintenance solutions tied to 25% higher customer retention.` },
      { metric: '90%', label: 'test coverage', body: `Stood up infrastructure as code with Docker, Kubernetes and GitHub Actions CI/CD, collaborating with PM, UX and 8 engineers under Agile — and shipping two sprints ahead of schedule.` },
    ],
    stack: [
      { group: 'Languages', items: ['Python', 'SQL'] },
      { group: 'Streaming & ETL', items: ['Kafka', 'Spark', 'Airflow'] },
      { group: 'Warehouse', items: ['Snowflake', 'dbt'] },
      { group: 'Infrastructure', items: ['Docker', 'Kubernetes', 'GitHub Actions'] },
    ],
  },

  'wpp': {
    role: 'Cloud Data Platform Intern · GroupM Nexus',
    period: 'Jan – May 2022',
    location: 'Hong Kong',
    overview:
      `Server-side ad-event ingestion and identity resolution at serious scale — a half-billion-events-a-day pipeline and an 80-million-profile identity graph feeding analytics, built under strict privacy regimes.`,
    highlights: [
      { metric: '500M+/day', label: 'ad events · 99.95% delivery', body: `Engineered Python / Go server-side ingestion via Meta CAPI, Google Enhanced Conversions and the TikTok Events API across 25+ platforms, streaming through AWS Kinesis Firehose / Glue into Parquet on S3.` },
      { metric: '80M+', label: 'profiles unified · 92% OneID', body: `Built an identity-resolution graph across HEM / MAID / IDFA / CRM with deterministic + probabilistic matching (Splink / LSH), enforcing GDPR / CCPA / PIPL via IAB TCF 2.0, k-anonymity, differential privacy and AWS Lake Formation.` },
      { metric: '60s → 15s', label: 'BI latency (−75%)', body: `Architected AWS Redshift + Spectrum with a Kimball star schema, SCD Type 2 and 120+ dbt models orchestrated via Step Functions / Athena, with Great Expectations checks and 40% lower storage cost.` },
    ],
    stack: [
      { group: 'Languages', items: ['Python', 'Go'] },
      { group: 'Pipelines', items: ['Kinesis', 'Glue', 'dbt', 'Step Functions'] },
      { group: 'Warehouse', items: ['Redshift', 'Spectrum', 'Athena'] },
      { group: 'Governance', items: ['Lake Formation', 'Great Expectations'] },
    ],
  },

  'rag-news': {
    role: 'Personal project · Northeastern',
    period: 'Oct 2024 – Apr 2025',
    location: 'Retrieval-augmented generation',
    overview:
      `A real-time, retrieval-augmented news summarization platform built end to end — a hybrid retrieval stack with fine-tuned embeddings and full LLM observability, tuned for both answer quality and cost.`,
    highlights: [
      { metric: '+35%', label: 'retrieval nDCG@10', body: `Built a real-time RAG pipeline over 50K+ articles combining BM25 with bge-large embeddings in pgvector on AWS RDS plus Cohere Rerank v3, reaching 92% answer faithfulness on 2K+ eval queries.` },
      { metric: '12h → 4h', label: 'training time (−67%)', body: `Fine-tuned bge-large-en embeddings on 120K pairs via contrastive learning (PyTorch + DeepSpeed) on AWS SageMaker (4× A10G GPUs), lifting accuracy 15%; enhanced queries with HyDE and spaCy NER.` },
      { metric: '−$8K/mo', label: 'compute cost', body: `Built LLM observability with Prometheus / Grafana, OpenTelemetry, LangSmith traces and the ELK stack at a 99.95% SLA, optimizing token usage and vLLM inference batching to cut on-call escalations 60%.` },
    ],
    stack: [
      { group: 'Language', items: ['Python'] },
      { group: 'Retrieval', items: ['BM25', 'bge-large', 'pgvector', 'Cohere Rerank'] },
      { group: 'Training', items: ['PyTorch', 'DeepSpeed', 'SageMaker'] },
      { group: 'Observability', items: ['Prometheus', 'Grafana', 'OpenTelemetry', 'vLLM'] },
    ],
  },
};

export function getDetail(slug) {
  return DETAILS[slug] || null;
}

/* wrap-around previous / next project for the case-study footer nav */
export function prevNextProject(slug) {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  const n = PROJECTS.length;
  return { prev: PROJECTS[(i - 1 + n) % n], next: PROJECTS[(i + 1) % n] };
}
