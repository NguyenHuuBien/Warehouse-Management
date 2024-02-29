import { convertNameSearch } from "./convert.js"

export const searchNameCode = (q) => {
    let conditions = {}
    const nameSearch = convertNameSearch(q)
    conditions["$or"] = [
        {
            name_search: {
                $regex: '.*' + nameSearch + '.*'
            }

        },
        {
            code: {
                $regex: ".*" + q.toUpperCase() + '.*'
            }
        },
        {
            roles: {
                $regex: ".*" + q.toLowerCase() + ".*"
            }
        }
    ]
    return conditions
}