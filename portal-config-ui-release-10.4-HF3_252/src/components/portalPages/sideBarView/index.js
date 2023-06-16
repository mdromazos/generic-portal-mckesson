import { Section, IconButton, Toolbar, Tooltip } from "@informatica/droplets-core";
import "@informatica/droplets-core/dist/themes/archipelago/archipelago.css";
import React, { useState } from "react";
import "./index.css";
import CONFIG from "../../../config/config";
import { useTranslation } from "react-i18next";
import close from "@informatica/archipelago-icons/src/icon_font/close.svg";

const SideBarView = ({ cssClassName, closeSideBar, addComponent }) => {

    const components = CONFIG.COMPONENTS_LIST;
    const { t: translate } = useTranslation();
    const [ hoverField, setHoverField] = useState(null);
    const { ICONS: { ADD_BUTTON } } = CONFIG;

    return <div className={cssClassName}>
        <Section title={translate("LABEL_ADD_COMPONENT")} toolbar={({ expanded }) => (
            <Toolbar>
                <IconButton className="shell-header-close-icon" onClick={closeSideBar}>
                    <img src={close} alt="" className="button-icon"/>
                </IconButton>
            </Toolbar>
        )}>
            <Section title={translate("LABEL_STANDARD_COMPONENT")} collapsible>
                {
                    components.map((component) => <div className="data-panel"
                            onMouseEnter={() => setHoverField(component.type)}
                            onMouseLeave={() => setHoverField(null)}
                        >
                            <div className="component-text">{translate(component.label)}</div>
                            {
                                hoverField === component.type && <Tooltip content={translate("LABEL_TOOLTIP_ADD")}>
                                    <IconButton key={component.type} onClick={() => addComponent(component)}>
                                        <img src={ADD_BUTTON} alt="" className="button-icon"/>
                                    </IconButton>
                                </Tooltip>
                            }
                        </div>
                    )
                }
            </Section>
        </Section>
    </div>;
};
export default SideBarView;
