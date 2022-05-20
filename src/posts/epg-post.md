---
title: 'ephemeral pattern generator'
excerpt: 'Working with event listeners in JavaScript to manipulate the DOM.'
---

<section>

Imagine you have a dog. You'd like the dog to raise their paw and touch your hand whenever you say "shake". You'll have to teach the dog this behavior, but with enough patience (and treats!), eventually the dog will learn. You have now taught your dog (the target) to listen for a command (the event) and raise its paw (the action).

That's essentially what an event listener is. Instead of all that training though, Javascript has a method, [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener), that provides an easy way to add all sorts of interactivity to web pages.

I wanted to practice using event handlers, so I built a little [app](https://ephemeral-pattern-generator.netlify.app/) that adds SVG glyphs to the screen. Once added, the color of the glyphs can be changed by selecting one and clicking on a button. Not particularly useful, maybe, but kind of fun.

</section>

<section>

### The HTML

The HTML is pretty straightforward, so I'll just run through it quickly. CSS is important to the way the app works, but it's not the main focus of this post, so I'm going to skip over most of it. You can find it on the project's [github](https://github.com/w0whitaker/epg/blob/main/_site/style.css) page.

#### The output

There are two glyphs that the user can add to the screen.

| ![glyph consisting of three diagonal lines tilting to the right](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5lpq3iwizvucbw3dvcw6.png) |     | ![glyph consisting of three diagonal lines tilting to the left](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uwnxge5dkasfg395ytr3.png) |
| :-------------------------------------------------------------------------------------------------------------------------------------------------: | --- | :------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                       glyphR                                                                        |     |                                                                       glyphL                                                                       |

The first thing we need is a place to display the glyphs once they get added.

```html
<section id="output">
  <div id="glyph-container"></div>
</section>
```

This is just an empty div for now, but as glyphs are added, it will get filled with `<svg>` elements.

```html
<div id="glyph-container">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 62" class="glyph">
    ...
  </svg>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 62" class="glyph">
    ...
  </svg>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 62" class="glyph">
    ...
  </svg>
  <!-- etc. -->
</div>
```

Because I wanted the display area to be present visually with or without any glyphs, I gave it a fixed size and some other styling in the CSS.

```css
#output {
  width: 400px;
  min-height: 425px;
  padding: 20px;
  background-color: #0f0f0f;
  border-radius: 5%;
  margin: 10px auto;
}
```

#### The buttons

Next up are some buttons to add glyphs and eventually change their color.

```html
<div id="add-buttons">
  <button id="addL">
    <svg>...</svg>
  </button>
  <button id="addR">
    <svg>...</svg>
</div>
<div id="color-pickers">
  <button id="redBtn"></button>
  <button id="orangeBtn"></button>
  <button id="yellowBtn"></button>
  <!-- etc. -->
</div>
```

{% assign screenreader_issue = "[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#accessibility_concerns) has a bit about buttons and accessibility, and there's a good [article](https://www.smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/#basic-alternative-descriptions-using-the-svg-tag) by [Carrie Fisher](https://cariefisher.com/) on [Smashing Magazine](https://www.smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/) that goes over some options for making SVGs more accessible as well." | md %}
Nothing too special here, except that I use IDs so that I'll be able to reference the buttons easily in the Javascript. Note that for the "add" buttons, I'm using an SVG of the relevant glyph as the content of the button. While that may indicate visually what the button is for, it won't do much for people using screen readers. In practice, there should be something to describe what the button does that a screen reader will pick {% footnoteref "screenreader-issue" screenreader_issue %}up{% endfootnoteref %}.

</section>

<section>

### The Javascript

#### A few definitions

To start with, I'm going to define a few things by declaring some variables. These use `const` because I don't want the values to change.

```javascript
const btnAddL = document.getElementById('addL');
const btnAddR = document.getElementById('addR');

const displayArea = document.getElementById('glyph-container');

const glyphs = document.getElementsByClassName('glyph');

// glyph definitions
const glyphL = '<svg class="glyph">...</svg>';

const glyphR = '<svg class="glyph">...</svg>';

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
```

{% assign get_by_id_vs_class = "There's an important difference between the two, in that `.getElementsByClassName()` returns an &#8220;[array-like object](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName)&#8221; rather than a single object. This makes sense, as it will be returning more than one element, and it will have implications later on when it comes time to add event listeners to the glyphs." | md %}
I use `document.getElementById()` to reference the "add" buttons and the `<div>` that will act as the display area for the glyphs. Because there will be more than one glyph on the screen, I can't use an ID, so I'm using {% footnoteref "get-by-id-vs-class" get_by_id_vs_class %} `document.getElementsByClassName()`{% endfootnoteref %} to collect the glyphs.

Next, I declare a couple of variables for the glyphs themselves, which will make working with the (long, messy) SVG code easier.

Finally, I create an array that will hold the colors to be used. You may have noticed that I didn't declare variables for these "color" buttons; I'll be doing that later and using the colors in this array to name them.

#### The `init()` function

{% assign dom_content_vs_load = "It would also be possible to add this event listener to the `document` object, and listen for the `'DOMContentLoaded'` event, which fires as soon as the HTML is loaded. The `'load'` event, on the other hand, waits until _all_ of the page's resources have loaded. Given that this is a pretty minimal app, perhaps it doesn't make much difference which one is used. I've opted to use the `'load'` event, figuring that if for some reason the CSS were delayed, for example, it wouldn't make much sense for the user to start clicking things." | md %}
The code for the app's behavior will be wrapped in a function, which will be called once the page has {% footnoteref "dom-content-vs-load" dom_content_vs_load %}loaded{% endfootnoteref %}.

```javascript
function init() {
  // app functionality will go in here
}

window.addEventListener('load', () => {
  init();
});
```

#### Event listeners on buttons

There are two sets of buttons that will need event listeners, those that add glyphs to the screen and those that pick a color.

##### Adding glyphs

Adding the glyphs to the screen is pretty straightforward. Earlier, I declared variables which create a reference to the appropriate button. Each of the two "add" buttons gets an event listener, which is set up to respond to a `'click'` event. Every time one of those two buttons is clicked, a function that adds a glyph to the `displayArea` using `insertAdjacentHTML()` will run.

```javascript
function glyphButtons() {
  // left button
  btnAddL.addEventListener('click', () => {
    //add svg, i.e., html, to '#output'
    displayArea.insertAdjacentHTML('afterbegin', glyphL);
  });

  // right button
  btnAddR.addEventListener('click', () => {
    //add svg, i.e., html, to '#output'
    displayArea.insertAdjacentHTML('afterbegin', glyphR);
  });
}
```

The first argument [`insertAdjacentHTML()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML) takes tells it where to put the HTML in relation to the element specified; in this case, it will be placed just after the opening `<div>` tag of the `displayArea`. The second is the HTML to add, here it's stored in one of the variables that I declared earlier.

##### Changing colors

Setting up event listeners on the "color" buttons is going to follow the same pattern as the "add" buttons.

```javascript
function colorButtons() {
  for (let color of colors) {
    let colorBtn = document.getElementById(`${color}Btn`);
    colorBtn.addEventListener('click', () => {
      // we'll come back to this...
    });
  }
}
```

There are a couple of important differences, however. Each of the color buttons will reuse the event listener code, with only the name of the color changing. So rather than repeat that code over and over, I'm looping over the `colors` array from earlier and using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to insert each value into the argument for `getElementById()`.

The actual code for the event listener is going to be a little more complicated than it was for the "add" buttons, so I'm going to pause here and take a look at what the Javascript looks like at this point.

##### The code so far

```javascript
const btnAddL = document.getElementById('addL');
const btnAddR = document.getElementById('addR');

const displayArea = document.getElementById('glyph-container');

const glyphs = document.getElementsByClassName('glyph');

// glyph definitions
const glyphL = '<svg class="glyph">...</svg>';

const glyphR = '<svg class="glyph">...</svg>';

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

function init() {
  function glyphButtons() {
    // left button
    btnAddL.addEventListener('click', () => {
      //add svg, i.e., html, to '#output'
      displayArea.insertAdjacentHTML('afterbegin', glyphL);
    });

    // right button
    btnAddR.addEventListener('click', () => {
      //add svg, i.e., html, to '#output'
      displayArea.insertAdjacentHTML('afterbegin', glyphR);
    });
  }

  function colorButtons() {
    for (let color of colors) {
      let colorBtn = document.getElementById(`${color}Btn`);
      colorBtn.addEventListener('click', () => {
        // we'll come back to this...
      });
    }
  }

  // don't forget to call the functions!
  glyphButtons();
  colorButtons();
}

window.addEventListener('load', (event) => {
  init();
});
```

Inside the `init()` function are two other functions, `glyphButtons()` and `colorButtons()`, both of which get called at the end of `init()`.

#### Event listeners on the glyphs

In order to change a glyph's color, there needs to be a way to select it. For now, I'm going to declare an empty variable that will eventually "hold" the selected glyph. I'll put it at the top of the `init()` function, so that it can be accessed from the other functions within `init()`. Note that I'm using `let` so that it's value can be changed as needed.

```javascript
let selectedGlyph = '';
```

##### The `MutationObserver`

When the page loads, there won't be any glyphs to select. Adding the actual event listener can go in a function easily enough, but there needs to be a way to call that function whenever a glyph is added. It turns out that Javascript has something called `MutationObserver` that can "watch" part of the page and do something when it changes.

```javascript
let observer = new MutationObserver(function () {
  glyphListener();
});

observer.observe(displayArea, {
  subtree: true,
  childList: true,
});
```

First, a new `MutationObserver()` is declared with the variable `observer`, which then uses the method `observe` to point the observer to the `displayArea`. The options `subtree` and `childList` tell the observer to watch all the child nodes of `displayArea` for changes.

##### Adding the listener

With the `MutationObserver` in place, an event listener can now be attached to each glyph as it gets added. This will require looping over the elements that have been stored in the variable `glyphs`.

```javascript
function glyphListener() {
  for (let glyph of glyphs) {
    glyph.addEventListener('click', () => {
      glyph.classList.add('glyph-selected');
      selectedGlyph = glyph;
    });
  }
}
```

This time, the event listener is going to add a class of `.glyph-selected` to the glyph that has been clicked on. This will style the glyph, turning it from light gray to cyan, visually indicating that it has been selected. The variable `selectedGlyph` is now assigned the value of the glyph that has been clicked on.

This is looking promising, but there is a problem. As it is now, it's possible to select multiple glyphs, or, more precisely, to style multiple glyphs with `.glyph-selected`. Every time a glyph is clicked, the previous selection needs to be cleared, which can be accomplished with a function that gets called before adding `.glyph-selected`. For good measure, this `clearSelection()` function will also reassign `selectedGlyph` to be empty.

```javascript
function glyphListener() {
  for (let glyph of glyphs) {
    glyph.addEventListener('click', () => {
      clearSelection();
      glyph.classList.add('glyph-selected');
      selectedGlyph = glyph;
    });
  }
  function clearSelection() {
    for (let glyph of glyphs) {
      glyph.classList.remove('glyph-selected');
      selectedGlyph = '';
    }
  }
}
```

#### Changing glyph colors

In the same way that `selectedGlyph` was initialized as an empty variable so that it could be reassigned as needed, a variable called `selectedColor` will be declared that can "hold" the color the user selects.

```javascript
let selectedColor = '';
```

Now the event listener for the color buttons can take shape. First, the color of the button clicked is assigned to `selectedColor`.

```javascript
function colorButtons() {
  for (let color of colors) {
    let colorBtn = document.getElementById(`${color}Btn`);
    colorBtn.addEventListener('click', () => {
      selectedColor = color;
    });
  }
}
```

In order to assign that color to the selected glyph, a class will get added to the glyph that styles it with CSS. There's going to be a bit of back and forth here between `glyphListener()` and `colorButtons()`; where `glyphListener()` just cares about `selectedGlyph`, `colorButtons()` needs to know about both `selectedGlyph` and `selectedColor`. So I created an object (`setColor`) outside of `glyphListener()` and `colorButtons` that has a couple of methods attached.

```javascript
const setColor = {
  addColorClass(glyph, color) {
    glyph.classList.add(`${color}Glyph`);
  },
};
```

The method `addColorClass()` gets passed the value of `selectedGlyph` and `selectedColor`.

```javascript
function colorButtons() {
  for (let color of colors) {
    let colorBtn = document.getElementById(`${color}Btn`);
    colorBtn.addEventListener('click', function () {
      selectedColor = color;
      setColor.addColorClass(selectedGlyph, selectedColor);
    });
  }
}
```

If the code was left in this state, each time a color button was clicked, a new color class would be added to the glyph. Just as the styling provided by `.glyph-selected` needed to be removed from one glyph before it could be added to another, the color class needs to be removed:

```javascript
removeColorClass(glyph) {
  let colorRegEx = /^\w*-glyph/gm;
  let iterator = glyph.classList.values();
  for (let value of iterator) {
    glyph.classList.remove(value.match(colorRegEx));
  }
},
```

To find the classes that added color to the glyph, there is RegEx that will match anything that begins with some number of characters and ends with '-glyph', thus matching any of the color classes that have been added. That RegEx is assigned to a variable so that it can be used in a loop that will go over all the classes of the selected glyph and match them against the RegEx.

To set up that loop, I've used `classList` to get all the classes of the selected glyph, and then used the `values()` method to put them in an array. Then, that array is iterated over, and `match()` is used to check if the class matches the RegEx. If it does, it gets removed from the element's `classList`.

This call to `removeColorClass()` gets placed just before the selected color class is added, and `selectedGlyph` is passed as the argument.

The code now looks like this:

```javascript
function colorButtons() {
  for (let color of colors) {
    let colorBtn = document.getElementById(`${color}Btn`);
    colorBtn.addEventListener('click', () => {
      selectedColor = color;
      setColor.removeColorClass(selectedGlyph);
      setColor.addColorClass(selectedGlyph, selectedColor);
    });
  }
}
```

</section>
<section>

### conclusion

That should do it! Now the user can add glyphs to the screen, select them, and change their color.

```javascript
const displayArea = document.getElementById('glyph-container');

const btnAddL = document.getElementById('addL');
const btnAddR = document.getElementById('addR');

// glyph definitions
const glyphL =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 62" class="glyph">...</svg>';

const glyphR =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 62" class="glyph">...</svg>';

const glyphs = document.getElementsByClassName('glyph');

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

function init() {
  const setColor = {
    addColorClass(glyph, color) {
      glyph.classList.add(`${color}-glyph`);
    },
    removeColorClass(glyph) {
      let colorRegEx = /^\w*-glyph/gm;
      let iterator = glyph.classList.values();
      for (let value of iterator) {
        glyph.classList.remove(value.match(colorRegEx));
      }
    },
  };

  let selectedGlyph = '';
  let selectedColor = '';
  let observer = new MutationObserver(function () {
    glyphListener();
  });

  observer.observe(displayArea, {
    subtree: true,
    childList: true,
  });

  function glyphButtons() {
    // left button
    btnAddL.addEventListener('click', () => {
      //add svg, i.e., html, to '#output'
      displayArea.insertAdjacentHTML('afterbegin', glyphL);
    });

    // right button
    btnAddR.addEventListener('click', () => {
      //add svg, i.e., html, to '#output'
      displayArea.insertAdjacentHTML('afterbegin', glyphR);
    });
  }

  function colorButtons() {
    for (let color of colors) {
      let colorBtn = document.getElementById(`${color}Btn`);
      colorBtn.addEventListener('click', () => {
        selectedColor = color;
        setColor.removeColorClass(selectedGlyph);
        setColor.addColorClass(selectedGlyph, selectedColor);
      });
    }
  }

  function glyphListener() {
    for (let glyph of glyphs) {
      glyph.addEventListener('click', () => {
        clearSelection();
        setColor.removeColorClass(glyph);
        glyph.classList.add('glyph-selected');
        selectedGlyph = glyph;
      });
    }
    function clearSelection() {
      for (let glyph of glyphs) {
        glyph.classList.remove('glyph-selected');
        selectedGlyph = '';
      }
    }
  }

  glyphButtons();
  colorButtons();
}

window.addEventListener('load', () => {
  init();
});
```

There are several features I'd like to add at some point, like the ability to delete glyphs, and limit the total number of glyphs to what fits in the display. Maybe even some animation! But that's for another day.

Thanks for reading!

</section>
