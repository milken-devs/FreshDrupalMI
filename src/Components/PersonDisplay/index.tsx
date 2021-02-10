import React from "react";
import * as DataObject from "../../DataTypes/NodeArticle";
import PersonCard from "./PersonCard";
import PersonRow from "./PersonRow";
import ErrorBoundary from "../../Utility/ErrorBoundary";

export interface ArticleDisplayProps {
  data: DataObject.NodeArticleInterface;
  view_mode: string;
}

export const PersonDisplay = (props: ArticleDisplayProps) => {
  const { data, view_mode } = props;

  switch (view_mode) {
    case "card":
      return (
        <ErrorBoundary>
          <PersonCard/>
        </ErrorBoundary>
      );

    case "tile":
      return (
        <div>
          <h1>Article Tile View</h1>
        </div>
      );

    case "row":
      return (
        <ErrorBoundary>
          <PersonRow data={data}/>
        </ErrorBoundary>
      );

    default:
      return (
        <ErrorBoundary>
          <PersonRow data={data}/>
        </ErrorBoundary>
      );
  }
};

export default PersonDisplay;
