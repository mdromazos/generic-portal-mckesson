<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
				xmlns:tns="http://www.informatica.com/solutions/avosEmailService"
				xmlns:xhtml="http://www.w3.org/1999/xhtml"
				version="1.0">
<xsl:output encoding="UTF-8" indent="yes" method="html" version="4.0"/>
<xsl:template match="/">
<message>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    <meta http-equiv="content-style-type" content="text/css; charset=utf-8"/>
    <!-- All CSS styles must be defined in-line for Gmail support -->
</head>
<body>
    <table  style="border: 1px solid #ccc; box-shadow: 0 0 4px #ccc;"  align="center" cellpadding="14" cellspacing="0" width="650">
        <tr>
            <td>
                <img width="100%" height="100%" src="images/HEADER_logos_.png" alt="Informatica Header Logo" />
            </td>
        </tr>
		<table width="625" align="center">
        <tr style="background-color: #ffffff;">
            <td style="font-family: Calibri, Helvetica, sans-sherif;">
                <p>Dear <xsl:value-of select="tns:sendEmail/properties/property[@name='loginName']"/> ,</p>
<p>We received a request to reset your password.</p>
<p>To set a new password, click the following link:<br/><xsl:value-of select="tns:sendEmail/properties/property[@name='passwordLink']"/></p>
<p>If you did not request to reset your password, you can safely ignore this email.</p>
<p>If you have any questions, contact us or send email.</p>
<p>
    <strong>Telephone:</strong>[organization_telephone_number_and_business_hours]<br/>
    <strong>Email:</strong>[organization_email]
</p>
<p>Regards,</p>
<p>Portal Team,<br/>[organization_name]<br/>[organization_address]<br/>[organization_website]</p>

            </td>
        </tr>
		</table>
		<table width="625" cellpadding="32" align = "center" height = "90">
        <tr style="background-color: #D9D9D9;" >
            <td align="center">
			    <table style="color: #ffffff; font-size: 14px" cellpadding="2" cellspacing="0" > 
                    <tr>
                        <td>
                            <span style = "color: #3C363F ;font-family: Roboto-Light,Sans-serif; font-size: 14px;text-align: right;letter-spacing: -0.08px">Powered by</span>
                        </td>
                        <td>
                           <span style = "font-family: Roboto-Regular,Sans-serif;font-size:14px;color:#FF6500;letter-spacing: -0.08px;text-align:center;"> Informatica </span>
                        </td>
                    </tr>
				</table>	
            </td>
        </tr>
		</table>
    </table>
</body>
</html>
</message>
</xsl:template>
</xsl:stylesheet>
