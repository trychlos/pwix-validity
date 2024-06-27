# pwix:validity

## What is it ?

A package to manage validity periods in Meteor.

Any object may be defined with validity periods. The used taxonomy is:

- the object as a whole is named an *entity* (and identified by an entity id)

- each validity period of the object (of the *entity*) is materialized in the database as a distinct document, called a *record* (or a *validity record* when we want point out the fact).

We do not define here any data, apart from the entity identifier, which would be common to all validity records.

## Installation

This Meteor package is installable with the usual command:

```sh
    meteor add pwix:validity
```

## Usage

```js
    import { Validity } from 'meteor/pwix:validity';
```

## Provides

### `Validity`

The exported `Validity` global object provides following items:

#### Functions

##### `Validity.configure()`

    See [below](#configuration).

#### Classes

## Configuration

The package's behavior can be configured through a call to the `Validity.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `verbosity`

    Define the expected verbosity level.

    The accepted value can be any or-ed combination of following:

    - `Validity.C.Verbose.NONE`

        Do not display any trace log to the console

    - `Validity.C.Verbose.CONFIGURE`

        Trace `Validity.configure()` calls and their result

Please note that `Validity.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `Validity.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

`Validity.configure()` is a reactive data source.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.0.0:

```js
    'lodash': '^4.17.0'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

New and updated translations are willingly accepted, and more than welcome. Just be kind enough to submit a PR on the [Github repository](https://github.com/trychlos/pwix-validity/pulls).

## Cookies and comparable technologies

None at the moment.

## Issues & help

In case of support or error, please report your issue request to our [Issues tracker](https://github.com/trychlos/pwix-validity/issues).

---
P. Wieser
- Last updated on 2024, Jun. 27th
