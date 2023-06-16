package com.informatica.mdm.portal.metadata.model;


import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;


@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "sendEmail",namespace="http://www.informatica.com/solutions/avosEmailService")
public class InitiateEmail {
	private String toEmail;
	private String fromEmail;
	private String replyToEmail;
	private String emailType;
	private String emailTemplate;
	private String subject;
	@XmlElement(name = "properties", type = EmailProperties.class)
	private EmailProperties emailProperties;

	public String getToEmail() {
		return toEmail;
	}

	public void setToEmail(String toEmail) {
		this.toEmail = toEmail;
	}

	public String getFromEmail() {
		return fromEmail;
	}

	public void setFromEmail(String fromEmail) {
		this.fromEmail = fromEmail;
	}

	public String getReplyToEmail() {
		return replyToEmail;
	}

	public void setReplyToEmail(String replyToEmail) {
		this.replyToEmail = replyToEmail;
	}

	public String getEmailType() {
		return emailType;
	}

	public void setEmailType(String emailType) {
		this.emailType = emailType;
	}

	public String getEmailTemplate() {
		return emailTemplate;
	}

	public void setEmailTemplate(String emailTemplate) {
		this.emailTemplate = emailTemplate;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public EmailProperties getEmailProperties() {
		return emailProperties;
	}

	public void setEmailProperties(EmailProperties emailProperties) {
		this.emailProperties = emailProperties;
	}
}

