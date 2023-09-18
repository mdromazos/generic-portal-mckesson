package com.informatica.mdm.portal.metadata.model;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class PortalRestConfig {

    private List<String> portalNodes;
    private JsonNode filter;
    private String sort;
    private String sortOrder;
    private Integer depth;
    private Integer currentPage;
    private Integer pageSize;
    private String ors;
    private Integer version;
    private List<String> projections;
    private Boolean resolveExtConfig;
    private String mdmSessionId;
    private String initialApiUrl;
    private String locale;
    private String role;

    public PortalRestConfig(String ors, Integer version, List<String> portalNodes) {
        this.portalNodes = portalNodes;
        this.ors = ors;
        this.version = version;
    }

    public PortalRestConfig(String ors, Integer version, List<String> portalNodes, JsonNode filter,
                            String sort, String sortOrder, Integer depth, Integer currentPage, Integer pageSize, List<String> projections, Boolean resolveExtMeta) {
        this.portalNodes = portalNodes;
        this.filter = filter;
        this.sort = sort;
        this.sortOrder = sortOrder;
        this.depth = null != depth ? depth : 0;
        this.currentPage = null != currentPage ? currentPage : 0;
        this.pageSize = null != pageSize ? pageSize : 0;
        this.ors = ors;
        this.version = version;
        this.projections = projections;
        this.resolveExtConfig = resolveExtMeta;
    }
    
    public PortalRestConfig(String ors, JsonNode filter, List<String> projections) {
        this.ors = ors;
        this.filter = filter;
        this.projections = projections;
    }

    public static PortalRestConfig generatePortalRestConfig(String ors, Integer version, List<String> portalNodes,
                                                            String filterText, String sort, String sortOrder, Integer depth,
                                                            Integer currentPage, Integer pageSize, List<String> projections, Boolean resolveExtMeta) throws IOException {

        JsonNode filter = null != filterText ? new ObjectMapper().readTree(filterText) : null;
        projections = null != projections ? projections : new ArrayList<String>();
        return new PortalRestConfig(ors, version, portalNodes, filter, sort, sortOrder, depth, currentPage, pageSize, projections, resolveExtMeta);
    }

    public static PortalRestConfig generatePortalRestConfig(String ors, Integer version, List<String> portalNodes) {

        return new PortalRestConfig(ors, version, portalNodes);
    }
    
    public static PortalRestConfig generatePortalRestConfig(String ors, String filterText, List<String> projections) throws IOException {

    	JsonNode filter = null != filterText ? new ObjectMapper().readTree(filterText) : null;
        projections = null != projections ? projections : new ArrayList<String>();
        return new PortalRestConfig(ors, filter, projections);
    }

    public List<String> getPortalNodes() {
        return portalNodes;
    }

    public void setPortalNodes(List<String> portalNodes) {
        this.portalNodes = portalNodes;
    }

    public JsonNode getFilter() {
        return filter;
    }

    public void setFilter(JsonNode filter) {
        this.filter = filter;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public Integer getDepth() {
        return depth;
    }

    public void setDepth(Integer depth) {
        this.depth = depth;
    }

    public Integer getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(Integer currentPage) {
        this.currentPage = currentPage;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public String getOrs() {
        return ors;
    }

    public void setOrs(String ors) {
        this.ors = ors;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

	public String getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(String sortOrder) {
		this.sortOrder = sortOrder;
	}

	public List<String> getProjections() {
		return projections;
	}

	public void setProjections(List<String> projections) {
		this.projections = projections;
	}

	public String getMdmSessionId() {
		return mdmSessionId;
	}

	public void setMdmSessionId(String mdmSessionId) {
		this.mdmSessionId = mdmSessionId;
	}

	public Boolean getResolveExtConfig() {
		if(null == this.resolveExtConfig) {
			this.resolveExtConfig = true;
		}
		return resolveExtConfig;
	}

	public void setResolveExtConfig(Boolean resolveExtMeta) {
		this.resolveExtConfig = resolveExtMeta;
	}

	public String getInitialApiUrl() {
		return initialApiUrl;
	}

	public void setInitialApiUrl(String initialApiUrl) {
		this.initialApiUrl = initialApiUrl;
	}

	public String getLocale() {
		return locale;
	}

	public void setLocale(String locale) {
		this.locale = locale;
	}

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
