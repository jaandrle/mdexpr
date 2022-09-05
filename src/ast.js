import { readFileSync } from "fs";
const reverseText= text=> text.split("").reverse().join("");

export function astPerFile(file){
	const ast_pre= { mdexpr: [] };
	const file_lines= readFileSync(file).toString().split("\n");
	const lines= file_lines.length + 1;
	let last, skip, block_end; // last to todo, skip when code block
	for(let line_i= lines; line_i > 0; line_i--){
		const line= file_lines[line_i];
		if(skip){
			if(line.indexOf("```")===0) skip= false;
			continue;
		}
		if(!last && !/\{[^\}]+ \w+\}\$$/.test(line)){
			if(line==="```") skip= true;
			continue;
		}
		let block_start_found= false;
		if(last && !block_end){
			block_start_found= / *(> |```|- \[[ x]\] )/g.exec(line) || [];
			block_start_found= block_start_found[1];
			if(block_start_found)
				block_end= new RegExp(block_start_found.indexOf("- [")===0 ? "^\t*- \\[[ x]\\] " : "^\t*"+block_start_found);
		}
		if(last && ( !block_end || isBlockContextEnd(block_end, line, block_start_found) )){
			line_i+= last[0].context.length;
			appendBlockContext(last, line, block_end);
			block_end= false;
			last= null;
			continue;
		} else if(last){
			appendBlockContext(last, line);
			continue;
		}

		const asts_line= astPerLine(file, line_i, line);
		if(!asts_line[0].context.length) last= asts_line;
		else asts_line.forEach(l=> l.line+= 1);
		asts_line.forEach(l=> {
			if(!Reflect.has(ast_pre, l.cmd)) ast_pre[l.cmd]= [];
			ast_pre[l.cmd].push(l);
			Reflect.deleteProperty(l, "cmd");
		});
	}
	const map= new Map([ [ "mdexpr", "mdexpr" ] ]);
	ast_pre.mdexpr
	.filter(({ args })=> args.indexOf("use")===0)
	.forEach(function({ args }){
		const [ _, name, use ]= /\[([^\]]+)\]\(([^\)]+)\)/.exec(args);
		map.set(name, use);
	});
	const ast= {};
	map.forEach((use, name)=> ast[use]= ast_pre[name]);
	return ast;
}
function isBlockContextEnd(block_end, line, block_found){
	if(block_found) return false;
	return !( block_end.test("```") ^ block_end.test(line) ); //bitwise XOR
}
function appendBlockContext(last, line, block_end){
	if(block_end && block_end.test("- [ ] "))
		return;
	last.forEach(l=> l.context.push(line));
}
function astPerLine(file, line_num, line_text){
	let out= { context: [], line: line_num, file };
	let out_code= [];
	let out_i= 0;
	let is_code, is_cmd; // is code/cmd part
	const line= line_text.split("").reverse();
	const { length }= line;
	for(let i= 0; i<length; i++){
		const ch= line[i];
		if(!is_code && ch==="$" && line[i+1]==="}"){
			is_code= true;
			i+= 1;
			continue;
		}
		if(!is_code){
			if(!out.context[0])
				out.context[0]= "";
			out.context[0]+= ch;
			continue;
		}
		if(!out_code[out_i]){
			out_code[out_i]= { cmd: ch, args: "" };
			is_cmd= true;
			continue;
		}
		if(ch==="{"){
			is_code= false;
			is_cmd= false;
			out_i+= 1;
			continue;
		}
		if(is_cmd && ch===" "){
			is_cmd= false;
			continue;
		}
		out_code[out_i][is_cmd ? "cmd" : "args"]+= ch;
	}
	if(out.context[0])
		out.context[0]= reverseText(out.context[0]);
	return out_code.map(d=> {
		d.cmd= reverseText(d.cmd);
		d.args= reverseText(d.args);
		return d;
	}).map(d=> Object.assign(d, out));
}
