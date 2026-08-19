import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		// Generated output: the Vitest HTML coverage report and the SvelteKit build are
		// artefacts, not sources — linting them only produces noise.
		ignores: ['coverage/', 'build/', '.svelte-kit/', 'generated/']
	},
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',

			// An `_`-prefixed binding is the conventional way to say "this parameter is part
			// of the contract but deliberately unused here" (e.g. the Wakam stub, which keeps
			// the signature a real API call would need).
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'after-used',
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_'
				}
			],

			// The app is served from the domain root and declares no `base` path, so
			// resolve() would be an identity function on every link. Re-enable this rule
			// if the app ever moves under a sub-path.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		// Test doubles: a mock RequestEvent or a partial Prisma stub is deliberately loose,
		// and forcing the real types on them buys nothing the assertions do not already check.
		files: ['**/*.{test,spec}.{js,ts}'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	}
);
