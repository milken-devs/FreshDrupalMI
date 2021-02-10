import React, { useState } from "react";
import ErrorBoundary from "../../Utility/ErrorBoundary";
import ArticleDisplay from "../ArticleDisplay";

export interface FacetResultListProps {
  data: Array<any>;
  type: String;
  view_mode: String;
}

export const FacetResultList = (props: FacetResultListProps) => {

  const { data, type, view_mode } = props;

  switch (type) {
    case "node--article":
      console.log("FacetDisplay: type => node--article", data);
      return (
        <>
        {
          data.map((item, key) => {
            if (item.type !== undefined) {
              return (
                <ErrorBoundary key={key}>
                  <ArticleDisplay data={item} view_mode={"row"} />
                </ErrorBoundary>
              );
            }
            // return item;
          })
        }
      </>
      );

    case "media--video":
      console.log("FacetDisplay: type => media--video");
      return (
        <div>
          <h1>Video Display</h1>
        </div>
      );

    case "person--expert":
      console.log("FacetDisplay: type => person--expert");
        return (
          <ErrorBoundary>
            {/* <PeopleDisplay data={data}/> */}
          </ErrorBoundary>
        );
    default:
      console.log("FacetDisplay: type => default");
      return (
        <ErrorBoundary>
          {/* <ArticleDisplay data={data} view_mode={view_mode} /> */}
        </ErrorBoundary>
      );
  }
};

export default FacetResultList;