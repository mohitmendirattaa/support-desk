import React from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-reverse btn-back"
      style={{ marginLeft: "180px", marginRight: "180px" }}
      onClick={() => navigate(-1)}
    >
      <FaArrowCircleLeft /> Back
    </button>
  );
}

export default BackButton;
