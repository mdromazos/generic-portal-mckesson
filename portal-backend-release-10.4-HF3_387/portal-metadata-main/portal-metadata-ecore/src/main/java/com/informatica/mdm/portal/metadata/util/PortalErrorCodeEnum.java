package com.informatica.mdm.portal.metadata.util;

public enum PortalErrorCodeEnum {
	
	CONFIG301("Draft Portal Config Not Found"),
	CONFIG302("Portal Config Not Found"),
	CONFIG303("Save Portal Config Error"),
	CONFIG304("Publish Portal Config Error"), 
	CONFIG305("Delete draft Portal Config Error"),
	CONFIG306("Delete Published Portal Config Error"),
	CONFIG315("Retrieving All Portals Error"),
	CONFIG316("Published Portal Config version can't be less than current user base version for the portal"),
	CONFIG317("Published Portal Config version has higher version than current user base version"),
	CONFIG318("Portal Config with name already exist"),
	CONFIG401("Database Error"),
	CONFIG402("Ors ID %s not found!"),
	CONFIG403("Could not resolve the datasource!"),
	CONFIG701("Map JsonNode to Ecore EObject Error"),
	CONFIG703("Map Ecore EObject to JsonNode Error"),
	CONFIG702("Can't load metamodel from file: {0}"),
	CONFIG704("Ecore EObject heirarchy traverse Error"),
	CONFIG705("Deleting Portal Child Config from Portal Config Error"),
	CONFIG706("Retrieving Portal Config from EMF Resource Error"),
	CONFIG707("Save Portal Config to EMF Resource Error"),
	CONFIG708("Delete Published Portal Config Error"),
	CONFIG709("Merge portal child EObject to Portal EObject"),
	CONFIG710("Retrieving Portal Child Config from Portal Config Error"),
	CONFIG711("Reference data load Error"),
	CONFIG712("Fetch Reference data Error"),
	CONFIG713("Deleting Portal Child Config from Portal Config Error"),
	CONFIG714("Path shouldn't be empty for Get, Create, Update and Publish of Portal Config"),
	CONFIG715("Config Model CRUD error"),
	CONFIG716("Invalid path for Portal Configuration"),
	CONFIG717("Patch Update, Existing Object not found for the specified path to update"),
	CONFIG718("Collection Identifier is mandatory for Collection Updates"),
	CONFIG719("Path traversal should be reference object"),
	CONFIG720("Path traversal identifier is required for Collections in the path"),
	CONFIG721("Collection Update - mentioned id not found"),
	CONFIG722("Child Config creation - already exist"),
	CONFIG723("Child Config update - not exist"),
	CONFIG724("Invalid attribute in payload data"),
	CONFIG725("Delete Object is a Cross Reference type"),
	CONFIG726("Filter can be applied on Collections"),
	CONFIG727("No data available for the requested pagination"),
	CONFIG801("JsonNode Traverse Error"),
	CONFIG802("Payload Data can't be empty for create, update or patch update api's"),
	CONFIG501("Application Error"),
	CONFIG100("Portal version and database id can't be empty"),
	CONFIG101("Database id can't be empty"),
	CONFIG102("Portal version must be numeric"),
	CONFIG601("Unable to process your application"),
	CONFIG602("Something went wrong, Please contact administrator"),
	CONFIG603("Unable to validate the user"),
	CONFIG604("Unable to find BE for given user."),
	CONFIG605("State is enabled but no field with state value found"),
	CONFIG606("Error on Invoking Proxy Api call"),
	CONFIG607("Valid mdmsessionid is required to invoke proxy api"),
	CONFIG608("Portal config validation failed"),
	CONFIG609("Siperian Api Invocation Error"),
	CONFIG610("Error while exporting portal"),
	CONFIG611("Unable to get bundle for given locale");
	
	private final String errorDesc;
	
	private PortalErrorCodeEnum(String errorDesc) {
		this.errorDesc = errorDesc;
	}

	public String getErrorDesc() {
		return errorDesc;
	}
}
