(: XQuery main module :)
xquery version "3.0";
module namespace cfgx = 'http://informatica.com/modules/configuration/1.0/xquery';
declare namespace cfg="http://www.informatica.com/schema/1.0/av_config.xsd";

(:~
 Function retrieves property text node value from document node by property name 
 
 Parameters:
 @param $node as node() container node that will contain or contain cfg:properties
 @param $propertyName as xs:string property name 
 @return item()
 :)
declare function cfgx:getPropertyValue ($node as node(), $propertyName as xs:string) as xs:string? {
    string(cfgx:getProperty($node,$propertyName))
};

declare function cfgx:getProperty ($node as node(), $propertyName as xs:string) as item()? {
    $node/cfg:properties/cfg:property[@name=$propertyName]
};