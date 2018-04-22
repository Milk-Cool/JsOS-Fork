const get = require("./get");

class GitLab {
	constructor(author) {
		this.author = author || "JsOS";
	}

	api(path) {
		return get("https://gitlab.com/api/v3/" + path)
			.then(JSON.parse);
	}


	readDir(path, commit) {
		return this.api(`projects/${this.author}%2FNPI-pkg/repository/tree/?ref_name=${commit}&path=${path}`)
			.then(files => {
				if(files.message == "404 Tree Not Found") {
					throw new Error("No ref " + commit);
				}

				if(!Array.isArray(files)) {
					throw new Error(path + " is not a directory");
				}

				for(const file of files) {
					file.sha = file.id;
				}
				return files;
			});
	}
	readDirRecursively(path, commit) {
		return this.api(`projects/${this.author}%2FNPI-pkg/repository/tree/?path=${path}&recursive=true&ref_name=${commit}`);
	}
	readFilePages(path, commit) {
		return get(`https://${this.author.toLowerCase()}.gitlab.io/NPI-pkg/${path}`);
	}
};

module.exports = GitLab;