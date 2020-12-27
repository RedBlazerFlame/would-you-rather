# would-you-rather
An online web game built on node.js based on the popular game "would you rather". Features Include:
* Rooms
* Various Themes
* Background Music

## Documentation

### Questions

A **question** refers to anything with a prompt and choices. An example question would be:

![Example Question](https://i.pinimg.com/originals/82/e5/76/82e57631dfdd12b394a7262d89754be0.png)

Notice that on the top, there is a question ("Would you Rather?"), and a timer which is showing how many seconds there are left for that round.

On the bottom, there are two different choices, namely:

* Eat something tasty off of the floor
* Eat something disgusting from a clean plate

#### [data/questions.json](data/questions.json)

The structure of data/questions.json is:
```JavaScript

{
  "questions":
  [
    {Question1},
    {Question2},
    {Question3},
    .
    .
    .
    {QuestionN}
  ]
}

```

Where {QuestionN} is an object representing one question and its choices.

The format of {QuestionN} is:
```JavaScript
{
  "question": /*String or Null*/,
  "choices": [String1, String2, String3, ..., StringN]
}
```

The values that each property can store can be summarized as:
<table>
  <tr>
    <th>
      <b>
        Property Name
      </b>
    </th>
    <th>
      <b>
        Allowed Data Types
      </b>
    </th>
    <th>
      <b>
        Case-Sensitive
      </b>
    </th>
    <th>
      <b>
        Required
      </b>
    </th>
  </tr>

  <tr>
    <td>
      <b>
        question
      </b>
    </td>
    <td>
      String or Null
    </td>
    <td>
      Yes
    </td>
    <td>
      Yes
    </td>
  </tr>

  <tr>
    <td>
      <b>
        choices
      </b>
    </td>
    <td>
      Array of Strings
    </td>
    <td>
      Yes
    </td>
    <td>
      Yes
    </td>
  </tr>
</table>

##### properties - question

##### properties - choices

### Themes

#### [docs/themes.js](docs/themes.js)

### Music

#### [docs/music/](docs/music/)

#### [data/musicGame.json](data/musicGame.json)

#### [data/musicIntermission.json](data/musicIntermission.json)
