import React, { useState } from "react";
import { Card } from "react-bootstrap";
import styled from "styled-components";
import moment from "moment";
import { NodeArticle, NodeArticleInterface } from "../../DataTypes/NodeArticle";
import SlideDisplay from "../SlideDisplay";
import { EntityComponentProps } from "../../DataTypes/EntityComponentProps";
import Loading from "../Loading";
import ErrorBoundary from "../../Utility/ErrorBoundary";
import ImageFileDisplay from "../FileDisplay/ImageFileDisplay";
import SlideDisplayImageOnly from "../SlideDisplay/SlideDisplayImageOnly";

export interface ArticleCardProps {
  data: NodeArticleInterface;
  view_mode: string;
  key?: number;
}

const StyledLink = styled.a`
  border: 1px solid orange;
`;

const PersonCard = (props: ArticleCardProps) => {
  const { data, view_mode, key } = props;
  const DataObject = new NodeArticle(data);
  const [articleData, setArticleData] = useState(DataObject);
  if (!articleData.hasData()) {
    const ecp = new EntityComponentProps(articleData);
    ecp
      .getData(articleData.getIncluded())
      .then((res) => res.json())
      .then((ajaxData) => {
        setArticleData(new NodeArticle(ajaxData.data));
      });
    return <Loading />;
  }
  console.debug("Article Card", articleData);

  const created = moment(data.created, "ddd MMM DD YYYY Z");

  const CardWrapper = styled.div`
    min-width: 222px;

    &:hover {
      box-shadow: 0 8px 16px 0 grey;
    }
    & img{
      height: 12.35vw;
      min-height: 146px;
    }
  `;

  const CustomCardHeader = styled.div`
    position: relative;
  `;

  const DateWrapper = styled.div`
    width: 100%;
    background: rgba(0, 0, 0, 0.53);
    color: white;
    text-align: right;
    padding-right: 0.5em;
    position: absolute;
    bottom: 0;
  `;

  return (
    <>
      <CardWrapper className="card my-5 mx-2 text-align-left flex-shrink-1">
        <a
          href={articleData.path.alias}
          className=""
          data-drupal-id={articleData.drupal_internal__nid}
          data-drupal-type={articleData.type}
          data-uuid={articleData.id}
          style={{ maxWidth: "393px" }}
        >
          <CustomCardHeader>
            <ErrorBoundary>
              <SlideDisplayImageOnly data={articleData.field_promo_slide} />
              <DateWrapper>{created.format("MMMM D, YYYY")}</DateWrapper>
            </ErrorBoundary>
          </CustomCardHeader>
          <Card.Body style={{ minHeight: "5em", paddingBottom: "0" }}>
            <Card.Title style={{ fontSize: "1em", marginBottom: "0" }}>
              {articleData.title}
            </Card.Title>
          </Card.Body>
          <Card.Footer className="bg-white border-0">
            Authors and Tags
          </Card.Footer>
        </a>
      </CardWrapper>
    </>
  );
};

export default PersonCard;
