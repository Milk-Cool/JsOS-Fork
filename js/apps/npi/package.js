const GitHub = require("./github");
const GitLab = require("./gitlab");

class Package {
	constructor(name, version="latest", backend="github", backendAuthor=null) {
		this.name = name;
		this.version = version;
		this.installationStopped = false;

		if(version === "latest") {
			this.commit = "master";
		} else if(this.isSha(version)) {
			this.commit = version;
		} else {
			if(version[0] === "v" && !isNaN(parseInt(version[1]))) {
				version = version.substr(1);
			}
			this.commit = this.name + "--" + version;
		}

		this.backend = backend;
		this.github = new GitHub(backendAuthor);
		this.gitlab = new GitLab(backendAuthor);
	}

	isSha(version) {
		return (
			version.length === 40 && // Exactly 40 characters, and
			Array.from(version.toLowerCase()).every(c => { // each character
				return "0123456789abcdef".indexOf(c) > -1; // is a hex digit
			})
		);
	}

	getInfo() {
		let info = {
			name: this.name
		};
		let pkg;

		return Promise.resolve()
			.then(() => {
				// Get package
				if(this.backend === "github") {
					return this.github.readDir("packages", this.commit);
				} else if(this.backend === "gitlab") {
					return this.gitlab.readDir("packages", this.commit);
				}
			})
			.then(packages => {
				pkg = packages.find(file => file.name === this.name);
				if(!pkg) {
					throw new Error("Package not found");
				}

				if(this.backend === "github") {
					info.url = pkg.html_url;
				} else if(this.backend === "gitlab") {
					info.url = `https://gitlab.com/JsOS/NPI-pkg/tree/${this.commit}/packages/${this.name}`;
				}

				info.sha = pkg.sha;

				info.module = null;
				if(this.backend === "github") {
					// Get module
					return this.github.readModule(`packages/${this.name}`, this.commit)
						.then(module => {
							info.module = module.submodule_git_url;
						}, () => {
							info.module = null;
						});
				}
			})
			.then(() => {
				// Read files
				if(this.backend === "github") {
					return this.github.readTree(pkg.sha);
				} else if(this.backend === "gitlab") {
					return this.gitlab.readDirRecursively(`packages/${this.name}`, this.commit);
				}
			}).then(tree => {
				info.files = 0;
				info.size = this.backend === "github" ? 0 : null;
				(tree.tree || tree).forEach(file => {
					if(file.type === "blob") {
						info.files++;
						if(this.backend === "github") {
							info.size += file.size;
						}
					}
				});
			})
			.then(() => info);
	}

	install(io) {
		this.installationStopped = false;

		return Promise.resolve()
			.then(() => {
				if(this.backend === "github") {
					io.writeLine("Getting information");
					return this.getInfo();
				}
			})
			.then(info => {
				io.writeLine("Gathering package");
				if(this.backend === "github") {
					return this.github.readTree(info.sha, this.commit);
				} else if(this.backend === "gitlab") {
					return this.gitlab.readDirRecursively(`packages/${this.name}`, this.commit);
				}
			})
			.then(tree => {
				return Promise.all((tree.tree || tree).map(file => this.installFile(file, io)))
					.catch(e => {
						this.installationStopped = true;
						throw e;
					});
			})
			.then(() => {
				io.writeLine(`Installing package ${this.name}`);

				const app = require(`npi/${this.name}`);

				// Install application
				PERSISTENCE.Apps[this.name] = {
					run: app.call,
					commands: app.commands
				};

				// Create links
				for(const command of app.commands) {
					PERSISTENCE.Apps._commands[command] = this.name;
				}

				io.writeLine(`Installed package ${this.name}`);
			});
	}
	installFile(file, io) {
		if(file.type != "blob") {
			return;
		}

		io.writeLine("Downloading " + file.path);

		let backend = null;
		if(this.backend == "github") {
			backend = this.github;
		} else if(this.backend == "gitlab") {
			backend = this.gitlab;
		}

		return backend.readFileRaw(this.backend === "gitlab" ? file.path : `packages/${this.name}/${file.path}`, this.commit)
			.then(code => {
				if(this.installationStopped) {
					return;
				}

				let path = file.path;
				if(this.backend === "gitlab") {
					path = path.replace(/^packages\//, "");
				} else {
					path = `${this.name}/${path}`;
				}
				require.register(`/node_modules/npi/${path}`, code);
				io.writeLine("Installed " + file.path);
			});
	}
};

module.exports = Package;