import React, { useEffect, useRef } from "react";
import "./LaunchingSoon.css";

// A React conversion of the provided static LaunchingSoon HTML/JS
export default function LaunchingSoon() {
  const passwordRef = useRef(null);

  useEffect(() => {
    // focus password after a short delay
    const t = setTimeout(() => {
      passwordRef.current && passwordRef.current.focus();
    }, 600);

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
        const form = document.getElementById("passwordForm");
        form && form.dispatchEvent(new Event("submit", { bubbles: true }));
      }
    }
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
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
    transition.className = "page-transition";
    transition.innerHTML =
      '<div class="pt-inner"><div>Loading ViePropChain...</div><div class="spinner"></div></div>';
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
    <>
      {/* Background GIF */}
      <div className="background-container">
        <img
          src="/hong-kong-night.gif"
          alt="Background Animation"
          className="background-gif"
        />
        <div className="background-overlay"></div>
      </div>

      {/* Coming Soon Content */}
      <div className="coming-soon-container">
        <div className="logo-container">
          <img
            src="/logo-removebg-preview.png"
            alt="PropChain Logo"
            className="main-logo"
          />
          <h1 className="brand-name">ViePropchain</h1>
        </div>

        <div className="content-center">
          <h2 className="main-heading">The Future of Real Estate is Upon Us</h2>
          <p className="sub-heading">Launching Soon</p>

          <form className="access-form" id="passwordForm" onSubmit={onSubmit}>
            <input
              ref={passwordRef}
              type="password"
              placeholder="Enter your password"
              className="password-input"
              id="passwordInput"
              required
            />
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
