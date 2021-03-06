import PropTypes from "prop-types";
import React, { useState } from "react";
import { Collapse } from "react-bootstrap";
import { theme } from "../Shared/Styles";

import styled from "styled-components";

const MAX_LENGTH_LIMIT = 100;

const ViewMoreButton = styled.button`
  border: 0;
  background: none;
  padding: 5px;
  color: ${theme.colors.secondary};
`;

function TextEllipsis({ text }) {
  const [showmore, setShowmore] = useState(false);

  const renderViewMoreButton = () => {
    return (
      <ViewMoreButton
        className="mt-1"
        onClick={() => setShowmore(!showmore)}
        aria-controls="text-collapse"
        aria-expanded={showmore}
      >
        {showmore ? "- Read Less" : "+ Read More"}
      </ViewMoreButton>
    );
  };

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: text.substring(0, MAX_LENGTH_LIMIT - 3),
        }}
      ></div>
      <Collapse in={showmore}>
        <div id="text-collapse">
          <div
            dangerouslySetInnerHTML={{
              __html: text.substring(MAX_LENGTH_LIMIT - 3, text.length),
            }}
          ></div>
        </div>
      </Collapse>

      {renderViewMoreButton()}
    </>
  );
}

TextEllipsis.propTypes = {
  text: PropTypes.string,
};

function SearchCard(props) {
  const { image, type, title, text, link } = props;

  // TODO: Conditional image output, clean type (when available from backend)
  const renderImage = image ? (
    <div className="content-image-wrapper">
      <img alt="content" src={image} className="card-image" />
      {!!type ? <span>{type}</span> : ""}
    </div>
  ) : (
    false
  );

  return (
    <div className="content-card card d-flex flex-column">
      <a href={link}>{renderImage}</a>
      <div className="content-text-wrapper">
        <h5>
          <a href={link}>{title}</a>
        </h5>
        {text && text.length > MAX_LENGTH_LIMIT ? (
          <TextEllipsis text={text} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: text }}></div>
        )}
      </div>
    </div>
  );
}

SearchCard.propTypes = {
  type: PropTypes.string,
  id: PropTypes.any,
  image: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,
};

export default SearchCard;
