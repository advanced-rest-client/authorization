# Contributing

## Getting stated

Clone the local copy.

```sh
git clone https://github.com/advanced-rest-client/authorization
cd authorization
npm install
```

Running the demo page:

```sh
npm start
```

Running the tests:

```sh
npm test
```

Running the tests in the watch mode:

```sh
npm run test: watch
```

## Authorization method

This element is a shell for various authorization logic and UI. These logics are defined in `src/lib/ui/` directory.

When the `type` is set on the element it creates an instance of the UI (extends `AuthUiBase` class) and renders the contents.

### Lifecycle

When the UI is initialized it sets up current set properties on the instance, related to the type. This happens in the `UiDataHelper.setup*` functions. After that the element is calling the `defaults()` function on the instance of the UI. The UI only sets defaults when the value of not already set. Note that `defaults()` may trigger change notification which calls the `[propagateChanges]()` method.

The properties set on the element that are declared in the static `properties` object are passed down to the UI instance in an async call. This does not check what property goes where. All changed properties on the element are set on the current UI instance, event if they are not relevant. This is done to simplify the logic and it has no side effects.

When the UI notifies a change it synchronously reads UI factory properties related tpo the current method and sets them on the element. Be careful not to create a loop here by triggering a change notification in a property setter.

### Building an UI factory

Create a class that extends the `AuthUiBase` class.

The `restore()` method is called when the application wants to restore previously serialized values without setting each property separately.

The `serialize()` function creates a state of the editor with user entered values. This object should contain all information required to perform the authorization.

The `reset()` function clears the user input from the form.

The `render()` function is called by the element and must return the `TemplateRest` with the UI to render.
When adding events in the template, bind the callback function to the UI factory instance or otherwise the callback will be called in the context of the element and not the UI class.

When the state of the UI change call `notifyChange()` function. This triggers setting UI factory values onto the element so they can be read by the parent application. Similarly call the `requestUpdate()` method to re-render the template. This is an async operation controlled by `lit-html`.

If the authorization method can perform an operation to obtain the credentials before the HTTP request is made, implement this logic in the `authorize()` method. This is how the OAuth 2 method requests for the auth token.
