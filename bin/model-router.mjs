#!/usr/bin/env node
import { route, LEVELS } from '../lib/route.mjs';

function printHelp() {
  console.log(`model-router

A decision aid, not an authority: given a task's data sensitivity and
complexity, recommends a model tier and the controls that come with it.
A human still owns the call.

Usage:
  model-router --sensitivity <low|medium|high> --complexity <low|medium|high> [--json] [--help]

Also accepts --sensitivity=<value> / --complexity=<value>.

Options:
  --sensitivity   How sensitive the data touching this task is
  --complexity    How complex the task itself is
  --json          Print the result as JSON instead of text
  --help          Show this message
`);
}

function parseArgs(argv) {
  const args = { sensitivity: null, complexity: null, json: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    let token = argv[i];
    let inlineValue = null;
    const eq = token.indexOf('=');
    if (token.startsWith('--') && eq !== -1) {
      inlineValue = token.slice(eq + 1);
      token = token.slice(0, eq);
    }

    if (token === '--sensitivity' || token === '--complexity') {
      let value = inlineValue;
      if (value === null) {
        const next = argv[i + 1];
        if (!next || next.startsWith('-')) {
          console.error(`${token} requires a value (${LEVELS.join('|')})`);
          process.exit(1);
        }
        value = next;
        i += 1;
      }
      args[token.slice(2)] = value;
    } else if (token === '--json') {
      args.json = true;
    } else if (token === '--help' || token === '-h') {
      args.help = true;
    } else {
      console.error(`Unknown option: ${token}\nRun with --help for usage.`);
      process.exit(1);
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.sensitivity || !args.complexity) {
    console.error('Both --sensitivity and --complexity are required.\n');
    printHelp();
    process.exit(1);
  }

  let result;
  try {
    result = route({ sensitivity: args.sensitivity, complexity: args.complexity });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Recommended tier: ${result.tier}`);
  console.log(`Why: ${result.why}`);
  console.log('Required controls:');
  for (const c of result.controls) {
    console.log(`  - ${c}`);
  }
  if (result.sensitivityCappedTier) {
    console.log(
      `\n(Sensitivity capped this below what complexity alone would justify - the whole point of asking both questions.)`,
    );
  }
}

main();
