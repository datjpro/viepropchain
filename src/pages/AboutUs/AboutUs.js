import React, { useState } from 'react';
import aboutUs from "../../data/aboutUs";
import "./AboutUs.css";
import blogUs from "../../data/blog";
export const AboutUs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="about-us-container">
        <img
          src={aboutUs[activeIndex].img}
          alt={aboutUs[activeIndex].title}
          className="about-us-image"
        />

        <div className="about-us-overlay">
          <h3>{aboutUs[activeIndex].title}</h3>
          <p>{aboutUs[activeIndex].content}</p>
        </div>

        <div className="about-us-sidebar">
          {aboutUs.map((item, index) => (
            <div
              key={item.id}
              onMouseEnter={() => setActiveIndex(index)}
              className="about-us-item"
            >
              <span className={index === activeIndex ? "active" : "inactive"}>
                {item.id}
              </span>
              <div className="relative w-[160px]">
                <div
                  className={`about-us-item-bar ${index === activeIndex ? "active" : "inactive"}`}
                ></div>
              </div>
              <div
                className={`about-us-item-dot ${index === activeIndex ? "active" : "inactive"}`}
              ></div>
            </div>
          ))}
        </div>

        <p className="about-us-footer-text">
          Vì sao ViePropChain được tin chọn?
        </p>
      </div>

      <div className="blogus-wrapper">
        <div className="blogus-flex">
          <div className="blogus-left">
            {blogUs.map((item, index) => (
              <div key={index} className="blogus-item">
                <p className="blogus-item-title">{item.title}</p>
                <div className="blogus-item-content-wrapper">
                  <div className="blogus-item-bar"></div>
                  <p className="blogus-item-content">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="blogus-right">
            {blogUs.map((item, index) => (
              <img key={index} src={item.img} alt={item.title} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
