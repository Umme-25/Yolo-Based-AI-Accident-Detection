import { Link } from 'wouter';
import { Activity, ArrowRight, Camera, ShieldAlert, Gauge, ScanSearch, CircleCheck } from 'lucide-react';

const highlights = [
  { icon: Camera, title: 'Traffic camera monitoring', text: 'Bring camera feeds and video samples into one focused monitoring workspace.' },
  { icon: ScanSearch, title: 'Incident review workflow', text: 'Keep potential incidents visible for review before any real-world action.' },
  { icon: ShieldAlert, title: 'Response-ready reporting', text: 'Organize incident details in a consistent report format for future integration.' },
];

export default function Home() {
  return (
    <div className="landing-page">
      <section className="hero-section page-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> ROAD SAFETY MONITORING PLATFORM</div>
          <h1>Smarter roads.<br /><span>Faster awareness.</span></h1>
          <p className="hero-description">A focused interface for traffic monitoring, accident incident review, and structured reporting — built as the frontend foundation for our AI accident detection project.</p>
          <div className="hero-actions">
            <Link href="/dashboard" className="button button-primary">Open dashboard <ArrowRight size={17} /></Link>
            <Link href="/traffic-analysis" className="button button-secondary"><Camera size={17} /> Traffic analysis</Link>
          </div>
          <div className="hero-footnote"><CircleCheck size={15} /> Standalone local frontend · Ready for backend integration</div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline"><span><span className="live-dot" /> MONITORING CONSOLE</span><span>UI PREVIEW / 01</span></div>
          <div className="road-graphic">
            <div className="road-grid" />
            <div className="road-line line-a" /><div className="road-line line-b" />
            <div className="lane-mark lane-one" /><div className="lane-mark lane-two" /><div className="lane-mark lane-three" />
            <div className="vehicle vehicle-one"><span /></div><div className="vehicle vehicle-two"><span /></div>
            <div className="camera-tag"><Camera size={15} /> CAM-01 <b>DEMO</b></div>
            <div className="scan-frame"><span /><span /><span /><span /></div>
            <div className="visual-caption"><Activity size={15} /> TRAFFIC SCENE SIMULATION <span>NO LIVE FEED</span></div>
          </div>
          <div className="visual-bottom"><div><small>PLATFORM STATUS</small><strong><span className="state-dot" /> UI ONLINE</strong></div><div><small>DETECTION ENGINE</small><strong>NOT CONNECTED</strong></div></div>
        </div>
      </section>
      <section className="overview-strip page-wrap">
        <div><span className="strip-number">01</span><span><strong>Monitor</strong><small>Camera workspace</small></span></div>
        <div><span className="strip-number">02</span><span><strong>Review</strong><small>Incident overview</small></span></div>
        <div><span className="strip-number">03</span><span><strong>Report</strong><small>Structured records</small></span></div>
      </section>
      <section className="features-section page-wrap">
        <div className="section-heading"><div><span className="eyebrow">CORE WORKSPACE</span><h2>Everything important.<br /><span>Nothing extra.</span></h2></div><p>The interface is intentionally limited to five areas so the team can complete and test the frontend before integrating the AI pipeline and backend.</p></div>
        <div className="feature-grid">
          {highlights.map(({ icon: Icon, title, text }, index) => <article className="feature-card" key={title}><span className="feature-index">0{index + 1}</span><div className="feature-icon"><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></article>)}
        </div>
        <div className="feature-cta"><div><Gauge size={20} /><span><strong>Ready to explore the interface?</strong><small>Open the dashboard to view the sample incident overview.</small></span></div><Link href="/dashboard" className="text-link">Go to dashboard <ArrowRight size={16} /></Link></div>
      </section>
    </div>
  );
}