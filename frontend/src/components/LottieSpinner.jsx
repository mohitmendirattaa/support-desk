// src/components/LottieSpinner.jsx
import React from "react";
import Lottie from "react-lottie";
import animationData from "../images/ticket.json"; // Adjust path to your .lottie file

const LottieSpinner = ({ width = 150, height = 150 }) => {
  const defaultOptions = {
    loop: true, // Animation will loop indefinitely
    autoplay: true, // Animation will play automatically
    animationData: animationData, // Your Lottie animation JSON
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice", // Maintain aspect ratio and cover container
    },
  };

  return (
    <div className="lottie-spinner-container" style={{ width, height }}>
      <Lottie
        options={defaultOptions}
        height={height}
        width={width}
        isStopped={false} // Set to true if you want to stop it
        isPaused={false} // Set to true if you want to pause it
      />
    </div>
  );
};

export default LottieSpinner;
