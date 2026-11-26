#!/usr/bin/env node
/**
 * Thin orchestrator: package/push Neural X-Ray + rhyme standalones.
 *   --list    print slug/repo/suite
 *   --push    package then push to existing FractiAI/synthobs-* repos
 */
import { runRhymeStandalonePublish } from '../src/standalones/rhyme-publish.mjs';

process.exitCode = runRhymeStandalonePublish(process.argv.slice(2));
