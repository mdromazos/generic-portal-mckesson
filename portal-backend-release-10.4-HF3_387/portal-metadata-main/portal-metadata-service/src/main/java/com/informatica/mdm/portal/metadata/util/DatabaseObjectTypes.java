package com.informatica.mdm.portal.metadata.util;

import java.util.ArrayList;
import java.util.List;

public enum DatabaseObjectTypes {

	C_SOLUTIONS_PORTAL_CONFIG {
		@Override
		public List<DatabaseColumns> getObjectType() {
			List<DatabaseColumns> columnsTypes = new ArrayList<DatabaseColumns>();
			DatabaseColumns columnMetamodelVersion = new DatabaseColumns(DatabaseConstants.COLUMN_PORTAL_METAMODEL_VERSION, "String", 50);
			DatabaseColumns columnSSOConfiguration = new DatabaseColumns(DatabaseConstants.COLUMN_SSO_CONFIGURATION, "Blob", null);
			columnsTypes.add(columnMetamodelVersion);
			columnsTypes.add(columnSSOConfiguration);
			return columnsTypes;
		}
	},
	C_SOLUTIONS_PORTAL_CONFIG_TEMP {
		@Override
		public List<DatabaseColumns> getObjectType() {
			List<DatabaseColumns> columnsTypes = new ArrayList<DatabaseColumns>();
			DatabaseColumns columnType = new DatabaseColumns(DatabaseConstants.COLUMN_PORTAL_ID, "Number", 20);
			DatabaseColumns columnSSOConfiguration = new DatabaseColumns(DatabaseConstants.COLUMN_SSO_CONFIGURATION, "Blob", null);
			columnsTypes.add(columnType);
			columnsTypes.add(columnSSOConfiguration);
			return columnsTypes;
		}
	};

	public abstract List<DatabaseColumns> getObjectType();
}