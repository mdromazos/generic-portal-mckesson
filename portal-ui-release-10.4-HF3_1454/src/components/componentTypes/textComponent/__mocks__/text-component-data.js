const component_data = {
    body: "Body of the component",
    componentType: "TextComponent",
    customHeight: "200",
    displayHeight: "CUSTOM",
    heading: "Heading of Component",
    title: "Text"
};

const data__without__heading__and___body  = {
    ...component_data,
    heading : null, 
    body:null 
};

export {component_data, data__without__heading__and___body};