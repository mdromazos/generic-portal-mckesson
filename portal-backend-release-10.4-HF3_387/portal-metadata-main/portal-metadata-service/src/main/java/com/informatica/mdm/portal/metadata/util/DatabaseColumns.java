package com.informatica.mdm.portal.metadata.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class DatabaseColumns {

	private String columnName;
	private String columnType;
	private Integer columnSize;

	public DatabaseColumns(String columnName, String columnType, Integer columnSize) {
		
		this.columnName = columnName;
		this.columnType = columnType;
		this.columnSize = columnSize;
	}

	public String getColumnName() {
		return columnName;
	}

	public void setColumnName(String columnName) {
		this.columnName = columnName;
	}

	public String getColumnType() {
		return columnType;
	}

	public void setColumnType(String columnType) {
		this.columnType = columnType;
	}

	public Integer getColumnSize() {
		return columnSize;
	}

	public void setColumnSize(Integer columnSize) {
		this.columnSize = columnSize;
	}

	@Override
	public int hashCode() {
		return Objects.hash(columnName, columnType, columnSize);
	}

	@Override
	public boolean equals(Object obj) {

		if (this == obj)
			return true;
		if (obj == null || getClass() != obj.getClass())
			return false;
		DatabaseColumns that = (DatabaseColumns) obj;
		return Objects.equals(this.columnName, that.columnName)
				&& Objects.equals(this.columnType, that.columnType)
				&& Objects.equals(this.columnSize, that.columnSize);
	}
	
	public static List<DatabaseColumns> getAddColumns(List<DatabaseColumns> dbFields, List<DatabaseColumns> actualFields) {

		List<DatabaseColumns> addColumns = new ArrayList<DatabaseColumns>();
		if (dbFields == actualFields)
			return addColumns;

		for(DatabaseColumns actualField : actualFields) {
			boolean flag = false;
			for(DatabaseColumns dbField : dbFields) {
				if(actualField.getColumnName().equals(dbField.getColumnName())) {
					flag = true;
					break;
				}
			}
			if(!flag) {
				addColumns.add(actualField);
			}
		}
		return addColumns;
	}
}
