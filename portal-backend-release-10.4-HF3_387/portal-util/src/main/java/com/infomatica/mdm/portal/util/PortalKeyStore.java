package com.infomatica.mdm.portal.util;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Scanner;

import com.siperian.sam.security.certificate.MdmKeyStore;

public class PortalKeyStore {
	private final static int RSA_KEY_LENGTH = 1024;
	private static final String CERT_RELATIVE_PATH = File.separator+"resources"+File.separator+"certificates";
	private static final String INFA_PORTAL = "infaPortal";
	
    public static void main(String args[]) throws Exception {
    	String hubServerPath = "";
    	if(args.length>0 && args[0]!=null && args[0].trim().length()>0){
            File path = new File(args[0]);
            if(path.isDirectory()){
                	hubServerPath = path.getAbsolutePath();
             }else {
                	System.out.println("Path entered is not a valid directory. [" + path.getAbsolutePath() + "]");
                }
    	}
    	if(hubServerPath!=null && hubServerPath.trim().length()>0) {
    		MdmKeyStore.setCmxHome(hubServerPath);
    	}
    	MdmKeyStore mks = new MdmKeyStore();
    	mks.initialize(INFA_PORTAL, RSA_KEY_LENGTH);
    	System.out.println("Keystore and certificates are initialized successfully at following path: [" +new File(hubServerPath+CERT_RELATIVE_PATH).getAbsolutePath()+"]");
    	
    	System.out.println("Creating infaPortal Application User in mdm");
    	Connection connection = getDBConnection();
    	AddApplicationUserUtil.addAppUsers(hubServerPath, connection, INFA_PORTAL);
    }
    
    private static Connection getDBConnection() throws ClassNotFoundException, SQLException {
    	Connection connection = null;
		Scanner sc = null;
		String dbName = null;
		sc = new Scanner(System.in);
		System.out.println("Enter the database type [Oracle, DB2, MSSQL]: ");
		String dbVendor = sc.nextLine();
		System.out.println("Enter the username for master database:");
		String dbUsername = sc.nextLine();
		System.out.println("Enter the password for master database:");
		String dbPassword = sc.nextLine();
		System.out.println("Enter the Operational Reference Store database host name:");
		String host = sc.nextLine();
		System.out.println("Enter the Operational Reference Store database port number:");

		String port = sc.nextLine();
		if (dbVendor.equalsIgnoreCase("Oracle") || dbVendor.equalsIgnoreCase("DB2")) {
			System.out.println("Enter the database name:");

			dbName = sc.nextLine();
		}
		if (dbVendor.equalsIgnoreCase("Oracle")) {
			String connectURL = "jdbc:oracle:thin:@" + host + ":" + port + ":" + dbName;
			try {
				Class.forName("oracle.jdbc.driver.OracleDriver");

				connection = DriverManager.getConnection(connectURL, dbUsername,dbPassword);

			} catch (ClassNotFoundException e) {
				sc.close();
				throw e;
			} catch (SQLException e) {
				sc.close();
				throw e;
			}finally {
				sc.close();
			}
		} else if (dbVendor.equalsIgnoreCase("DB2")) {
			String connectURL = "jdbc:db2://" + host + ":" + port + "/" + dbName;
			try {
				Class.forName("com.ibm.db2.jcc.DB2Driver");
				connection = DriverManager.getConnection(connectURL, dbUsername,dbPassword);
			} catch (ClassNotFoundException e) {
				sc.close();
				throw e;
			} catch (SQLException e) {
				sc.close();
				throw e;
			}finally {
				sc.close();
			}
		} else if (dbVendor.equalsIgnoreCase("MSSQL")) {
			String connectURL = "jdbc:sqlserver://" + host + ":" + port + ";DatabaseName=" + dbUsername;
			try {
				Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");

				connection = DriverManager.getConnection(connectURL, dbUsername, dbPassword);
			} catch (ClassNotFoundException e) {
				sc.close();
				throw e;
			} catch (SQLException e) {
				sc.close();
				throw e;
			}finally {
				sc.close();
			}
		}
		return connection;
    }
}
