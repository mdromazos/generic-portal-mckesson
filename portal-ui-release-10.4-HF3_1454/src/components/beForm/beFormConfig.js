const BEFORM_CONFIG = {
    "DATA_TYPES": {
        "STRING": "String",
        "INTEGER": "Integer",
        "DECIMAL": "Decimal",
        "LOOKUP": "lookup",
        "IMAGE_URL": "ImageURL",
        "BOOLEAN": "Boolean",
        "DATE": "Date",
        "FILE_ATTACHMENT": "FileAttachment",
        "LOOKUP_FIELD": "Lookup",
        "HYPERLINKTEXT": "HyperlinkText",
    },
    "FIELD_TYPES": {
        "TEXT_BOX": "textField",
        "TEXT_AREA": "textArea",
        "CHECKBOX": "checkbox",
        "RADIO_BUTTON": "radioButton",
        "MULTI_SELECT_VIEW": "multiSelectView",
        "DYNAMIC_FIELD_VIEW": "dynamicFieldView",
        "DROPDOWN": "dropdown"
    },
    "ICONS":{
        "ALERT": process.env.PUBLIC_URL + "/icons/alert.svg"
    },
    "LOOKUP_LINKS": {
        "LIST": "list",
        "LOOKUP": "lookup"
    },
    "DATE_FORMAT": "DD/MM/YYYY",
    "VIEW_TYPE": {
        "CARD": "cardView",
        "GRID":"gridView"
    },
    "MODES": {
        "READ_EDIT": "READ_EDIT",
        "READ_ONLY": "READ_ONLY",
        "EDIT_ONLY": "EDIT_ONLY",
        "EDIT_READ": "EDIT_READ",
        "EDIT_AUTO_SAVE": "EDIT_AUTO_SAVE",
    },
    "OPERATIONS": {
        "READ": "read",
        "UPDATE": "update",
        "CREATE": "create",
        "DELETE": "delete",
        "VALIDATION": "validation"
    },
    "META_KEYS": {
        "OPERATIONS": "operations",
        "ALLOWED": "allowed"
    },
    "ONE_TO_MANY": {
        "ORIGINAL_COPY": "$originalObj",
        "ORIGINAL": "$original",
        "DATA_KEY": "OneToManyGroup",
        "ROW_ID_KEY": "rowidObject",
        "SWITCH_VIEW": "enableAlternateView",
        "SORT": {
            "ASCENDING": "ascending",
            "DESCENDING": "descending"
        },
        "GRID": {
            "PAGE_SIZE_LIST": [5, 10, 25, 50],
            "FILTER" : {
                "QUERY_SEPERATOR_1": "+and+",
                "QUERY_SEPERATOR_2":"+%3D+",
                "QUERY_SEPERATOR_3": "%27"
            },
            "DEFAULT_PAGE_SIZE": 5    
        }
    },
    "SCROLL_TYPE" : {
        "SMOOTH" : "smooth"
    }
};
export { BEFORM_CONFIG as default }
