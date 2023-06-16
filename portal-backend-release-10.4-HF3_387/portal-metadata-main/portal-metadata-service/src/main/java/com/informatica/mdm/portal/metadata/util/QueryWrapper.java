package com.informatica.mdm.portal.metadata.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QueryWrapper {

	private String dbType;
	private String queryType;
	private String tableName;
	private String intialQuery;
	private List<String> projections;
	private List<QueryComponent> filter;
	private List<QueryComponent> setClause;
	private List<QueryComponent> sortFields;

	public String getDbType() {
		return dbType;
	}

	public void setDbType(String dbType) {
		this.dbType = dbType;
	}

	public String getQueryType() {
		return queryType;
	}

	public void setQueryType(String queryType) {
		this.queryType = queryType;
	}

	public String getTableName() {
		return tableName;
	}

	public void setTableName(String tableName) {
		this.tableName = tableName;
	}

	public String getIntialQuery() {
		return intialQuery;
	}

	public void setIntialQuery(String intialQuery) {
		this.intialQuery = intialQuery;
	}

	public List<String> getProjections() {
		if (null == this.projections) {
			this.projections = new ArrayList<String>();
		}
		return projections;
	}

	public void setProjections(List<String> projections) {
		this.projections = projections;
	}

	public List<QueryComponent> getFilter() {
		if (null == this.filter) {
			this.filter = new ArrayList<QueryComponent>();
		}
		return filter;
	}

	public void setFilter(List<QueryComponent> filter) {
		this.filter = filter;
	}

	public List<QueryComponent> getSetClause() {
		if (null == this.setClause) {
			this.setClause = new ArrayList<QueryComponent>();
		}
		return setClause;
	}

	public void setSetClause(List<QueryComponent> setClause) {
		this.setClause = setClause;
	}

	public List<QueryComponent> getSortFields() {
		if (null == this.sortFields) {
			this.sortFields = new ArrayList<QueryComponent>();
		}
		return sortFields;
	}

	public void setSortFields(List<QueryComponent> sortFields) {
		this.sortFields = sortFields;
	}

	public static String applyProjections(QueryWrapper queryWrapper) {

		List<String> projections = queryWrapper.getProjections();
		String query = String.join(", ", projections);

		return query.toString();
	}

	public static String applyFilter(QueryWrapper queryWrapper) {

		StringBuilder query = new StringBuilder();
		List<QueryComponent> filter = queryWrapper.getFilter();
		if (null != filter && !filter.isEmpty()) {
			query = query.append(DatabaseConstants.WHERE_LITERAL);
			int predicateIndex = 0;
			for (QueryComponent predicateField : filter) {
				query.append(predicateField.getKey());
				if (null == predicateField.getOperator()) {
					query.append(DatabaseConstants.SELECT_EQUALS_OPERATOR);
				} else if (DatabaseConstants.NEGATION_LITERAL.equalsIgnoreCase(predicateField.getOperator())) {
					query.append(DatabaseConstants.SELECT_NEGATION_OPERATOR);
				}
				if (predicateIndex < filter.size() - 1) {
					query.append(DatabaseConstants.AND_LITERAL);
				}
				predicateIndex++;
			}
		}
		return query.toString();
	}

	public static Map<String, String> applySetter(QueryWrapper queryWrapper) {

		StringBuilder query = new StringBuilder();
		StringBuilder params = new StringBuilder();
		List<QueryComponent> setter = queryWrapper.getSetClause();
		Map<String, String> queryParams = new HashMap<String, String>();
		if (null != setter && !setter.isEmpty()) {
			int predicateIndex = 0;
			for (QueryComponent setterField : setter) {
				query.append(setterField.getKey());
				if (DatabaseConstants.UPDATE_QUERY_TYPE.equalsIgnoreCase(queryWrapper.getQueryType())) {
					query.append(DatabaseConstants.SELECT_EQUALS_OPERATOR);
				}
				params.append(DatabaseConstants.QUOTATION_OPERATOR);
				if (predicateIndex < setter.size() - 1) {
					query.append(", ");
					params.append(", ");
				}
				predicateIndex++;
			}
		}
		queryParams.put(DatabaseConstants.SETTER_QUERY_KEY, query.toString());
		queryParams.put(DatabaseConstants.SETTER_QUERY_PARAM, params.toString());
		return queryParams;
	}

	public static String applySort(QueryWrapper queryWrapper) {

		StringBuilder query = new StringBuilder();
		List<QueryComponent> sortAttributes = queryWrapper.getSortFields();
		int sortIndex = 0;
		if (null != sortAttributes && !sortAttributes.isEmpty()) {
			query.append(DatabaseConstants.ORDER_BY_LITERAL);
			for (QueryComponent sortAttribute : sortAttributes) {
				query.append(sortAttribute.getKey());
				query.append(" ");
				query.append(sortAttribute.getValue());

				if (sortIndex < sortAttributes.size() - 1) {
					query.append(", ");
				}
			}
		}
		return query.toString();
	}
	
}
