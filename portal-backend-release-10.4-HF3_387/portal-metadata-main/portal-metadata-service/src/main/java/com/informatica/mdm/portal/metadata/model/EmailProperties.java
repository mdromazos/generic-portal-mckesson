package com.informatica.mdm.portal.metadata.model;

import java.util.List;


import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "properties")
public class EmailProperties {
	@XmlElement(name = "property", type = EmailProperty.class)
	public List<EmailProperty> properties;

	public List<EmailProperty> getProperties() {
		return properties;
	}

	public void setProperties(List<EmailProperty> properties) {
		this.properties = properties;
	}

	

}

