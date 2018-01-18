
module.exports = function queryStringify(object) {
    var queryString = "";
    var isFirst = true;
    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            var value = object[property];
            if (!isFirst) {
                queryString += "&";
            }
            queryString += encodeURIComponent(property) + "=";
            if (value !== null && typeof value !== "undefined") {
                queryString += encodeURIComponent(value);
            }
            isFirst = false;
        }
    }
    return queryString;
}