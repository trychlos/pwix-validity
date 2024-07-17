# pwix:validity

## What is it ?

A package to manage validity periods in Meteor.

Any object may be defined with validity periods. The used taxonomy is:

- the object as a whole is named an *entity* (and identified by an entity id)

- each validity period of the object (of the *entity*) is materialized in the database as a distinct document, called a *record* (or a *validity record* when we want point out the fact).

This package defines following data:

- at the entity level:

    - an entity identifier
    - an entity notes, will be common to all records

- at the record level:

    - an attached entity (the entity identifier above)
    - a start date, which be null or undefined
    - an end date, which be null or undefined.

    A starting (resp. ending) null or undefined data means from (resp. to) infinite.

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

##### `Validity.analyzeByRecords( records<Array> )`

Compare the fields among provided array of validity records and returns the analyze result as an object with following keys:

- `diffs`: an array of the field names which do not have the same value among all records, may be empty

##### `Validity.atDateByRecords( records<Array>, opts<Object> )`

Returns among the provided array of validity records the one which is valid at the `opts.date` provided date, defaulting to current local date. The returned value may be null.

`opts` is an optional options object which may have following keys:

- `date`: the searched validity date, as a Date object, defaulting to current date.

##### `Validity.checkEnd( array<ReactiveVar>, item<Object>, opts<Object> )`

##### `Validity.checkStart( array<ReactiveVar>, item<Object> )`

Check whether the candidate ending (resp. starting) effect date would be valid regarding the whole entity items. It may notably be invalid if inside of an already allocated validity period.

`array` is an array of validity records as `ReactiveVar`'s.

`item` is the item which holds the candidate effect date.

The functions return an error message, or null if the candidate date is valid.

##### `Validity.closest( entity<Object>, opts<Object> )`

Returns the validity record the closest of the provided date as `opts.date`, defaulting to current local date.

`entity` is the entity object, with its `DYN` added object, which notably includes `records`, the array of validity records as `ReactiveVar`'s.

`opts` is an optional options object which may have following keys:

- `date`: the searched validity date, as a Date object, defaulting to current date.

The function returns its result as an object with following keys:

- `closest`: the searched closest validity record, always set

- `index`: the zero-based index of this record in the provided array.

##### `Validity.closestByRecords( records<Array>, opts<Object> )`

Returns the validity record the closest of the provided date as `opts.date`, defaulting to current local date.

`records` is the array of validity records.

`opts` is an optional options object which may have following keys:

- `date`: the searched validity date, as a Date object, defaulting to current date.

The function returns its result as an object with following keys:

- `closest`: the searched closest validity record, always set

- `index`: the zero-based index of this record in the provided array.

##### `Validity.englobingPeriodByRecords( records<Array> )`

Computes the englobing period of the provided validity records, and returns the result as an object with following keys:

- `start`: the lowest effect start date, may be null for infinite

- `end`: the highest effect end date, may be null for infinite.

##### `Validity.entitiesFieldDef()`

Returns an object suitable for a `Field.Def` definition of the entities collection, as an empty definition as `pwix:validity` doesn't add anything to it.

This function should be called from common code, but you can just omit it as it does nothing at the moment, and is only defined for completeness.

```js
    Validity.entitiesFieldDef = function(){
        return [];
    };
```

##### `Validity.holesByRecords( array<Object> )`

Computes the available validity periods, i.e. the periods which are NOT covered by an existing validity record.

`array` is the array of validity records.

The function returns its result as an array, maybe empty, of objects with following keys:

- `start`: the starting uncovered date, may be unset for infinite

- `end`: the ending uncovered date, may be unset for infinite

##### `Validity.isValidPeriod( start<Date|String>, end<Date|String> )`

Tests whether the `start` and `end` provided dates make a valid validity period.

`array` is the array of validity records.

The function returns a `true`|`false` boolean.

##### `Validity.newRecord( entity<Object>, period<Object> )`

Builds a new validity record, based on the current data.

- `entity`: the current entity published document, i.e. with its `DYN.records` array of `ReactiveVar`'s

- `period`: the new (currently free) validity period, as a `{ start, end }` object

The function returns its result as an object with following keys:

- `records`: the new entity records `ReactiveVar`'s array, including the new one, in the order of ascending effect start date

- `index`: the index of the new record in the returned array.

##### `Validity.recordsFieldDef()`

Returns an array suitable for a `Field.Set` extension, as the following definition:

```js
    Validity.recordsFieldDef = function(){
        return [
            {
                name: 'entity',
                type: String,
                dt_visible: false,
                help_line: pwixI18n.label( I18N, 'help.entity_line' )
            },
            {
                name: 'effectStart',
                type: Date,
                optional: true,
                dt_visible: false,
                dt_className: 'dt-center',
                dt_template: Meteor.isClient && Template.dtValidityDate,
                form_check: Validity.checks.effectStart,
                form_status: Forms.FieldType.C.OPTIONAL,
                help_line: pwixI18n.label( I18N, 'help.start_line' )
            },
            {
                name: 'effectEnd',
                type: Date,
                optional: true,
                dt_visible: false,
                dt_className: 'dt-center',
                dt_template: Meteor.isClient && Template.dtValidityDate,
                form_check: Validity.checks.effectEnd,
                form_status: Forms.FieldType.C.OPTIONAL,
                help_line: pwixI18n.label( I18N, 'help.end_line' )
            }
        ];
    };
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

    It is expected that the document contains a `DYN` object, with a `records` key. The `DYN.records` value is an array of ReactiveVar's which each contains a validity record.

- `template`: the name of the Blaze template to be used for records panes.

    The record panes will receive their data context as:

    - the data context itself passed to `ValidityTabbed` (and, notably, the `entity` ReactiveVar),

    - `index`: the index in the `DYN.records` array of the record this pane is expected to manage.

- `withValidities`: whether we want deal with validity records, defaulting to `true`.

#### `ValidityFieldset`

An additional component to be included by the Blaze template which manages the records documents (the `template` above) to let the user enter start and end effect dates.

The expected data context is:

- `startDate`: the starting effect date (as a Date), or null

- `endDate`: the ending effect date (as a Date), or null.

Even if this component embeds itself a `DateInput` advanced date input component, and so even if you could react on `date-input-data` event, the `ValidityFieldset` components takes care of that in your place, and triggers `validity-fieldset-data` events, with data as an `Object` with following keys:

- `validity-start`, a valid `Date`, or null
- `validity-end`, a valid `Date`, or null.

If the calling code makes use of `pwix:forms`, it can also uses `.js-start input` and `.js-end input` selectors to handle these respective fields checks.

## Configuration

The package's behavior can be configured through a call to the `Validity.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `effectStart`
- `effectEnd`

    The name of the fields which hold the starting and ending effect dates.

    Defaulting to `effectStart` and `effectEnd`.

- `verbosity`

    Define the expected verbosity level.

    The accepted value can be any or-ed combination of following:

    - `Validity.C.Verbose.NONE`

        Do not display any trace log to the console

    - `Validity.C.Verbose.CONFIGURE`

        Trace `Validity.configure()` calls and their result
    
    Defaults to `Validity.C.Verbose.CONFIGURE`.

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
