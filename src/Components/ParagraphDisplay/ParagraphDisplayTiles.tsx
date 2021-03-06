import React, { useState, useRef } from "react";
import { Container } from "react-bootstrap";
import { ParagraphTilesInterface } from "../../DataTypes/ParagraphTiles";
import { EntityComponentProps } from "../../DataTypes/EntityComponentProps";
import Loading from "../Loading";
import ParagraphDataFactory from "./ParagraphDataFactory";
import ListDisplay from "../ListDisplay";
import Paragraph, { ParagraphInterface } from "../../DataTypes/Paragraph";

export interface ParagraphDisplayTilesProps {
  data: ParagraphTilesInterface;
}

export interface ParagraphDisplayTilesState {
  data: Paragraph;
  loading: boolean;
  loaded: boolean;
}

export class ParagraphDisplayTiles extends React.Component<
  ParagraphDisplayTilesProps,
  ParagraphDisplayTilesState
> {
  constructor(props) {
    super(props);
    const { data } = props;
    const DataObject = ParagraphDataFactory(data);
    this.state = {
      data: DataObject,
      loading: false,
      loaded: DataObject.hasData(),
    };
    this.scrollOnClickHandler = this.scrollOnClickHandler.bind(this);
  }

  scrollOnClickHandler() {
    // Scoll on click handler goes here
  }

  componentDidMount() {
    const { data, loading } = this.state;
    if (!data.hasData() && !loading) {
      console.debug("Paragraph does not have data", data);
      this.setState({ loaded: false, loading: true });
      const ecp = new EntityComponentProps(data);
      ecp
        .getData(data.getIncluded())
        .then((res) => res.json())
        .then((ajaxData) => {
          const returnedData = ParagraphDataFactory(ajaxData.data);
          this.setState({
            loaded: true,
            loading: false,
            data: returnedData,
          });
        });
    }
  }

  render() {
    const { data, loading, loaded } = this.state;

    if (loading) {
      return (
        <>
          <Loading />
        </>
      );
    }
    if (loaded) {
      let containerClassNames = (data.field_view_mode == "card") 
        ? "position-relative overflow-hidden py-5" 
        : (data.field_view_mode == "tile") 
        ? "text-center py-5"
        : "py-5";

      let containerBackgroundColor = ( data.field_view_mode == "card" && data.type == "paragraph--media_tiles" )
        ? '#e2e7ea'
        : ( data.field_view_mode == "card" && data.type == "paragraph--content_tiles" )
        ? '#e2e7ea'
        : ( data.field_view_mode == "tile" && data.type == "paragraph--content_tiles" )
        ? '#f0f3f5'
        : '#FFFFFF';

      let elSubheader = (data.field_section_subheader !== undefined && data.field_section_subheader !== null)
        ? <p>{data.field_section_subheader}</p>
        : '';

      return (
        <section
          style={{backgroundColor: containerBackgroundColor}}
        >
          <Container
            fluid={data.field_view_mode == "card" ? true : false}
            className={containerClassNames}
          >
            <div className="row">
              <div className="col">
                <h2
                  style={{
                    fontFamily: "LatoWebBlack",
                    fontSize: "1.5em",
                    fontWeight: "bold",
                  }}
                >
                  {data.field_title}
                </h2>
                {elSubheader}
              </div>
            </div>
            <ListDisplay
              id={"tiles-list-".concat(data.id)}
              list={data.tiles}
              view_mode={data.field_view_mode}
              display_size={data.field_display_size}
            />
          </Container>
        </section>
      );
    }
    return <div />;
  }
}

export default ParagraphDisplayTiles;
