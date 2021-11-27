import semver from 'semver'

export const getLatest = versions => sortVersions(versions)[0]

export const sortVersions = versions => versions.map(x => x.version).sort(semver.rcompare)
