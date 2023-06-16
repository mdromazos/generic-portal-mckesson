import React from "react";
import CONFIG from "../../../config/config";
import {getHeight} from "../../../common/helperUtils";
import {Card} from '@informatica/droplets-core';
import "./index.css";

const Text = ({component}) => {
    return (
        <Card className="external-link-width" data-testid="text__component">
            <Card.Body> 
                { component.heading && <p className="text-body-title" data-testid="text__component__heading"> 
                    {component.heading} 
                </p>} 
                { component.body && <div className="component-scroll-wrap text-card-body"
                    data-testid="text__component__body" 
                    style = {{
                        maxHeight: getHeight(component, CONFIG.DEFAULT_HEIGHT_FIT_TO_CONTENT)
                    }}>
                        {component.body} 
                    </div>
                } 
            </Card.Body> 
        </Card>
    );
}

export default Text;