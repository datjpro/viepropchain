import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '../../components/Header/header';
import './Home.css';
import hongKongGif from '../../assets/Hong Kong Night GIF by Earth Hour.gif';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
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
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
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
            <motion.h1 
              variants={fadeInUp}
              className="home-heading-1"
            >
              Unified Real Estate Data.{' '}
              <span className="home-gradient-text">
                AI‑Ready. Blockchain‑Verified.
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="home-hero-subtitle"
            >
              Transform fragmented property records into decision-grade intelligence. 
              Secured by blockchain, powered by AI, trusted globally.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="home-hero-buttons"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="home-button home-button-primary"
              >
                Request Demo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="home-button home-button-secondary"
              >
                View Platform
              </motion.button>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="home-hero-badges"
            >
              <div className="home-hero-badge">
                <div className="home-hero-badge-dot home-hero-badge-dot-primary"></div>
                <span>EU & GCC Operations</span>
              </div>
              <div className="home-hero-badge">
                <div className="home-hero-badge-dot home-hero-badge-dot-secondary"></div>
                <span>120M+ Records</span>
              </div>
              <div className="home-hero-badge">
                <div className="home-hero-badge-dot home-hero-badge-dot-primary"></div>
                <span>Real-time Analytics</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ValuePropsSection = () => {
  const features = [
    {
      icon: "🗃️",
      title: "Structured Global Dataset",
      desc: "AI-ready property intelligence across multiple jurisdictions"
    },
    {
      icon: "🛡️",
      title: "Blockchain Verification",
      desc: "Tamper-proof audit trails and regulatory compliance"
    },
    {
      icon: "📊",
      title: "Real-time Analytics",
      desc: "Advanced reporting built on unified data layers"
    },
    {
      icon: "🌐",
      title: "Interoperable Infrastructure",
      desc: "Borderless real estate market operations"
    }
  ];

  return (
    <section className="home-section home-section-dark">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            variants={fadeInUp}
            className="home-heading-2"
          >
            Enterprise-Grade Infrastructure
          </motion.h2>

          <div className="home-grid-features">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="home-card"
              >
                <div className="home-feature-icon">{feature.icon}</div>
                <h3 className="home-feature-title">
                  {feature.title}
                </h3>
                <p className="home-feature-desc">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const PlatformArchitecture = () => {
  const steps = [
    { icon: "📥", title: "Data Ingestion", desc: "Multi-source real estate data collection" },
    { icon: "⚙️", title: "Normalization", desc: "AI-powered data standardization" },
    { icon: "🔗", title: "Blockchain", desc: "Immutable record verification" },
    { icon: "📈", title: "Analytics", desc: "Real-time intelligence processing" },
    { icon: "🔌", title: "APIs", desc: "Enterprise integration endpoints" }
  ];

  return (
    <section className="home-section home-section-gradient-vertical">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            variants={fadeInUp}
            className="home-heading-2"
          >
            Platform Architecture
          </motion.h2>

          <div className="home-architecture-desktop">
            {steps.map((step, index) => (
              <div key={index} className="home-flex home-items-center">
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1 }}
                  className="home-architecture-step"
                >
                  <div className="home-architecture-icon">
                    {step.icon}
                  </div>
                  <h3 className="home-architecture-title">
                    {step.title}
                  </h3>
                  <p className="home-architecture-desc">
                    {step.desc}
                  </p>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="home-architecture-line"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="home-architecture-mobile">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-architecture-step-mobile"
              >
                <div className="home-architecture-icon home-architecture-icon-mobile">
                  {step.icon}
                </div>
                <div>
                  <h3 className="home-architecture-title home-architecture-title-mobile">
                    {step.title}
                  </h3>
                  <p className="home-architecture-desc home-architecture-desc-mobile">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const UseCasesSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = [
    {
      title: "Investors",
      benefits: [
        "Portfolio optimization with AI-driven insights",
        "Risk assessment across global markets",
        "Real-time valuation updates"
      ],
      metric: { value: "34%", label: "Higher Returns" }
    },
    {
      title: "Lenders",
      benefits: [
        "Automated underwriting processes",
        "Enhanced due diligence workflows",
        "Real-time collateral monitoring"
      ],
      metric: { value: "67%", label: "Faster Processing" }
    },
    {
      title: "Asset Managers",
      benefits: [
        "Unified property management dashboard",
        "Predictive maintenance analytics",
        "Performance benchmarking tools"
      ],
      metric: { value: "45%", label: "Cost Reduction" }
    },
    {
      title: "Government",
      benefits: [
        "Transparent property registration",
        "Anti-fraud detection systems",
        "Regulatory compliance automation"
      ],
      metric: { value: "89%", label: "Accuracy Rate" }
    }
  ];

  return (
    <section className="home-section home-section-dark">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 
            variants={fadeInUp}
            className="home-heading-2"
          >
            Tailored Solutions
          </motion.h2>

          <motion.div 
            variants={fadeInUp}
            className="home-tabs-nav"
          >
            {useCases.map((useCase, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`home-tab-button ${
                  activeTab === index
                    ? 'home-tab-button-active'
                    : 'home-tab-button-inactive'
                }`}
              >
                {useCase.title}
              </button>
            ))}
          </motion.div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="home-card home-card-large home-tab-content"
          >
            <div className="home-grid-tabs">
              <div>
                <h3 className="home-feature-title" style={{fontSize: '1.5rem', marginBottom: '1.5rem'}}>
                  For {useCases[activeTab].title}
                </h3>
                <ul className="home-tab-benefits">
                  {useCases[activeTab].benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="home-tab-benefit"
                    >
                      <div className="home-tab-benefit-dot"></div>
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="home-tab-metric-container">
                <div className="home-card-metric">
                  <div className="home-tab-metric-value">
                    {useCases[activeTab].metric.value}
                  </div>
                  <div className="home-tab-metric-label">
                    {useCases[activeTab].metric.label}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
    { number: "99.9%", label: "Uptime" }
  ];

  const CounterAnimation = ({ value, duration = 2 }) => {
    const [count, setCount] = useState("0");
    const [inView, setInView] = useState(false);

    useEffect(() => {
      if (!inView) return;

      const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
      const suffix = value.replace(/[\d.]/g, '');
      
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        
        const currentValue = progress * numericValue;
        setCount(currentValue.toFixed(value.includes('.') ? 1 : 0) + suffix);
        
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
            onComplete: () => setInView(true)
          }
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
          <motion.h2 
            variants={fadeInUp}
            className="home-heading-2"
          >
            Global Impact
          </motion.h2>

          <div className="home-grid-stats">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="home-card"
                >
                  <CounterAnimation value={stat.number} />
                  <div className="home-stats-label">
                    {stat.label}
                  </div>
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
            style={{ color: 'white', marginBottom: '2rem' }}
          >
            Ready to transform your real estate data infrastructure?
          </motion.h2>

          <motion.div 
            variants={fadeInUp}
            className="home-flex home-flex-col home-items-center home-justify-center home-gap-1"
          >
            <div className="home-flex home-flex-col home-gap-1" style={{ flexDirection: 'row' }}>
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
  const mockOnConnectWallet = () => console.log('Connect wallet clicked');
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
      <ValuePropsSection />
      <PlatformArchitecture />
      <UseCasesSection />
      <StatsSection />
      <CTABanner />
    </div>
  );
};

export default Home;
