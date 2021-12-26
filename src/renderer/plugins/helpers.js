import semver from 'semver'

/**
 *
 * @param {Array<KharonVersion>} versions
 * @return {string}
 */
export const getLatest = versions => sortVersions(versions)[0]

/**
 *
 * @param {Array<KharonVersion>} versions
 * @return {Array<string>}
 */
export const sortVersions = versions => versions.map(x => x.version).sort(semver.rcompare)
