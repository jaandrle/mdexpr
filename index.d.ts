import { Command } from "commander";
export { Option } from "commander";
import { join } from "path";

/** Represents the main cli interface */
export const cli: Command;
/** Represents the `files` sub-command, which parses the `*.md` files. */
export const cli_mdexpr: Command;

type ast= Record<"mdexpr"|string, Record<string, any>[]>;
export function mdexpr(files_path: string): ast;

/** Returns options for given library (identified by `use` url – see `mdexpr` syntax `{use [library-alias](library-use) with …options… mdexpr}$`). */
export function useOptions(use: string, file: string, ast: ast): Record<string, any>;

/** Returns parsed JSON from file by given path (arguments for {@link join}). */
export function readJSONFileSync(...path: string[]): Record<string, any>;
