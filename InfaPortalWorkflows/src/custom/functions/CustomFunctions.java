package custom.functions;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.activebpel.rt.bpel.function.AeFunction;
import org.activebpel.rt.bpel.function.AeFunctionCallException;
import org.activebpel.rt.bpel.function.AeFunctionContext;
import org.activebpel.rt.bpel.function.AeFunctionUnit;
import org.activebpel.rt.bpel.function.AeUnresolvableException;
import org.activebpel.rt.bpel.function.IAeFunction;
import org.activebpel.rt.bpel.function.IAeFunctionContext;
import org.activebpel.rt.bpel.function.IAeFunctionExecutionContext;
import org.json.JSONObject;
import org.json.XML;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;
import com.siperian.sif.client.CertificateHelper;

@AeFunctionContext(name = "CustomJavaContext", namespace = "http://custom.functions/CustomJavafunctions")
public class CustomFunctions implements IAeFunctionContext {

	@AeFunctionUnit(prefix = "solution", display = "Custom Java Function", hoverText = "Custom Java Function Description", functions = {
                  @AeFunction(syntax = "${prefix}:getTextValue(${caret})", display = "GetTextValue", hoverText = "Get text value of element"),
                  @AeFunction(syntax = "${prefix}:getNodeValue(${caret})", display = "GetNodeValue", hoverText = "Get node value of element"),
                  @AeFunction(syntax = "${prefix}:jsonToXML(${caret})", display = "JsonToXML", hoverText = "Convert Json to XML"),
                  @AeFunction(syntax = "${prefix}:getUserDataPath(${caret})", display = "GetUserDataPath", hoverText = "Get user data path")})
      @Override
      public IAeFunction getFunction(String name) throws AeUnresolvableException {
            if ("getTextValue".equals(name)) 
            {
                  return new GetTextValue();
                  
            }
            if ("getNodeValue".equals(name))
            {
                  return new GetNodeValue();
            }
            if ("jsonToXML".equals(name)) 
            {
                  return new JsonToXML();
            }
            if ("getUserDataPath".equals(name)) 
            {
                  return new GetUserDataPath();
            }
            throw new AeUnresolvableException(name);
      }
}

class JsonToXML implements IAeFunction {
	@Override
	public Object call(IAeFunctionExecutionContext context, List args)
			throws AeFunctionCallException {
		String jsonString = args.get(0).toString();
		JSONObject json = new JSONObject(jsonString);
		String xml = XML.toString(json);
		xml = "<root>" + xml + "</root>";
		return xml;
	}
}

class GetTextValue implements IAeFunction {

	@Override
	public Object call(IAeFunctionExecutionContext context, List args)
			throws AeFunctionCallException {
		String xml = args.get(0).toString();
		String path = args.get(1).toString();
		boolean skipRoot = true;
		if(args.size()>2){
			skipRoot=false;
		}
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		dbFactory.setNamespaceAware(true);
		DocumentBuilder dBuilder;
		try {
			dBuilder = dbFactory.newDocumentBuilder();
			Document doc = dBuilder
					.parse(new InputSource(new StringReader(xml)));
			Element element = doc.getDocumentElement();
			Element nodeElement = null;
			if(skipRoot){
				nodeElement = (Element) element.getChildNodes().item(0).getChildNodes();
			}else{
				nodeElement = (Element) element.getChildNodes();
			}
			String[] splittedPath = path.split("\\.");
			Node node = null;
			for (int i = 0; i < splittedPath.length - 1; i++) {
				node = (Element) nodeElement.getElementsByTagNameNS("*",  splittedPath[i]).item(0);
				if (node == null)
					return "";
				nodeElement = (Element) node.getChildNodes();
			}
			node = nodeElement.getElementsByTagNameNS("*",  splittedPath[splittedPath.length - 1]).item(0);
			if (node == null)
				return "";
			return node.getTextContent();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "";
	}
}

class GetNodeValue implements IAeFunction {

	@Override
	public Object call(IAeFunctionExecutionContext context, List args)
			throws AeFunctionCallException {
		String xml = args.get(0).toString();
		String path = args.get(1).toString();
		boolean skipRoot = true;
		if(args.size()>2){
			skipRoot=false;
		}
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		dbFactory.setNamespaceAware(true);
		try {
			DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
			Document doc = dBuilder
					.parse(new InputSource(new StringReader(xml)));
			Element element = doc.getDocumentElement();
			Element nodeElement = null;
			if(skipRoot){
				nodeElement = (Element) element.getChildNodes().item(0).getChildNodes();
			}else{
				nodeElement = (Element) element.getChildNodes();
			}
			String[] splittedPath = path.split("\\.");
			Node node = null;
			for (int i = 0; i < splittedPath.length - 1; i++) {
				node = (Element) nodeElement.getElementsByTagNameNS("*",  splittedPath[i]).item(0);
				if (node == null)
					return "";
				nodeElement = (Element) node.getChildNodes();
			}
			node = nodeElement.getElementsByTagNameNS("*",  splittedPath[splittedPath.length - 1]).item(0);
			if (node == null)
				return "";
			return convertNodeToString(node);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "";
	}

	private static String convertNodeToString(Node node) {
		try {
			StringWriter writer = new StringWriter();
			Transformer trans = TransformerFactory.newInstance()
					.newTransformer();
			trans.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
			trans.setOutputProperty(OutputKeys.INDENT, "yes");
			trans.transform(new DOMSource(node), new StreamResult(writer));
			return writer.toString();
		} catch (TransformerException te) {
			te.printStackTrace();
		}
		return "";
	}
}
class GetUserDataPath implements IAeFunction {
	@Override
	public Object call(IAeFunctionExecutionContext context, List args)
			throws AeFunctionCallException {
		String path = args.get(0).toString();
		String contactChild = args.get(1).toString();
		if (path.contains(contactChild)) {
			path = path.substring(path.indexOf(".") + 1);
		}
		return path;
	}
}
