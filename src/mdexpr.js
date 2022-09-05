// ast ⇒ abstract syntax tree
import { program as cli } from "commander";
export { Option } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { astPerFile } from "./ast.js";
import glob from "glob";
const { push }= Array.prototype;

const [ pkg_name, ...pkg_root ]= process.argv[1].split("bin/").reverse();
const pkg= readJSONFileSync(...pkg_root, "lib", "node_modules", pkg_name, "package.json");
const syntax_version= pkg?.mdexpr?.version || "0.0";
const syntax_supported= Number(/\d+\.\d+/.exec(syntax_version)[0])<=0.6;
cli.name(pkg.name)
	.version(pkg.version+", syntax ("+(syntax_supported?"":"un")+"supported): "+syntax_version, "-v, --version")
	.description([
		"mdexpr-*",
		"\tThese commands works with markdown files with additional `mdexpr` syntax (see [1]).",
		pkg.name,
		"\t"+pkg.description
	].join("\n"))
	.addHelpText("after", [
		"",
		"Links:",
		"  [1] https://github.com/jaandrle/mdexpr-agenda"
	].join("\n"));

/** Main command ≡ processing markdown files. */
const cli_mdexpr= cli.command("files [file(s)]", { isDefault: true })
	.summary("[default] process markdown file(s).")
	.description("Process expressions in markdown file(s).");

export { cli, cli_mdexpr };

export function mdexpr(files_path){
	if(!syntax_supported) throw new Error(`Non-supported syntax version '${syntax_version}' requested. Contact program developer(s).`);
	if(!files_path || files_path===".") files_path= "./*.md";
	const ast_arr= [];
	const files= glob.sync(files_path);
	if(!files.length) throw new Error(`File(s) '${files_path}' not found.`);
	
	for(const file of files)
		push.call(ast_arr, astPerFile(file));
	const ast= ast_arr.reduce(function(out, curr){
		Object.keys(curr).forEach(function(key){
			if(!Reflect.has(out, key)) out[key]= [];
			push.apply(out[key], curr[key]);
		});
		return out;
	}, {});
	return ast;
}
export function useOptions(use, file, ast){
	const conf= (ast.mdexpr || []).find(({ args, file: file_c })=> args.indexOf("use")===0 && file_c===file && args.indexOf(use)!==-1);
	if(typeof conf === "undefined" || conf.args.indexOf("with")===-1)
		return {};
	return / with (.*)/.exec(conf.args)[1].split(" ")
		.reduce(function(acc, curr){
			Reflect.set(acc, ...curr.split("="));
			return acc;
		}, {});
}
export function readJSONFileSync(...path){
	path= path.length === 1 ? path[0].split("/") : path;
	return JSON.parse(readFileSync(join.apply(null, path)));
}

