package com.informatica.mdm.portal.metadata.model;

public class PasswordPolicy {

	private int maximumPasswordLength;
	private int minimumPasswordLength;
	private int minimumUniqueCharacters;
	private String passwordBeginningPattern;
	private String passwordMiddlePattern;
	private String passwordEndPattern;
	private boolean patternValidationEnabled;
	
	public int getMaximumPasswordLength() {
		return maximumPasswordLength;
	}
	public void setMaximumPasswordLength(int maximumPasswordLength) {
		this.maximumPasswordLength = maximumPasswordLength;
	}
	public int getMinimumPasswordLength() {
		return minimumPasswordLength;
	}
	public void setMinimumPasswordLength(int minimumPasswordLength) {
		this.minimumPasswordLength = minimumPasswordLength;
	}
	public int getMinimumUniqueCharacters() {
		return minimumUniqueCharacters;
	}
	public void setMinimumUniqueCharacters(int minimumUniqueCharacters) {
		this.minimumUniqueCharacters = minimumUniqueCharacters;
	}
	public String getPasswordBeginningPattern() {
		return passwordBeginningPattern;
	}
	public void setPasswordBeginningPattern(String passwordBeginningPattern) {
		this.passwordBeginningPattern = passwordBeginningPattern;
	}
	public String getPasswordMiddlePattern() {
		return passwordMiddlePattern;
	}
	public void setPasswordMiddlePattern(String passwordMiddlePattern) {
		this.passwordMiddlePattern = passwordMiddlePattern;
	}
	public String getPasswordEndPattern() {
		return passwordEndPattern;
	}
	public void setPasswordEndPattern(String passwordEndPattern) {
		this.passwordEndPattern = passwordEndPattern;
	}
	public boolean isPatternValidationEnabled() {
		return patternValidationEnabled;
	}
	public void setPatternValidationEnabled(boolean patternValidationEnabled) {
		this.patternValidationEnabled = patternValidationEnabled;
	}
		
}
