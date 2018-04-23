// JsOS/NPI
// By Ivanq

'use strict';

const Package = require("./package");
let backend = "gitlab";
let backendAuthor = "JsOS";

function main(args, api, res) {
	const io = api.stdio;

	args = args.split(/\s+/);
	let cmd = args.shift();

	switch(cmd) {
		case "":
		case "help": {
			switch (args[0]) {
				case "f":
				case "info":
					io.setColor("yellow");
					io.writeLine("JsOS/NPI - No Problem Installer");
					io.writeLine("info <pkg>              Show info about <pkg> package");
					io.writeLine("f <pkg>                 <alias>");
					break;

				case "i":
				case "install":
					io.setColor("yellow");
					io.writeLine("JsOS/NPI - No Problem Installer");
					io.writeLine("install <pkg>           Install <pkg> package");
					io.writeLine("install <pkg>@<commit>  Install <pkg> package from commit in NPI-pkg");
					io.writeLine("install <pkg>@<version> Install <pkg> package by version");
					io.writeLine("i <pkg>                 <alias>");
					break;

				case "backend":
					io.setColor("yellow");
					io.writeLine("JsOS/NPI - No Problem Installer");
					io.writeLine("backend gitlab          Use GitLab API to get packages");
					io.writeLine("backend github          Use GitHub API to get packages");
					io.writeLine("backend github:<author> Use https://github.com/<author>/NPI-pkg repository");
					break;

				default:
					io.setColor("yellow");
					io.writeLine("JsOS/NPI - No Problem Installer");
					io.writeLine("Commands:");
					io.writeLine("help                    Show command or subcommand help");
					io.writeLine("info                    Show package info");
					io.writeLine("install                 Install package");
					io.writeLine("backend                 Set backend");
					break;
			}

			return res(0);
		}

		case "f":
		case "info": {
			if(!args[0]) {
				io.setColor("red");
				io.writeLine("npi info: choose some package");
				return res(1);
			}

			const name = args[0].split("@")[0];
			const version = args[0].split("@")[1] || "latest";

			const pkg = new Package(name, version, backend, backendAuthor);
			pkg.getInfo()
				.then(info => {
					io.setColor("white");
					for(const key of Object.keys(info)) {
						let value = info[key];
						if(value === null) {
							value = "<null>";
						}

						io.writeLine(key + " ".repeat(10 - key.length) + value);
					}
					res(0);
				}, e => {
					io.writeError(e.message);
					res(1);
				});

			break;
		}

		case "i":
		case "install": {
			if(!args[0]) {
				io.setColor("red");
				io.writeLine("npi install: choose some package");
				return res(1);
			}

			const name = args[0].split("@")[0];
			const version = args[0].split("@")[1] || "latest";

			const pkg = new Package(name, version, backend, backendAuthor);
			pkg.install({
				write: io.writeLine.bind(io)
			})
				.then(
					() => res(0),
					e => {
						io.writeError(e);
						res(1);
					}
				);

			break;
		}

		case "backend": {
			const name = args[0].split(":")[0];

			if(name !== "github" && name !== "gitlab") {
				io.setColor("red");
				io.writeLine("npi backend: choose github or gitlab");
				return res(1);
			}


			backend = name;
			backendAuthor = args[0].split(":")[1];
			io.writeLine("Backend set to " + args[0]);
			res(0);
			break;
		}

		default: {
			io.setColor("red");
			io.writeLine("Unknown command");
			return res(1);
		}
	}
}

exports.call = (cmd, args, api, res) => main(args, api, res);

exports.commands = ["npi"];