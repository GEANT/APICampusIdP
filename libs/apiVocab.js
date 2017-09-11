
const vocab = "http://geant.org/schema/campusidp/";

var context = {
    "@vocab": vocab,
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "ref": {
        "@type": "@id"
    },
    "confRef": {
        "@type": "@id"
    },
    "dependency": {
        "@type": "@id"
    },
    "exposed": {
        "@type": "xsd:boolean"
    },
    "apiVersion": "xsd:string"
};

var schema = {
    "@context": {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "xsd": "http://www.w3.org/2001/XMLSchema#"
    },
    "@graph" : [
        {
            "@id" : vocab+"autoGenerated",
            "@type": "rdfs:Class",
            "rdfs:comment": "If any property points to a node of this class then api server is signaled to generate value for the property.",
            "rdfs:label": "autoGenerated"
        },
        {
            "@id" : vocab+"ServiceDescription",
            "@type": "rdfs:Class",
            "rdfs:comment": "The main node Service configuration.",
            "rdfs:label": "ServiceDescription"
        },
        {
            "@id" : vocab+"WebServer",
            "@type": "rdfs:Class",
            "rdfs:comment": "WebServer frontend configuration.",
            "rdfs:label": "WebServer"
        },
        {
            "@id" : vocab+"IdPConf",
            "@type": "rdfs:Class",
            "rdfs:comment": "Identity Provider configuration.",
            "rdfs:label": "Identity Provider configuration"
        },
        {
            "@id" : vocab+"AttributeDefinition",
            "@type": "rdfs:Class",
            "rdfs:comment": "Definition of an attribute ex. attribute-resolver.",
            "rdfs:label": "Definition of an attribute"
        },
        {
            "@id" : vocab+"DataSource",
            "@type": "rdfs:Class",
            "rdfs:comment": "Definition of data source (Ldap, Database etc)",
            "rdfs:label": "Definition of data source"
        },
        {
            "@id" : vocab+"MetadataProvider",
            "@type": "rdfs:Class",
            "rdfs:comment": "MetadataProvider definition",
            "rdfs:label": "MetadataProvider definition"
        },
        {
            "@id" : vocab+"X509Certificate",
            "@type": "rdfs:Class",
            "rdfs:comment": "X509Certificate",
            "rdfs:label": "X509Certificate"
        },
        {
            "@id" : vocab+"hostname",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"WebServer"
                }
            ],
            "rdfs:comment": "Hostname.",
            "rdfs:label": "hostname"
        },
        {
            "@id" : vocab+"http",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"WebServer"
                }
            ],
            "rdfs:comment": "http",
            "rdfs:label": "http"
        },
        {
            "@id" : vocab+"attrID",
            "@type": "rdf:Property",
            "rdfs:comment": "attrID",
            "rdfs:label": "attrID"
        },
        {
            "@id" : vocab+"attrType",
            "@type": "rdf:Property",
            "rdfs:comment": "attrType",
            "rdfs:label": "attrType"
        },
        {
            "@id" : vocab+"https",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"WebServer"
                }
            ],
            "rdfs:comment": "https",
            "rdfs:label": "https"
        },
        {
            "@id" : vocab+"port",
            "@type": "rdf:Property",
            "rdfs:comment": "http(s) port",
            "rdfs:label": "http(s) port"
        },
        {
            "@id" : vocab+"privateKey",
            "@type": "rdf:Property",
            "rdfs:comment": "private Key",
            "rdfs:label": "private Key"
        },
        {
            "@id" : vocab+"privateKeyPassword",
            "@type": "rdf:Property",
            "rdfs:comment": "private Key Password",
            "rdfs:label": "private Key Password"
        },
        {
            "@id" : vocab+"publicKey",
            "@type": "rdf:Property",
            "rdfs:comment": "public Certificate",
            "rdfs:label": "public Certificate"
        },
        {
            "@id" : vocab+"software",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"IdPConf"
                },
                {
                    "@id" : vocab+"WebServer"
                },
                {
                    "@id" : vocab+"MetadataProvider"
                }
            ],
            "rdfs:comment": "information about software used by component",
            "rdfs:label": "information about software used by component"
        },
        {
            "@id" : vocab+"name",
            "@type": "rdf:Property",
            "rdfs:comment": "Name property. Can be used by any node",
            "rdfs:label": "name"
        },
        {
            "@id" : vocab+"version",
            "@type": "rdf:Property",
            "rdfs:comment": "version",
            "rdfs:label": "version"
        },
        {
            "@id" : vocab+"entityID",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"IdPConf"
                }
            ],
            "rdfs:comment": "entityID of Identity/Service Provider",
            "rdfs:label": "entityID of Identity/Service Provider"
        },
        {
            "@id" : vocab+"metadataProviders",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"IdPConf"
                }
            ],
            "rdfs:comment": "collection of metadataProviders",
            "rdfs:label": "collection of metadataProviders"
        },
        {
            "@id" : vocab+"idpsso",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"IdPConf"
                }
            ],
            "rdfs:comment": "idpsso",
            "rdfs:label": "idpsso"
        },
        {
            "@id" : vocab+"aa",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"IdPConf"
                }
            ],
            "rdfs:comment": "aa",
            "rdfs:label": "aa"
        },
        {
            "@id" : vocab+"url",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"MetadataProvider"
                }
            ],
            "rdfs:comment": "URL ",
            "rdfs:label": "URL"
        },
        {
            "@id" : vocab+"ref",
            "@type": "rdf:Property",
            "rdfs:comment": "reference to other node",
            "rdfs:label": "ref"
        },
        {
            "@id" : vocab+"dependency",
            "@type": "rdf:Property",
            "rdfs:comment": "dependecy on other node",
            "rdfs:label": "dependency"
        },
        {
            "@id" : vocab+"certificates",
            "@type": "rdf:Property",
            "http://schema.org/domainIncludes" : [
                {
                    "@id" : vocab+"sso"
                },
                {
                    "@id" : vocab+"aa"
                }
            ],
            "rdfs:comment": "certificate collection",
            "rdfs:label": "certificates"
        },
        {
            "@id" : vocab+"use",
            "@type": "rdf:Property",
            "rdfs:comment": "use",
            "rdfs:label": "use"
        },
        {
            "@id" : vocab+"components",
            "@type": "rdf:Property",
            "rdfs:comment": "components : usually collection of config elements",
            "rdfs:label": "components"
        },
        {
            "@id" : vocab+"baseDN",
            "@type": "rdf:Property",
            "rdfs:comment": "base DN LDAP",
            "rdfs:label": "baseDN"
        },
        {
            "@id" : vocab+"authnUser",
            "@type": "rdf:Property",
            "rdfs:comment": "username used for authentication to resources",
            "rdfs:label": "authnUser"
        },
        {
            "@id" : vocab+"password",
            "@type": "rdf:Property",
            "rdfs:comment": "password used for authentication to resources",
            "rdfs:label": "password"
        }

    ]
}


module.exports.context = context;
module.exports.schema = schema;