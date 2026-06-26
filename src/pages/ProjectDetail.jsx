import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProject, getDetail, prevNextProject, PROJECTS, SPLINE } from '../data/content.js';
import TechRing from '../components/TechRing.jsx';
import SplineScene from '../components/SplineScene.jsx';
import ImpactCoverflow from '../components/ImpactCoverflow.jsx';

const EASE = [0.2, 0.7, 0.2, 1];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const rise = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };
const drawX = { hidden: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1, transition: { duration: 0.6, ease: EASE } } };
const inView = { once: true, margin: '-12% 0px' };

function SectionHead({ children }) {
  return (
    <motion.h2 className="cs-h2"
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={inView} transition={{ duration: 0.5, ease: EASE }}>
      <motion.span className="cs-h2__rule" variants={drawX} initial="hidden" whileInView="show"
        viewport={inView} style={{ transformOrigin: 'left' }} />
      {children}
    </motion.h2>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const p = getProject(slug);
  const d = getDetail(slug);
  const ringItems = React.useMemo(
    () => (d && d.stack ? d.stack.flatMap((g) => g.items) : []),
    [slug], // d is derived from slug; rebuild the ring only when the project changes
  );

  if (!p) {
    return (
      <div>
        <main>
          <section className="section cs"><div className="wrap">
            <Link to="/" className="project-back">← Back to work</Link>
            <h1 className="cs-title">Project not found</h1>
          </div></section>
        </main>
      </div>
    );
  }

  const { prev, next } = prevNextProject(slug);
  const idx = Math.max(0, PROJECTS.findIndex((x) => x.slug === slug)) + 1;
  const idxStr = String(idx).padStart(2, '0');

  return (
    <div>
      <main>
        <article className="section cs">
          <div className="wrap">
            {/* decorative layer (sits behind the content) */}
            <div className="cs-glow" aria-hidden="true" />
            <motion.div className="cs-index" aria-hidden="true"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}>
              {idxStr}
            </motion.div>

            <Link to="/" state={{ scrollTo: '#build' }} className="project-back">← Back to work</Link>

            {/* enters naturally — a soft fade, nothing flies in. The homepage
                big-head character (SPLINE.home) sits INSIDE the hero on the right,
                ON TOP of the card — not in the page margin behind the frosted glass
                (which is what left her blurred + clipped before). */}
            <motion.header className="cs-hero"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE }}>
              <div className="cs-hero__text">
                <div className="no">{p.no}</div>
                <h1 className="cs-title">{p.title}</h1>
                <p className="cs-role">{(d && d.role) || p.role}</p>
              </div>
              <div className="cs-hero__fig" aria-hidden="true">
                <span className="cs-hero__fig-aura" aria-hidden="true" />
                <SplineScene url={SPLINE.home} className="scene" />
              </div>
            </motion.header>

            {d && (
              <motion.div className="cs-meta" variants={stagger} initial="hidden" animate="show">
                {d.period && <motion.span className="cs-tag" variants={rise}>{d.period}</motion.span>}
                {d.location && <motion.span className="cs-tag" variants={rise}>{d.location}</motion.span>}
              </motion.div>
            )}

            {d && d.overview && (
              <motion.p className="cs-overview"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={inView} transition={{ duration: 0.6, ease: EASE }}>
                {d.overview}
              </motion.p>
            )}

            {d && d.stack && (
              <section className="cs-block">
                <SectionHead>Stack</SectionHead>
                <TechRing items={ringItems} label={`Technologies used at ${p.title}`} />
              </section>
            )}

            {d && d.highlights && (
              <section className="cs-block">
                <SectionHead>Impact</SectionHead>
                <ImpactCoverflow highlights={d.highlights} />
              </section>
            )}

            <nav className="cs-nav">
              {prev && (
                <Link to={`/work/${prev.slug}`} className="cs-nav__link cs-nav__prev">
                  <span className="cs-nav__dir"><span className="cs-nav__arrow">←</span> Previous</span>
                  <span className="cs-nav__title">{prev.title}</span>
                </Link>
              )}
              {next && (
                <Link to={`/work/${next.slug}`} className="cs-nav__link cs-nav__next">
                  <span className="cs-nav__dir">Next <span className="cs-nav__arrow">→</span></span>
                  <span className="cs-nav__title">{next.title}</span>
                </Link>
              )}
            </nav>
          </div>
        </article>
      </main>
    </div>
  );
}
