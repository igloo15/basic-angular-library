const { gitDescribeSync } = require('git-describe');
const writePkg = require('write-pkg');
const readPkg = require('read-pkg');

const gitInfo = gitDescribeSync(__dirname+"/..");
const pkg = readPkg.sync();

let version = gitInfo.semver.version;
let dateString = `${new Date().toDateString()}`;

if(gitInfo.distance > 0) {
    version = gitInfo.semver.major+"."+(gitInfo.semver.minor+1)+".0"+"-dev."+gitInfo.distance;
}
console.log(version);
console.log(dateString);

pkg.version = version;
pkg.date = dateString;

writePkg.sync(__dirname+"/..", pkg);
