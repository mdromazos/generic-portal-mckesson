package com.informatica.mdm.portal.metadata.util;

import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.StreamSupport;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.MissingNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.informatica.mdm.portal.metadata.exception.PortalConfigException;
import com.informatica.mdm.portal.metadata.exception.ResourceNotFoundException;

public class JsonUtil {
	
	private static Properties errorCodeProperties;

	private final static Logger log = LoggerFactory.getLogger(JsonUtil.class);
	
	public static Properties getErrorCodeProperties() {
		return errorCodeProperties;
	}

	public static void setErrorCodeProperties(Properties errorCodeProperties) {
		JsonUtil.errorCodeProperties = errorCodeProperties;
	}

	/*
	 Retrieve portal configuration based on the path filter and level(defines object heirarchy)
	 Perform a order by for List Objects 
	 */
	public static JsonNode getPortalConfigModelByPath(JsonNode portalConfigNode, List<String> path)
			throws PortalConfigException {
		
		log.info("Portal Config Get Portal path traversal for {} ", path);
		try {
			
			Iterator<String> pathIterator = path.iterator();
			while (pathIterator.hasNext()) {

				if (portalConfigNode.isMissingNode()) {
					throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
							errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
				}

				String childKey = pathIterator.next();

				portalConfigNode = portalConfigNode.path(childKey);

				if (portalConfigNode.isArray()) {

					if(pathIterator.hasNext()) {
						String childId = pathIterator.next();
						if (!StringUtils.isEmpty(childId)) {
							portalConfigNode = StreamSupport.stream(portalConfigNode.spliterator(), false).filter(
									child -> child.get(PortalMetadataContants.ID_ATTRIBUTE).asText().equals(childId))
									.findFirst().orElse(MissingNode.getInstance());
						}
					}
				}

			}
			
			return portalConfigNode;

		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Json traversal erro for path {} ", path);
			throw new PortalConfigException(ErrorCodeContants.CONFIG801,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG801), e.getMessage());
		}
	}
	
	/*
	 Retrieve portal configuration based on the depth specified(defines object heirarchy)
	 */
	public static JsonNode applyDepth(JsonNode valueNode, String key, Integer depth) {
		
		log.info("Portal Config Get Portal apply depth {} ", depth);
		ObjectMapper mapper = new ObjectMapper();
		AtomicInteger traverseLevel = new AtomicInteger(0);
		ObjectNode returnNode = mapper.createObjectNode();
		if(valueNode.isArray()) {
			ArrayNode arrayNode = mapper.createArrayNode();
			for (JsonNode jsonNode : valueNode) {
				traverseLevel = new AtomicInteger(0);
				if(jsonNode.isObject()) {
					returnNode = mapper.createObjectNode();
					arrayNode.add(modelWrapper(depth, returnNode, jsonNode, traverseLevel, mapper));
				} else {
					arrayNode.add(jsonNode);
				}
			}
			return arrayNode;
		}else if(valueNode.isContainerNode()) {
			modelWrapper(depth, returnNode, valueNode, traverseLevel, mapper);
		}else if(valueNode.isValueNode()) {
			((ObjectNode) returnNode).putPOJO(key, valueNode);
		}
		return returnNode;
	}
	
	/*
	 Perform a order by for List Objects 
	 */
	public static JsonNode applySort(JsonNode configNode, String orderBy, String sortOrder) {
		
		log.info("Portal Config Get Portal apply sort on attribute {} ", orderBy);
		ObjectMapper mapper = new ObjectMapper();
		
		if(!configNode.isEmpty(null) && null != configNode && !configNode.isMissingNode()) {
			
			if(!StringUtils.isEmpty(orderBy)) {
				
				if(!StringUtils.isEmpty(sortOrder) && PortalMetadataContants.SORT_ORDER_DESC.equalsIgnoreCase(sortOrder)) {
					
					Comparator<JsonNode> sortComparator = constructReverseComparator(configNode, orderBy, sortOrder);
					
					configNode = StreamSupport.stream(configNode.spliterator(), false)
							.filter(node -> null!= node.get(orderBy) && !node.get(orderBy).isEmpty(null) && !node.get(orderBy).isMissingNode())
							.sorted(sortComparator)
							.collect(mapper::createArrayNode, ArrayNode::add, ArrayNode::addAll);
					
				} else {
					
					Comparator<JsonNode> sortComparator = constructNaturalComparator(configNode, orderBy, sortOrder);
					configNode = StreamSupport.stream(configNode.spliterator(), false)
							.filter(node -> null!= node.get(orderBy) && !node.get(orderBy).isEmpty(null) && !node.get(orderBy).isMissingNode())
							.sorted(sortComparator)
							.collect(mapper::createArrayNode, ArrayNode::add, ArrayNode::addAll);
				}
				
			}
			
		}
		
		return configNode;
	}
	
	private static Comparator<JsonNode> constructNaturalComparator(JsonNode configNode, String orderBy, String sortOrder) {
		
		Comparator<JsonNode> sortComparator = null;
		JsonNode valueNode = ((ArrayNode) configNode).get(0).get(orderBy);
		if(!valueNode.isEmpty(null) && !valueNode.isMissingNode() && valueNode.isTextual()) {
			sortComparator = Comparator.comparing(node -> node
					.get(orderBy).asText(),
					Comparator.nullsFirst(Comparator.naturalOrder()));
		} else if(!valueNode.isEmpty(null) && !valueNode.isMissingNode() && valueNode.isNumber()) {
			sortComparator = Comparator.comparing(node -> node
					.get(orderBy).asLong(),
					Comparator.nullsFirst(Comparator.naturalOrder()));
		} else if(!valueNode.isEmpty(null) && !valueNode.isMissingNode() && valueNode.isBoolean()) {
			sortComparator = Comparator.comparing(node -> node
					.get(orderBy).asBoolean(),
					Comparator.nullsFirst(Comparator.naturalOrder()));
		}
		
		return sortComparator;
	}
	
	private static Comparator<JsonNode> constructReverseComparator(JsonNode configNode, String orderBy, String sortOrder) {
		
		Comparator<JsonNode> sortComparator = null;
		JsonNode valueNode = ((ArrayNode) configNode).get(0).get(orderBy);
		if(!valueNode.isEmpty(null) && !valueNode.isMissingNode() && valueNode.isTextual()) {
			sortComparator = Comparator.comparing(node -> node
					.get(orderBy).asText(),
					Comparator.nullsFirst(Comparator.reverseOrder()));
		} else if(!valueNode.isEmpty(null) && !valueNode.isMissingNode() && valueNode.isNumber()) {
			sortComparator = Comparator.comparing(node -> node
					.get(orderBy).asLong(),
					Comparator.nullsFirst(Comparator.reverseOrder()));
		} else if(!valueNode.isEmpty(null) && !valueNode.isMissingNode() && valueNode.isBoolean()) {
			sortComparator = Comparator.comparing(node -> node
					.get(orderBy).asBoolean(),
					Comparator.nullsFirst(Comparator.reverseOrder()));
		}
		
		return sortComparator;
	}
	
	/*
	 Recursive function to traverse the Portal configuration object based on the level specified
	 */
	private static JsonNode modelWrapper(Integer depth, JsonNode returnNode, JsonNode traverseNode, AtomicInteger traverseLevel, ObjectMapper mapper) {
		
		if(traverseLevel.get() < depth || depth == 0) {
			int initValue = traverseLevel.incrementAndGet();
			traverseNode.fields().forEachRemaining(node -> {
				
				traverseLevel.getAndSet(initValue);
				
				if(node.getValue().isArray()) {
					ArrayNode arrayNode = ((ObjectNode) returnNode).putArray(node.getKey());
					int value = traverseLevel.get();
					node.getValue().forEach(arrNode -> {
						traverseLevel.getAndSet(value);
						if(arrNode.isObject()) {
							JsonNode addNode = modelWrapper(depth, mapper.createObjectNode(), arrNode, traverseLevel, mapper);
							if(!addNode.isEmpty(null)) {
								arrayNode.add(addNode);
							}
						} else {
							if(traverseLevel.get() < depth || depth == 0) {
								arrayNode.add(arrNode);
							}
						}
					});
					if(arrayNode.size() == 0) {
						((ObjectNode) returnNode).remove(node.getKey());
					}
				}else if(node.getValue().isContainerNode()) {
					modelWrapper(depth, ((ObjectNode) returnNode).putObject(node.getKey()), node.getValue(), traverseLevel, mapper);
					if(((ObjectNode) returnNode).get(node.getKey()).isEmpty(null)) {
						((ObjectNode) returnNode).remove(node.getKey());
					}
				}else if(node.getValue().isValueNode()) {
					populateValueNode(returnNode, node.getKey(), node.getValue());
				}
				
			});
			return returnNode;
		}
		return returnNode;
	}
	
	private static void populateValueNode(JsonNode responseNode, String key, JsonNode value) {
		
		if(value.isTextual()) {
			((ObjectNode) responseNode).put(key, value.asText());
		}else if(value.isNumber()) {
			((ObjectNode) responseNode).put(key, value.asInt());
		}else if(value.isBoolean()) {
			((ObjectNode) responseNode).put(key, value.asBoolean());
		}else {
			((ObjectNode) responseNode).putPOJO(key, value);
		}
	}
	
	/*
	 Retrieve portal configuration based on the filter specified(defines object heirarchy)
	 Supports mutiple filters and multi-level filter
	 */
	public static JsonNode applyFilter(JsonNode configNode, JsonNode filterNode) throws ResourceNotFoundException {
		
		log.info("Portal Config Get Portal apply filter {} ", filterNode);
		ObjectMapper mapper = new ObjectMapper();
		ArrayNode filteredArray = mapper.createArrayNode();
		if(configNode.isArray()) {
			for(JsonNode arrNode:configNode) {
				if(filterByPredicate(arrNode, filterNode)) {
					filteredArray.add(arrNode);
				}
			}
		} else {
			log.error("Filter can be applied on Collections {}, with filterNode {}", configNode, filterNode);
			throw new ResourceNotFoundException(ErrorCodeContants.CONFIG716,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG716));
		}
		return filteredArray;
	}
	
	private static Boolean filterByPredicate(JsonNode configNode, JsonNode filterNode)
			throws ResourceNotFoundException {
		
		Boolean flag = false;
		Iterator<Entry<String, JsonNode>> fields = filterNode.fields();
		while (fields.hasNext()) {
			Entry<String, JsonNode> jsonPath = fields.next();
			if(jsonPath.getValue().isObject()) {
				if(configNode.isArray()) {
					for(JsonNode arrNode:configNode) {
						flag = filterByPredicate(arrNode.path(jsonPath.getKey()), jsonPath.getValue());
					}
				}else {
					flag = filterByPredicate(configNode.path(jsonPath.getKey()), jsonPath.getValue());
				}
			} else if(jsonPath.getValue().isValueNode() || jsonPath.getValue().isArray()) {
				if(applyFilter(configNode, jsonPath)) {
					flag = true;
				} else {
					flag = false;
				}
			}
			if(!flag) {
				break;
			}
		}
		return flag;
	}
	
	private static Boolean applyFilter(JsonNode configNode, Entry<String, JsonNode> jsonPath) {

		ObjectMapper mapper = new ObjectMapper();
		ArrayNode filterValues = mapper.createArrayNode();
		filterValues = jsonPath.getValue().isArray() ? filterValues.addAll((ArrayNode) jsonPath.getValue())
				: filterValues.add(jsonPath.getValue());
		Set<Object> acceptableValues = StreamSupport.stream(filterValues.spliterator(), false)
				.collect(Collectors.toSet());

		return applyPredicate(configNode, acceptableValues, jsonPath.getKey());
	}
	
	private static Boolean applyPredicate(JsonNode configNode, Set<Object> acceptableValues, String filterKey) {
		
		Boolean predicate = false;
		if(configNode.isArray()) {
			for(JsonNode arrNode:configNode) {
				predicate = apply(arrNode, acceptableValues, filterKey);
				if(predicate) {
					return predicate;
				}
			}
		}else {
			predicate = apply(configNode, acceptableValues, filterKey);
		}
		
		return predicate;
	}
	
	private static Boolean apply(JsonNode configNode, Set<Object> acceptableValues, String filterKey) {
		
		JsonNode filter = configNode.path(filterKey);
		if (filter.isArray()) {
			return StreamSupport.stream(filter.spliterator(), false).anyMatch(c -> acceptableValues.contains(c));
		} else if (filter.isValueNode()) {
			return acceptableValues.contains(filter);
		}
		return false;
	}

	/*
	 Retrieve portal configuration based on the projections/field selectors specified
	 */
	public static JsonNode applyProjections(JsonNode portalConfigNode, List<String> projections) {

		ObjectMapper mapper = new ObjectMapper();
		JsonNode projectedNodes = null;
		if (portalConfigNode.isArray()) {
			projectedNodes = mapper.createArrayNode();
			for (JsonNode arrNode : portalConfigNode) {
				ObjectNode objectNode = mapper.createObjectNode();
				((ArrayNode) projectedNodes).add(cascaseProjections(arrNode, projections, objectNode));
			}
		} else if (portalConfigNode.isObject()) {
			projectedNodes = mapper.createObjectNode();
			cascaseProjections(portalConfigNode, projections, ((ObjectNode) projectedNodes));
		} else if (portalConfigNode.isValueNode()) {
			projectedNodes = mapper.createObjectNode();
			projectedNodes = ((ObjectNode) portalConfigNode).deepCopy();
		}
		return projectedNodes;
	}

	private static JsonNode cascaseProjections(JsonNode existingNode, List<String> projections, ObjectNode objectNode) {

		for (String fieldSelector : projections) {
			JsonNode existingFieldNode = existingNode.get(fieldSelector);
			if (null != existingFieldNode && !existingFieldNode.isMissingNode()) {
				if (existingFieldNode.isArray()) {
					objectNode.putArray(fieldSelector).addAll((ArrayNode) existingFieldNode);
				} else if (existingFieldNode.isObject()) {
					ObjectNode selectedNode = objectNode.putObject(fieldSelector);
					selectedNode.setAll((ObjectNode) existingFieldNode);
				} else if (existingFieldNode.isValueNode()) {
					populateValueNode(objectNode, fieldSelector, existingFieldNode);
				}
			}
		}
		return objectNode;
	}

	public static JsonNode applyPagination(JsonNode portalConfigNode, Integer pageSize, Integer currentPage) throws ResourceNotFoundException {

		ObjectMapper mapper = new ObjectMapper();
		List<JsonNode> portals = StreamSupport.stream(portalConfigNode.spliterator(), false).collect(Collectors.toList());
		Map<Integer, List<JsonNode>> paginatedPortals = IntStream
				.range(0, (portals.size() + pageSize - 1) / pageSize).boxed()
				.collect(Collectors.toMap(i -> i + 1, i -> ((List<JsonNode>) portals).subList(i * pageSize,
						Math.min(pageSize * (i + 1), portals.size()))));
		if(null == paginatedPortals.get(currentPage)) {
			log.error("No data available for the requested pagination for currentPage {}, with pageSize {}", currentPage, pageSize);
			throw new ResourceNotFoundException(ErrorCodeContants.CONFIG727,
					errorCodeProperties.getProperty(ErrorCodeContants.CONFIG727), errorCodeProperties.getProperty(ErrorCodeContants.CONFIG727));
		}
		ArrayNode paginatedNode = paginatedPortals.get(currentPage).stream().collect(mapper::createArrayNode, ArrayNode::add, ArrayNode::addAll);
		return paginatedNode;
	}

}
