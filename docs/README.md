# ozka.js documentation

ozka.js is an independent ESM Discord library for Node.js 22+. Start with native components, add an optional image renderer when you need visual freedom, and route real Discord interactions through the same client.

Current published release: [`0.1.0-alpha.1`](https://www.npmjs.com/package/ozka.js). This is an alpha; read the [implementation limits](STATUS.md) before selecting it for production.

## Start here

1. [Create your first bot](QUICKSTART.md).
2. [Add commands, options, buttons, and modals](GUIDE.md).
3. [Build native, positioned, hybrid, and reactive interfaces](UI.md).
4. [Run the examples](EXAMPLES.md).

## Reference and operations

| Page                                             | Contents                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| [API reference](API.md)                          | Bot lifecycle, command options, contexts, message builders, state, and exports |
| [Troubleshooting](TROUBLESHOOTING.md)            | Common failures and concrete fixes                                             |
| [Performance and operations](PERFORMANCE.md)     | Gateway, REST, sharding, caches, limits, and diagnostics                       |
| [Migration from discord.js](MIGRATION.md)        | API mappings and differences in raw Discord data                               |
| [Architecture and extensions](ARCHITECTURE.md)   | Logical packages, custom transports, renderer contracts, and plugins           |
| [Release status](STATUS.md)                      | Implemented scope, unsupported features, and stable-release gates              |
| [Verification](VERIFICATION.md)                  | Tests actually run, environment, and validation limits                         |
| [Benchmark methodology](../benchmarks/README.md) | Reproducing the comparisons                                                    |
| [Benchmark results](../benchmarks/RESULTS.md)    | Measurements and limitations                                                   |
| [Changelog](../CHANGELOG.md)                     | Changes by version                                                             |

## Platform boundaries

- Native components use Discord's layout. Positioned graphics are PNG attachments.
- Buttons drawn into an image cannot receive interactions. Add native controls instead.
- Components V2 cannot contain ordinary embeds. Keep message edits in the same mode.
- Graphics are optional. Installing the base library does not require the graphics backend.
- State storage, authorization rules, ticket provisioning, moderation actions, and voice playback remain application responsibilities.

## Official Discord references

Use Discord's documentation as the authority for platform behavior:

- [Bot setup](https://docs.discord.com/developers/quick-start/getting-started)
- [Gateway](https://docs.discord.com/developers/events/gateway)
- [Application commands](https://docs.discord.com/developers/interactions/application-commands)
- [Interaction responses](https://docs.discord.com/developers/interactions/receiving-and-responding)
- [Component reference](https://docs.discord.com/developers/components/reference)
- [REST rate limits](https://docs.discord.com/developers/topics/rate-limits)
- [Discord API documentation repository](https://github.com/discord/discord-api-docs)

[Back to the project](../README.md)
