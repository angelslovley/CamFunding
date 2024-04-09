import React, { useRef } from "react";
import _ from "lodash";
import styles from "./styles/paginate.module.css";

const Pagination = (props) => {
  const ref = useRef();

  
  const { itemsCount, pageSize, currentPage, onPageChange } = props;

  const pagesCount = Math.ceil(itemsCount / pageSize);
  if (pagesCount === 1) return null;

  const pages = _.range(1, pagesCount + 1);

  return (
    <React.Fragment>
      <div className={styles.paginateSection}>
        <nav className={styles.nav}>
          <ul className={`pagination ${styles.ul}`} ref={ref}>
            {pages.map((page) => (
              <li
                className={
                  page === currentPage ? "page-item active" : "page-item"
                }
                key={page}
              >
                <button
                  className={
                    "page-link " +
                    (page === currentPage
                      ? `${styles.active}`
                      : `${styles.inactive}`)
                  }
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
   
      </div>
    </React.Fragment>
  );
};

export default Pagination;
