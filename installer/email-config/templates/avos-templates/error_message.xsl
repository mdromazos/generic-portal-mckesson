<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xhtml="http://www.w3.org/1999/xhtml"
	xmlns:tns="http://www.informatica.com/solutions/avosEmailService">
	<xsl:output method="html" version="4.0" encoding="UTF-8"
		indent="yes" />
	<xsl:template match="/">
		<message>
		<table>
		<tr>
			Error occurred during process execution.
			</tr>
			<tr>Error Description :</tr>
			<tr><xsl:value-of select="tns:sendEmail/properties/property[@name='errorDesc']"/>
			</tr> 
			</table>
	</message>
	</xsl:template>
</xsl:stylesheet>