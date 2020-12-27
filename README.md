# would-you-rather
An online web game built on node.js based on the popular game "would you rather". Features Include:
* Rooms
* Various Themes
* Background Music

## Documentation

### Questions

A **question** refers to anything with a prompt and choices. An example question would be:

![Sample Question 1](https://i.pinimg.com/originals/82/e5/76/82e57631dfdd12b394a7262d89754be0.png)

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
This property can be set to a **String** value or **null**

If it is set to a **String** value, it will display that string as the question/prompt.
If set to **null**, it will display "Would you Rather?" as the question instead.
Ex:

1. Setting ```"question"``` to ```"Never gonna ..."``` gives:

   ![Sample Question 2](https://i.pinimg.com/originals/a9/f6/a5/a9f6a53bcaf8d2e8d753d3c70a7d3d2b.png)
1. Setting ```"question"``` to ```null``` gives:

   ![Sample Question 1](https://i.pinimg.com/originals/82/e5/76/82e57631dfdd12b394a7262d89754be0.png)

##### properties - choices
This property can be set to an **Array of Strings**. Each element of this array would represent a choice.

Ex:
1. Setting ```"choices"``` to ```[
                "give you up",
                "let you down",
                "run around",
                "desert you"
            ]``` gives:

   ![Sample Question 2](https://i.pinimg.com/originals/a9/f6/a5/a9f6a53bcaf8d2e8d753d3c70a7d3d2b.png)
1. Setting ```"choices"``` to ```[
                "Eat something tasty off of the floor",
                "Eat something disgusting from a clean plate"
            ]``` gives:

  ![Sample Question 1](https://i.pinimg.com/originals/82/e5/76/82e57631dfdd12b394a7262d89754be0.png)


### Themes

#### [docs/themes.js](docs/themes.js)

### Music

#### [docs/music/](docs/music/)

#### [data/musicGame.json](data/musicGame.json)

#### [data/musicIntermission.json](data/musicIntermission.json)
