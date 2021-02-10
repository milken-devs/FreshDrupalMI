import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { SlideDisplay } from "../SlideDisplay";
import { NodeArticle, NodeArticleInterface } from "../../DataTypes/NodeArticle";
import ParagraphDisplayList from "../ParagraphDisplay/ParagraphDisplayList";
import { EntityComponentProps } from "../../DataTypes/EntityComponentProps";
import Loading from "../Loading";
import ErrorBoundary from "../../Utility/ErrorBoundary";
import styled from "styled-components";
import moment from "moment";
import {TagsDisplay} from "../TagsDisplay";
import {SocialDisplay} from "../SocialDisplay";

export interface ArticleFullProps {
  data: NodeArticleInterface;
  view_mode: string;
}

export const PersonFull = (props: ArticleFullProps) => {
  const { data, view_mode } = props;
  const DataObject = new NodeArticle(data);
  const [nodeArticleData, setNodeArticleData] = useState(DataObject);
  if (!nodeArticleData.hasData()) {
    console.debug("retrieving node data", nodeArticleData);
    const ecp = new EntityComponentProps(nodeArticleData);
    ecp
      .getData(nodeArticleData.getIncluded())
      .then((res) => res.json())
      .then((ajaxData) => {
        setNodeArticleData(new NodeArticle(ajaxData.data));
      });
    return <Loading />;
  }
  console.debug("Should have node data now", nodeArticleData);

  const ElMainContentWrapper = styled.div`
    & .section-social {
      order: 1;
    }
    & .section-content {
      order: 2;
      @media only screen and (max-width: 1199px) {
        order: 3;
        padding-top: 1.5em;

      }
    }
    & .section-tags {
      order: 3;
      @media only screen and (max-width: 1199px) {
        order: 2;
      }
    }
  `;

  const ElTitle = styled.h1`
    font-size: 2em;
    padding-bottom: 1em;

    @media only screen and (max-width: 1200px) {
      font-size: 1.5em;
    }
  `;

  const created = moment(nodeArticleData.created, "ddd MMM DD YYYY Z");

  // TO-DO: Need to build the list of tags from multiple taxonomy vocabs
  const tagList = [
    {
      tag: "Health",
      link_uri: "/tagsURL/health"
    },
    {
      tag: "Finance",
      link_uri: "/tagsURL/finance"
    },
    {
      tag: "Aging",
      link_uri: "/tagsURL/aging"
    },
    {
      tag: "Policy",
      link_uri: "/tagsURL/policy"
    },
  ];

  //TODO: get a default slide if field_promo_slide is empty

  return (
    <>
      <Row id={`promo-slide-${nodeArticleData.id}`}>
        <Container fluid style={{ position: "relative" }}>
          <SlideDisplay
            data={nodeArticleData.field_promo_slide}
            view_mode={"full"}
          />
        </Container>
      </Row>
      <Row>
        <ElMainContentWrapper className="container-fluid" style={{ width: "90%", margin: "2em auto" }}>
          <Row>
            <Col>
              <ElTitle>{nodeArticleData.title}</ElTitle>
            </Col>
          </Row>
          <Row>
            <Col xs="12" lg="6" xl="1" className="section-social">
              <SocialDisplay data={{"name": nodeArticleData.title}}></SocialDisplay>
            </Col>
            <Col xs="12" xl="8" className="section-content">
              <ErrorBoundary>
                <ParagraphDisplayList
                  list={nodeArticleData.field_content}
                  view_mode="full"
                />
              </ErrorBoundary>
            </Col>
            <Col xs="12" lg="6" xl="3" className="section-tags">
              <TagsDisplay data={
                {
                  published_date_string: "Published " + created.format('MMMM D, YYYY'),
                  tagList: tagList
                }
              }></TagsDisplay>
            </Col>
          </Row>
        </ElMainContentWrapper>
      </Row>
    </>
  );
};

export default PersonFull;
