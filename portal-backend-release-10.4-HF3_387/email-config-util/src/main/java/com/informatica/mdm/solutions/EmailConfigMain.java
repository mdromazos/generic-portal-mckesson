package com.informatica.mdm.solutions;

public class EmailConfigMain
{
	
	private static final String EMAIL_CONFIG_PATH = "/server/resources/mdmapps/email-config";
	private static final String EMAIL_CONFIG_XML = "/emailConfig.xml";
	private static final String EMAIL_CONFIG = "/email-config";
	private static final String TEMPLATES_PATH = "/templates/avos-templates";
	
    public static void main( String[] args ) throws Exception
    {
    	String hubHome=args[0];
        String appHome = args[1];
        String srcFilePath = appHome+EMAIL_CONFIG+EMAIL_CONFIG_XML;
        String destFilePath = hubHome+EMAIL_CONFIG_PATH+EMAIL_CONFIG_XML;
        EmailConfigHelper.mergeEmailConfig(srcFilePath, destFilePath);
        EmailConfigHelper.createCatalogXML(hubHome+EMAIL_CONFIG_PATH+TEMPLATES_PATH, hubHome+EMAIL_CONFIG_PATH);
    }
}
