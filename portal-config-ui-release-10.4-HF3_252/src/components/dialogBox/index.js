import React from "react";
import { MessageBox, Button } from "@informatica/droplets-core";
import PropTypes from "prop-types";
import CONFIG from "../../config/config";
import "./index.css";

const DialogBox = ({ 
    dialogBox,
    title,
    cancelButtonText,
    messageContentTitle,
    messageContentBody,
    actionButtonText,
    clickHandler,
    type= CONFIG.NOTIFICATION_TYPE.WARNING,
}) => (
        <MessageBox
            type={type}
            title={title}
            {...dialogBox}
            data-testid="message-box-title"
        >
            <MessageBox.Content>
                <MessageBox.Title data-testid="message-box-content-title">
                    {messageContentTitle}
                </MessageBox.Title>
                <p data-testid="message-box-content-body"> {messageContentBody}</p>
            </MessageBox.Content>
            <MessageBox.Footer>
                    <>
                        {
                            actionButtonText && clickHandler && typeof clickHandler === 'function' && 
                                <Button
                                    variant="primary"
                                    onClick={(params) => {
                                        dialogBox.close();
                                        clickHandler(params);
                                    }}
                                    data-testid="message-box-action-button"
                                >
                                    {actionButtonText}
                                </Button>
                        }
                        {
                            cancelButtonText &&
                            <Button onClick={dialogBox.close} data-testid="message-box-cancel-button">
                                {cancelButtonText}
                            </Button>
                        }
                    </>
            </MessageBox.Footer>        
        </MessageBox>       
);
DialogBox.propTypes = {
    title: PropTypes.string,
    messageContentTitle:PropTypes.string,
    messageContentBody:PropTypes.string,
    actionButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
    dialogBox: PropTypes.object,
};
export default DialogBox;
