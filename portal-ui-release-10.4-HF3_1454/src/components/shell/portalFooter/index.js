import React, { useContext } from 'react';
import { StateContext } from '../../../context/stateContext';
import './index.css';

const PortalFooter = () => {
    const [{ globalSettings: { footer } }] = useContext(StateContext);

    return(
        <div className="portal-footer" style={{ backgroundColor: footer.backgroundColor }} data-testid="portal__footer">
            <span style={{ color: footer.fontColor }} data-testid="portal__footer__text">{ footer.footerText }</span>
        </div>
    );
};
export default PortalFooter;