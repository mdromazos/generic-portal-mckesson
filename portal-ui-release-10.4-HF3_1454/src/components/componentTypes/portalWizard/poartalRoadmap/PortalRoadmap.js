// @flow

import React from "react";
import PortalRoadmapStep from "./PortalRoadmapStep";

import type { Element } from "react";

type Props = {
    /**
     * Pass a list of `RoadmapStep` elements as children
     */
    children?: Array<Element<typeof RoadmapStep>>,
};

/**
 * UI container for the roadmap steps that indicate
 * which step we're on. Roadmap is typically used in Wizards.
 * @version 0.2.1
 */
function PortalRoadmap(props: Props) {
    return <ol className="d-roadmap">{props.children}</ol>;
}

PortalRoadmap.displayName = "PortalRoadmap";
PortalRoadmap.Step = PortalRoadmapStep;

export default PortalRoadmap;
