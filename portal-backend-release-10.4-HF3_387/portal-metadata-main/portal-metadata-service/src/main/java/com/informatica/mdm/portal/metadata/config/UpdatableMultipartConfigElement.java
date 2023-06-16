package com.informatica.mdm.portal.metadata.config;

import javax.servlet.MultipartConfigElement;

public class UpdatableMultipartConfigElement extends MultipartConfigElement {

    private volatile long maxFileSize = -1;

    public UpdatableMultipartConfigElement(String location, long maxFileSize, long maxRequestSize, int fileSizeThreshold) {
        super(location, maxFileSize, maxRequestSize, fileSizeThreshold);
    }

    @Override
    public long getMaxFileSize() {
        return super.getMaxFileSize() > 0 ? super.getMaxFileSize() : maxFileSize;
    }

    public void setMaxFileSize(long maxFileSize) {
        this.maxFileSize = maxFileSize;
    }
}