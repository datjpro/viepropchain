import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";
import { useLanguage } from "../../contexts/LanguageContext";
import { translations } from "../../translations/translations";
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
  const { t } = useLanguage();
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

      <div className="home-hero-content-wrapper">
        <div className="home-hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="home-heading-1">
              {t(translations.hero.title1)}
              <br />
              <span className="home-gradient-text">
                {t(translations.hero.title2)}
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="home-hero-subtitle">
              {t(translations.hero.subtitle)}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FoundationsSection = () => {
  const { t } = useLanguage();

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
            {t(translations.foundations.title)
              .split("\n")
              .map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i <
                    t(translations.foundations.title).split("\n").length -
                      1 && <br />}
                </React.Fragment>
              ))}
          </motion.h2>

          <div className="home-foundations-grid">
            {translations.foundations.items.map((foundation, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-foundation-card"
              >
                <h3 className="home-foundation-title">{t(foundation.title)}</h3>
                <p className="home-foundation-desc">{t(foundation.desc)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const PlatformLayers = () => {
  const { t } = useLanguage();

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
            {t(translations.platformLayers.title)}
          </motion.h2>

          <div className="home-layers-container">
            {translations.platformLayers.layers.map((layer, layerIndex) => (
              <motion.div
                key={layerIndex}
                variants={fadeInUp}
                className="home-layer-card"
              >
                <div className="home-layer-header">
                  <span className="home-layer-badge">{t(layer.layer)}</span>
                  <h3 className="home-layer-title">{t(layer.title)}</h3>
                  {layer.subtitle.en && (
                    <p className="home-layer-subtitle">{t(layer.subtitle)}</p>
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
                        {t(feature.name)}
                      </h4>
                      <p className="home-layer-feature-desc">
                        {t(feature.desc)}
                      </p>
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
  const { t } = useLanguage();

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
            {t(translations.stakeholders.title)}
          </motion.h2>

          <motion.p variants={fadeInUp} className="home-section-subtitle">
            {t(translations.stakeholders.subtitle)}
          </motion.p>

          <div className="home-stakeholders-grid">
            {translations.stakeholders.items.map((stakeholder, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-stakeholder-card"
              >
                <h3 className="home-stakeholder-title">
                  {t(stakeholder.title)}
                </h3>
                <p className="home-stakeholder-desc">{t(stakeholder.desc)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const { t } = useLanguage();

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
            {t(translations.stats.title)}
          </motion.h2>

          <div className="home-grid-stats">
            {translations.stats.items.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="home-text-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} className="home-card">
                  <CounterAnimation value={stat.number} />
                  <div className="home-stats-label">{t(stat.label)}</div>
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
  const { t } = useLanguage();

  return (
    <section className="home-cta-section">
      <div className="home-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="home-cta-content"
        >
          <motion.h2 variants={fadeInUp} className="home-cta-heading">
            {t(translations.cta.title)}
          </motion.h2>

          <motion.div variants={fadeInUp} className="home-cta-buttons">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="home-button home-button-primary"
            >
              {t(translations.cta.buttons.getStarted)}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="home-button home-button-secondary"
            >
              {t(translations.cta.buttons.contactUs)}
            </motion.button>
            <Link to="/test">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="home-button home-button-secondary"
              >
                Test Contract
              </motion.button>
            </Link>
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
      <Footer />
    </div>
  );
};

export default Home;
