require("../../node_modules/coren/shared/components/coren_backend")

module.exports = {
    "basics": {
        "brand": "Coren",
        "title": "Coren :: Schema and REST",
        "description": "Simple site management",
        "css": [
            "/css/base.css"
        ],
        "javascript": [
            "/vendor/jquery.js",
            "/js/main.js"
        ],
        "apps": {
            "coren_backendAppView": "node_modules/coren/shared/components/coren_backend"
        },
        "rootUrl": "http://127.0.0.1",
        "port": 2032,
        "fonts": [
            "http://fonts.googleapis.com/css?family=Roboto:100,300,400,500"
        ],
        "socketPort": 2250,
        "socketUrl": "/sockets",
        "useTemplates": true,
        "useServer": true,
        "useApps": true,
        "enableSockets": false
    },
    "coren": {
        "apiRoot": "/api",
        "loginUrl": "/login",
        "loginFailedUrl": "/login/failed",
        "loginRedirect": "/",
        "logoutUrl": "/logout",
        "useBackend": true,
        "undo": true,
        "authenticateURLs": false,
        "authenticateAPI": false,
        "dataTypes": {
            "checkbox": {
                "model": "checkboxFieldModel",
                "view": "checkboxFieldView",
                "editView": "checkboxEditView"
            },
            "count": {},
            "currency": {},
            "date": {},
            "dateTime": {},
            "duration": {},
            "entity": {},
            "entityType": {},
            "multiEntity": {},
            "multiEntityType": {},
            "float": {},
            "file": {},
            "id": {},
            "list": {},
            "number": {},
            "password": {},
            "percent": {},
            "pivot": {},
            "progress": {},
            "query": {},
            "json": {},
            "status": {},
            "text": {},
            "time": {},
            "image": {},
            "orderedListSelection": {},
            "array": {},
            "nestedEntities": {}
        }
    },
    "ui": {
        "doubleClickTimeout": 300,
        "clickThreshold": 10,
        "flickThreshold": 10,
        "defaultKeyNamespace": "app"
    }
}