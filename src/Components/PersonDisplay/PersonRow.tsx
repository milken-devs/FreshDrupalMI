import React, { useState } from 'react';
import Filters from '../FacetDisplay/FacetFilters/Filters';
import Person from './Person';
import { useEffect } from 'react';
import ReactPaginate  from 'react-paginate';
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";
// var data = require('./example.json');

const MainArea = styled.div`
  & .filter-area{
    @media screen and (max-width: 768px) {
      display:none;
    }

    @media screen and (min-width: 768px) {
      display:block !important;
    }
  }
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
var currentData = [];
const PersonRow = ({data}) => {
  const [filters_centerAndGroups, setfilters_centerAndGroups] = useState([]);
  const [filters_topics, setfilters_topics] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedCenterAndGroups, setSelectedCenterAndGroups] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  var pageRangeDisplayed = 5;
  const [pageCount, setPageCount] = useState(Math.ceil(data.length/pageRangeDisplayed))
  var currentPage = 1;
  useEffect(() => {
    currentData = data;  
    var CentersAndGroups = [];
    var Topics = [];
    data.forEach(element => {
      element.departments.forEach(departments => {
        CentersAndGroups.push(departments.trim());
      });
      element.tags.forEach(tags => {
        Topics.push(tags.trim());
      });
    });
    setfilters_centerAndGroups(getFilters(CentersAndGroups));
    setfilters_topics(getFilters(Topics));
    refreshPagination(currentData);
  }, []);

  function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
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
  const filterDataForCenterAndGroups = (centerandgroups) => {
    var filtered_data = [];
    setSelectedCenterAndGroups(centerandgroups);
    if(centerandgroups.length > 0){
      data.forEach(element => {
        var existed = false;
        var departments_str = element.departments.join(":");
        var BreakException= {};
        try {
          centerandgroups.forEach(function(centerandgroup) {
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
      filtered_data = data;
    }
    refreshPagination(filtered_data);
  }
  const refreshPagination = (filtered_data) => {
    currentData = filtered_data;
    setPageCount(Math.ceil(currentData.length/pageRangeDisplayed));
    setPersons(paginate(currentData, pageRangeDisplayed, currentPage));
  }
  const handlePageClick = (page) => {
    currentPage = page.selected + 1;
    setPersons(paginate(currentData, pageRangeDisplayed, currentPage));
  }
  const filterDataForTopics = (topics) => {
    var filtered_data = [];
    setSelectedTopics(topics);
    if(topics.length > 0){
      data.forEach(element => {
        var existed = false;
        var tags_str = element.tags.join(":");
        var BreakException= {};
        try {
          topics.forEach(function(topic) {
            if(tags_str.includes(topic)) {
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
      filtered_data = data;
    }
    refreshPagination(filtered_data);
  }

  return (
    <MainArea>
      <Row>
        <Col className="sidebar filter-area" md={3} sm={12}>
          <Filters filters={ filters_topics } resetPeople={filterDataForTopics} selectedFilters={selectedTopics} type={'topics'}/>
          <Filters filters={ filters_centerAndGroups } resetPeople={filterDataForCenterAndGroups} selectedFilters={selectedCenterAndGroups} type={'centerandgroups'}/>
        </Col>
        <Col md={9} sm={12}>
        {persons.map((person, index) => (
          <div key={index}>
            <Person person={person}/>
          </div>
        ))}
        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={pageRangeDisplayed}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          activeClassName={'active'}
        />              
        </Col>
      </Row>        
    </MainArea>
  )
};
export default PersonRow;