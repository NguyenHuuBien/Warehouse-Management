import { convertNameSearch } from "./convert.js"

export const searchNameCode = (q) => {
    let conditions = {}
    if (q.roles || q.name || q.code || q.sku) {
        conditions["$and"] = [];
    }
    if (q.roles) {
        conditions["$and"].push({
            roles: {
                $regex: ".*" + q.roles.toLowerCase() + ".*"
            }
        });
    }
    if (q.name) {
        const nameSearch = convertNameSearch(q.name)
        conditions["$and"].push({
            name_search: {
                $regex: ".*" + nameSearch + ".*"
            }
        });
    }
    if (q.code) {
        conditions["$and"].push({
            code: {
                $regex: ".*" + q.code.toUpperCase() + '.*'
            }
        });
    }
    if (q.sku) {
        conditions["$and"].push({
            sku: {
                $regex: ".*" + q.sku.toUpperCase() + '.*'
            }
        });
    }
    return conditions
}