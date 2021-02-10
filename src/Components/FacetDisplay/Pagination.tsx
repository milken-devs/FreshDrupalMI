import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ReactPaginate from 'react-paginate';
const PaginationArea = styled.div`
  & .pagination{
    display: flex;
    padding-left: 0;
    list-style: none;
  }
  & .pagination > li {
    display: inline;
  }
  & .pagination>li>a {
    position: relative;
    float: left;
    padding: 6px 12px;
    line-height: 1.42857143;
    border: 1px solid #ddd;
  }
  & .pagination .active > a, & .pagination .active > a:hover {
    background: #eee;
    border-color: #dddddd;
  }
`;
export const Pagination = ({totalPageNum, getPageData, countPerpage}) => {

    const handlePageClick = (page) => {
        getPageData(page.selected + 1);
    }
    return (
        <PaginationArea>

            <ReactPaginate
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={totalPageNum}
              marginPagesDisplayed={2}
              pageRangeDisplayed={countPerpage}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
        </PaginationArea>
  
    )
}

export default Pagination