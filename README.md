# Tripwire

Tripwire is a Prisma extension designed to simplify the implementation of application roles and permissions, drawing inspiration from the functionality provided by Spatie Laravel. The extension is available on NPM as `@ilovehanekawa/tripwire`.

## Installation

To get started, install Tripwire using the following command:

```bash
npm install @ilovehanekawa/tripwire
```

## Usage

Once installed, you can use Tripwire to generate the necessary files, migrations, and client for implementing roles and permissions in your Prisma model. Follow these simple steps:

1. Run the Tripwire CLI with the model name you want to extend with roles and permissions:

```bash
npx tripwire --model=<model_name>
```

Replace `<model_name>` with the name of your Prisma model.

2. Tripwire will generate the required migrations, client, and files for your specified model.

3. A seeder file will also be created, providing handy helper functions such as `hasRole()`, `assignRole()`, and `removeRole()` to facilitate role-related operations on your selected Prisma model.

## Example

```bash
npx tripwire --model=User
```

This command will extend the "User" model with roles and permissions, creating the necessary files and migrations.

## Contributing

If you encounter any issues or have suggestions for improvements, feel free to contribute by opening issues or submitting pull requests on the [Tripwire GitHub repository](https://github.com/ilovehanekawa/tripwire).

## License

Tripwire is open-source software licensed under the [GNU General Public License v3.0](LICENSE.md).
