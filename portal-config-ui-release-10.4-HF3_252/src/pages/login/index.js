import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import LoginForm from './../../components/loginForm';
import '@informatica/droplets-core/dist/themes/archipelago/components/section.css';
import { URLMap } from '../../utils/urlMappings';
import { APIMap } from '../../utils/apiMappings';
import axios from 'axios';
import './index.css';
import CONFIG from "../../config/config";

const LoginPage = (props) => {

    const { t: translate } = useTranslation();
    const [sessionValidationCheck, setSessionValidationCheck] = useState(false);
    const { IMAGES } = CONFIG;

    useEffect(() => {
        axios.get(APIMap.validateSession()).then(() => {
            props.history.push(URLMap.portals());
        }).catch(() => {
            setSessionValidationCheck(true);
        });
    }, []);

    return <>
        {
            sessionValidationCheck && <div className='login-page' style={{ backgroundImage: `url(${IMAGES.BRANDING})` }}>
                <div className='login-box'>
                    <div className='login-box-header'>
                        <div className='login-header-image'>
                            <img className='login-header-image-logo' src={IMAGES.INFA_LOGO}  alt="" />
                        </div>
                        <div className='login-header-content'>
                            {translate("MDM_CONFIG_PRODUCT_NAME")}
                        </div>
                    </div>
                    <div className='login-box-content'>
                        <LoginForm history={props.history} />
                    </div>
                    <div className="copyright__style">
                        {translate('LABEL_COPYRIGHT_TEXT')}
                    </div>
                </div>
            </div>
        }
    </>;
};
export default LoginPage;
