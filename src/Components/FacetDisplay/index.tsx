import React, { useState, useEffect } from "react";
import SortDisplay from "./FacetSorts/SortDisplay";
import JSONApiGenericFetcher from "../../DataTypes/JSONApiGenericFetcher";
import FacetResultList from "./FacetResultList";
import FacetFilter from "./FacetFilter";
import styled from "styled-components";
import ReactPaginate from 'react-paginate';
import { Col, Row } from "react-bootstrap";
import Pagination from "./Pagination";

export interface FacetDisplayProps {
  data?: Array<any>;
  type: string;
  filterValue: string;
  filterSort?: string;
  view_mode: string;
}
var originData = [];
export const FacetDisplay = (props: FacetDisplayProps) => {

  const { data, type, filterValue, filterSort, view_mode } = props;

  const [currentPageData, setCurrentPageData] = useState([]);
  const [totalPageNum, setTotalPageNum] = useState(1);
  const [filters_topics, setfilters_topics] = useState([]);
  const [filters_centers, setfilters_centers] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState();
  const [selectedCenters, setSelectedCenters] = useState([]);

  // const [currentPage, setCurrentPage] = useState(1);
  var currentPage = 1;
  let countPerpage = 1;

  useEffect(() => {
    var Centers = [];
    var Topics = [];

    const apiFetcher = new JSONApiGenericFetcher(type, filterValue);
    apiFetcher
      .getData()
      .then((res) => res.json())
      .then((ajaxData) => {
        originData = ajaxData.data;
        originData.forEach(element => {
          element.field_centers.forEach(center => {
            Centers.push(center.name.trim());
          });
          element.field_topics.forEach(topic => {
            Topics.push(topic.name.trim());
          });
        });
        setfilters_topics(getFilters(Topics));
        setfilters_centers(getFilters(Centers));
        refreshPagination(originData);
      });
  }, []);

  function refreshPagination (data) {
    setTotalPageNum(Math.ceil(data.length / countPerpage));
    setCurrentPageData(paginate(data, countPerpage, currentPage));
  }

  function getFilters(data){
    var result = [];
    let counts = {}

    for(let i =0; i < data.length; i++){ 
      if (counts[data[i]]){
      counts[data[i]] += 1
      } else {
      counts[data[i]] = 1
      }
    }  
    for (let prop in counts){
      if (counts[prop] >= 1){
        result.push(prop + ":" + counts[prop]);
      }
    }
    return result;
  }

  const FilterArea = styled.div`
    & .filter-area {
      @media screen and (max-width: 768px) {
        display:none;
      }

      @media screen and (min-width: 768px) {
        display:block !important;
      }
    }
  `;
  const FacetWrapper = styled.div`
    & > div {
      display:block;
    }      
  `    

  var filterList = JSONApiGenericFetcher.prototype.buildAPIFilterPathList(type, true);
  console.debug("FacetDisplay: List of filters ", filterList);

  function paginate(array, countPerpage, page_number) {
    return array.slice((page_number - 1) * countPerpage, page_number * countPerpage);
  }

  const handlePageClick = (pageNum) => {
    currentPage = pageNum;
    setCurrentPageData(paginate(originData, countPerpage, currentPage));

  }


  const filterDataForTopics = (topics) => {
    var filtered_data = [];
    setSelectedTopics(topics);
    if (topics.length > 0) {
      originData.forEach(element => {
        var existed = false;
        var tags_str = element.tags.join(":");
        var BreakException = {};
        try {
          topics.forEach(function (topic) {
            if (tags_str.includes(topic)) {
              existed = true;
              filtered_data.push(element);
              throw BreakException;
            }
          });
        } catch (e) {
          if (e !== BreakException) throw e;
        }
      });
    } else {
      filtered_data = originData;
    }
    refreshPagination(filtered_data);
  }

  const filterDataForCenters = (centers) => {
    var filtered_data = [];
    setSelectedCenters(centers);
    if(centers.length > 0){
      originData.forEach(element => {
        var existed = false;
        var departments_str = element.departments.join(":");
        var BreakException= {};
        try {
          centers.forEach(function(centerandgroup) {
            if(departments_str.includes(centerandgroup)) {
              existed = true;
              filtered_data.push(element);
              throw BreakException;
            }
          });
        } catch(e) {
          if (e!==BreakException) throw e;
        }
      });      
    } else{
      filtered_data = originData;
    }
    refreshPagination(filtered_data);
  }

  return (
      <div className={"mt-1 container-fluid"} style={{ maxWidth: "90%" }}>
        {/* <SortDisplay /> */}
          <Row>
            <FilterArea className="col-md-3 col-sm-12"> 
              <Col className="sidebar filter-area">
                <FacetFilter filters={ filters_topics } resetPeople={filterDataForTopics} selectedFilters={selectedTopics} type={'topics'}/>
                <FacetFilter filters={ filters_centers } resetPeople={filterDataForCenters} selectedFilters={selectedCenters} type={'centers'}/>
              </Col>
            </FilterArea>

            <Col md={9} sm={12}>
              <FacetWrapper>
                <FacetResultList data={currentPageData} type={type} view_mode={view_mode} />
              </FacetWrapper>
              <Pagination totalPageNum={totalPageNum} getPageData={handlePageClick} countPerpage={countPerpage}/>
            </Col>
          </Row>
      </div>
  );


};

export default FacetDisplay;