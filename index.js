/*************
 ** FORMSON **
 *************
 *
 * Copyright Ryan Gaus. Distributed under the MIT License
 */

function formsonTokenize(input) {
  let stack = ""; /* holds the currently accumlating key */
  const keys = []; /* eventual return value */
  
  // Store if the next character has been marked as being escaped
  // (ie, the character before was a backslash)
  let nextCharIsEscaped = false;
  
  for (let index = 0; index < input.length; index++) {
    // At the start of a new key, add the last key
    // to the keys collection before starting the new one.
    if (
      !nextCharIsEscaped &&
      (input[index] === '[' || input[index] === '.')
    ) {
      keys.push(stack);
      stack = "";
      isWithinKeyBody = true;
      continue
    }
    
    
    // Skip over close brackets.
    if (!nextCharIsEscaped && input[index] === ']') {
      isWithinKeyBody = false;
      continue
    }
    
    // If a backslash was entered, then escape the next character.
    if (!nextCharIsEscaped && input[index] === '\\') {
      nextCharIsEscaped = true;
      continue
    }
    
    stack += input[index];
  }
  
  keys.push(stack);
  return keys.filter(i => i.length > 0);
}

document.querySelectorAll("form[data-json]").forEach(form => {
  form.addEventListener("submit", e => {
    // Keep the form from actually submitting, which would cause a non-json-bodied request to be sent to a server.
    e.preventDefault();
    
    // Generate the body of the request
    const body = {};
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    form.querySelectorAll("input").forEach(input => {
      if (input.type === 'submit') { return; } /* irrelevant input */
      
      const prepend = input.attributes["data-prepend"] ? input.attributes["data-prepend"].value : "";
      const append = input.attributes["data-append"] ? input.attributes["data-append"].value : "";
      
      if (input.attributes['data-header']) {
        headers[input.name] = prepend + input.value + append;
        return;
      }
      
      const fields = formsonTokenize(input.name);
      // console.log("TOKENIZED FIELDS", fields)
      
      // Strip away any leading empty fields
      for (let i = 0; i < fields.length; i++) {
        if (fields[i].length !== 0) { break; }
        fields.shift();
      }
      
      // Resolve the path to the key
      let field = body;
      while (fields.length > 1) {
        const key = fields.shift();
        
        // console.log("TRAVERSING INTO", key, "WITHIN", field);
        
        // Add the key to the body if it doesn't already exist.
        if (!field[key]) {
          if (fields[0].match(/^[0-9]+$/)) {
            // console.log(".. MAKING NEW ARRAY");
            field[key] = [];
          } else {
            // console.log(".. MAKING NEW OBJECT AT", key, "IN", field);
            field[key] = {};
          }
        }
        
        field = field[key];
      }
      
      // console.log("FIELD", field, fields);
      
      // Add the field to the body.
      field[fields[0]] = prepend + input.value + append;
    });
    
    // Make an ajax request with fetch
    window.fetch(form.action || "/", {
      method: form.method || "POST",
      body: JSON.stringify(body),
      headers,
    }).then(response => {
      if (response.ok) {
        return response.json().then(json => {
          const file = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
          const fileURL = URL.createObjectURL(file);
          location.href = fileURL;
        });
      } else {
        throw new Error(`Non-ok response to json-form: ${response.statusCode}`);
      }
    }).catch(err => {
      const file = new Blob([err.toString()], {type: 'text/plain'});
      const fileURL = URL.createObjectURL(file);
      location.href = fileURL;
    });
  });
});
