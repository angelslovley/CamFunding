import React from "react";
import { Link } from "react-scroll";
import styles from "./styles/image_landing.module.css";

const ImageLanding = (props) => {
  return (
    <React.Fragment>
      <div className={styles.backgroundImage}>
        <div className={styles.title}>
          <p className={styles.text}> Camerin fund</p>
          <p className={styles.header}> You Bestow, We Deliver</p>
        </div>
        <Link
          to="Donate"
          activeClass="active"
          spy={true}
          smooth={true}
          offset={-70}
          duration={500}
        >
          <button className={`btn btn-success p-3 ${styles.donateBtn}`}>
            DONATE NOW
          </button>
        </Link>
      </div>

    </React.Fragment>
  );
};

export default ImageLanding;
