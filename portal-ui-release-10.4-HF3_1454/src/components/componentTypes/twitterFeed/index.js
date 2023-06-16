import React, { useEffect, useRef } from "react";
import CONFIG from "../../../config/config";
import {getHeight} from "../../../common/helperUtils";
import { Card} from '@informatica/droplets-core';
import '@informatica/droplets-core/dist/themes/archipelago/components/section.css';

const TwitterFeed = ({component}) => {
  const twitterWrapperRef = useRef();
  useEffect(() => {
    const twitterAnchor = document.createElement("a");
    twitterAnchor.setAttribute("class", "twitter-timeline");
    twitterAnchor.setAttribute("data-chrome", "noheader nofooter noborders");
    twitterAnchor.setAttribute("href",component.url);
    twitterWrapperRef.current.appendChild(twitterAnchor);
    const script = document.createElement("script");
    script.setAttribute("src", CONFIG.TWITTER_SCRIPT); // twitter script to embed the timeline
    twitterWrapperRef.current.appendChild(script);
  }, []);

  return (
    <Card className="external-link-width" data-testid="twitter__component">
        <Card.Header title={component.title}/>
        <Card.Body>
            <div className="component-scroll-wrap" data-testid="twitter__component__body"
              style={{maxHeight:getHeight(component, CONFIG.DEFAULT_HEIGHT_FIT_TO_CONTENT)}}
            >
              <div className="twitter-embed"  data-testid="twitter__link" ref={twitterWrapperRef}></div>
            </div>
        </Card.Body>
    </Card>
  );
}

export default TwitterFeed;
