# Formson

A simple way to adapt html forms to submit data encoded as JSON.

## Why?
These days, it's pretty easy to issue an ajax request from a web page. You might ask, why would this
be helpful?

In 99% of cases, it's not.

I built this to provide an easy, quick way to create a form that submits data to a web service with
the primary use-case of building tools to allow non-technical people to interact with web apis. And,
for that use-case, it works really well and means that I don't have to spend my time debugging some
sort of weird edge case of fetch or xmlhttprequest every single time I make one of these forms.
So, if building a lot of small forms is something you do often, then read on.


## Documentation, or "how to create a form"

First, add the formson script to to the bottom of the body within your html page:
```html
<body>

  <!-- formson script -->
  <script src="https://formson.surge.sh/formson.min.js"></script>
</body>
```

### Creating a formson form

First, create a normal form.
```html
<form method="POST" action="https://httpbin.org/post">
  <input type="text" name="my_text" />
  <input type="submit" />
</form>
```

Then, add the `data-json` attribute to the form. Now, when submitted, Formson will encode each
`input` within the form as a key. 
```html
<form data-json method="POST" action="https://httpbin.org/post">
  <input type="text" name="my_text" />
  <input type="submit" />
</form>
```

When submitted, this makes the equivalent request as this CURL:
```
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"my_text": "contents of textbox"}' \
  https://httpbin.org/post
```

## More complex bodies

Formson supports a few different ways to express a body that contains nested keys.

The simplest syntax consists of placing a `.` before each section within the `name` attribute:
```html
<form data-json method="POST" action="https://httpbin.org/post">
  <input type="text" name=".foo.bar" />
  <input type="submit" />
</form>
```

This form, when submitted, would send a request equivalent to the below:
```
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"foo":{"bar": "contents of textbox"}}' \
  https://httpbin.org/post
```

Alternatively, the syntax of using brackets (`[` and `]`) is supported. As an example, `.foo.bar` is
equivalent to `[foo][bar]`. Also, they can be mixed: `.foo[bar]`.

## Arrays in bodies
Specifying an numberical index as a key within an input's `name` attribute works to define an inner
key as an array. For example:

```html
<form data-json method="POST" action="https://httpbin.org/post">
  <input type="hidden" name=".foo.0" value="hello" />
  <input type="text" name=".foo.1" value="world" />
  <input type="submit" />
</form>
```

```
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"foo": ["hello", "world"]}' \
  https://httpbin.org/post
```

## Custom headers
If you'd like to send a custom header along with a request, add the `data-header` attribute to an
input within the form. For example:

```html
<form data-json method="POST" action="https://httpbin.org/post">
  <input data-header type="hidden" name="x-my-test-header" value="hello" />
  <input type="submit" />
</form>
```

```
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'X-My-Test-Header: hello' \
  -d '{}' \
  https://httpbin.org/post
```

## Prepend and Append
Sometimes, adding a constant string before or a constant string after an input is desired. A great
example of this is passing the `Authorization` header - typically, this follows the form of `type
payload`, where type is something like `Basic`, ``Bearer`, `Token`, etc. Formson has the
`data-prepend` and `data-append` attributes, which when used, will prepend or append a constant to
the data.

For example:

```html
<form data-json method="POST" action="https://httpbin.org/post">
  Token: <input data-header data-prepend="Bearer " type="text" name="Authorization" />
  Count: <input type="number" name="count" />
  <input type="submit" />
</form>
```

```
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer mytoken' \
  -d '{"count": 5}' \
  https://httpbin.org/post
```

That's all that Formson does.
