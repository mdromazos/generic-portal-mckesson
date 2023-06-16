import React from 'react';

// translations for the parent app
import {mdmBeFormBuilderTranslations} from '../i18n';

// components
import beFormBuilder from './beFormBuilder'


export const BeFormBuilder = {
    mdmBeFormBuilderTranslations: Object.assign({}, mdmBeFormBuilderTranslations),
    BeFormBuilder: beFormBuilder
};
