module PrayerEdit exposing (update, view, Msg)

import Model exposing (Prayer, maybeGet)
import Element exposing (Attribute, Element, column, el, text, row, alignLeft, alignTop, fill, width, rgb255, spacing, centerY, centerX, padding)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Events exposing (onClick)
import Element.Input as Input
import Html.Attributes
import Model exposing (Model, updatePrayer, emptyPrayer)

-- UPDATE

type Msg = ChangeName String | ChangeText String

update : Msg -> Model -> Model
update message model =
  let
    prayer = maybeGet model.openPrayer
    newPrayer =
      case message of
        ChangeName name -> { prayer | name = name }
        ChangeText text -> { prayer | text = text }
  in
    updatePrayer newPrayer model

-- VIEW

view : Prayer -> Element Msg
view prayer =
  column [ alignTop, spacing 10 ]
    [ Input.text
        [ Font.size 32, Font.bold ]
          { onChange = ChangeName
          , text = prayer.name
          , placeholder = Just (Input.placeholder [] <| text "Name")
          , label = Input.labelHidden "name"
          }
    , Input.multiline
        [ Font.size 16, Font.bold ]
          { onChange = ChangeText
          , text = prayer.text
          , placeholder = Just (Input.placeholder [] <| text "Text")
          , label = Input.labelHidden "text"
          , spellcheck = False
          }
    ]
