import * as React from "react";

export default function(steps, initialStep, setStep, setVisitedSteps) {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        if (initialStep) {
            if (steps[initialStep].beforeEnter) {
                steps[initialStep].beforeEnter().then(valid => {
                    if (valid) {
                        setVisitedSteps(Array(initialStep + 1).fill(true));
                        setStep(initialStep);
                    }
                    setReady(true);
                });
            } else {
                setVisitedSteps(Array(initialStep + 1).fill(true));
                setStep(initialStep);
                setReady(true);
            }
        } else {
            setReady(true);
        }
        /**
         * This effect should run only during the initial render.
         * This is why we need to pass an empty dependencies array to the useEffect call.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { ready };
}
