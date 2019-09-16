module PrayerEdit exposing (update, view, Msg)

import Html.Attributes
import Model exposing (Prayer)
import Element exposing (Attribute, Element, alignTop, column, px, spacing, text, width)
import Element.Font as Font
import Element.Input as Input
import Model exposing (Model, updatePrayer)
import Utils exposing (space)

-- UPDATE

type Msg = ChangeName String | ChangeText String

update : Msg -> Model -> Model
update message model =
  case model.openPrayer of
    Just prayer ->
      let
        newPrayer = case message of
          ChangeName name -> { prayer | name = name }
          ChangeText text -> { prayer | text = text }
      in updatePrayer newPrayer model
    Nothing -> model

-- VIEW

view : Int -> Prayer -> Element Msg
view editVidth prayer =
  column [ alignTop, spacing space, width <| px editVidth ]
    [ Input.text
        [ Font.size 24, Font.bold, Element.htmlAttribute <| Html.Attributes.id "edit-name"  ]
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
