const client = require('../services/db');


const getFetchedRepos = async() => {
    try {
        const fetchedRepos = await client.query(
            `SELECT * FROM fetched_repositories`
        )
        return fetchedRepos.rows
    } catch (error) {
        throw new Error(error.message)
    }
}


module.exports = {getFetchedRepos}