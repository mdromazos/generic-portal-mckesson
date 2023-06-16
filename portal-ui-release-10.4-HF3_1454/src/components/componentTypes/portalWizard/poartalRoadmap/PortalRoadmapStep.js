// @flow

import React from "react";
import type { Node } from "react";

export type StepStatus = "current" | "enabled" | "disabled";

export type Props = {
    /**
     * The internal representation of the page. Usually zero-based indexes
     * like arrays. If `step` is not defined, then the label inside the circle
     * will be `index + 1`.
     */
    index: number,

    /**
     * Number to show inside of the circle. By default
     * this will be `index + 1`.
     */
    step?: number,

    /**
     * The status of the step in the roadmap.
     * This can either be enabled, current or disabled, error
     */
    status: StepStatus,

    /**
     * The name to show the user (e.g. Step 1, Step 2, etc.).
     * This can also be additional JSX to render.
     */
    name: Node,

    /**
     * Custom class selectors to pass.
     */
    className?: string,

    /**
     * Title attribute to add for the node.
     * Appears as tooltip on the roadmap step
     */
    title?: string,

    /**
     * The onClick handler when the user clicks on the step.
     * This callback is called only when the status of the step is NOT disabled.
     */
    onClick: () => void,

    imageIcon?: String,

    stepNumber?: String

};

const getName = (name: Node): Node => {
    if (typeof name === "string") {
        return <span className="d-roadmap__step__label">{name}</span>;
    }

    return name;
};

const getClassNameByStatus = (status: StepStatus) => {
    return status === "current" ? "" : `d-roadmap__step--${status}`;
};

const ENTER = 32;
const SPACE = 13;

/**
 * A UI only component that renders a step and it's status.
 * This component should be rendered as a child of a `Roadmap` component.
 */
function PortalRoadmapStep(props: Props) {
    const handleKeyPress = React.useCallback(
        (e: SyntheticKeyboardEvent<HTMLSpanElement>) => {
            if ((e.keyCode === SPACE || e.keyCode === ENTER) && props.status === "enabled") {
                handleClick();
            }
        },
        [props.step]
    );

    const handleClick = React.useCallback(() => {
        if (props.status === "enabled") {
            props.onClick();
        }
    }, [props.status, props.onClick]);

    let circleObj = (props.stepNumber ===0) ? (<>&nbsp;<img src={props.imageIcon} alt="" width="20" /></>) : props.stepNumber || props.index + 1;
    return (
        <span
            onClick={handleClick}
            className={`d-roadmap__step ${getClassNameByStatus(props.status)} ${props.className}`}
            role="link"
            tabIndex="0"
            onKeyUp={handleKeyPress}
            title={props.title}>
            <span className="d-roadmap__step__circle">{circleObj}</span>
            {props.name ? getName(props.name) : null}
        </span>
    );
}

PortalRoadmapStep.displayName = "PortalRoadmap.Step";
PortalRoadmapStep.defaultProps = {
    status: "disabled",
};

export default PortalRoadmapStep;
