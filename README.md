**WIP – currently under investigation!**

# mdexpr
Use extended markdown syntax to simulate `org-agenda` from emacs.

This repository represents a syntax extension for
**markdown** documents inspired by [Org mode for Emacs](https://orgmode.org/).
In particular, it is about:

1. to provide syntax specification and documentation
1. to provide utilities for developers to create libraries working with `mdexpr`.
1. to provide list of well-known libraries

## Motivation
The main goal of the `mdexpr` is not to replace the Org mode/filetype.
But it can be useful to bring some features (e.g.
[Org-Agenda](http://www.cachestocaches.com/2016/9/my-workflow-org-agenda/)) into markdown documents.
This is because, for example, `README.md` documents are already used on GitHub.

## Syntax Overview
The idea is that the markdown document should be readable primarily by people, therefore:

1. Syntax should be as minimal as possible and use already existing markdown syntax as much as possible.
1. The reader should be able to find out the maximum amount of information “encoded” in the extended syntax.
1. Technical texts should by on the end of line/document.

The `mdexpr` syntax provide extension for block or line:
- block syntax:
```markdown
## 2dn level Headline
{… cmd}$

- list
- list
{… cmd}$
```
- inline syntax:
```
## 2dn level Headline {… cmd}$

- list
- list {… cmd}$
```

<details>
<summary>…these example are converted into `context {… cmd}$`:</summary>

- first example (block syntax)
	- context:
	```
	## 2dn level Headline
	```
	- command & arguments:
	```
	{… cmd}$
	```
- second example (block syntax)
	- context:
	```
	- list
	- list
	```
	- command & arguments:
	```
	{… cmd}$
	```
- third example (inline syntax)
	- context:
	```
	## 2dn level Headline
	```
	- command & arguments:
	```
	{… cmd}$
	```
- fourth example (inline syntax)
	- context:
	```
	- list 
	```
	- command & arguments:
	```
	{… cmd}$
	```

</details>

Concrete code processing depends on used program/library.

## Syntax v0.5.x (currently)
Extended commands are located into `{… cmd}$`, where `cmd` refers to command name and `…` are arguments for this command.
Reserved command name is **mdexpr**, currently supporting:

- Use library syntax: `…1 {use [cmd](library-url) with …2}`:
	- *library-url* see library documentation
	- **cmd** is choosed alias used in another `{… cmd}$` processed by this library
	- *with* is optional part holding setting for library
	- *…1*: the *context* part is ignored in this case
	- This way, the regular user reading document can find out information in *library-url*, for example use:
	```markdown
	<details>
	<summary>`{… cmd}$` explanation</summary>

	This is [mdexpr](https://github.com/jaandrle/mdexpr) syntax. This document uses:
	- {use [agenda](https://github.com/jaandrle/mdexpr-agenda) with states=TODO,NEXT|DONE mdexpr}$

	</details>
	```
- Include (TBD): `{include […](another-md-file)}$`

Block syntax for now provide only line above `{… cmd}$`.

## Libraries
- [jaandrle/mdexpr-agenda: Use extended markdown syntax to simulate `org-agenda` from emacs.](https://github.com/jaandrle/mdexpr-agenda)

## Ideas
- check list progress
```markdown
## Headline {% todo}$
- [ ] todo
- [x] todo
- [x] todo
- [ ] todo
{todo}$
```
- code export
```markdown
\`\`\`\`javascript
console.log("A");
\`\`\`\`
{write}$

{use [write](library-url) with target=export_path mdexpr}$
```
