package com.informatica.mdm.portal.metadata.model;

import com.fasterxml.jackson.databind.JsonNode;

public class PortalUIModel {
    JsonNode portalConfig;
    String locale;
    boolean rawModel;

    public JsonNode getPortalConfig() {
        return portalConfig;
    }

    public void setPortalConfig(JsonNode portalConfig) {
        this.portalConfig = portalConfig;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public boolean isRawModel() {
        return rawModel;
    }

    public void setRawModel(boolean rawModel) {
        this.rawModel = rawModel;
    }
}
