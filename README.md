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

##### `Validity.configure( o<Object> )`

See [below](#configuration)

##### `Validity.entitiesFieldDef()`

Returns an object suitable for a `Field.Def` definition of the entities collection, as an empty definition as `pwix:validity` doesn't add anything to it.

This function should be called from common code, but you can just omit it as it does nothing, and is only defined for completeness.

##### `Validity.recordsFieldDef()`

Returns an array suitable for a `Field.Set` extension, as the following definition:

```js
```

This function MUST be called from common code.

##### `Validity.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

### Blaze components

#### `ValidityTabbed`

A `Tabbed`-derived component which let the application manage validity records of an entity. Each record is displayed in its own pane, whose name is built from start and end effect dates.

An additional tab is displayed to show available periods (if any).

The expected data context is:

- `entity`: a ReactiveVar which must contain the edited entity document.

    It is expected that the document contains a `DYN` object, with a `records` key. The `DYN.records` value is an array of ReactiveVar's which contains a validity record.

- `template`: the name of the Blaze template to be used for records panes.

- `startField`: the name of the field (of the record documents) which contains the starting effect date, defaulting to 'effectStart'

- `endField`: the name of the field (of the record documents) which contains the ending effect date, defaulting to 'effectEnd'

- `withValidities`: whether we want deal with validity records, defaulting to `true`.

#### `ValidityFieldset`

An additional component to be included by the Blaze template which manages the records documents (the `template` above) to let the user enter start and end effect dates.

The expected data context is:

- `startDate`: the starting effect date (as a Date), or null

- `endDate`: the ending effect date (as a Date), or null.

Even if this component embeds itself a `DateInput` advanced date input component, and so even if you could react on `date-input-data` event, the `ValidityFieldset` components takes care of that in your place, and triggers `validity-fieldset-data` events, with data as an `Object` with following keys:

- `validity-start`, a valid `Date`, or null
- `validity-end`, a valid `Date`, or null.

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
