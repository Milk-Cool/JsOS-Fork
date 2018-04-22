const get = require("./get");

class GitHub {
	constructor(author) {
		this.author = author || "JsOS-Team";
	}

	api(path) {
		return get("https://api.github.com/" + path)
			.then(JSON.parse)
			.then(res => {
				if(typeof res.message === "string") {
					if(res.message.indexOf("rate limit") > -1) {
						throw new Error("GitHub API rate limit exceeded");
					}
					throw new Error(res.message);
				}

				return res;
			});
	}


	readDir(path, commit) {
		if(commit === "pages") {
			commit = "master";
		}

		return this.api(`repos/${this.author}/NPI-pkg/contents/${path}?ref=${commit}`)
			.then(files => {
				if(!Array.isArray(files)) {
					throw new Error(path + " is not a directory");
				} else {
					return files;
				}
			});
	}
	readModule(path, commit) {
		if(commit === "pages") {
			commit = "master";
		}

		return this.api(`repos/${this.author}/NPI-pkg/contents/${path}?ref=${commit}`)
			.then(module => {
				if(module.type !== "submodule") {
					throw new Error(path + " is not a module");
				} else {
					return module;
				}
			});
	}
	readTree(sha) {
		return this.api(`repos/${this.author}/NPI-pkg/git/trees/${sha}?recursive=1`);
	}

	readFileRaw(path, commit) {
		if(commit === "pages") {
			return this.readFilePages(path);
		}

		return get(`https://raw.githubusercontent.com/${this.author}/NPI-pkg/${commit}/${path}`);
	}
	readFilePages(path) {
		return get(`https://${this.author.toLowerCase()}.github.io/NPI-pkg/${path}`);
	}
};

module.exports = GitHub;