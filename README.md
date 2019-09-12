# spike-performance

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your unit tests
```
yarn run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Report Configuration
This report can be configured according the specifications defined by its config object. Find below an example for the report standard configuration.

```json
{
  "fetchCompleteDataset": true,
  "hideEmptyClusters": true
}
```

Properties
----------

| Name                        | Type           | Required | Default value                    | Info                                        |
| --------------------------- | -------------- | -------- | -------------------------------- | ------------------------------------------- |
| **fetchCompleteDataset**    | Boolean | No       | true | Fetches the complete dataset from workspace or partially, only for the startpoint factsheets in view (useful for large workspaces)  |
| **hideEmptyClusters**    | Boolean | No       | false | Hide clusters without any endpoint factsheets  |
