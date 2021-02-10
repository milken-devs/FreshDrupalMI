
import React, { useState } from 'react';
import { Col, Container, Row } from "react-bootstrap";
import { SlideDisplay } from "../SlideDisplay";
import { NodeArticle, NodeArticleInterface } from "../../DataTypes/NodeArticle";
import ParagraphDisplayList from "../ParagraphDisplay/ParagraphDisplayList";
import { EntityComponentProps } from "../../DataTypes/EntityComponentProps";
import Loading from "../Loading";
import ErrorBoundary from "../../Utility/ErrorBoundary";
import styled from "styled-components";
import moment from "moment";
import {SlideDisplayImageOnly} from "../SlideDisplay/SlideDisplayImageOnly"

export interface ArticleFullProps {
  data: any;
  view_mode: string;
}

export const ArticleRow = (props: ArticleFullProps) => {
  const { data, view_mode } = props;
  console.debug("ArticleRow: DataObject =>", data);
  const [nodeArticleData, setNodeArticleData] = useState(data);

  // if (nodeArticleData.type === undefined) {
  //   console.debug("ArticleRow: retrieving node data", nodeArticleData);
  //   const ecp = new EntityComponentProps(nodeArticleData);
  //   ecp
  //     .getData(nodeArticleData.getIncluded())
  //     .then((res) => res.json())
  //     .then((ajaxData) => {
  //       setNodeArticleData(new NodeArticle(ajaxData.data));
  //     });
  //   return <Loading />;
  // }
  // console.debug("Should have node data now", nodeArticleData);

  const ArticleRowWrapper = styled.div`
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
  & .article-title{
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
  & .article-description, .article-description * {
      height: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
  }
  & .article-description i{
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
  & .article-published-date{
      font-size: 20px;
  }
`;

  const created = moment(nodeArticleData.created, "YYYY-mm-DDZ");

  let articleTagList = ["Press Release"];

  return (
      <ArticleRowWrapper>
          <div className="form-group filter-sidebar-1">
              <Row>
                  <Col className="speaker-detail text-left" lg={9} md={9} sm={12}>
                      <div>
                          <div className="field-tag-speaker font-weight-bold">
                              <span>{articleTagList.join(" - ")}</span>
                          </div>
                          <a href={nodeArticleData.path.alias} className="article-title font-weight-bold">{nodeArticleData.title}</a>
                          <div className="article-description">
                            <ParagraphDisplayList
                              list={nodeArticleData.field_content}
                              view_mode="full"
                            />
                          </div>
                          <h6 className="article-published-date">
                              {created.format('MMMM D, YYYY')}
                              <a className="external pull-right" href={nodeArticleData.path.alias}>
                                  Featured Link                      
                              </a>
                          </h6>
                      </div>
                  </Col>
                  <Col className="img-bkg-detail" lg={3} md={3} sm={12}>
                    <SlideDisplayImageOnly
                      data={nodeArticleData.field_promo_slide}
                    />
                  </Col>                        
              </Row>

          </div>                    
      </ArticleRowWrapper>     
  );
};

export default ArticleRow;


