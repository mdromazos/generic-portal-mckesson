import React, { useState, useCallback, useRef, useEffect } from 'react';

import Positioner from "react-positioner/dist-umd/index.js";

const wrapTextNode = node => {
    if (typeof node === "string") {
        return <span>{node}</span>;
    }

    return node;
};

function useTimer(fn, delay, dependencies) {
    const timer = useRef(null);

    const start = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(fn, delay);
    }, []);

    const cancel = useCallback(() => {
        clearTimeout(timer.current);
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, dependencies);

    return [start, cancel];
}

function useTemplateMenuTimer({ showDelay, hideDelay }) {
    const [visible, setVisible] = useState(false);
    const [startShowTimer, cancelShowTimer] = useTimer(() => setVisible(true), showDelay, [visible]);
    const [startHideTimer, cancelHideTimer] = useTimer(() => setVisible(false), hideDelay, [visible]);

    const handleMouseEnter = useCallback(() => {
        cancelHideTimer();
        startShowTimer();
    }, []);

    const handleMouseLeave = useCallback(() => {
        startHideTimer();
        cancelShowTimer();
    }, []);

    return { visible, handleMouseEnter, handleMouseLeave };
}

export default function TemplateMenu({
    targetOffset = 3,
    bodyOffset = 6,
    children,
    content,
    position,
    showDelay = 0,
    hideDelay = 100,
}) {
    const { visible, handleMouseEnter, handleMouseLeave } = useTemplateMenuTimer({ showDelay, hideDelay });
    if (!children) return null;

    return (
        <Positioner
            targetOffset={targetOffset}
            bodyOffset={bodyOffset}
            content={
                <div className='template__menu__container'
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleMouseLeave}
                >
                    {content}
                </div>
            }
            isShown={visible}
            position={position}>
            {React.cloneElement(wrapTextNode(children), {
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
            })}
        </Positioner>
    );
}

TemplateMenu.defaultProps = { position: "bottom" };
