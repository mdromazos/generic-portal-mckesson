import React from "react";
import { Dialog, Button } from "@informatica/droplets-core";
import { useTranslation } from "react-i18next";

const SessionDialog = ({sessionTimeout, addMoreTime, progressBar, dialogBox}) => {
    const { t: translate } = useTranslation();

    const getRotateAnimation = (progressBar, timingFunction, animationName, animationDirection) => {
        return {
                animationDuration: `${progressBar}s`,
                animationTimingFunction: timingFunction,
                animationDelay: `0s`,
                animationIterationCount: `infinite`,
                animationDirection: animationDirection,
                animationFillMode: `none`,
                animationPlayState: `running`,
                animationName: animationName
        }
    }

    return(
        <Dialog className="session__dialog" closed={dialogBox.close} onClose={dialogBox.close} bounds="parent" {...dialogBox}
            data-testid="session-dialog"
        >
            <Dialog.Header title={translate("LABEL_SESSION_TITLE")} data-testid="dialog__header__title" className="session__timeout__header" />
                <Dialog.Content>
                    <p className="session__dialog__header__title" data-testid="session-dialog-header-title">
                        {translate("LABEL_SESSION_EXPIRE_HEADER_TITLE")}
                    </p>
                    <div className="session_wrapper">
                        <div className="pie spinner" style={getRotateAnimation(progressBar, `linear`, `timer_rotate`, `normal`)}></div>
                        <div className="pie filler" style={getRotateAnimation(progressBar, `steps(1)`, `timer_opacity`, `reverse`)}></div>
                        <div className="mask" style={getRotateAnimation(progressBar, `steps(1)`, `timer_opacity`, `normal`)}></div>
                        <div className="timer">
                            <div className="remaining__time" data-testid="remaining-time">{sessionTimeout}</div>
                            <div className="remaining__time__description" data-testid="remaining-time-description">
                                {translate("LABEL_SECONDS")}
                            </div>
                        </div>
                    </div>
                    <p className="session__dialog__footer__title" data-testid="dialog-footer-title">
                        {`${translate("LABEL_SESSION_EXPIRE_FOOTER_TITLE", {WARNING_TIME: `${sessionTimeout}`})}`}
                    </p>
                </Dialog.Content>
            <Dialog.Footer>
                <Button variant="primary" onClick={addMoreTime} className='login__button' data-testid="logged-in-button">
                    {translate("LABEL_KEEP_ME_LOGGED_IN")}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
}

export default SessionDialog;
