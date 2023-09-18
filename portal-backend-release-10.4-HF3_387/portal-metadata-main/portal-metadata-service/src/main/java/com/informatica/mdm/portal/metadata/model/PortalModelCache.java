package com.informatica.mdm.portal.metadata.model;

import com.informatica.mdm.portal.metadata.util.PortalServiceConstants;

public class PortalModelCache {
    private String orsId;
    private String selectedLocale;
    private String role;
    private String lastDBChange;
    private String portalId;

    public PortalModelCache(String orsId, String role, String lastDBChange, String portalId, String selectedLocale) {
        this.orsId = null == orsId ? "" : orsId;
        this.role = null == role ? "" : role;
        this.lastDBChange = null == lastDBChange ? "" : lastDBChange;
        this.portalId = null == portalId ? "" : portalId;
        this.selectedLocale = null == selectedLocale ? PortalServiceConstants.DEFAULT_LOCALE : selectedLocale;
    }

    @Override
    public int hashCode() {

        int prime = 31;
        int result = 1;
        result = prime * result + ((orsId == null) ? 0 : orsId.hashCode());
        result = prime * result + ((selectedLocale == null) ? 0 : selectedLocale.hashCode());
        result = prime * result + ((role == null) ? 0 : role.hashCode());
        result = prime * result + ((lastDBChange == null) ? 0 : lastDBChange.hashCode());
        result = prime * result + ((portalId == null) ? 0 : portalId.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object object) {

        if (null == object) {
            return false;
        }

        PortalModelCache cache = (PortalModelCache) object;

        if (this.getOrsId().equalsIgnoreCase(cache.getOrsId())
                && this.getSelectedLocale().equalsIgnoreCase(cache.getSelectedLocale())
                && this.getRole().equalsIgnoreCase(cache.getRole())
                && this.getLastDBChange().equalsIgnoreCase(cache.getLastDBChange())
                && this.getPortalId().equalsIgnoreCase(cache.getPortalId())) {
            return true;
        }
        return false;
    }

    public String getOrsId() {
        return orsId;
    }

    public void setOrsId(String orsId) {
        this.orsId = orsId;
    }

    public String getSelectedLocale() {
        return selectedLocale;
    }

    public void setSelectedLocale(String selectedLocale) {
        this.selectedLocale = selectedLocale;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLastDBChange() {
        return lastDBChange;
    }

    public void setLastDBChange(String lastDBChange) {
        this.lastDBChange = lastDBChange;
    }

    public String getPortalId() {
        return portalId;
    }

    public void setPortalId(String portalId) {
        this.portalId = portalId;
    }
}
