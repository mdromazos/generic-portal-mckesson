package com.informatica.mdm.solutions;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class EmailConfigHelper {
	
	private static final String catalogXMLString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + 
			"<catalog xmlns='http://schemas.active-endpoints.com/catalog/2006/07/catalog.xsd' URI=\"project:/SolutionsEmailService\">" + 
			"<wsdlEntry location=\"project:/SolutionsEmailService/wsdl/avosEmailNotification.wsdl\" classpath=\"wsdl/testwork1/prod_depot/solutions/Supplier Hub/main/projects/ActiveVos Workflow/v10/SolutionsEmailService/wsdl/avosEmailNotification.wsdl\" />" + 
			"<wsdlEntry location=\"project:/SolutionsEmailService/wsdl/bpel/SolutionsEmailService.public.wsdl\" classpath=\"wsdl/testwork1/prod_depot/solutions/Supplier Hub/main/projects/ActiveVos Workflow/v10/SolutionsEmailService/wsdl/bpel/SolutionsEmailService.public.wsdl\" />" + 
			"<otherEntry location=\"project:/SolutionsEmailService/emailConfigParameters/emailConfig.xml\" classpath=\"wsdl/testwork1/prod_depot/solutions/Supplier Hub/main/projects/ActiveVos Workflow/v10/SolutionsEmailService/emailConfigParameters/emailConfig.xml\" typeURI=\"null\"/></catalog>";
	
	private static final String LOCATION = "project:/SolutionsEmailService/xsl/";
	private static final String CLASS_PATH="resources/SolutionsEmailService/xsl/";
	private static final String TYPE_URI ="http://www.w3.org/1999/XSL/Transform";
	private static final String CATALOG_XML = "/catalog.xml";
	private static final String EMAIL_CONFIG_TAG = "email-config";
	private static final String EMAIL_TAMPLATE_ARTTIB = "emailTemplate";
	private static final String OTHER_ENTRY = "otherEntry";
	private static final String LOCATION_LABEL = "location";
	private static final String CLASS_PATH_LABEL = "classpath";
	private static final String TYPE_URI_LABEl= "typeURI";
	
	public static void mergeEmailConfig(String src,String dest) throws Exception {
		Document sourceDoc = getFileAsDocument(src);
		Document destDoc = getFileAsDocument(dest);
		if(destDoc!=null) {
			merge(sourceDoc, destDoc);
		}
		writeToFile(sourceDoc, dest,"no");
	}
	
	private static Document getFileAsDocument(String filePath) throws SAXException, IOException, ParserConfigurationException {
		File file = new File(filePath);
		if(!file.exists())
			return null;
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();  
		DocumentBuilder db = dbf.newDocumentBuilder();  
		Document doc = db.parse(file);  
		doc.getDocumentElement().normalize(); 
		return doc;
	}
	
	private static void writeToFile(Document doc,String path,String indent) throws Exception {
		  	Transformer transformer = TransformerFactory.newInstance().newTransformer();
		    transformer.setOutputProperty(OutputKeys.INDENT, indent);
		    transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
		    transformer.setOutputProperty(OutputKeys.METHOD, "html");
		    DOMSource domSource = new DOMSource(doc);
		    transformer.transform(domSource,  new StreamResult(new FileWriter(path)));
	}
	
	private static void merge(Document srcDoc,Document destDoc) throws XPathExpressionException{
		NodeList list = destDoc.getElementsByTagName(EMAIL_CONFIG_TAG); 
		for(int index = 0;index<list.getLength();index++) {
			Node node = list.item(index);
			String templateName = ((Element)node).getAttribute(EMAIL_TAMPLATE_ARTTIB);
			XPath xPath = XPathFactory.newInstance().newXPath();
			NodeList nodes = (NodeList) xPath.evaluate("//email-configs/email-config[@emailTemplate='"+ templateName +"']", srcDoc,XPathConstants.NODESET);
			if(nodes.getLength()==0)
			{
				Element element = srcDoc.getDocumentElement();
				element.appendChild(srcDoc.adoptNode(node.cloneNode(true)));
			}
		}
	}
	
	public static void createCatalogXML(String src,String dest) throws Exception {
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();  
		DocumentBuilder db = dbf.newDocumentBuilder();  
		Document doc = db.parse(new ByteArrayInputStream(catalogXMLString.getBytes())); 
		doc.getDocumentElement().normalize();
		File dir = new File(src);
		File[] files = dir.listFiles();
		for(File file : files) {
			String name = file.getName();
			if(!name.contains(".xsl") && !name.contains(".XSL"))
				continue;
			Element elem = doc.getDocumentElement();
			Node node = doc.createElement(OTHER_ENTRY);
			((Element)node).setAttribute(LOCATION_LABEL, LOCATION+name);
			((Element)node).setAttribute(CLASS_PATH_LABEL, CLASS_PATH+name);
			((Element)node).setAttribute(TYPE_URI_LABEl, TYPE_URI);
			elem.appendChild(doc.adoptNode(node.cloneNode(true)));
		}
		writeToFile(doc, dest+CATALOG_XML,"yes");
	}
}
