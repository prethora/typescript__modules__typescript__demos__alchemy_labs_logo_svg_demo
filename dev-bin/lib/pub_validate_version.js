const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function run()
{
	const pkg = require("../../package.json");
	const version = pkg.version;	

	if ((!version) || (!/^\d+\.\d+\.\d+$/.test(version)))
	{
		console.log(`fatal: '${version}' is not a valid semver version`);
		process.exit(1);		
	}

	const tag = `v${version}`;

	const { stdout, stderr } = await exec("git tag");
	const existingTags = stdout.split("\n").filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag));
	if (existingTags.indexOf(tag)!=-1)
	{
		console.log(`fatal: tag '${tag}' already exists`);
		process.exit(1);
	}
	existingTags.push(tag);
	existingTags.sort((a,b) => 
	{
		const resa = /^v(\d+)\.(\d+)\.(\d+)$/.exec(a);
		const resb = /^v(\d+)\.(\d+)\.(\d+)$/.exec(b);
		const resa1 = parseInt(resa[1]);
		const resa2 = parseInt(resa[2]);
		const resa3 = parseInt(resa[3]);
		const resb1 = parseInt(resb[1]);
		const resb2 = parseInt(resb[2]);
		const resb3 = parseInt(resb[3]);
		if (resa1<resb1) return -1;
		if (resa1>resb1) return 1;
		if (resa2<resb2) return -1;
		if (resa2>resb2) return 1;
		if (resa3<resb3) return -1;
		if (resa3>resb3) return 1;
		return 0
	});
	if (existingTags[existingTags.length-1]!=tag)
	{
		console.log(`fatal: version '${version}' is not greater than at least one existing released version`);
		process.exit(1);		
	}
}

run();


