package com.infomatica.mdm.portal.util;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class AddApplicationUserUtil {

	public static void addAppUsers(String sipHome,Connection connection, String user) throws Exception {
        List<String> existingUsers = getExistingUsers(connection);
        System.out.println("Existing Users: " + existingUsers);
        
        
            if(existingUsers.contains(user)){
                System.out.println("Updating application user [" + user + "]");
                updateAppUser(sipHome,user, connection);
            }else{
                System.out.println("Creating new application user [" + user + "]");
                addAppUsers(sipHome,user, connection);
            }
        }
    
	
	private static void updateAppUser(String sipHome,String user, Connection connection) throws Exception {
        PreparedStatement stmt = null;
        String sql = "UPDATE C_REPOS_USER "
                + "SET CERTIFICATE_FILE = ? "
                + "WHERE USER_NAME = ?";
        try {
            stmt = connection.prepareStatement(sql);
            byte[] certificateContent = getCertificateContent(sipHome,user);
            stmt.setBinaryStream(1, new ByteArrayInputStream(certificateContent), certificateContent.length);
            stmt.setString(2,user);
            stmt.execute();
        } catch (SQLException | IOException e) {
            e.printStackTrace();
            throw e;
        }finally {
            try {
                if(stmt!=null){
                    stmt.close();
                }
            } catch (SQLException e) {
                throw e;
            }
        }
    }
	
	private static byte[] getCertificateContent(String sipHome,String user) throws FileNotFoundException, IOException {
        File certificate = new File(sipHome + File.separator + "resources" + File.separator + "certificates" + File.separator + "certificate_"+user+".cert");
        if(!certificate.exists()){
            System.err.println("Certificate file ["+certificate.getAbsolutePath()+"] for user ["+ user +"] is missing.");
            return new byte[0];
        }
        return readFileToByteArray(certificate);
    }
	
	private static byte[] readFileToByteArray(File file){
        FileInputStream fis = null;
        byte[] bArray = new byte[(int) file.length()];
        try{
            fis = new FileInputStream(file);
            fis.read(bArray);
            fis.close();        
            
        }catch(IOException ioExp){
            ioExp.printStackTrace();
        }
        return bArray;
    }
	
	private static void addAppUsers(String sipHome,String user, Connection connection) throws Exception {
        PreparedStatement stmt = null;
        String sql = "INSERT INTO C_REPOS_USER "
                + "(ROWID_USER, USER_NAME, GROUP_IND, FULL_NAME, PASS_MIN_LENGTH, USER_DB, CERTIFICATE_FILE, APPLICATION_IND) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try {
            stmt = connection.prepareStatement(sql);
                stmt.setString(1,user);
                stmt.setString(2,user);
                stmt.setInt(3,3);
                stmt.setString(4,user);
                stmt.setInt(5,0);
                stmt.setString(6, "CMX_SYSTEM");

                byte[] certificateContent = getCertificateContent(sipHome,user);
                stmt.setBinaryStream(7, new ByteArrayInputStream(certificateContent), certificateContent.length);
                
                stmt.setInt(8,1);
                stmt.execute();
        } catch (SQLException | IOException e) {
            e.printStackTrace();
            throw e;
        }finally {
            try {
                if(stmt!=null){
                    stmt.close();
                }
            } catch (SQLException e) {
                throw e;
            }
        }
    }
	
	private static List<String> getExistingUsers(Connection connection) throws SQLException{
        List<String> users = new ArrayList<>();
        Statement stmt = null;
        try {
            stmt = connection.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT USER_NAME FROM C_REPOS_USER");
            while(rs.next()){
                users.add(rs.getString("USER_NAME"));
            }
            rs.close();

        } catch (SQLException e) {
            throw e;
        }finally{
            try {
                if(stmt!=null){
                    stmt.close();
                }
            } catch (SQLException e) {
                throw e;
            }
        }
        return users;
    }
}
