const get = require("./get");

class GitLab {
	constructor() {
	}

	api(path) {
		return get("https://gitlab.com/api/v3/" + path)
			.then(JSON.parse);
	}


	readDir(path) {
		return this.api(`projects/JsOS%2FNPI-pkg/repository/tree/?path=${path}`)
			.then(files => {
				if(!Array.isArray(files)) {
					throw new Error(path + " is not a directory");
				}

				for(const file of files) {
					file.sha = file.id;
				}
				return files;
			});
	}
	readDirRecursively(path) {
		return this.api(`projects/JsOS%2FNPI-pkg/repository/tree/?path=${path}&recursive=true`);
	}
	readFilePages(path) {
		return get("https://jsos.gitlab.io/NPI-pkg/" + path);
	}
};

module.exports = GitLab;