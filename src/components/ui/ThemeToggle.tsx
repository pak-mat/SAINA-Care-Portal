// File: src/components/ui/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
 const { darkMode, toggleDarkMode } = useTheme();

 return (
 <div className="theme-toggle-wrapper">
 <label className="switch" htmlFor="theme-switch">
 <input 
 type="checkbox" 
 id="theme-switch"
 checked={darkMode}
 onChange={toggleDarkMode}
 aria-label="Toggle dark mode"
 />
 <div className="slider">
 <div className="stars">
 <svg viewBox="0 0 24 24" className="star star-1">
 <path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 24l-2.5-8.5L1 12l8.5-2.5z" />
 </svg>
 <svg viewBox="0 0 24 24" className="star star-2">
 <path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 24l-2.5-8.5L1 12l8.5-2.5z" />
 </svg>
 <svg viewBox="0 0 24 24" className="star star-3">
 <path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 24l-2.5-8.5L1 12l8.5-2.5z" />
 </svg>
 </div>
 <div className="clouds">
 <svg className="cloud cloud-1" viewBox="0 0 100 40">
 <path d="M 20 35 A 15 15 0 0 1 20 5 A 15 15 0 0 1 45 10 A 15 15 0 0 1 70 5 A 15 15 0 0 1 70 35 Z" />
 </svg>
 <svg className="cloud cloud-2" viewBox="0 0 100 40">
 <path d="M 20 35 A 15 15 0 0 1 20 5 A 15 15 0 0 1 45 10 A 15 15 0 0 1 70 5 A 15 15 0 0 1 70 35 Z" />
 </svg>
 </div>
 <div className="sun-moon">
 <div className="craters">
 <div className="crater crater-1"></div>
 <div className="crater crater-2"></div>
 <div className="crater crater-3"></div>
 </div>
 </div>
 </div>
 </label>

 <style>{`
 .theme-toggle-wrapper {
 display: inline-flex;
 align-items: center;
 justify-content: center;
 }

 .switch {
 position: relative;
 display: inline-block;
 width: 72px;
 height: 34px;
 cursor: pointer;
 }

 .switch input {
 opacity: 0;
 width: 0;
 height: 0;
 }

 .slider {
 position: absolute;
 cursor: pointer;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background-color: #059669; /* Emerald Green */
 border-radius: 34px;
 transition: background-color 0.4s ease;
 overflow: hidden;
 box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
 }

 input:checked + .slider {
 background-color: #18181b; /* Charcoal Gray */
 }

 input:focus-visible + .slider {
 box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.2);
 }

 input:checked:focus-visible + .slider {
 box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.2);
 }

 .sun-moon {
 position: absolute;
 top: 4px;
 left: 4px;
 height: 26px;
 width: 26px;
 background-color: #FDE047;
 border-radius: 50%;
 transition: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), background-color 0.4s ease;
 box-shadow: inset -2px -2px 0px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.2);
 overflow: hidden;
 z-index: 2;
 }

 input:checked + .slider .sun-moon {
 transform: translateX(38px);
 background-color: #E2E8F0;
 }

 .craters {
 position: absolute;
 inset: 0;
 opacity: 0;
 transition: opacity 0.4s ease;
 }

 input:checked + .slider .sun-moon .craters {
 opacity: 1;
 }

 .crater {
 position: absolute;
 background-color: #94A3B8;
 border-radius: 50%;
 box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2);
 }

 .crater-1 { top: 6px; left: 14px; width: 6px; height: 6px; }
 .crater-2 { top: 15px; left: 10px; width: 4px; height: 4px; }
 .crater-3 { top: 12px; left: 4px; width: 3px; height: 3px; }

 .clouds {
 position: absolute;
 inset: 0;
 opacity: 1;
 transition: opacity 0.4s ease;
 pointer-events: none;
 }

 input:checked + .slider .clouds {
 opacity: 0;
 }

 .cloud {
 position: absolute;
 fill: rgba(255, 255, 255, 0.8);
 animation: cloud-move 8s linear infinite;
 }

 .cloud-1 {
 bottom: -5px;
 left: 10px;
 width: 40px;
 height: auto;
 animation-duration: 12s;
 }

 .cloud-2 {
 bottom: -10px;
 left: 40px;
 width: 30px;
 height: auto;
 fill: rgba(255, 255, 255, 0.5);
 animation-duration: 8s;
 }

 .stars {
 position: absolute;
 inset: 0;
 opacity: 0;
 transition: opacity 0.4s ease;
 pointer-events: none;
 }

 input:checked + .slider .stars {
 opacity: 1;
 }

 .star {
 position: absolute;
 fill: #ffffff;
 animation: star-twinkle 3s infinite alternate;
 }

 .star-1 { top: 6px; left: 14px; width: 6px; height: 6px; }
 .star-2 { top: 16px; left: 24px; width: 4px; height: 4px; animation-delay: 1s; }
 .star-3 { top: 10px; left: 34px; width: 3px; height: 3px; animation-delay: 2s; }

 @keyframes cloud-move {
 0% { transform: translateX(20px); }
 100% { transform: translateX(-50px); }
 }

 @keyframes star-twinkle {
 0% { opacity: 0.2; transform: scale(0.6); }
 50% { opacity: 1; transform: scale(1.2); }
 100% { opacity: 0.2; transform: scale(0.6); }
 }
 `}</style>
 </div>
 );
}
