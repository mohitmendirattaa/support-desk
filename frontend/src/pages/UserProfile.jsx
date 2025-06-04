import React from "react";
import styles from "./css/userprofile.module.css"; 
import { useSelector } from "react-redux";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { name, email, employeeCode, location, company, contact } = user;
  const BackFaceSVG = () => (
    <svg
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1542 1542"
      className={styles.backFaceSvg}
    >
      {/* Embedded style from the original SVG for paths .a and .b */}
      <style>{`.a{fill:#2d2b7c}.b{fill:#f7f7fa}`}</style>
      <path
        fillRule="evenodd"
        className={styles.backSvgPathA}
        d="m648.8 2.9q677.7-41.4 879.5 600.1 94.9 624.3-470.8 891.5-670.8 194.9-1000.1-415.5-203.5-608.8 319-974.4 134.5-65.5 272.4-101.7z"
      />
      <path
        fillRule="evenodd"
        className={styles.backSvgPathB}
        d="m935.1 547.8q29.3-3.4 55.2 6.9-82.8 55.2-136.3 136.3 74.2 110.3 143.2 225.9 98.3-238 320.7-369.1 13.8 3.5 25.9 6.9-279.4 234.5-339.7 600.1-25.9 13.8-48.3-6.9-67.3-187.9-177.6-355.2-89.7 174.2-129.4 369-25.8 3.5-46.5-13.8-113.8-351.8-401.8-579.4 87.9-13.8 175.9 0 162.1 150 258.6 348.4 43.2-93.2 96.6-177.7-79.3-96.5-177.6-170.7 158.6-43.1 265.6 74.2 63.8-44.9 115.5-94.9z"
      />
    </svg>
  );

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Front Face of the card */}
        <div className={`${styles.card} ${styles.frontFace}`}>
          <div className={styles.userInfoHeader}>
            {/* User icon SVG (front face logo) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              width="16"
              height="16" 
              className={
                styles.userIcon
              } 
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                className={styles.userIconPath} 
              />
            </svg>
            <h5 className={styles.h5}>User Information</h5>
          </div>

          <div className={styles.userInfoDetails}>
            <div>
              <h6 className={styles.h6}>Full Name</h6>
              <h5 className={styles.h5}>{name}</h5>
            </div>
            <div>
              <h6 className={styles.h6}>Employee Code</h6>
              <h5 className={styles.h5}>{employeeCode}</h5>
            </div>
            <div>
              <h6 className={styles.h6}>Contact Number</h6>
              <h5 className={styles.h5}>{contact}</h5>
            </div>
            <div>
              <h6 className={styles.h6}>Email Address</h6>
              <h5 className={styles.h5}>{email}</h5>
            </div>
            <div>
              <h6 className={styles.h6}>Location</h6>
              <h5 className={styles.h5}>{location}</h5>
            </div>
            <div>
              <h6 className={styles.h6}>Company</h6>
              <h5 className={styles.h5}>{company}</h5>
            </div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.backFace}`}>
          <BackFaceSVG />
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
