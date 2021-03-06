import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import PodcastEpisodeServiceLinks from "./PodcastEpisodeServiceLinks";
import AudioFileDisplay from "../FileDisplay/AudioFileDisplay";
import ImageFileDisplay from "../FileDisplay/ImageFileDisplay";
import styled, { StyledComponent } from "styled-components";
import { MediaPodcastEpisodeInterface } from "../../DataTypes/MediaPodcastEpisode";
import ErrorBoundary from "../../Utility/ErrorBoundary";

export interface PodcastEpisodeBodyProps extends MediaPodcastEpisodeInterface {
  data: MediaPodcastEpisodeInterface;
  view_mode: string;
  container: StyledComponent;
}

const learnMoreLink = styled.a`
    color: #ff6633
    font-weight: bold;
`;

const ImageFileDisplayContainer = styled.div`
  height: 120px;
`;

export const PodcastEpisodeBody: React.FunctionComponent = (
  props: PodcastEpisodeBodyProps
) => {
  const { data, view_mode, container } = props;
  console.debug("PodcastEpisodeBody", props);
  return (
    <>
      <Card.Body>
        <Container className={"col-xs-12 col-lg-12"}>
          <Row>
            <Col xs={12} sm={3}>
              <ErrorBoundary>
                <ImageFileDisplay
                  data={data.field_media_image}
                  container={ImageFileDisplayContainer}
                />
              </ErrorBoundary>
            </Col>
            <Col xs={12} sm={9}>
              <Row style={{ margin: "auto" }}>
                <Col cellPadding={"1rem"}>
                  <span
                    dangerouslySetInnerHTML={{ __html: data.field_body?.value }}
                    className={"text-muted"}
                  ></span>
                  <br />
                  <p>
                    <learnMoreLink href={data.path.alias}>
                      LEARN MORE &gt;
                    </learnMoreLink>
                  </p>
                </Col>
              </Row>
              <Row>
                <Col className={"col-md-10"}>
                  <br />
                  <ErrorBoundary>
                    <AudioFileDisplay
                      data={data.field_media_audio_file}
                      view_mode={"full"}
                    />
                  </ErrorBoundary>
                  <br />
                </Col>
              </Row>
              <Row cellPadding={"1rem"}>
                <PodcastEpisodeServiceLinks links={data.field_service_links} />
              </Row>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </>
  );
};

export default PodcastEpisodeBody;
