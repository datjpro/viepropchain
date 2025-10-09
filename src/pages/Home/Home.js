import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "../../components/Header/header";
import "./Home.css";
import hongKongGif from "../../assets/Hong Kong Night GIF by Earth Hour.gif";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  return (
    <section className="home-hero">
      <div className="home-hero-background">
        <img
          src={hongKongGif}
          alt="Hong Kong Night"
          className="home-hero-bg-gif"
        />
        <motion.div
          style={{ y: y1 }}
          className="home-hero-particle home-hero-particle-1"
        />
        <motion.div
          style={{ y: y2 }}
          className="home-hero-particle home-hero-particle-2"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="home-container">
        <div className="home-hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="home-heading-1">
              Building the Real Estate
              <br />
              <span className="home-gradient-text">Infrastructure Layer</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="home-hero-subtitle">
              ViePropChain unifies property data, AI-readiness and blockchain
              validation into one interoperable platform, so institutions,
              lenders, asset managers, developers, and proptechs can build the
              next generation of real estate solutions.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FoundationsSection = () => {
  const foundations = [
    {
      title: "Unified data foundation",
      desc: "A structured global dataset that transforms fragmented records into AI-ready, decision-grade intelligence.",
    },
    {
      title: "Trusted by design",
      desc: "Tamper-proof verification and auditability, secured by blockchain.",
    },
    {
      title: "Actionable solutions",
      desc: "Real-time reporting, analytics, and operational tools built directly on our core layers.",
    },
    {
      title: "Collaborative ecosystem",
      desc: "Partnering and investing with stakeholders across the value chain to accelerate innovation and scale.",
    },
  ];

  return (
    <section className="home-section home-foundations-section">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="home-heading-2 home-foundations-heading"
          >
            Foundations that power
            <br />
            our ecosystem
          </motion.h2>

          <div className="home-foundations-grid">
            {foundations.map((foundation, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-foundation-card"
              >
                <h3 className="home-foundation-title">{foundation.title}</h3>
                <p className="home-foundation-desc">{foundation.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const PlatformLayers = () => {
  const layers = [
    {
      layer: "Layer 1",
      title: "Propchain Cloud",
      subtitle: "Ingestion & Normalisation",
      features: [
        {
          name: "Data Normalisation",
          desc: "Normalises & orders fragmented datasets across markets, asset classes, and formats. Creating AI-readiness and structure.",
        },
        {
          name: "Data Enrichment",
          desc: "Fuses transactional, operational, geospatial, macro, and other third-party feeds to raise informational quality.",
        },
        {
          name: "Secure Data-Sharing",
          desc: "Role-based access, clean rooms, and commercial frameworks to exchange data across stakeholders.",
        },
        {
          name: "APIs & Governance",
          desc: "Enterprise-grade access, versioning, permissions, lineage, and policy compliance.",
        },
      ],
    },
    {
      layer: "Layer 2",
      title: "Blockchain Validation",
      subtitle: "",
      features: [
        {
          name: "Provenance & Integrity",
          desc: "Cryptographic anchoring of critical records and data inputs.",
        },
        {
          name: "Compliance-ready Contracts",
          desc: "Smart-contract templates for audit trails, permissions, and process controls.",
        },
        {
          name: "Interoperability",
          desc: "Designed to integrate with institutional systems and external chains where appropriate.",
        },
        {
          name: "Tokenization Readiness",
          desc: "Built to integrate with modern day tokenization solutions through on-chain data bridges.",
        },
      ],
    },
    {
      layer: "Layer 3",
      title: "Purpose-built Solutions",
      subtitle: "",
      features: [
        {
          name: "Data Products",
          desc: "Automated valuation models (AVMs), market intelligence, portfolio analytics.",
        },
        {
          name: "Operational Tools & AI Agents",
          desc: "Underwriting, reporting, management optimization, workflow automation, compliance monitoring.",
        },
        {
          name: "Specialized Modules",
          desc: "Risk scoring, ESG compliance, sector specific capabilities like loan servicing and development tooling.",
        },
        {
          name: "APIs & Datasets",
          desc: "Data enrichment, tailored datasets, on-chain data bridging for tokenization solutions.",
        },
      ],
    },
  ];

  return (
    <section className="home-section home-platform-layers-section">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="home-heading-2">
            Platform Architecture
          </motion.h2>

          <div className="home-layers-container">
            {layers.map((layer, layerIndex) => (
              <motion.div
                key={layerIndex}
                variants={fadeInUp}
                className="home-layer-card"
              >
                <div className="home-layer-header">
                  <span className="home-layer-badge">{layer.layer}</span>
                  <h3 className="home-layer-title">{layer.title}</h3>
                  {layer.subtitle && (
                    <p className="home-layer-subtitle">{layer.subtitle}</p>
                  )}
                </div>

                <div className="home-layer-features">
                  {layer.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: featureIndex * 0.1 }}
                      className="home-layer-feature"
                    >
                      <h4 className="home-layer-feature-name">
                        {feature.name}
                      </h4>
                      <p className="home-layer-feature-desc">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const StakeholdersSection = () => {
  const stakeholders = [
    {
      title: "Institutional Investors & Managers",
      desc: "Portfolio analytics, risk/ESG overlays, market insights, standardised/automated reporting.",
    },
    {
      title: "Developers & property managers",
      desc: "Operational dashboards, performance KPIs, (predictive) maintenance and occupancy optimisation/automation.",
    },
    {
      title: "Banks & lenders",
      desc: "Due‑diligence acceleration, valuation confidence, collateral transparency, risk frameworks.",
    },
    {
      title: "PropTech partners",
      desc: "APIs, enrichment, and blockchain verification to enhance product accuracy and credibility.",
    },
    {
      title: "Governments & Municipalities",
      desc: "Verified ESG reporting, urban planning insights, transparent zoning and compliance monitoring, improved tax assessment, and affordable housing policy support.",
    },
  ];

  return (
    <section className="home-section home-stakeholders-section">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="home-heading-2">
            Built for Every Stakeholder
          </motion.h2>

          <motion.p variants={fadeInUp} className="home-section-subtitle">
            From investors to government bodies, Propchain powers smarter
            decisions, faster transactions, lower costs, and more trusted data,
            tailored to your position in the real estate value chain.
          </motion.p>

          <div className="home-stakeholders-grid">
            {stakeholders.map((stakeholder, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-stakeholder-card"
              >
                <h3 className="home-stakeholder-title">{stakeholder.title}</h3>
                <p className="home-stakeholder-desc">{stakeholder.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { number: "120M+", label: "Property Records" },
    { number: "18+", label: "Global Markets" },
    { number: "<200ms", label: "Query Speed" },
    { number: "99.9%", label: "Uptime" },
  ];

  const CounterAnimation = ({ value, duration = 2 }) => {
    const [count, setCount] = useState("0");
    const [inView, setInView] = useState(false);

    useEffect(() => {
      if (!inView) return;

      const numericValue = parseFloat(value.replace(/[^\d.]/g, ""));
      const suffix = value.replace(/[\d.]/g, "");

      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min(
          (currentTime - startTime) / (duration * 1000),
          1
        );

        const currentValue = progress * numericValue;
        setCount(currentValue.toFixed(value.includes(".") ? 1 : 0) + suffix);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [inView, value, duration]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{
          opacity: 1,
          transition: {
            onComplete: () => setInView(true),
          },
        }}
        className="home-stats-counter"
      >
        {count}
      </motion.div>
    );
  };

  return (
    <section className="home-section home-section-gradient-reverse">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="home-heading-2">
            Global Impact
          </motion.h2>

          <div className="home-grid-stats">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-text-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} className="home-card">
                  <CounterAnimation value={stat.number} />
                  <div className="home-stats-label">{stat.label}</div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const CTABanner = () => {
  return (
    <section className="home-section home-section-gradient-horizontal">
      <div className="home-container home-text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="home-heading-2"
            style={{ color: "white", marginBottom: "2rem" }}
          >
            Ready to transform your real estate data infrastructure?
          </motion.h2>

          <motion.div
            variants={fadeInUp}
            className="home-flex home-flex-col home-items-center home-justify-center home-gap-1"
          >
            <div
              className="home-flex home-flex-col home-gap-1"
              style={{ flexDirection: "row" }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="home-button home-button-white"
              >
                Request Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="home-button home-button-outline-white"
              >
                Download Deck
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Home = () => {
  const mockWeb3Api = { provider: null };
  const mockAccount = null;
  const mockOnConnectWallet = () => console.log("Connect wallet clicked");
  const mockError = null;

  return (
    <div className="home-page">
      <Header
        web3Api={mockWeb3Api}
        account={mockAccount}
        onConnectWallet={mockOnConnectWallet}
        error={mockError}
      />
      <HeroSection />
      <FoundationsSection />
      <PlatformLayers />
      <StakeholdersSection />
      <StatsSection />
      <CTABanner />
    </div>
  );
};

export default Home;
