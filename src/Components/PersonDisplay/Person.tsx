import React from 'react';
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";

const ExpertWrapper = styled.div`
    & .img-bkg-detail img{
        @media screen and (max-width: 768px) {
            width: 100%;
            min-height: -webkit-fill-available;  
        }

        @media screen and (min-width: 768px) {
            width: 100%;
            height: 10.7vw;
            min-height: 205px;
        }        
    }
    & .profile-link{
        color:#E02222;
        text-transform: uppercase;
        font-size: 13px;
    }
    & .field-tag-speaker{
        margin-top: 16px;
        text-transform: uppercase;
        color: #0065cc;
        font-size: 1.3em;
        margin-bottom: 9px;
        line-height: 18px;
    }
    & .filter-sidebar-1{
        border: 1px solid #b9b9b9;
    }
    & .position-job-speaker{
        color: #999aa3;
        font-family: 'Lato';
        font-size: 14px;
    }
    & .body ul{
        padding-left: 1.5em;
        margin-bottom: 10px;
        line-height: 20px;
        font-size: 14px;
    }
`;

const NewsroomWrapper = styled.div`
    & .img-bkg-detail img{
        @media screen and (max-width: 768px) {
            width: 100%;
            min-height: -webkit-fill-available;  
        }

        @media screen and (min-width: 768px) {
            width: 100%;
            height: 10.3vw;
            min-height: 198px;
        }        
    }
    & .speaker-detail > div{
        padding-left:15px;
    }
    & .external{
        padding: 10px;
        color:#E02222;
    }
    & .speaker-detail .field-tag-speaker{
        margin-top: 16px;
        text-transform: uppercase;
        color: #0065cc;
        font-size: 1.1em;
        margin-bottom: 9px;
        line-height: 18px;
    }
    & .filter-sidebar-1{
        border: 1px solid #b9b9b9;
    }
    & .newsroom-title{
        margin-bottom: 10px;
        line-height: 22px;
        font-size: 23px;
        color: #35363c;
        display: -webkit-box;
        text-overflow: ellipsis;
        overflow: hidden;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }
    & .description {
        height: 80px;
    }
    & .description i{
        line-height: 22px;
        display: -webkit-box;
        max-width: 100%;
        height: auto;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 16px;
    }
    & .date-featured{
        font-size: 20px;
    }
`;
const Person = ({person}) => {

  return (
    <div>
      {
        (person.publish_date) ?
          <NewsroomWrapper>
            <div className="form-group filter-sidebar-1">
              <Row>
                <Col className="speaker-detail text-left" lg={9} md={9} sm={12}>
                  <div>
                    <div className="field-tag-speaker font-weight-bold">
                      <span>{person.type.join(" - ")}</span>
                    </div>
                    <a href={person.link_uri} className="newsroom-title font-weight-bold">{person.title}</a>
                    <div className="description">
                      <i>{person.description}</i>
                    </div>
                    <h6 className="date-featured">
                      {person.publish_date}
                      <a className="external pull-right" href={person.link_uri}>
                          {person.link_text}                      
                      </a>
                    </h6>
                  </div>
                </Col>
                <Col className="img-bkg-detail" lg={3} md={3} sm={12}>
                  <img src={person.image}></img>
                </Col>                        
              </Row>
            </div>                    
          </NewsroomWrapper> :
          <ExpertWrapper>
            <div className="form-group filter-sidebar-1">
              <Row>
                <Col lg={3} md={3} sm={12} className="img-bkg-detail">
                  <img src={person.image} />
                </Col>
                <Col lg={9} md={9} sm={12} className="speaker-detail text-left">
                  <div className="field-tag-speaker font-weight-bold">
                    <span>{person.tags.join(" - ")}</span>
                  </div>
                  <h5 className="bold"> {person.name} <span className="position-job-speaker">{person.departments.join(" and ")}</span></h5>
                  <div className="body">
                    <div dangerouslySetInnerHTML={{__html: person.description}}></div>
                    <a href={person.link_uri} className="profile-link">{person.link_text}</a>
                  </div>
                </Col>                        
              </Row>
            </div>                    
          </ExpertWrapper>
      }
    </div>
  )
    
};
export default Person;