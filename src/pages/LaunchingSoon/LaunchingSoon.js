import React, { useEffect, useRef } from "react";
import "./LaunchingSoon.css";

// A React conversion of the provided static LaunchingSoon HTML/JS
export default function LaunchingSoon() {
  const passwordRef = useRef(null);
  const backgroundRef = useRef(null);

  useEffect(() => {
    // focus password after a short delay
    const t = setTimeout(() => {
      passwordRef.current && passwordRef.current.focus();
    }, 600);

    // respects prefers-reduced-motion
    const bg = backgroundRef.current;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleMotion(e) {
      if (!bg) return;
      if (e.matches) {
        bg.style.filter = "grayscale(20%)";
        bg.style.opacity = "0.8";
      } else {
        bg.style.filter = "none";
        bg.style.opacity = "1";
      }
    }

    mql.addEventListener?.("change", handleMotion);
    handleMotion(mql);

    function onVisibility() {
      if (!bg) return;
      bg.style.animationPlayState = document.hidden ? "paused" : "running";
    }
    document.addEventListener("visibilitychange", onVisibility);

    // keyboard shortcuts
    function onKey(e) {
      if (e.key === "Escape") {
        if (passwordRef.current) {
          passwordRef.current.value = "";
          passwordRef.current.blur();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        // submit
        const form = document.getElementById("vp-password-form");
        form && form.dispatchEvent(new Event("submit", { bubbles: true }));
      }
    }
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      mql.removeEventListener?.("change", handleMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `vp-notification vp-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    // animate
    requestAnimationFrame(
      () => (notification.style.transform = "translateX(0)")
    );
    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 400);
    }, 3800);
  }

  function createPageTransition() {
    const transition = document.createElement("div");
    transition.className = "vp-page-transition";
    transition.innerHTML =
      '<div class="vp-pt-inner"><div>Loading ViePropChain...</div><div class="vp-spinner"></div></div>';
    document.body.appendChild(transition);
    requestAnimationFrame(() => (transition.style.opacity = "1"));
    return transition;
  }

  function onSubmit(e) {
    e.preventDefault();
    const value = passwordRef.current?.value.trim() || "";
    if (!value) {
      showNotification("Please enter a password", "warning");
      return;
    }

    const accepted = ["viepropchain", "propchain2025", "demo"];
    if (accepted.includes(value)) {
      showNotification("Access granted! Welcome to ViePropChain.", "success");
      setTimeout(() => {
        createPageTransition();
        // navigate to home route if present
        setTimeout(() => {
          // prefer React navigation; fallback to root
          try {
            window.location.href = "/";
          } catch (err) {
            window.location.href = "/";
          }
        }, 800);
      }, 600);
    } else {
      showNotification(
        'Invalid password. Try "viepropchain" for access.',
        "error"
      );
      if (passwordRef.current) {
        passwordRef.current.value = "";
        passwordRef.current.focus();
      }
    }
  }

  return (
    <div className="vp-coming-soon-root">
      <div className="vp-background-container">
        <img
          ref={backgroundRef}
          src={
            process.env.PUBLIC_URL +
            "/assets/Hong Kong Night GIF by Earth Hour.gif"
          }
          alt="background"
          className="vp-background-gif"
        />
        <div className="vp-background-overlay" />
      </div>

      <div className="vp-coming-soon-container">
        <div className="vp-logo-container">
          <img
            src={process.env.PUBLIC_URL + "/assets/logo-removebg-preview.png"}
            alt="logo"
            className="vp-main-logo"
          />
          <h1 className="vp-brand-name">ViePropchain</h1>
        </div>

        <div className="vp-content-center">
          <h2 className="vp-main-heading">
            The Future of Real Estate is Upon Us
          </h2>
          <p className="vp-sub-heading">Launching Soon</p>

          <form
            id="vp-password-form"
            className="vp-access-form"
            onSubmit={onSubmit}
          >
            <input
              ref={passwordRef}
              id="passwordInput"
              type="password"
              placeholder="Enter your password"
              className="vp-password-input"
              required
            />
            <button type="submit" className="vp-submit-btn">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
